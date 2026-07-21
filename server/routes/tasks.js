/**
 * server/routes/tasks.js
 */

const { Router } = require('express');
const auth       = require('../middleware/auth');
const roleCheck  = require('../middleware/roleCheck');
const { getMyTasks, updateTaskStatus } = require('../controllers/taskController');

const router = Router();
router.use(auth, roleCheck('employee'));

router.get('/',                 getMyTasks);
router.patch('/:id/status',     updateTaskStatus);

module.exports = router;
