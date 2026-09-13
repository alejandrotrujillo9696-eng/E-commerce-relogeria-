export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFoundHandler = (req, _res, next) => {
  next(new ApiError(404, `No existe la ruta ${req.method} ${req.originalUrl}.`));
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Ocurrió un error interno en el servidor.' : error.message,
  });
};
