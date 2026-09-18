import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';
import { findUserByEmail } from '../models/userModel.js';
import {
  consumePasswordResetToken,
  createPasswordResetToken,
  deleteUserPasswordResetTokens,
  findValidPasswordResetToken,
} from '../models/passwordResetModel.js';
import { sendPasswordResetEmail } from './emailService.js';

const TOKEN_TTL_MINUTES = 30;

const normalizeEmail = (email) => email?.trim().toLowerCase();

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const validatePassword = (password) => {
  if (typeof password !== 'string' || password.length < 6 || password.length > 72) {
    throw new ApiError(400, 'La contraseña debe tener entre 6 y 72 caracteres.');
  }
};

export const requestPasswordReset = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return;
  }

  const user = await findUserByEmail(pool, normalizedEmail);
  if (!user) {
    return;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);
  await deleteUserPasswordResetTokens(pool, user.id);
  await createPasswordResetToken(pool, {
    userId: user.id,
    tokenHash: hashToken(rawToken),
    expiresAt,
  });

  const frontendUrl = (process.env.FRONTEND_URL || '').split(',')[0].trim();
  if (!frontendUrl) {
    throw new Error('FRONTEND_URL no está configurada.');
  }

  const resetUrl = new URL('/reset-password', frontendUrl);
  resetUrl.searchParams.set('token', rawToken);

  try {
    await sendPasswordResetEmail(user, resetUrl.toString());
  } catch (error) {
    await deleteUserPasswordResetTokens(pool, user.id);
    throw error;
  }
};

export const resetPassword = async (token, password) => {
  if (typeof token !== 'string' || !token || token.length !== 64) {
    throw new ApiError(400, 'El enlace de recuperación no es válido o ha expirado.');
  }
  validatePassword(password);

  const tokenHash = hashToken(token);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const resetToken = await findValidPasswordResetToken(connection, tokenHash);
    if (!resetToken) {
      throw new ApiError(400, 'El enlace de recuperación no es válido o ha expirado.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const consumed = await consumePasswordResetToken(connection, resetToken.id);
    if (!consumed) {
      throw new ApiError(400, 'El enlace de recuperación no es válido o ha expirado.');
    }

    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, resetToken.user_id]
    );
    await deleteUserPasswordResetTokens(connection, resetToken.user_id);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};