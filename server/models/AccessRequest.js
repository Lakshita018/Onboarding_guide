/**
 * server/models/AccessRequest.js
 */

const { query } = require('../config/database');

const AccessRequest = {
  async findByEmployeeId(employeeId) {
    const { rows } = await query(
      `SELECT ar.*, u.name AS approved_by_name
       FROM access_requests ar
       LEFT JOIN users u ON u.id = ar.approved_by
       WHERE ar.employee_id = $1
       ORDER BY ar.created_at DESC`,
      [employeeId]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await query(
      `SELECT ar.*, u.name AS approved_by_name
       FROM access_requests ar
       LEFT JOIN users u ON u.id = ar.approved_by
       WHERE ar.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ employee_id, application_name, reason }) {
    const { rows } = await query(
      `INSERT INTO access_requests (employee_id, application_name, reason)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [employee_id, application_name, reason || null]
    );
    return rows[0];
  },

  async updateStatus(id, { status, approved_by }) {
    const { rows } = await query(
      `UPDATE access_requests
       SET status = $1, approved_by = $2, reviewed_at = $3
       WHERE id = $4
       RETURNING *`,
      [status, approved_by || null, new Date().toISOString(), id]
    );
    return rows[0] || null;
  },

  async findPending() {
    const { rows } = await query(
      `SELECT ar.*, u.name AS employee_name, e.department
       FROM access_requests ar
       JOIN employees e ON e.id = ar.employee_id
       JOIN users u ON u.id = e.user_id
       WHERE ar.status = 'pending'
       ORDER BY ar.created_at ASC`
    );
    return rows;
  },
};

module.exports = AccessRequest;
