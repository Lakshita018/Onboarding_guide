const { verifyToken } = require('../utils/jwt');

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    // Attach user payload to request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
};

module.exports = authenticateUser;
module.exports.authenticateUser = authenticateUser;
