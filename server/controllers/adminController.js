/**
 * adminController.js
 * All persistence uses Firestore via firestoreService.
 * Socket.IO real-time notifications are preserved unchanged.
 */
const {
  Users, Employees, Documents, ChecklistItems, Tasks, AccessRequests, Signatures,
} = require('../config/firestoreService');
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
    const allEmployees = await Employees.findAll();

    const totalEmployees = allEmployees.length;
    const notStarted     = allEmployees.filter(e => e.onboarding_stage === ONBOARDING_STAGES.NOT_STARTED).length;
    const inProgress     = allEmployees.filter(e => e.onboarding_stage === ONBOARDING_STAGES.IN_PROGRESS).length;
    const completed      = allEmployees.filter(e => e.onboarding_stage === ONBOARDING_STAGES.COMPLETED).length;

    const [pendingDocuments, pendingAccess, pendingTasks] = await Promise.all([
      Documents.countByStatus(DOCUMENT_STATUS.PENDING),
      AccessRequests.countByStatus(ACCESS_REQUEST_STATUS.PENDING),
      Tasks.countByStatus(TASK_STATUS.PENDING),
    ]);

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
    const employees = await Employees.findAll();

    // Enrich each employee with user info — skip orphan records
    const enriched = (await Promise.all(
      employees
        .filter(emp => emp.user_id)
        .map(async (emp) => {
          const user = await Users.findById(emp.user_id);
          if (!user) return null;
          return { ...emp, User: user };
        })
    )).filter(Boolean);

    return res.status(200).json({ success: true, employees: enriched });
  } catch (error) {
    next(error);
  }
};

// ─── GET EMPLOYEE DETAIL ──────────────────────────────────────
exports.getEmployeeDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await Employees.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    const [user, documents, checklist, tasks, accessRequests] = await Promise.all([
      Users.findById(employee.user_id),
      Documents.findByEmployeeId(id),
      ChecklistItems.findByEmployeeId(id),
      Tasks.findByEmployeeId(id),
      AccessRequests.findByEmployeeId(id),
    ]);

    return res.status(200).json({
      success: true,
      employee: {
        ...employee,
        User:           user,
        Documents:      documents.filter(d => d.document_type),
        ChecklistItems: checklist,
        Tasks:          tasks,
        AccessRequests: accessRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── ASSIGN MANAGER OR BUDDY ──────────────────────────────────
exports.assignManagerOrBuddy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { manager, buddy } = req.body;

    const employee = await Employees.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    const updateData = {};
    if (manager !== undefined) updateData.manager = manager;
    if (buddy   !== undefined) updateData.buddy   = buddy;

    const updated = await Employees.update(id, updateData);

    // Real-time notification
    try {
      const io = getIO();
      io.to(`employee_${employee.user_id}`).emit('employeeUpdated', {
        type:    'assignment',
        message: 'Your manager/buddy assignment has been updated.',
        data:    { manager: updated.manager, buddy: updated.buddy },
      });
    } catch (_) {}

    return res.status(200).json({ success: true, employee: updated });
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

    const employee = await Employees.findById(employee_id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    const task = await Tasks.create({
      employee_id,
      title,
      description: description || '',
      assigned_by: req.user.id,
      status:      TASK_STATUS.PENDING,
      deadline:    deadline ? new Date(deadline) : null,
    });

    // Real-time notification
    try {
      const io = getIO();
      io.to(`employee_${employee.user_id}`).emit('employeeUpdated', {
        type:    'task_assigned',
        message: `New task assigned: ${title}`,
        data:    task,
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
    const { id }                      = req.params;
    const { status, review_comment }  = req.body;

    const allowed = [DOCUMENT_STATUS.VERIFIED, DOCUMENT_STATUS.REJECTED];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `status must be one of: ${allowed.join(', ')}`,
      });
    }

    const document = await Documents.findById(id);
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    const updated = await Documents.update(id, {
      verification_status: status,
      review_comment: review_comment || null,
      reviewed_at: new Date().toISOString(),
    });

    // Real-time notification
    try {
      // Look up the employee to get the user_id for socket room
      const employee = await Employees.findById(document.employee_id);
      const io = getIO();
      io.to(`employee_${employee.user_id}`).emit('employeeUpdated', {
        type:    'document_updated',
        message: `Your document "${document.document_name}" has been ${status}.`,
        data:    { document_id: id, status },
      });
    } catch (_) {}

    return res.status(200).json({ success: true, document: updated });
  } catch (error) {
    next(error);
  }
};

// ─── HANDLE ACCESS REQUEST ─────────────────────────────────────
exports.handleAccessRequest = async (req, res, next) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const allowed = [ACCESS_REQUEST_STATUS.APPROVED, ACCESS_REQUEST_STATUS.REJECTED];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `status must be one of: ${allowed.join(', ')}`,
      });
    }

    const request = await AccessRequests.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Access request not found.' });
    }

    const updated = await AccessRequests.update(id, {
      status,
      approved_by: req.user.id,
    });

    // Real-time notification
    try {
      const employee = await Employees.findById(request.employee_id);
      const io = getIO();
      io.to(`employee_${employee.user_id}`).emit('employeeUpdated', {
        type:    'access_request_updated',
        message: `Your access request for "${request.application_name}" has been ${status}.`,
        data:    { request_id: id, status, application: request.application_name },
      });
    } catch (_) {}

    return res.status(200).json({ success: true, request: updated });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL DOCUMENTS ────────────────────────────────────────
exports.getAllDocuments = async (req, res, next) => {
  try {
    const documents = await Documents.findAll();

    // Enrich with employee + user info — skip orphans
    const enriched = (await Promise.all(
      documents
        .filter(doc => doc.employee_id && doc.document_type)
        .map(async (doc) => {
          const employee = await Employees.findById(doc.employee_id);
          const user     = employee ? await Users.findById(employee.user_id) : null;
          return { ...doc, Employee: { ...employee, User: user } };
        })
    )).filter(Boolean);

    return res.status(200).json({ success: true, documents: enriched });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL TASKS ────────────────────────────────────────────
exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Tasks.findAll();

    const enriched = (await Promise.all(
      tasks
        .filter(task => task.employee_id)
        .map(async (task) => {
          const employee = await Employees.findById(task.employee_id);
          const user     = employee ? await Users.findById(employee.user_id) : null;
          return { ...task, Employee: { ...employee, User: user } };
        })
    )).filter(Boolean);

    return res.status(200).json({ success: true, tasks: enriched });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL ACCESS REQUESTS ──────────────────────────────────
exports.getAllAccessRequests = async (req, res, next) => {
  try {
    const requests = await AccessRequests.findAll();

    const enriched = (await Promise.all(
      requests
        .filter(r => r.employee_id)
        .map(async (r) => {
          const employee = await Employees.findById(r.employee_id);
          const user     = employee ? await Users.findById(employee.user_id) : null;
          return { ...r, Employee: { ...employee, User: user } };
        })
    )).filter(Boolean);

    return res.status(200).json({ success: true, requests: enriched });
  } catch (error) {
    next(error);
  }
};

// ─── GET EMPLOYEE SIGNATURES ──────────────────────────────────
exports.getEmployeeSignatures = async (req, res, next) => {
  try {
    const { id } = req.params;
    const signatures = await Signatures.findByEmployeeId(id);
    return res.status(200).json({ success: true, signatures });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE ONBOARDING STAGE ──────────────────────────────────
exports.updateOnboardingStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { onboarding_stage } = req.body;

    const allowed = ['not_started', 'in_progress', 'completed'];
    if (!onboarding_stage || !allowed.includes(onboarding_stage)) {
      return res.status(400).json({ success: false, error: `onboarding_stage must be one of: ${allowed.join(', ')}` });
    }

    const employee = await Employees.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    const updated = await Employees.update(id, { onboarding_stage });

    try {
      const io = getIO();
      io.to(`employee_${employee.user_id}`).emit('employeeUpdated', {
        type:    'stage_updated',
        message: `Your onboarding stage has been updated to ${onboarding_stage}.`,
        data:    { onboarding_stage },
      });
    } catch (_) {}

    return res.status(200).json({ success: true, employee: updated });
  } catch (error) {
    next(error);
  }
};
