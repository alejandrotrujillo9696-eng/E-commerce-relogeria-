import crypto from 'node:crypto';

import { ApiError } from './errorHandler.js';

const COOKIE_NAME = '_csrf';

const getCsrfCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: false,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    path: '/',
  };
};

export const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const setCsrfCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, getCsrfCookieOptions());
};

export const ensureCsrfCookie = (req, res, next) => {
  if (!req.cookies[COOKIE_NAME]) {
    const token = generateCsrfToken();
    setCsrfCookie(res, token);
  }

  return next();
};

export const getCsrfToken = (req, res) => {
  let token = req.cookies[COOKIE_NAME];

  if (!token) {
    token = generateCsrfToken();
    setCsrfCookie(res, token);
  }

  return token;
};

export const validateCsrfToken = (req, res, next) => {
  const method = req.method;

  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (!isMutating) {
    return next();
  }

  if (req.authViaBearer) {
    if (method === 'POST' && req.originalUrl === '/api/cart/items') {
      console.log('[CSRF DEBUG] POST /api/cart/items');
      console.log('authViaBearer: SI');
      console.log('_csrf cookie:', req.cookies?.[COOKIE_NAME] ? 'PRESENTE' : 'AUSENTE');
      console.log('X-CSRF-Token header:', req.get('X-CSRF-Token') ? 'PRESENTE' : 'AUSENTE');
    }
    return next();
  }

  const cookieToken = req.cookies[COOKIE_NAME];
  const headerToken = req.get('X-CSRF-Token');

  if (method === 'POST' && req.originalUrl === '/api/cart/items') {
    console.log('[CSRF DEBUG] POST /api/cart/items');
    console.log('authViaBearer: NO');
    console.log('_csrf cookie:', cookieToken ? 'PRESENTE' : 'AUSENTE');
    console.log('X-CSRF-Token header:', headerToken ? 'PRESENTE' : 'AUSENTE');
  }

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new ApiError(403, 'Token CSRF inválido o faltante.'));
  }

  const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const origin = req.get('Origin');

  if (
    origin &&
    allowedOrigins.length > 0 &&
    !allowedOrigins.includes(origin)
  ) {
    return next(new ApiError(403, 'Origen no permitido.'));
  }

  return next();
};

export { COOKIE_NAME };