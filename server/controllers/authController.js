const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { ROLES } = require('../utils/constants');
const { generateToken } = require('../utils/jwt');

// User registration (Signup)
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate request body
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email is already registered.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user (default role is employee)
    const user = await User.create({
      name,
      email,
      password_hash: passwordHash,
      role: ROLES.EMPLOYEE,
    });

    // Initialize employee profile
    await Employee.create({
      user_id: user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created'
    });
  } catch (error) {
    next(error);
  }
};

// User login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    // Fetch user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Compare password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Generate JWT via helper
    const token = generateToken(user);

    // Return response matching requirements
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Fetch current user session details (Profile)
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User session not found.' });
    }

    // Return details directly as in the spec example
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};


