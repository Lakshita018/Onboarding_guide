/**
 * server/routes/checklist.js
 */

const { Router } = require('express');
const auth       = require('../middleware/auth');
const roleCheck  = require('../middleware/roleCheck');
const {
  getChecklist,
  markComplete,
  markIncomplete,
} = require('../controllers/checklistController');

const router = Router();
router.use(auth, roleCheck('employee'));

router.get('/',                     getChecklist);
router.patch('/:id/complete',       markComplete);
router.patch('/:id/incomplete',     markIncomplete);

module.exports = router;
