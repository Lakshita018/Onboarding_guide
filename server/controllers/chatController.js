/**
 * server/controllers/chatController.js
 */

const Employee   = require('../models/Employee');
const ChatLog    = require('../models/ChatLog');
const watsonxAssistant = require('../services/watsonxAssistant');
const { CHAT_SENDER, apiSuccess, apiError } = require('../config/constants');

// ─── GET /api/chat/history ────────────────────────────────────────────────────
async function getChatHistory(req, res, next) {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json(apiError('Employee profile not found.'));
    }

    const limit = parseInt(req.query.limit || '50', 10);
    const logs  = await ChatLog.findByEmployeeId(employee.id, limit);
    res.json(apiSuccess({ logs }));
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/chat/message ───────────────────────────────────────────────────
async function sendMessage(req, res, next) {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json(apiError('message is required.'));
    }

    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json(apiError('Employee profile not found.'));
    }

    // Persist user message
    await ChatLog.create({
      employee_id: employee.id,
      sender:      CHAT_SENDER.USER,
      message:     message.trim(),
    });

    // Get AI response
    const context = {
      name:            employee.name,
      onboarding_stage: employee.onboarding_stage,
    };
    const aiResponse = await watsonxAssistant.sendMessage(
      employee.id,
      message.trim(),
      context
    );

    // Persist assistant reply
    const savedReply = await ChatLog.create({
      employee_id: employee.id,
      sender:      CHAT_SENDER.ASSISTANT,
      message:     aiResponse.reply,
      intent:      aiResponse.intent,
    });

    res.json(apiSuccess({
      reply:       savedReply,
      suggestions: aiResponse.suggestions,
      intent:      aiResponse.intent,
    }));
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/chat/history ─────────────────────────────────────────────────
async function clearHistory(req, res, next) {
  try {
    const employee = await Employee.findByUserId(req.user.id);
    if (!employee) {
      return res.status(404).json(apiError('Employee profile not found.'));
    }
    await ChatLog.clearByEmployeeId(employee.id);
    res.json(apiSuccess(null, 'Chat history cleared.'));
  } catch (err) {
    next(err);
  }
}

module.exports = { getChatHistory, sendMessage, clearHistory };
