import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiError } from '../middleware/errorHandler.js';
import { createUser, findUserByEmail, findUserById } from '../models/userModel.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeRegistration = (input) => {
  const firstName = input.firstName?.trim();
  const lastName = input.lastName?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password;

  if (!firstName || firstName.length > 100) {
    throw new ApiError(400, 'El nombre es obligatorio y debe tener máximo 100 caracteres.');
  }

  if (!lastName || lastName.length > 100) {
    throw new ApiError(400, 'El apellido es obligatorio y debe tener máximo 100 caracteres.');
  }

  if (!email || !EMAIL_PATTERN.test(email) || email.length > 255) {
    throw new ApiError(400, 'Debes proporcionar un correo electrónico válido.');
  }

  if (typeof password !== 'string' || password.length < 6 || password.length > 72) {
    throw new ApiError(400, 'La contraseña debe tener entre 6 y 72 caracteres.');
  }

  return { firstName, lastName, email, password };
};

const publicUser = (user) => ({
  id: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  email: user.email,
  role: user.role || 'customer',
});

export const registerUser = async (executor, input) => {
  const userData = normalizeRegistration(input);
  const existingUser = await findUserByEmail(executor, userData.email);

  if (existingUser) {
    throw new ApiError(409, 'Ya existe una cuenta con este correo electrónico.');
  }

  const passwordHash = await bcrypt.hash(userData.password, 12);
  const user = await createUser(executor, { ...userData, passwordHash });
  return publicUser(user);
};

export const loginUser = async (executor, input) => {
  const email = input.email?.trim().toLowerCase();
  const password = input.password;

  if (!email || typeof password !== 'string') {
    throw new ApiError(400, 'El correo electrónico y la contraseña son obligatorios.');
  }

  const user = await findUserByEmail(executor, email);
  const isValidPassword = user && await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw new ApiError(401, 'Correo electrónico o contraseña incorrectos.');
  }

  return publicUser(user);
};

export const getUserById = async (executor, userId) => {
  const user = await findUserById(executor, userId);

  if (!user) {
    throw new ApiError(401, 'La cuenta asociada a esta sesión no existe.');
  }

  return publicUser(user);
};

export const createAuthToken = (userId, role = 'customer') => jwt.sign(
  { role },
  process.env.JWT_SECRET,
  { subject: String(userId), expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
);
