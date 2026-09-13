import { ApiError } from './errorHandler.js';

export const requireAdmin = (req, _res, next) => {
  if (!req.auth) {
    return next(new ApiError(401, 'Debes iniciar sesión.'));
  }

  if (req.auth.role !== 'admin') {
    return next(new ApiError(403, 'No tienes permisos para realizar esta acción.'));
  }

  return next();
};
