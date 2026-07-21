/**
 * server/middleware/auth.js
 *
 * JWT verification middleware.
 * Attaches decoded payload to req.user on success.
 */

const jwt = require('jsonwebtoken');
const { apiError } = require('../config/constants');

module.exports = function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(apiError('Authentication required. Please log in.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;   // { id, email, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json(apiError('Session expired. Please log in again.'));
    }
    return res.status(401).json(apiError('Invalid authentication token.'));
  }
};
