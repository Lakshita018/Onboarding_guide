/**
 * server/models/Employee.js
 */

const { query } = require('../config/database');

const Employee = {
  async findById(id) {
    const { rows } = await query(
      `SELECT e.*,
              u.name, u.email, u.role,
              m.name AS manager_name,
              b.name AS buddy_name
       FROM employees e
       JOIN users u ON u.id = e.user_id
       LEFT JOIN users m ON m.id = e.manager
       LEFT JOIN users b ON b.id = e.buddy
       WHERE e.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByUserId(userId) {
    const { rows } = await query(
      `SELECT e.*,
              u.name, u.email, u.role,
              m.name AS manager_name,
              b.name AS buddy_name
       FROM employees e
       JOIN users u ON u.id = e.user_id
       LEFT JOIN users m ON m.id = e.manager
       LEFT JOIN users b ON b.id = e.buddy
       WHERE e.user_id = $1`,
      [userId]
    );
    return rows[0] || null;
  },

  async create({ user_id, department, designation, joining_date }) {
    const { rows } = await query(
      `INSERT INTO employees (user_id, department, designation, joining_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, department || null, designation || null, joining_date || null]
    );
    return rows[0];
  },

  async update(id, fields) {
    const allowed = [
      'department', 'designation', 'manager', 'buddy',
      'joining_date', 'onboarding_stage', 'offer_accepted',
      'os_type', 'status',
    ];
    const updates = [];
    const values  = [];
    let   idx     = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${idx++}`);
        values.push(fields[key]);
      }
    }
    if (updates.length === 0) return null;

    values.push(id);
    const { rows } = await query(
      `UPDATE employees SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async findAll({ status, onboarding_stage } = {}) {
    let sql = `
      SELECT e.*,
             u.name, u.email,
             m.name AS manager_name,
             b.name AS buddy_name
      FROM employees e
      JOIN users u ON u.id = e.user_id
      LEFT JOIN users m ON m.id = e.manager
      LEFT JOIN users b ON b.id = e.buddy
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (status) {
      sql += ` AND e.status = $${idx++}`;
      params.push(status);
    }
    if (onboarding_stage) {
      sql += ` AND e.onboarding_stage = $${idx++}`;
      params.push(onboarding_stage);
    }

    sql += ' ORDER BY u.name ASC';
    const { rows } = await query(sql, params);
    return rows;
  },

  async countByStage() {
    const { rows } = await query(
      `SELECT onboarding_stage, COUNT(*) AS count
       FROM employees
       GROUP BY onboarding_stage`
    );
    return rows;
  },
};

module.exports = Employee;
