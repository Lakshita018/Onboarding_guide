const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Only allow employees to hit these routes
router.use(authMiddleware, roleMiddleware('employee'));

router.get('/profile', employeeController.getProfile);
router.get('/checklist', employeeController.getChecklist);
router.patch('/checklist/:id', employeeController.updateChecklistItem);
router.post('/upload', uploadMiddleware.single('document'), employeeController.uploadDocument);
router.post('/access-request', employeeController.requestAccess);
router.get('/recommendations', employeeController.getRecommendations);

module.exports = router;
