/**
 * server/models/ChecklistItem.js
 */

const { query } = require('../config/database');

const ChecklistItem = {
  async findByEmployeeId(employeeId) {
    const { rows } = await query(
      `SELECT * FROM checklist_items
       WHERE employee_id = $1
       ORDER BY order_index ASC`,
      [employeeId]
    );
    return rows;
  },

  async create({ employee_id, title, description, category, priority, due_date, order_index }) {
    const { rows } = await query(
      `INSERT INTO checklist_items
         (employee_id, title, description, category, priority, due_date, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        employee_id,
        title,
        description || null,
        category    || null,
        priority    || 'medium',
        due_date    || null,
        order_index || 0,
      ]
    );
    return rows[0];
  },

  async bulkCreate(items) {
    // Insert items one by one — works for both PG and SQLite
    const results = [];
    for (const item of items) {
      const created = await ChecklistItem.create(item);
      results.push(created);
    }
    return results;
  },

  async markComplete(id, employeeId) {
    const { rows } = await query(
      `UPDATE checklist_items
       SET completed = $1, completed_at = $2
       WHERE id = $3 AND employee_id = $4
       RETURNING *`,
      [true, new Date().toISOString(), id, employeeId]
    );
    return rows[0] || null;
  },

  async markIncomplete(id, employeeId) {
    const { rows } = await query(
      `UPDATE checklist_items
       SET completed = $1, completed_at = NULL
       WHERE id = $2 AND employee_id = $3
       RETURNING *`,
      [false, id, employeeId]
    );
    return rows[0] || null;
  },

  async getProgress(employeeId) {
    const { rows } = await query(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN completed = 1 OR completed = true THEN 1 ELSE 0 END) AS completed_count
       FROM checklist_items
       WHERE employee_id = $1`,
      [employeeId]
    );
    const row   = rows[0] || { total: 0, completed_count: 0 };
    const total = parseInt(row.total, 10);
    const done  = parseInt(row.completed_count, 10);
    return {
      total,
      completed: done,
      percentage: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  },
};

module.exports = ChecklistItem;
