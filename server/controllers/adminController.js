const User = require('../models/User');
const Employee = require('../models/Employee');
const Document = require('../models/Document');
const ChecklistItem = require('../models/ChecklistItem');
const Task = require('../models/Task');
const AccessRequest = require('../models/AccessRequest');
const { getIO } = require('../config/socket');
const {
  DOCUMENT_STATUS,
  ACCESS_REQUEST_STATUS,
  TASK_STATUS,
  ONBOARDING_STAGES,
} = require('../utils/constants');

// ─── DASHBOARD STATS ──────────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {
    const allEmployees = await Employee.findAll({ include: [User] });
    const totalEmployees = allEmployees.length;
    const notStarted = allEmployees.filter(e => e.onboarding_stage === ONBOARDING_STAGES.NOT_STARTED).length;
    const inProgress = allEmployees.filter(e => e.onboarding_stage === ONBOARDING_STAGES.IN_PROGRESS).length;
    const completed = allEmployees.filter(e => e.onboarding_stage === ONBOARDING_STAGES.COMPLETED).length;

    const pendingDocuments = await Document.count({ where: { verification_status: DOCUMENT_STATUS.PENDING } });
    const pendingAccess = await AccessRequest.count({ where: { status: ACCESS_REQUEST_STATUS.PENDING } });
    const pendingTasks = await Task.count({ where: { status: TASK_STATUS.PENDING } });

    return res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        notStarted,
        inProgress,
        completed,
        completionRate: totalEmployees ? Math.round((completed / totalEmployees) * 100) : 0,
        pendingDocuments,
        pendingAccess,
        pendingTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL EMPLOYEES ────────────────────────────────────────
exports.getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email', 'created_at'] }],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({ success: true, employees });
  } catch (error) {
    next(error);
  }
};

// ─── GET EMPLOYEE DETAIL ──────────────────────────────────────
exports.getEmployeeDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'name', 'email', 'created_at'] },
        { model: Document },
        { model: ChecklistItem },
        { model: Task },
        { model: AccessRequest },
      ],
    });

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    return res.status(200).json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

// ─── ASSIGN MANAGER OR BUDDY ──────────────────────────────────
exports.assignManagerOrBuddy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { manager, buddy } = req.body;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    const updateData = {};
    if (manager !== undefined) updateData.manager = manager;
    if (buddy !== undefined) updateData.buddy = buddy;

    await employee.update(updateData);

    // Real-time notification
    try {
      const io = getIO();
      io.to(`employee_${employee.user_id}`).emit('employeeUpdated', {
        type: 'assignment',
        message: 'Your manager/buddy assignment has been updated.',
        data: { manager: employee.manager, buddy: employee.buddy },
      });
    } catch (_) {}

    return res.status(200).json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

// ─── ASSIGN TASK ──────────────────────────────────────────────
exports.assignTask = async (req, res, next) => {
  try {
    const { employee_id, title, description, deadline } = req.body;

    if (!employee_id || !title) {
      return res.status(400).json({ success: false, error: 'employee_id and title are required.' });
    }

    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    const task = await Task.create({
      employee_id,
      title,
      description: description || '',
      assigned_by: req.user.id,
      status: TASK_STATUS.PENDING,
      deadline: deadline ? new Date(deadline) : null,
    });

    // Real-time notification
    try {
      const io = getIO();
      io.to(`employee_${employee.user_id}`).emit('employeeUpdated', {
        type: 'task_assigned',
        message: `New task assigned: ${title}`,
        data: task,
      });
    } catch (_) {}

    return res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// ─── VERIFY DOCUMENT ──────────────────────────────────────────
exports.verifyDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = [DOCUMENT_STATUS.VERIFIED, DOCUMENT_STATUS.REJECTED];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `status must be one of: ${allowed.join(', ')}`,
      });
    }

    const document = await Document.findByPk(id, { include: [Employee] });
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    await document.update({ verification_status: status });

    // Real-time notification
    try {
      const io = getIO();
      io.to(`employee_${document.Employee.user_id}`).emit('employeeUpdated', {
        type: 'document_updated',
        message: `Your document "${document.document_name}" has been ${status}.`,
        data: { document_id: document.id, status },
      });
    } catch (_) {}

    return res.status(200).json({ success: true, document });
  } catch (error) {
    next(error);
  }
};

// ─── HANDLE ACCESS REQUEST ─────────────────────────────────────
exports.handleAccessRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = [ACCESS_REQUEST_STATUS.APPROVED, ACCESS_REQUEST_STATUS.REJECTED];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `status must be one of: ${allowed.join(', ')}`,
      });
    }

    const request = await AccessRequest.findByPk(id, { include: [Employee] });
    if (!request) {
      return res.status(404).json({ success: false, error: 'Access request not found.' });
    }

    await request.update({
      status,
      approved_by: req.user.id,
    });

    // Real-time notification
    try {
      const io = getIO();
      io.to(`employee_${request.Employee.user_id}`).emit('employeeUpdated', {
        type: 'access_request_updated',
        message: `Your access request for "${request.application_name}" has been ${status}.`,
        data: { request_id: request.id, status, application: request.application_name },
      });
    } catch (_) {}

    return res.status(200).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL PENDING DOCUMENTS ────────────────────────────────
exports.getAllDocuments = async (req, res, next) => {
  try {
    const documents = await Document.findAll({
      include: [{ model: Employee, include: [{ model: User, attributes: ['name', 'email'] }] }],
      order: [['created_at', 'DESC']],
    });
    return res.status(200).json({ success: true, documents });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL TASKS ────────────────────────────────────────────
exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.findAll({
      include: [{ model: Employee, include: [{ model: User, attributes: ['name', 'email'] }] }],
      order: [['created_at', 'DESC']],
    });
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
};
