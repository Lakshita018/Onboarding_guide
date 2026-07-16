const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Chat endpoints require standard authenticated user context
router.use(authMiddleware);

router.post('/send', chatController.sendMessage);
router.get('/history', chatController.getChatHistory);

module.exports = router;
