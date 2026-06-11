import logger from '../utils/logger.js';
import { AppError } from '../utils/response.js';

const handleCastError = (err) => new AppError(`Invalid ${err.path}: ${err.value}`, 400);
const handleDuplicateError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists. Please use a different value.`, 400);
};
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${errors.join('. ')}`, 400);
};
const handleCSRFError = () => new AppError('Security token expired. Please refresh the page and try again.', 403);
const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Token expired. Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({ success: false, message: err.message });
  } else {
    logger.error('UNEXPECTED ERROR:', err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

export const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found.`, 404));
};

export const globalErrorHandler = (err, req, res, _next) => {
  err.statusCode = err.statusCode || err.status || 500;
  err.status = err.statusCode >= 400 && err.statusCode < 500 ? 'fail' : 'error';

  // Log full error in development for debugging
  if (process.env.NODE_ENV === 'development') {
    logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    if (err.errors) logger.debug('Validation Errors:', err.errors);
    return sendErrorDev(err, res);
  }

  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  let error = { ...err, message: err.message };
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateError(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.code === 'EBADCSRFTOKEN') error = handleCSRFError();
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  sendErrorProd(error, res);
};
