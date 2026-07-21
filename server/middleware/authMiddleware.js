/**
 * authMiddleware.js
 * Verifies Firebase ID tokens sent as Bearer tokens.
 * Attaches { id, role, email } to req.user — same shape used by all controllers.
 */
const { auth, Users } = require('../config/firestoreService');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    const idToken = authHeader.split(' ')[1];

    // Verify with Firebase Admin
    const decoded = await auth.verifyIdToken(idToken);

    // Fetch Firestore user document to get the role
    const user = await Users.findById(decoded.uid);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User record not found.' });
    }

    // Attach the same shape controllers already expect: { id, role, email, name }
    req.user = {
      id:    decoded.uid,
      role:  user.role || 'employee',
      email: user.email,
      name:  user.name,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
};

module.exports = authenticateUser;
module.exports.authenticateUser = authenticateUser;
