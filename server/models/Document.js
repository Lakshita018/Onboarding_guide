/**
 * server/models/Document.js
 */

const { query } = require('../config/database');

const Document = {
  async findById(id) {
    const { rows } = await query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  async findByEmployeeId(employeeId) {
    const { rows } = await query(
      'SELECT * FROM documents WHERE employee_id = $1 ORDER BY created_at DESC',
      [employeeId]
    );
    return rows;
  },

  async create({ employee_id, document_name, document_type, file_path, file_size_kb, mime_type }) {
    const { rows } = await query(
      `INSERT INTO documents
         (employee_id, document_name, document_type, file_path, file_size_kb, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [employee_id, document_name, document_type, file_path, file_size_kb || null, mime_type || null]
    );
    return rows[0];
  },

  async updateStatus(id, { verification_status, rejection_reason }) {
    const { rows } = await query(
      `UPDATE documents
       SET verification_status = $1, rejection_reason = $2
       WHERE id = $3
       RETURNING *`,
      [verification_status, rejection_reason || null, id]
    );
    return rows[0] || null;
  },

  async findPending() {
    const { rows } = await query(
      `SELECT d.*, u.name AS employee_name, e.department
       FROM documents d
       JOIN employees e ON e.id = d.employee_id
       JOIN users u ON u.id = e.user_id
       WHERE d.verification_status = 'pending'
       ORDER BY d.created_at ASC`
    );
    return rows;
  },

  async delete(id) {
    await query('DELETE FROM documents WHERE id = $1', [id]);
  },
};

module.exports = Document;
