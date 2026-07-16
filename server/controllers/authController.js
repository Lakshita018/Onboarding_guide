/**
 * server/controllers/authController.js
 */

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User         = require('../models/User');
const Employee     = require('../models/Employee');
const ChecklistItem = require('../models/ChecklistItem');
const {
  ROLES,
  BCRYPT_SALT_ROUNDS,
  DEFAULT_CHECKLIST,
  apiSuccess,
  apiError,
} = require('../config/constants');

// ─── POST /api/auth/register ──────────────────────────────────────────────────
async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(apiError('Validation failed.', errors.array()));
    }

    const { name, email, password, role = ROLES.EMPLOYEE, department, designation } = req.body;

    // Prevent self-registration as admin
    const safeRole = role === ROLES.ADMIN ? ROLES.EMPLOYEE : role;

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json(apiError('An account with this email already exists.'));
    }

    const password_hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user          = await User.create({ name, email, password_hash, role: safeRole });

    // Create employee profile for employee users
    if (safeRole === ROLES.EMPLOYEE) {
      const employee = await Employee.create({ user_id: user.id, department, designation });

      // Seed default checklist
      const checklistItems = DEFAULT_CHECKLIST.map(item => ({
        ...item,
        employee_id: employee.id,
      }));
      await ChecklistItem.bulkCreate(checklistItems);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json(apiSuccess({ token, user }, 'Account created successfully.'));
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json(apiError('Validation failed.', errors.array()));
    }

    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json(apiError('Invalid email or password.'));
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json(apiError('Invalid email or password.'));
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Strip password hash from response
    const { password_hash: _pw, ...safeUser } = user;

    res.json(apiSuccess({ token, user: safeUser }, 'Login successful.'));
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json(apiError('User not found.'));
    }

    let employee = null;
    if (user.role === ROLES.EMPLOYEE) {
      employee = await Employee.findByUserId(user.id);
    }

    res.json(apiSuccess({ user, employee }));
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };
