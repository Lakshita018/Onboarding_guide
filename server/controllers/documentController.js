/**
 * server/controllers/documentController.js
 */

const path     = require('path');
const fs       = require('fs');
const Employee = require('../models/Employee');
const Document = require('../models/Document');
const { apiSuccess, apiError } = require('../config/constants');

// ─── GET /api/documents ───────────────────────────────────────────────────────
async function getDocuments(req, res, next) {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json(apiError('Employee profile not found.'));
    }
    const documents = await Document.findByEmployeeId(employee.id);
    res.json(apiSuccess({ documents }));
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/documents/upload ──────────────────────────────────────────────
async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json(apiError('No file provided.'));
    }

    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      // Remove uploaded file if employee profile is missing
      fs.unlink(req.file.path, () => {});
      return res.status(404).json(apiError('Employee profile not found.'));
    }

    const { document_name, document_type } = req.body;
    if (!document_name || !document_type) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json(apiError('document_name and document_type are required.'));
    }

    const relativePath = path.relative(
      process.cwd(),
      req.file.path
    ).replace(/\\/g, '/');

    const document = await Document.create({
      employee_id:   employee.id,
      document_name,
      document_type,
      file_path:     relativePath,
      file_size_kb:  Math.ceil(req.file.size / 1024),
      mime_type:     req.file.mimetype,
    });

    res.status(201).json(apiSuccess({ document }, 'Document uploaded successfully.'));
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/documents/:id/verify (admin only) ────────────────────────────
async function verifyDocument(req, res, next) {
  try {
    const { verification_status, rejection_reason } = req.body;

    const validStatuses = ['verified', 'rejected'];
    if (!validStatuses.includes(verification_status)) {
      return res.status(400).json(apiError(`status must be one of: ${validStatuses.join(', ')}`));
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json(apiError('Document not found.'));
    }

    const updated = await Document.updateStatus(doc.id, {
      verification_status,
      rejection_reason: verification_status === 'rejected' ? rejection_reason : null,
    });

    res.json(apiSuccess({ document: updated }, `Document ${verification_status}.`));
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/documents/pending (admin only) ─────────────────────────────────
async function getPendingDocuments(req, res, next) {
  try {
    const documents = await Document.findPending();
    res.json(apiSuccess({ documents }));
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/documents/:id ───────────────────────────────────────────────
async function deleteDocument(req, res, next) {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json(apiError('Document not found.'));
    }

    // Only allow the owner or admin to delete
    if (req.user.role !== 'admin') {
      const employee = await Employee.findByUserId(req.user.id);
      if (!employee || employee.id !== doc.employee_id) {
        return res.status(403).json(apiError('Not authorized to delete this document.'));
      }
    }

    // Delete physical file
    const fullPath = path.resolve(process.cwd(), doc.file_path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await Document.delete(doc.id);
    res.json(apiSuccess(null, 'Document deleted successfully.'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDocuments,
  uploadDocument,
  verifyDocument,
  getPendingDocuments,
  deleteDocument,
};
