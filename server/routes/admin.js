/**
 * server/routes/admin.js
 */

const { Router } = require('express');
const auth       = require('../middleware/auth');
const roleCheck  = require('../middleware/roleCheck');
const {
  listEmployees,
  getEmployee,
  updateEmployee,
  createEmployee,
  getStats,
  listAdminUsers,
} = require('../controllers/adminController');
const { createTask, getAllTasks }         = require('../controllers/taskController');
const { reviewRequest, getPendingRequests } = require('../controllers/accessController');
const { verifyDocument, getPendingDocuments } = require('../controllers/documentController');
const { addItem }  = require('../controllers/checklistController');

const router = Router();
router.use(auth, roleCheck('admin'));

// Employee management
router.get('/employees',             listEmployees);
router.post('/employees',            createEmployee);
router.get('/employees/:id',         getEmployee);
router.patch('/employees/:id',       updateEmployee);

// Stats
router.get('/stats',                 getStats);

// Admin user list (for dropdowns)
router.get('/users',                 listAdminUsers);

// Task management
router.get('/tasks',                 getAllTasks);
router.post('/tasks',                createTask);

// Access request management
router.get('/access/pending',        getPendingRequests);
router.patch('/access/:id',          reviewRequest);

// Document management
router.get('/documents/pending',     getPendingDocuments);
router.patch('/documents/:id/verify', verifyDocument);

// Checklist management
router.post('/checklist',            addItem);

module.exports = router;
