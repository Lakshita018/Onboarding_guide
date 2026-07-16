/**
 * server/middleware/upload.js
 *
 * Multer configuration for secure file uploads.
 * Validates MIME type and enforces size limit before saving to disk.
 */

const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } = require('../config/constants');

// ─── Storage Engine ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const employeeId = req.user?.id || 'unknown';
    const uploadDir  = path.join(
      process.env.UPLOAD_DIR || './uploads',
      employeeId
    );
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename(_req, file, cb) {
    const timestamp = Date.now();
    const safe      = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}_${safe}`);
  },
});

// ─── MIME Type Filter ─────────────────────────────────────────────────────────
function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        'LIMIT_UNEXPECTED_FILE',
        `Unsupported file type: ${file.mimetype}. Allowed: PDF, PNG, JPG, DOCX.`
      ),
      false
    );
  }
}

// ─── Multer Instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

module.exports = upload;
