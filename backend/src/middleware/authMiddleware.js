import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler.js';
import { isTokenRevoked } from './tokenBlacklist.js';

const COOKIE_NAME = 'auth_token';

export const authenticate = (req, _res, next) => {
  const authorization = req.get('authorization');
  const bearerToken = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;
  const token = req.cookies[COOKIE_NAME] || bearerToken;

  if (req.method === 'GET' && req.originalUrl === '/api/cart') {
    console.log('[AUTH DEBUG] GET /api/cart');
    console.log('req.cookies exists:', !!req.cookies);
    console.log('auth_token cookie:', req.cookies?.[COOKIE_NAME] ? 'PRESENTE' : 'AUSENTE');
    console.log('authorization header:', authorization ? 'PRESENTE' : 'AUSENTE');
  }

  if (!token) {
    return next(new ApiError(401, 'Debes iniciar sesión para realizar esta acción.'));
  }

  if (isTokenRevoked(token)) {
    return next(new ApiError(401, 'Tu sesión no es válida o ha expirado.'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = { userId: payload.sub, role: payload.role || 'customer' };
    req.authViaBearer = !!bearerToken;
    return next();
  } catch {
    return next(new ApiError(401, 'Tu sesión no es válida o ha expirado.'));
  }
};

export { COOKIE_NAME };
