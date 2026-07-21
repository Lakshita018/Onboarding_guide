const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, error: 'Access forbidden. User role not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Access forbidden. Insufficient permissions.' });
    }

    next();
  };
};

module.exports = authorizeRole;
module.exports.authorizeRole = authorizeRole;
