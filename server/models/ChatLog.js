/**
 * server/models/ChatLog.js
 */

const { query } = require('../config/database');

const ChatLog = {
  async findByEmployeeId(employeeId, limit = 50) {
    const { rows } = await query(
      `SELECT * FROM chat_logs
       WHERE employee_id = $1
       ORDER BY timestamp ASC
       LIMIT $2`,
      [employeeId, limit]
    );
    return rows;
  },

  async create({ employee_id, sender, message, intent }) {
    const { rows } = await query(
      `INSERT INTO chat_logs (employee_id, sender, message, intent)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [employee_id, sender, message, intent || null]
    );
    return rows[0];
  },

  async clearByEmployeeId(employeeId) {
    await query('DELETE FROM chat_logs WHERE employee_id = $1', [employeeId]);
  },
};

module.exports = ChatLog;
