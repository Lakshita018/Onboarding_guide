/**
 * server/routes/access.js
 */

const { Router } = require('express');
const auth       = require('../middleware/auth');
const roleCheck  = require('../middleware/roleCheck');
const { getMyRequests, createRequest } = require('../controllers/accessController');

const router = Router();
router.use(auth, roleCheck('employee'));

router.get('/',   getMyRequests);
router.post('/',  createRequest);

module.exports = router;
