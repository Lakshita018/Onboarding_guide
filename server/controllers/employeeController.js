const path = require('path');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Document = require('../models/Document');
const ChecklistItem = require('../models/ChecklistItem');
const AccessRequest = require('../models/AccessRequest');
const { generateRecommendations } = require('../services/watsonxAI');
const {
  DOCUMENT_TYPES,
  DOCUMENT_STATUS,
  ONBOARDING_STAGES,
  ACCESS_REQUEST_STATUS,
} = require('../utils/constants');

// ─── GET PROFILE ───────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee profile not found.' });
    }

    return res.status(200).json({
      success: true,
      profile: {
        id: employee.id,
        user_id: user.id,
        name: user.name,
        email: user.email,
        department: employee.department,
        designation: employee.designation,
        manager: employee.manager,
        buddy: employee.buddy,
        joining_date: employee.joining_date,
        onboarding_stage: employee.onboarding_stage,
        offer_accepted: employee.offer_accepted,
        os_type: employee.os_type,
        status: employee.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPLOAD DOCUMENT ───────────────────────────────────────────
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const { document_type } = req.body;
    const allowedTypes = Object.values(DOCUMENT_TYPES);
    if (!document_type || !allowedTypes.includes(document_type)) {
      return res.status(400).json({
        success: false,
        error: `document_type must be one of: ${allowedTypes.join(', ')}`,
      });
    }

    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee profile not found.' });
    }

    const doc = await Document.create({
      employee_id: employee.id,
      document_name: req.file.originalname,
      document_type,
      file_path: req.file.path,
      verification_status: DOCUMENT_STATUS.PENDING,
    });

    return res.status(201).json({
      success: true,
      document: {
        id: doc.id,
        name: doc.document_name,
        type: doc.document_type,
        status: doc.verification_status,
        created_at: doc.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET DOCUMENTS ─────────────────────────────────────────────
exports.getDocuments = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee profile not found.' });
    }

    const documents = await Document.findAll({
      where: { employee_id: employee.id },
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({ success: true, documents });
  } catch (error) {
    next(error);
  }
};

// ─── ACCEPT OFFER ──────────────────────────────────────────────
exports.acceptOffer = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee profile not found.' });
    }

    if (employee.offer_accepted) {
      return res.status(400).json({ success: false, error: 'Offer already accepted.' });
    }

    await employee.update({
      offer_accepted: true,
      onboarding_stage: ONBOARDING_STAGES.IN_PROGRESS,
    });

    return res.status(200).json({
      success: true,
      message: 'Offer accepted successfully.',
      onboarding_stage: ONBOARDING_STAGES.IN_PROGRESS,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET CHECKLIST ─────────────────────────────────────────────
exports.getChecklist = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee profile not found.' });
    }

    const items = await ChecklistItem.findAll({
      where: { employee_id: employee.id },
      order: [
        ['completed', 'ASC'],
        ['priority', 'ASC'],
        ['created_at', 'ASC'],
      ],
    });

    const total = items.length;
    const completed = items.filter((i) => i.completed).length;

    return res.status(200).json({
      success: true,
      checklist: items,
      progress: { total, completed, percentage: total ? Math.round((completed / total) * 100) : 0 },
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE CHECKLIST ITEM ────────────────────────────────────
exports.updateChecklistItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    const item = await ChecklistItem.findOne({
      where: { id, employee_id: employee.id },
    });

    if (!item) {
      return res.status(404).json({ success: false, error: 'Checklist item not found.' });
    }

    await item.update({
      completed: !!completed,
      completed_at: completed ? new Date() : null,
    });

    return res.status(200).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE OS TYPE ────────────────────────────────────────────
exports.updateOsType = async (req, res, next) => {
  try {
    const { os_type } = req.body;
    const allowed = ['windows', 'mac', 'linux'];

    if (!os_type || !allowed.includes(os_type)) {
      return res.status(400).json({
        success: false,
        error: `os_type must be one of: ${allowed.join(', ')}`,
      });
    }

    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    await employee.update({ os_type });
    return res.status(200).json({ success: true, os_type });
  } catch (error) {
    next(error);
  }
};

// ─── REQUEST ACCESS ────────────────────────────────────────────
exports.requestAccess = async (req, res, next) => {
  try {
    const { application_name, reason } = req.body;

    if (!application_name || !reason) {
      return res.status(400).json({
        success: false,
        error: 'application_name and reason are required.',
      });
    }

    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    const request = await AccessRequest.create({
      employee_id: employee.id,
      application_name,
      reason,
      status: ACCESS_REQUEST_STATUS.PENDING,
    });

    return res.status(201).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

// ─── GET ACCESS REQUESTS ──────────────────────────────────────
exports.getAccessRequests = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    const requests = await AccessRequest.findAll({
      where: { employee_id: employee.id },
      order: [['requested_at', 'DESC']],
    });

    return res.status(200).json({ success: true, requests });
  } catch (error) {
    next(error);
  }
};

// ─── GET AI RECOMMENDATIONS ───────────────────────────────────
exports.getRecommendations = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    const recs = await generateRecommendations({
      department: employee.department,
      onboarding_stage: employee.onboarding_stage,
      os_type: employee.os_type,
    });

    return res.status(200).json({ success: true, recommendations: recs });
  } catch (error) {
    next(error);
  }
};
