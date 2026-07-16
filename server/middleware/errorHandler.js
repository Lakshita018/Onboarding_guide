/**
 * server/middleware/errorHandler.js
 *
 * Global error handling middleware.
 * Must be registered last in the Express app.
 */

const multer = require('multer');
const { apiError } = require('../config/constants');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  console.error('[ERROR]', err.message, err.stack ? `\n${err.stack}` : '');

  // Multer errors (file upload)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(
        apiError(`File too large. Maximum allowed size is ${process.env.MAX_FILE_SIZE_MB || 10}MB.`)
      );
    }
    return res.status(400).json(apiError(err.message));
  }

  // JWT errors that bubble up (shouldn't normally — middleware catches first)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json(apiError('Invalid or expired token.'));
  }

  // Validation errors from express-validator (should be caught in controllers)
  if (err.type === 'validation') {
    return res.status(422).json(apiError(err.message, err.errors));
  }

  // PostgreSQL unique-constraint violation
  if (err.code === '23505') {
    return res.status(409).json(apiError('A record with this value already exists.'));
  }

  // Default — do not leak internal details in production
  const message =
    process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred.';

  res.status(err.status || 500).json(apiError(message));
}

module.exports = errorHandler;
