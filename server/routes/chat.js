/**
 * server/routes/chat.js
 */

const { Router } = require('express');
const auth       = require('../middleware/auth');
const roleCheck  = require('../middleware/roleCheck');
const {
  getChatHistory,
  sendMessage,
  clearHistory,
} = require('../controllers/chatController');

const router = Router();
router.use(auth, roleCheck('employee'));

router.get('/history',   getChatHistory);
router.post('/message',  sendMessage);
router.delete('/history', clearHistory);

module.exports = router;
