/**
 * server/db/seed.js
 *
 * Seeds demo data for development.
 * Run: node db/seed.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { initDB, query } = require('../config/database');
const { BCRYPT_SALT_ROUNDS, DEFAULT_CHECKLIST } = require('../config/constants');

async function seed() {
  await initDB();
  console.log('[Seed] Database initialised. Seeding demo data…');

  // ─── Admin user ─────────────────────────────────────────────────────────────
  const adminEmail = 'admin@onboardai.com';
  const { rows: existingAdmin } = await query(
    'SELECT id FROM users WHERE email = $1',
    [adminEmail]
  );

  let adminId;
  if (existingAdmin.length === 0) {
    const hash = await bcrypt.hash('Admin@123', BCRYPT_SALT_ROUNDS);
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Alex Admin', adminEmail, hash, 'admin']
    );
    adminId = rows[0].id;
    console.log(`[Seed] Admin created: ${adminEmail}`);
  } else {
    adminId = existingAdmin[0].id;
    console.log(`[Seed] Admin already exists: ${adminEmail}`);
  }

  // ─── Demo employee ───────────────────────────────────────────────────────────
  const empEmail = 'jane.doe@onboardai.com';
  const { rows: existingEmp } = await query(
    'SELECT id FROM users WHERE email = $1',
    [empEmail]
  );

  if (existingEmp.length === 0) {
    const hash = await bcrypt.hash('Employee@123', BCRYPT_SALT_ROUNDS);
    const { rows: userRows } = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Jane Doe', empEmail, hash, 'employee']
    );
    const userId = userRows[0].id;

    const { rows: empRows } = await query(
      `INSERT INTO employees (user_id, department, designation, joining_date, manager, buddy)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [userId, 'Engineering', 'Software Engineer', '2025-02-01', adminId, adminId]
    );
    const empId = empRows[0].id;

    // Seed default checklist
    for (const item of DEFAULT_CHECKLIST) {
      await query(
        `INSERT INTO checklist_items
           (employee_id, title, description, category, priority, due_date, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          empId,
          item.title,
          item.description,
          item.category,
          item.priority,
          null,
          item.order_index,
        ]
      );
    }

    // Seed a sample admin-assigned task
    await query(
      `INSERT INTO tasks (employee_id, title, description, assigned_by, deadline)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        empId,
        'Complete Security Awareness Training',
        'Mandatory IBM security and compliance training. Must be completed within the first week.',
        adminId,
        '2025-02-07',
      ]
    );

    console.log(`[Seed] Employee created: ${empEmail}`);
    console.log(`[Seed] Checklist seeded with ${DEFAULT_CHECKLIST.length} items`);
    console.log('[Seed] Sample task created');
  } else {
    console.log(`[Seed] Employee already exists: ${empEmail}`);
  }

  console.log('\n[Seed] ✅ Done!\n');
  console.log('  Admin:    admin@onboardai.com  / Admin@123');
  console.log('  Employee: jane.doe@onboardai.com / Employee@123\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
