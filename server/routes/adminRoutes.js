const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware, roleMiddleware('admin'));

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// Employees
router.get('/employees', adminController.getAllEmployees);
router.get('/employees/:id', adminController.getEmployeeDetail);
router.patch('/employees/:id/assign', adminController.assignManagerOrBuddy);

// Tasks
router.post('/tasks', adminController.assignTask);
router.get('/tasks', adminController.getAllTasks);

// Documents
router.get('/documents', adminController.getAllDocuments);
router.patch('/documents/:id/verify', adminController.verifyDocument);

// Access requests
router.patch('/access-requests/:id', adminController.handleAccessRequest);

module.exports = router;
