/**
 * server/controllers/taskController.js
 */

const Employee = require('../models/Employee');
const Task     = require('../models/Task');
const { getIO } = require('../socket/socketHandler');
const { SOCKET_EVENTS, apiSuccess, apiError } = require('../config/constants');

// ─── GET /api/tasks (employee: own tasks) ─────────────────────────────────────
async function getMyTasks(req, res, next) {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json(apiError('Employee profile not found.'));
    }
    const tasks = await Task.findByEmployeeId(employee.id);
    res.json(apiSuccess({ tasks }));
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/tasks/:id/status ──────────────────────────────────────────────
async function updateTaskStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(apiError(`status must be one of: ${validStatuses.join(', ')}`));
    }

    const task = await Task.updateStatus(req.params.id, status);
    if (!task) {
      return res.status(404).json(apiError('Task not found.'));
    }
    res.json(apiSuccess({ task }, 'Task status updated.'));
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/admin/tasks (admin assigns task) ───────────────────────────────
async function createTask(req, res, next) {
  try {
    const { employee_id, title, description, deadline } = req.body;
    if (!employee_id || !title) {
      return res.status(400).json(apiError('employee_id and title are required.'));
    }

    const task = await Task.create({
      employee_id,
      title,
      description,
      assigned_by: req.user.id,
      deadline,
    });

    // Real-time: notify the employee
    try {
      const io = getIO();
      io.to(`employee:${employee_id}`).emit(SOCKET_EVENTS.TASK_ASSIGNED, { task });
      io.to(`employee:${employee_id}`).emit(SOCKET_EVENTS.NOTIFICATION, {
        title:   'New Task Assigned',
        message: `You have been assigned: "${title}"`,
        type:    'info',
      });
    } catch (_) { /* Socket not available in all environments */ }

    res.status(201).json(apiSuccess({ task }, 'Task assigned successfully.'));
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/tasks ─────────────────────────────────────────────────────
async function getAllTasks(req, res, next) {
  try {
    const tasks = await Task.findAllForAdmin();
    res.json(apiSuccess({ tasks }));
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyTasks, updateTaskStatus, createTask, getAllTasks };
