const Employee = require('../models/Employee');
const ChatLog = require('../models/ChatLog');
const { askAssistant } = require('../services/watsonxAssistant');
const { CHAT_SENDER } = require('../utils/constants');

// ─── SEND MESSAGE ──────────────────────────────────────────────
exports.sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
    }

    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee profile not found.' });
    }

    // Save employee message
    await ChatLog.create({
      employee_id: employee.id,
      sender: CHAT_SENDER.EMPLOYEE,
      message: message.trim(),
    });

    // Get AI response
    const aiResponse = await askAssistant(message.trim());

    // Save assistant response
    const assistantLog = await ChatLog.create({
      employee_id: employee.id,
      sender: CHAT_SENDER.ASSISTANT,
      message: aiResponse.response,
    });

    return res.status(200).json({
      success: true,
      response: aiResponse.response,
      timestamp: assistantLog.timestamp,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET CHAT HISTORY ──────────────────────────────────────────
exports.getChatHistory = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee profile not found.' });
    }

    const logs = await ChatLog.findAll({
      where: { employee_id: employee.id },
      order: [['timestamp', 'ASC']],
      limit: 100,
    });

    return res.status(200).json({ success: true, history: logs });
  } catch (error) {
    next(error);
  }
};
