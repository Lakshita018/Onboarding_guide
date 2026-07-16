/**
 * server/controllers/adminController.js
 */

const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const Employee = require('../models/Employee');
const ChecklistItem = require('../models/ChecklistItem');
const Document = require('../models/Document');
const Task     = require('../models/Task');
const AccessRequest = require('../models/AccessRequest');
const {
  ROLES,
  BCRYPT_SALT_ROUNDS,
  DEFAULT_CHECKLIST,
  apiSuccess,
  apiError,
} = require('../config/constants');

// ─── GET /api/admin/employees ─────────────────────────────────────────────────
async function listEmployees(req, res, next) {
  try {
    const { status, stage } = req.query;
    const employees = await Employee.findAll({
      status,
      onboarding_stage: stage,
    });
    res.json(apiSuccess({ employees }));
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/employees/:id ────────────────────────────────────────────
async function getEmployee(req, res, next) {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json(apiError('Employee not found.'));
    }

    const [progress, documents, tasks, accessRequests] = await Promise.all([
      ChecklistItem.getProgress(employee.id),
      Document.findByEmployeeId(employee.id),
      Task.findByEmployeeId(employee.id),
      AccessRequest.findByEmployeeId(employee.id),
    ]);

    res.json(apiSuccess({ employee, progress, documents, tasks, accessRequests }));
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/admin/employees/:id ──────────────────────────────────────────
async function updateEmployee(req, res, next) {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json(apiError('Employee not found.'));
    }

    const allowed = [
      'department', 'designation', 'manager', 'buddy',
      'joining_date', 'onboarding_stage', 'status',
    ];
    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = await Employee.update(employee.id, updates);
    res.json(apiSuccess({ employee: updated }, 'Employee updated successfully.'));
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/admin/employees ────────────────────────────────────────────────
async function createEmployee(req, res, next) {
  try {
    const { name, email, password, department, designation, joining_date } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json(apiError('An account with this email already exists.'));
    }

    const rawPassword   = password || 'Welcome@123';
    const password_hash = await bcrypt.hash(rawPassword, BCRYPT_SALT_ROUNDS);
    const user          = await User.create({ name, email, password_hash, role: ROLES.EMPLOYEE });

    const employee = await Employee.create({ user_id: user.id, department, designation, joining_date });

    const checklistItems = DEFAULT_CHECKLIST.map(item => ({
      ...item,
      employee_id: employee.id,
    }));
    await ChecklistItem.bulkCreate(checklistItems);

    const { password_hash: _pw, ...safeUser } = user;
    res.status(201).json(apiSuccess({ user: safeUser, employee }, 'Employee created successfully.'));
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
async function getStats(req, res, next) {
  try {
    const [employees, stageCounts, pendingDocs, pendingAccess] = await Promise.all([
      Employee.findAll(),
      Employee.countByStage(),
      Document.findPending(),
      AccessRequest.findPending(),
    ]);

    const stageMap = {};
    stageCounts.forEach(row => {
      stageMap[row.onboarding_stage] = parseInt(row.count, 10);
    });

    res.json(apiSuccess({
      total_employees:        employees.length,
      stage_distribution:     stageMap,
      pending_documents:      pendingDocs.length,
      pending_access_requests: pendingAccess.length,
    }));
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/users (for manager/buddy assignment dropdowns) ─────────────
async function listAdminUsers(req, res, next) {
  try {
    const users = await User.findAll({ role: ROLES.ADMIN });
    res.json(apiSuccess({ users }));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listEmployees,
  getEmployee,
  updateEmployee,
  createEmployee,
  getStats,
  listAdminUsers,
};
