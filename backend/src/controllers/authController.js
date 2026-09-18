import pool from '../config/db.js';
import { COOKIE_NAME } from '../middleware/authMiddleware.js';
import { createAuthToken, getUserById, loginUser, registerUser } from '../services/authService.js';
import { revokeToken } from '../middleware/tokenBlacklist.js';
import {
  authenticateWithProvider,
  createAuthorizationUrl,
  getSocialFrontendErrorUrl,
  SOCIAL_STATE_COOKIE,
} from '../services/socialAuthService.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: Number(process.env.JWT_MAX_AGE || 24 * 60 * 60 * 1000),
};

const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, cookieOptions);
};

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(pool, req.body);
    const fullUser = await getUserById(pool, user.id);
    const token = createAuthToken(fullUser.id, fullUser.role);
    setAuthCookie(res, token);
    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await loginUser(pool, req.body);
    const fullUser = await getUserById(pool, user.id);
    const token = createAuthToken(fullUser.id, fullUser.role);
    setAuthCookie(res, token);
    res.json({ success: true, data: { user, token } });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  const token = req.cookies[COOKIE_NAME];
  const authorization = req.get('authorization');
  const bearerToken = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (token) {
    revokeToken(token);
  }

  if (bearerToken) {
    revokeToken(bearerToken);
  }

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  res.json({ success: true, data: null });
};

export const me = async (req, res, next) => {
  try {
    const user = await getUserById(pool, req.auth.userId);
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

export const socialStart = (req, res, next) => {
  try {
    const { url, state } = createAuthorizationUrl(req.params.provider);
    res.cookie(SOCIAL_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
      path: '/',
    });
    res.redirect(url);
  } catch (error) {
    next(error);
  }
};

export const socialCallback = async (req, res) => {
  try {
    if (!req.query.code || !req.query.state) {
      throw new Error('La respuesta del proveedor social está incompleta.');
    }

    const user = await authenticateWithProvider(
      pool,
      req.params.provider,
      req.query.code,
      req.query.state,
      req.cookies[SOCIAL_STATE_COOKIE]
    );
    const token = createAuthToken(user.id, user.role);
    setAuthCookie(res, token);
    res.clearCookie(SOCIAL_STATE_COOKIE, { httpOnly: true, path: '/' });
    const frontendUrl = process.env.FRONTEND_URL?.split(',')[0].trim() || '/';
    res.redirect(frontendUrl);
  } catch (error) {
    const message = error.statusCode === 409
      ? error.message
      : 'No fue posible completar el inicio de sesión social.';
    res.redirect(getSocialFrontendErrorUrl(message));
  }
};
