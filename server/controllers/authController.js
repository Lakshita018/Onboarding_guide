/**
 * authController.js
 * Signup  → Firebase Auth createUser + Firestore user doc + employee doc
 * Login   → Firebase Auth signInWithEmailAndPassword is handled client-side;
 *            this endpoint verifies the ID token and returns user info + role.
 * Profile → returns current user details from Firestore.
 *
 * The client sends the Firebase ID token as the Bearer token on every request.
 */
const { auth, Users, Employees } = require('../config/firestoreService');

// ─── SIGNUP ────────────────────────────────────────────────────────────────────
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    // Check for duplicate email in Firestore
    const existing = await Users.findByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email is already registered.' });
    }

    // Create Firebase Auth user
    let firebaseUser;
    try {
      firebaseUser = await auth.createUser({ email, password, displayName: name });
    } catch (fbError) {
      if (fbError.code === 'auth/email-already-exists') {
        return res.status(400).json({ success: false, error: 'Email is already registered.' });
      }
      throw fbError;
    }

    const uid = firebaseUser.uid;

    // Create Firestore user doc
    await Users.create(uid, { name, email, role: 'employee' });

    // Create Firestore employee profile
    await Employees.create(uid);

    return res.status(201).json({ success: true, message: 'Account created' });
  } catch (error) {
    next(error);
  }
};

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
// The actual password check is done on the client via Firebase Auth.
// This endpoint is called with a Firebase ID token to exchange for user info + role.
exports.login = async (req, res, next) => {
  try {
    // The client sends the Firebase ID token in the request body after
    // successfully signing in with Firebase Auth on the frontend.
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, error: 'idToken is required.' });
    }

    // Verify the token
    let decoded;
    try {
      decoded = await auth.verifyIdToken(idToken);
    } catch (_) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }

    // Read Firestore user document
    const user = await Users.findById(decoded.uid);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User record not found.' });
    }

    // Return the Firebase ID token directly — it IS the session token
    return res.status(200).json({
      success: true,
      token: idToken,
      user: {
        id:   decoded.uid,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET CURRENT USER ──────────────────────────────────────────────────────────
// Protected by authMiddleware — req.user is already populated.
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User session not found.' });
    }

    return res.status(200).json({
      id:    user.id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    });
  } catch (error) {
    next(error);
  }
};
