/**
 * server/seed/seed.js
 *
 * IBM OnboardAI — Phase 1 Seed Script
 *
 * Creates demo data for immediate development and demonstration.
 *
 * Usage:  npm run seed
 *
 * Accounts created:
 *   Admin:    admin@ibm.com        / Admin123
 *   Employee: aarav@ibm.com        / Employee123   (PRE_JOINING — not started)
 *   Employee: priya@ibm.com        / Employee123   (ORIENTATION — in progress)
 *   Employee: rahul@ibm.com        / Employee123   (FULLY_PRODUCTIVE — completed)
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const path   = require('path');

const { initDB, query } = require('../config/database');
const {
  BCRYPT_SALT_ROUNDS,
  ROLES,
  ONBOARDING_STAGES,
  PRIORITY,
  CHECKLIST_CATEGORY,
  TASK_STATUS,
  DOCUMENT_STATUS,
  ACCESS_STATUS,
} = require('../utils/constants');

// ─── Helper: upsert user ───────────────────────────────────────────────────────
async function upsertUser({ name, email, password, role }) {
  const { rows: existing } = await query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  if (existing.length > 0) {
    console.log(`  [skip] User already exists: ${email}`);
    return existing[0].id;
  }
  const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id`,
    [name, email, hash, role]
  );
  console.log(`  [+] Created user: ${email} (${role})`);
  return rows[0].id;
}

// ─── Helper: upsert employee ───────────────────────────────────────────────────
async function upsertEmployee(profile) {
  const { rows: existing } = await query(
    'SELECT id FROM employees WHERE user_id = $1',
    [profile.user_id]
  );
  if (existing.length > 0) {
    console.log(`  [skip] Employee profile already exists for user: ${profile.user_id}`);
    return existing[0].id;
  }
  const { rows } = await query(
    `INSERT INTO employees
       (user_id, department, designation, joining_date, onboarding_stage,
        offer_accepted, os_type, status, manager, buddy)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id`,
    [
      profile.user_id,
      profile.department   || null,
      profile.designation  || null,
      profile.joining_date || null,
      profile.onboarding_stage,
      profile.offer_accepted ? true : false,
      profile.os_type        || null,
      profile.status         || 'active',
      profile.manager        || null,
      profile.buddy          || null,
    ]
  );
  console.log(`  [+] Created employee profile for user: ${profile.user_id}`);
  return rows[0].id;
}

// ─── Helper: insert checklist item ────────────────────────────────────────────
async function addChecklistItem(emp_id, item) {
  await query(
    `INSERT INTO checklist_items
       (employee_id, title, description, category, priority, completed, completed_at, order_index)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      emp_id,
      item.title,
      item.description || null,
      item.category    || null,
      item.priority    || PRIORITY.MEDIUM,
      item.completed   || false,
      item.completed   ? new Date().toISOString() : null,
      item.order_index || 0,
    ]
  );
}

// ─── Helper: insert task ──────────────────────────────────────────────────────
async function addTask(emp_id, assigned_by, task) {
  await query(
    `INSERT INTO tasks (employee_id, title, description, assigned_by, status, deadline)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      emp_id,
      task.title,
      task.description || null,
      assigned_by,
      task.status   || TASK_STATUS.PENDING,
      task.deadline || null,
    ]
  );
}

// ─── Helper: insert document ──────────────────────────────────────────────────
async function addDocument(emp_id, doc) {
  await query(
    `INSERT INTO documents
       (employee_id, document_name, document_type, file_path, verification_status)
     VALUES ($1,$2,$3,$4,$5)`,
    [
      emp_id,
      doc.document_name,
      doc.document_type,
      doc.file_path            || `uploads/sample/${doc.document_type}.pdf`,
      doc.verification_status  || DOCUMENT_STATUS.PENDING,
    ]
  );
}

// ─── Helper: insert access request ───────────────────────────────────────────
async function addAccessRequest(emp_id, req_data) {
  await query(
    `INSERT INTO access_requests
       (employee_id, application_name, reason, status)
     VALUES ($1,$2,$3,$4)`,
    [
      emp_id,
      req_data.application_name,
      req_data.reason || null,
      req_data.status || ACCESS_STATUS.PENDING,
    ]
  );
}

// ─── Wipe all data (clean slate for demo) ─────────────────────────────────────
async function clearDatabase() {
  console.log('\n🗑  Clearing existing data…');
  // Order matters — FK constraints (children first)
  await query('DELETE FROM chat_logs');
  await query('DELETE FROM access_requests');
  await query('DELETE FROM tasks');
  await query('DELETE FROM checklist_items');
  await query('DELETE FROM documents');
  await query('DELETE FROM employees');
  await query('DELETE FROM users');
  console.log('  [✓] Database cleared');
}

// ─── MAIN SEED ────────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱 IBM OnboardAI — Phase 1 Seed\n');

  await initDB();
  await clearDatabase();

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN USER
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n👤 Creating admin…');
  const adminId = await upsertUser({
    name:     'IBM Admin',
    email:    'admin@ibm.com',
    password: 'Admin123',
    role:     ROLES.ADMIN,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPLOYEE 1 — Aarav Sharma (PRE_JOINING / not_started)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n👤 Creating Employee 1: Aarav Sharma…');
  const aaravUserId = await upsertUser({
    name:     'Aarav Sharma',
    email:    'aarav@ibm.com',
    password: 'Employee123',
    role:     ROLES.EMPLOYEE,
  });

  const aaravEmpId = await upsertEmployee({
    user_id:          aaravUserId,
    department:       'Engineering',
    designation:      'Software Engineer',
    joining_date:     '2025-08-01',
    onboarding_stage: ONBOARDING_STAGES.PRE_JOINING,
    offer_accepted:   false,
    os_type:          null,
    status:           'active',
    manager:          adminId,
    buddy:            null,
  });

  // Checklist — all pending (not started yet)
  console.log('  [+] Adding checklist for Aarav…');
  const aaravChecklist = [
    { title: 'Review and accept offer letter',       category: CHECKLIST_CATEGORY.HR,        priority: PRIORITY.HIGH,   order_index: 1 },
    { title: 'Upload Government ID proof',           category: CHECKLIST_CATEGORY.DOCUMENTS, priority: PRIORITY.HIGH,   order_index: 2 },
    { title: 'Upload educational certificates',      category: CHECKLIST_CATEGORY.DOCUMENTS, priority: PRIORITY.HIGH,   order_index: 3 },
    { title: 'Upload address proof',                 category: CHECKLIST_CATEGORY.DOCUMENTS, priority: PRIORITY.MEDIUM, order_index: 4 },
    { title: 'Complete HR orientation session',      category: CHECKLIST_CATEGORY.HR,        priority: PRIORITY.HIGH,   order_index: 5 },
    { title: 'Set up workstation',                   category: CHECKLIST_CATEGORY.SETUP,     priority: PRIORITY.HIGH,   order_index: 6 },
    { title: 'Configure corporate email',            category: CHECKLIST_CATEGORY.SETUP,     priority: PRIORITY.HIGH,   order_index: 7 },
    { title: 'Request tool access (Jira, Slack)',    category: CHECKLIST_CATEGORY.SETUP,     priority: PRIORITY.MEDIUM, order_index: 8 },
    { title: 'Meet your team members',               category: CHECKLIST_CATEGORY.TEAM,      priority: PRIORITY.MEDIUM, order_index: 9 },
    { title: 'Complete Security Awareness Training', category: CHECKLIST_CATEGORY.LEARNING,  priority: PRIORITY.HIGH,   order_index: 10 },
  ];
  for (const item of aaravChecklist) {
    await addChecklistItem(aaravEmpId, { ...item, completed: false });
  }

  // Task
  await addTask(aaravEmpId, adminId, {
    title:       'Review Offer Letter',
    description: 'Open your offer letter in the Documents section, review all terms, and click Accept.',
    status:      TASK_STATUS.PENDING,
    deadline:    '2025-07-25',
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPLOYEE 2 — Priya Patel (ORIENTATION / in_progress)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n👤 Creating Employee 2: Priya Patel…');
  const priyaUserId = await upsertUser({
    name:     'Priya Patel',
    email:    'priya@ibm.com',
    password: 'Employee123',
    role:     ROLES.EMPLOYEE,
  });

  const priyaEmpId = await upsertEmployee({
    user_id:          priyaUserId,
    department:       'Cloud',
    designation:      'Cloud Developer',
    joining_date:     '2025-06-01',
    onboarding_stage: ONBOARDING_STAGES.ORIENTATION,
    offer_accepted:   true,
    os_type:          'windows',
    status:           'active',
    manager:          adminId,
    buddy:            aaravUserId,
  });

  // Checklist — some complete, some pending
  console.log('  [+] Adding checklist for Priya…');
  const priyaChecklist = [
    { title: 'Complete W3ID setup',                  category: CHECKLIST_CATEGORY.SETUP,     priority: PRIORITY.HIGH,   order_index: 1,  completed: true  },
    { title: 'Configure Outlook',                    category: CHECKLIST_CATEGORY.SETUP,     priority: PRIORITY.HIGH,   order_index: 2,  completed: true  },
    { title: 'Install Teams',                        category: CHECKLIST_CATEGORY.SETUP,     priority: PRIORITY.HIGH,   order_index: 3,  completed: true  },
    { title: 'Upload Government ID proof',           category: CHECKLIST_CATEGORY.DOCUMENTS, priority: PRIORITY.HIGH,   order_index: 4,  completed: true  },
    { title: 'Accept offer letter',                  category: CHECKLIST_CATEGORY.HR,        priority: PRIORITY.HIGH,   order_index: 5,  completed: true  },
    { title: 'Attend HR orientation',                category: CHECKLIST_CATEGORY.HR,        priority: PRIORITY.HIGH,   order_index: 6,  completed: false },
    { title: 'Read employee handbook',               category: CHECKLIST_CATEGORY.LEARNING,  priority: PRIORITY.MEDIUM, order_index: 7,  completed: false },
    { title: 'Request access to IBM Cloud Console',  category: CHECKLIST_CATEGORY.SETUP,     priority: PRIORITY.HIGH,   order_index: 8,  completed: false },
    { title: 'Meet your manager',                    category: CHECKLIST_CATEGORY.TEAM,      priority: PRIORITY.MEDIUM, order_index: 9,  completed: false },
    { title: 'Complete Security Awareness Training', category: CHECKLIST_CATEGORY.LEARNING,  priority: PRIORITY.HIGH,   order_index: 10, completed: false },
  ];
  for (const item of priyaChecklist) {
    await addChecklistItem(priyaEmpId, item);
  }

  // Documents
  console.log('  [+] Adding documents for Priya…');
  await addDocument(priyaEmpId, {
    document_name:       'Priya_National_ID.pdf',
    document_type:       'id_proof',
    verification_status: DOCUMENT_STATUS.VERIFIED,
  });
  await addDocument(priyaEmpId, {
    document_name:       'Priya_Degree_Certificate.pdf',
    document_type:       'education_certificate',
    verification_status: DOCUMENT_STATUS.PENDING,
  });

  // Tasks
  await addTask(priyaEmpId, adminId, {
    title:       'Complete Cloud Fundamentals Module',
    description: 'Finish the IBM Cloud Fundamentals learning module on your Learning page.',
    status:      TASK_STATUS.IN_PROGRESS,
    deadline:    '2025-06-15',
  });
  await addTask(priyaEmpId, adminId, {
    title:       'Schedule 1:1 with Manager',
    description: 'Book a 30-minute introduction call with your direct manager this week.',
    status:      TASK_STATUS.PENDING,
    deadline:    '2025-06-10',
  });

  // Access requests
  await addAccessRequest(priyaEmpId, {
    application_name: 'Slack',
    reason:           'Team communication and daily standups.',
    status:           ACCESS_STATUS.APPROVED,
  });
  await addAccessRequest(priyaEmpId, {
    application_name: 'IBM Cloud Console',
    reason:           'Required for cloud development tasks.',
    status:           ACCESS_STATUS.PENDING,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPLOYEE 3 — Rahul Verma (FULLY_PRODUCTIVE / completed)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n👤 Creating Employee 3: Rahul Verma…');
  const rahulUserId = await upsertUser({
    name:     'Rahul Verma',
    email:    'rahul@ibm.com',
    password: 'Employee123',
    role:     ROLES.EMPLOYEE,
  });

  const rahulEmpId = await upsertEmployee({
    user_id:          rahulUserId,
    department:       'AI Research',
    designation:      'AI Engineer',
    joining_date:     '2025-03-01',
    onboarding_stage: ONBOARDING_STAGES.FULLY_PRODUCTIVE,
    offer_accepted:   true,
    os_type:          'mac',
    status:           'active',
    manager:          adminId,
    buddy:            priyaUserId,
  });

  // Checklist — all completed
  console.log('  [+] Adding completed checklist for Rahul…');
  const rahulChecklist = [
    { title: 'Accept offer letter',                      category: CHECKLIST_CATEGORY.HR,       priority: PRIORITY.HIGH,   order_index: 1,  completed: true },
    { title: 'Upload Government ID proof',               category: CHECKLIST_CATEGORY.DOCUMENTS,priority: PRIORITY.HIGH,   order_index: 2,  completed: true },
    { title: 'Upload degree certificate',                category: CHECKLIST_CATEGORY.DOCUMENTS,priority: PRIORITY.HIGH,   order_index: 3,  completed: true },
    { title: 'Complete HR orientation',                  category: CHECKLIST_CATEGORY.HR,       priority: PRIORITY.HIGH,   order_index: 4,  completed: true },
    { title: 'Set up macOS workstation',                 category: CHECKLIST_CATEGORY.SETUP,    priority: PRIORITY.HIGH,   order_index: 5,  completed: true },
    { title: 'Configure IBM email on Mac',               category: CHECKLIST_CATEGORY.SETUP,    priority: PRIORITY.HIGH,   order_index: 6,  completed: true },
    { title: 'Request access to GitHub Enterprise',      category: CHECKLIST_CATEGORY.SETUP,    priority: PRIORITY.HIGH,   order_index: 7,  completed: true },
    { title: 'Request access to Watson Studio',          category: CHECKLIST_CATEGORY.SETUP,    priority: PRIORITY.HIGH,   order_index: 8,  completed: true },
    { title: 'Complete Security Awareness Training',     category: CHECKLIST_CATEGORY.LEARNING, priority: PRIORITY.HIGH,   order_index: 9,  completed: true },
    { title: 'Complete IBM AI Ethics & Compliance',      category: CHECKLIST_CATEGORY.LEARNING, priority: PRIORITY.HIGH,   order_index: 10, completed: true },
    { title: 'Meet all team members (1:1 intros)',       category: CHECKLIST_CATEGORY.TEAM,     priority: PRIORITY.MEDIUM, order_index: 11, completed: true },
    { title: 'Set 90-day goals with manager',            category: CHECKLIST_CATEGORY.HR,       priority: PRIORITY.MEDIUM, order_index: 12, completed: true },
  ];
  for (const item of rahulChecklist) {
    await addChecklistItem(rahulEmpId, item);
  }

  // Documents — all verified
  console.log('  [+] Adding documents for Rahul…');
  await addDocument(rahulEmpId, {
    document_name:       'Rahul_Passport.pdf',
    document_type:       'id_proof',
    verification_status: DOCUMENT_STATUS.VERIFIED,
  });
  await addDocument(rahulEmpId, {
    document_name:       'Rahul_BTech_Certificate.pdf',
    document_type:       'education_certificate',
    verification_status: DOCUMENT_STATUS.VERIFIED,
  });
  await addDocument(rahulEmpId, {
    document_name:       'Rahul_MTech_Certificate.pdf',
    document_type:       'education_certificate',
    verification_status: DOCUMENT_STATUS.VERIFIED,
  });

  // Tasks — all completed
  await addTask(rahulEmpId, adminId, {
    title:       'Complete Foundation AI Research Module',
    description: 'Finish the internal AI Research onboarding curriculum.',
    status:      TASK_STATUS.COMPLETED,
    deadline:    '2025-03-15',
  });
  await addTask(rahulEmpId, adminId, {
    title:       'Present 30-day progress to team',
    description: 'Prepare and deliver a 10-minute update to the AI Research team.',
    status:      TASK_STATUS.COMPLETED,
    deadline:    '2025-04-01',
  });

  // Access requests — all approved
  await addAccessRequest(rahulEmpId, {
    application_name: 'GitHub Enterprise',
    reason:           'Source control for AI research projects.',
    status:           ACCESS_STATUS.APPROVED,
  });
  await addAccessRequest(rahulEmpId, {
    application_name: 'Watson Studio',
    reason:           'Model training and experimentation.',
    status:           ACCESS_STATUS.APPROVED,
  });
  await addAccessRequest(rahulEmpId, {
    application_name: 'IBM Cloud Console',
    reason:           'Deployment infrastructure access.',
    status:           ACCESS_STATUS.APPROVED,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n✅ Seed complete!\n');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│              IBM OnboardAI — Demo Accounts              │');
  console.log('├──────────┬──────────────────────┬───────────────────────┤');
  console.log('│ Role     │ Email                │ Password              │');
  console.log('├──────────┼──────────────────────┼───────────────────────┤');
  console.log('│ Admin    │ admin@ibm.com         │ Admin123              │');
  console.log('│ Employee │ aarav@ibm.com         │ Employee123           │');
  console.log('│ Employee │ priya@ibm.com         │ Employee123           │');
  console.log('│ Employee │ rahul@ibm.com         │ Employee123           │');
  console.log('└──────────┴──────────────────────┴───────────────────────┘\n');

  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
