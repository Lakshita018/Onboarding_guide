// chatController.js placeholder
const watsonxAssistant = require('../services/watsonxAssistant');

exports.sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message field is required' });
    }
    const aiResponse = await watsonxAssistant.askAssistant(message);
    res.status(200).json(aiResponse);
  } catch (error) {
    next(error);
  }
};

exports.getChatHistory = async (req, res, next) => {
  res.status(200).json({ message: 'Get chat logs placeholder response' });
};
