/**
 * server/controllers/checklistController.js
 */

const Employee     = require('../models/Employee');
const ChecklistItem = require('../models/ChecklistItem');
const { apiSuccess, apiError } = require('../config/constants');

// ─── GET /api/checklist ───────────────────────────────────────────────────────
async function getChecklist(req, res, next) {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json(apiError('Employee profile not found.'));
    }

    const [items, progress] = await Promise.all([
      ChecklistItem.findByEmployeeId(employee.id),
      ChecklistItem.getProgress(employee.id),
    ]);

    res.json(apiSuccess({ items, progress }));
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/checklist/:id/complete ───────────────────────────────────────
async function markComplete(req, res, next) {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json(apiError('Employee profile not found.'));
    }

    const item = await ChecklistItem.markComplete(req.params.id, employee.id);
    if (!item) {
      return res.status(404).json(apiError('Checklist item not found.'));
    }

    const progress = await ChecklistItem.getProgress(employee.id);
    res.json(apiSuccess({ item, progress }, 'Task marked as complete.'));
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/checklist/:id/incomplete ─────────────────────────────────────
async function markIncomplete(req, res, next) {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json(apiError('Employee profile not found.'));
    }

    const item = await ChecklistItem.markIncomplete(req.params.id, employee.id);
    if (!item) {
      return res.status(404).json(apiError('Checklist item not found.'));
    }

    const progress = await ChecklistItem.getProgress(employee.id);
    res.json(apiSuccess({ item, progress }, 'Task marked as incomplete.'));
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/checklist (admin adds item for an employee) ────────────────────
async function addItem(req, res, next) {
  try {
    const { employee_id, title, description, category, priority, due_date } = req.body;
    if (!employee_id || !title) {
      return res.status(400).json(apiError('employee_id and title are required.'));
    }

    const item = await ChecklistItem.create({
      employee_id, title, description, category, priority, due_date,
    });
    res.status(201).json(apiSuccess({ item }, 'Checklist item added.'));
  } catch (err) {
    next(err);
  }
}

module.exports = { getChecklist, markComplete, markIncomplete, addItem };
