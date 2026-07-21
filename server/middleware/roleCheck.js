/**
 * server/middleware/roleCheck.js
 *
 * Role-based access control middleware factory.
 * Usage:  router.use(roleCheck('admin'))
 *         router.use(roleCheck('employee', 'admin'))
 */

const { apiError } = require('../config/constants');

/**
 * @param {...string} allowedRoles - One or more roles that may access the route.
 * @returns Express middleware
 */
function roleCheck(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json(apiError('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(
        apiError(`Access denied. Required role: ${allowedRoles.join(' or ')}.`)
      );
    }

    next();
  };
}

module.exports = roleCheck;
