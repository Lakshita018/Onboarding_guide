/**
 * server/models/Task.js
 */

const { query } = require('../config/database');

const Task = {
  async findByEmployeeId(employeeId) {
    const { rows } = await query(
      `SELECT t.*, u.name AS assigned_by_name
       FROM tasks t
       JOIN users u ON u.id = t.assigned_by
       WHERE t.employee_id = $1
       ORDER BY t.created_at DESC`,
      [employeeId]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT t.*, u.name AS assigned_by_name
       FROM tasks t
       JOIN users u ON u.id = t.assigned_by
       WHERE t.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ employee_id, title, description, assigned_by, deadline }) {
    const { rows } = await query(
      `INSERT INTO tasks (employee_id, title, description, assigned_by, deadline)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [employee_id, title, description || null, assigned_by, deadline || null]
    );
    return rows[0];
  },

  async updateStatus(id, status) {
    const { rows } = await query(
      `UPDATE tasks SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *`,
      [status, new Date().toISOString(), id]
    );
    return rows[0] || null;
  },

  async findAllForAdmin() {
    const { rows } = await query(
      `SELECT t.*, u.name AS employee_name, a.name AS assigned_by_name
       FROM tasks t
       JOIN employees e ON e.id = t.employee_id
       JOIN users u ON u.id = e.user_id
       JOIN users a ON a.id = t.assigned_by
       ORDER BY t.created_at DESC`
    );
    return rows;
  },
};

module.exports = Task;
