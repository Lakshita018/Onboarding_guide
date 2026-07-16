/**
 * server/controllers/employeeController.js
 */

const Employee    = require('../models/Employee');
const ChecklistItem = require('../models/ChecklistItem');
const { getRecommendations } = require('../services/watsonxAI');
const { apiSuccess, apiError } = require('../config/constants');

// ─── GET /api/employee/profile ────────────────────────────────────────────────
async function getProfile(req, res, next) {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json(apiError('Employee profile not found.'));
    }
    res.json(apiSuccess({ employee }));
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/employee/profile ─────────────────────────────────────────────
async function updateProfile(req, res, next) {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json(apiError('Employee profile not found.'));
    }

    const allowedFields = ['department', 'designation', 'joining_date', 'os_type'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = await Employee.update(employee.id, updates);
    res.json(apiSuccess({ employee: updated }, 'Profile updated successfully.'));
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/employee/accept-offer ─────────────────────────────────────────
async function acceptOffer(req, res, next) {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json(apiError('Employee profile not found.'));
    }

    const updated = await Employee.update(employee.id, {
      offer_accepted:  true,
      onboarding_stage: 'ORIENTATION',
    });

    res.json(apiSuccess({ employee: updated }, 'Offer letter accepted. Welcome to IBM!'));
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/employee/recommendations ───────────────────────────────────────
async function getRecommendationsForEmployee(req, res, next) {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json(apiError('Employee profile not found.'));
    }

    const progress = await ChecklistItem.getProgress(employee.id);

    const { recommendations } = await getRecommendations({
      onboarding_stage:      employee.onboarding_stage,
      completion_percentage: progress.percentage,
    });

    res.json(apiSuccess({ recommendations }));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  acceptOffer,
  getRecommendationsForEmployee,
};
