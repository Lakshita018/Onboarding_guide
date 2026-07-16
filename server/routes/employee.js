/**
 * server/routes/employee.js
 */

const { Router }  = require('express');
const auth        = require('../middleware/auth');
const roleCheck   = require('../middleware/roleCheck');
const {
  getProfile,
  updateProfile,
  acceptOffer,
  getRecommendationsForEmployee,
} = require('../controllers/employeeController');

const router = Router();
router.use(auth, roleCheck('employee'));

router.get('/profile',           getProfile);
router.patch('/profile',         updateProfile);
router.post('/accept-offer',     acceptOffer);
router.get('/recommendations',   getRecommendationsForEmployee);

module.exports = router;
