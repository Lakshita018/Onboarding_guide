const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware, roleMiddleware('employee'));

router.post('/', chatController.sendMessage);
router.get('/history', chatController.getChatHistory);

module.exports = router;
