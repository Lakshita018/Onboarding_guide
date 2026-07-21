/**
 * server/routes/documents.js
 */

const { Router }  = require('express');
const auth        = require('../middleware/auth');
const roleCheck   = require('../middleware/roleCheck');
const upload      = require('../middleware/upload');
const {
  getDocuments,
  uploadDocument,
  deleteDocument,
} = require('../controllers/documentController');

const router = Router();
router.use(auth);

// Employee: view own documents
router.get('/', roleCheck('employee'), getDocuments);

// Employee: upload a document
router.post('/upload', roleCheck('employee'), upload.single('file'), uploadDocument);

// Employee or Admin: delete a document (controller enforces ownership)
router.delete('/:id', deleteDocument);

module.exports = router;
