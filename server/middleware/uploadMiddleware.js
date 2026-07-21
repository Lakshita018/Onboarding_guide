/**
 * uploadMiddleware.js
 * Uses multer memoryStorage — files are kept in RAM and uploaded to Cloudinary.
 * The local disk is never written to.
 */
const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  // Also accept by extension as fallback
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (allowed.includes(file.mimetype) || ['pdf', 'png', 'jpg', 'jpeg'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, PNG, JPG, and JPEG files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

module.exports = upload;
