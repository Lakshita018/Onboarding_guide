/**
 * employeeController.js
 * All persistence now uses Firestore via firestoreService.
 * Document uploads go to Cloudinary; only the URL is stored in Firestore.
 */
const streamifier = require('streamifier');
const cloudinary   = require('../config/cloudinary');
const {
  Users, Employees, Documents, ChecklistItems, AccessRequests, Tasks,
} = require('../config/firestoreService');
const { generateRecommendations } = require('../services/watsonxAI');
const {
  DOCUMENT_TYPES,
  DOCUMENT_STATUS,
  ONBOARDING_STAGES,
  ACCESS_REQUEST_STATUS,
} = require('../utils/constants');

// ─── Helper: upload buffer to Cloudinary ─────────────────────────────────────
function uploadToCloudinary(buffer, originalname) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'onboarding_documents',
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// ─── GET PROFILE ───────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user     = await Users.findById(req.user.id);
    const employee = await Employees.findByUserId(req.user.id);

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee profile not found.' });
    }

    return res.status(200).json({
      success: true,
      profile: {
        id:               employee.id,
        user_id:          user.id,
        name:             user.name,
        email:            user.email,
        department:       employee.department,
        designation:      employee.designation,
        manager:          employee.manager,
        buddy:            employee.buddy,
        joining_date:     employee.joining_date,
        onboarding_stage: employee.onboarding_stage,
        offer_accepted:   employee.offer_accepted,
        os_type:          employee.os_type,
        status:           employee.status,
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

    const employee = await Employees.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee profile not found.' });
    }

    // Upload file buffer to Cloudinary
    const cloudResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    // Check for existing document of same type — replace if exists
    const existing = await Documents.findByEmployeeIdAndType(employee.id, document_type);

    let doc;
    if (existing) {
      doc = await Documents.update(existing.id, {
        document_name:        req.file.originalname,
        cloudinary_url:       cloudResult.secure_url,
        cloudinary_public_id: cloudResult.public_id,
        verification_status:  DOCUMENT_STATUS.PENDING,
        review_comment:       null,
        reviewed_at:          null,
        created_at:           new Date().toISOString(),
      });
    } else {
      doc = await Documents.create({
        employee_id:           employee.id,
        document_name:         req.file.originalname,
        document_type,
        cloudinary_url:        cloudResult.secure_url,
        cloudinary_public_id:  cloudResult.public_id,
        verification_status:   DOCUMENT_STATUS.PENDING,
      });
    }

    return res.status(201).json({
      success: true,
      document: {
        id:         doc.id,
        name:       doc.document_name,
        type:       doc.document_type,
        status:     doc.verification_status,
        url:        doc.cloudinary_url,
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
    const employee = await Employees.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee profile not found.' });
    }

    const documents = await Documents.findByEmployeeId(employee.id);
    return res.status(200).json({ success: true, documents });
  } catch (error) {
    next(error);
  }
};

// ─── ACCEPT OFFER ──────────────────────────────────────────────
exports.acceptOffer = async (req, res, next) => {
  try {
    const employee = await Employees.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee profile not found.' });
    }

    if (employee.offer_accepted) {
      return res.status(400).json({ success: false, error: 'Offer already accepted.' });
    }

    await Employees.update(employee.id, {
      offer_accepted:   true,
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
    const employee = await Employees.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee profile not found.' });
    }

    const items     = await ChecklistItems.findByEmployeeId(employee.id);
    const total     = items.length;
    const completed = items.filter((i) => i.completed).length;

    return res.status(200).json({
      success: true,
      checklist: items,
      progress: {
        total,
        completed,
        percentage: total ? Math.round((completed / total) * 100) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE CHECKLIST ITEM ────────────────────────────────────
exports.updateChecklistItem = async (req, res, next) => {
  try {
    const { id }       = req.params;
    const { completed } = req.body;

    const employee = await Employees.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    const item = await ChecklistItems.findByIdAndEmployee(id, employee.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Checklist item not found.' });
    }

    const updated = await ChecklistItems.update(id, {
      completed:    !!completed,
      completed_at: completed ? new Date().toISOString() : null,
    });

    return res.status(200).json({ success: true, item: updated });
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

    const employee = await Employees.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    await Employees.update(employee.id, { os_type });
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

    const employee = await Employees.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    const request = await AccessRequests.create({
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
    const employee = await Employees.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    const requests = await AccessRequests.findByEmployeeId(employee.id);
    return res.status(200).json({ success: true, requests });
  } catch (error) {
    next(error);
  }
};

// ─── GET AI RECOMMENDATIONS ───────────────────────────────────
exports.getRecommendations = async (req, res, next) => {
  try {
    const employee = await Employees.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    const recs = await generateRecommendations({
      department:       employee.department,
      onboarding_stage: employee.onboarding_stage,
      os_type:          employee.os_type,
    });

    return res.status(200).json({ success: true, recommendations: recs });
  } catch (error) {
    next(error);
  }
};

// ─── GET TASKS ─────────────────────────────────────────────────
exports.getTasks = async (req, res, next) => {
  try {
    const employee = await Employees.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }
    const tasks = await Tasks.findByEmployeeId(employee.id);
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
};

