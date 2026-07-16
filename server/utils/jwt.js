const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123456';

/**
 * Generate a JWT token containing user ID and role.
 * @param {Object} user User object containing id and role.
 * @returns {String} Signed JWT.
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Verify a JWT token.
 * @param {String} token JWT token string.
 * @returns {Object} Decoded token payload.
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  generateToken,
  verifyToken,
};
