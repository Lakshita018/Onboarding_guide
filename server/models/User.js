/**
 * server/models/User.js
 */

const { query } = require('../config/database');

const User = {
  async findById(id) {
    const { rows } = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const { rows } = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  },

  async create({ name, email, password_hash, role }) {
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, password_hash, role]
    );
    return rows[0];
  },

  async findAll({ role } = {}) {
    if (role) {
      const { rows } = await query(
        'SELECT id, name, email, role, created_at FROM users WHERE role = $1 ORDER BY created_at DESC',
        [role]
      );
      return rows;
    }
    const { rows } = await query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  },
};

module.exports = User;
