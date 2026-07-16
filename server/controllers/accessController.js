/**
 * server/controllers/accessController.js
 */

const Employee      = require('../models/Employee');
const AccessRequest = require('../models/AccessRequest');
const { getIO }     = require('../socket/socketHandler');
const { SOCKET_EVENTS, ACCESS_STATUS, apiSuccess, apiError } = require('../config/constants');

// ─── GET /api/access (employee: own requests) ─────────────────────────────────
async function getMyRequests(req, res, next) {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json(apiError('Employee profile not found.'));
    }
    const requests = await AccessRequest.findByEmployeeId(employee.id);
    res.json(apiSuccess({ requests }));
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/access ─────────────────────────────────────────────────────────
async function createRequest(req, res, next) {
  try {
    const { application_name, reason } = req.body;
    if (!application_name) {
      return res.status(400).json(apiError('application_name is required.'));
    }

    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json(apiError('Employee profile not found.'));
    }

    const request = await AccessRequest.create({
      employee_id:      employee.id,
      application_name,
      reason,
    });

    res.status(201).json(apiSuccess({ request }, 'Access request submitted successfully.'));
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/admin/access/:id (admin reviews request) ─────────────────────
async function reviewRequest(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = [ACCESS_STATUS.APPROVED, ACCESS_STATUS.REJECTED];

    if (!validStatuses.includes(status)) {
      return res.status(400).json(apiError(`status must be 'approved' or 'rejected'.`));
    }

    const existing = await AccessRequest.findById(req.params.id);
    if (!existing) {
      return res.status(404).json(apiError('Access request not found.'));
    }

    const updated = await AccessRequest.updateStatus(req.params.id, {
      status,
      approved_by: req.user.id,
    });

    // Real-time: notify the employee
    try {
      const io = getIO();
      io.to(`employee:${existing.employee_id}`).emit(SOCKET_EVENTS.EMPLOYEE_UPDATED, {
        type: 'access_request',
        data: updated,
      });
      io.to(`employee:${existing.employee_id}`).emit(SOCKET_EVENTS.NOTIFICATION, {
        title:   status === 'approved' ? 'Access Granted' : 'Access Request Rejected',
        message: `Your request for "${existing.application_name}" has been ${status}.`,
        type:    status === 'approved' ? 'success' : 'error',
      });
    } catch (_) {}

    res.json(apiSuccess({ request: updated }, `Access request ${status}.`));
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/access/pending ───────────────────────────────────────────
async function getPendingRequests(req, res, next) {
  try {
    const requests = await AccessRequest.findPending();
    res.json(apiSuccess({ requests }));
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyRequests, createRequest, reviewRequest, getPendingRequests };
