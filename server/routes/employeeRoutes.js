const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// All routes require authenticated employee
router.use(authMiddleware, roleMiddleware('employee'));

// Profile
router.get('/profile', employeeController.getProfile);

// Documents
router.post('/documents/upload', uploadMiddleware.single('file'), employeeController.uploadDocument);
router.post('/upload', uploadMiddleware.single('document'), employeeController.uploadDocument); // legacy alias
router.get('/documents', employeeController.getDocuments);

// Offer acceptance
router.put('/offer/accept', employeeController.acceptOffer);

// Checklist
router.get('/checklist', employeeController.getChecklist);
router.patch('/checklist/:id', employeeController.updateChecklistItem);

// OS setup
router.put('/profile/os', employeeController.updateOsType);

// Access requests
router.post('/access-request', employeeController.requestAccess);
router.get('/access-requests', employeeController.getAccessRequests);

// AI Recommendations
router.get('/recommendations', employeeController.getRecommendations);

module.exports = router;
