const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Only allow admins to hit these routes
router.use(authMiddleware, roleMiddleware('admin'));

router.get('/employees', adminController.getAllEmployees);
router.get('/employees/:id', adminController.getEmployeeDetail);
router.patch('/employees/:id/assign', adminController.assignManagerOrBuddy);
router.post('/tasks', adminController.assignTask);
router.patch('/documents/:id/verify', adminController.verifyDocument);
router.patch('/access-requests/:id', adminController.handleAccessRequest);

module.exports = router;
