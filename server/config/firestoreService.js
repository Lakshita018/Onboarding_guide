/**
 * firestoreService.js
 * Thin wrappers around Firestore collections.
 * Replaces all Sequelize model classes.
 *
 * ID strategy:
 *   users        → Firebase Auth UID  (string)
 *   employees    → same UID as user   (string, one-to-one)
 *   documents    → auto Firestore ID
 *   checklists   → auto Firestore ID
 *   tasks        → auto Firestore ID
 *   accessRequests → auto Firestore ID
 *   chatLogs     → auto Firestore ID
 */
const { db, auth }              = require('./firebase');
const { FieldValue, Timestamp } = require('firebase-admin/firestore');

// ─── helpers ─────────────────────────────────────────────────────────────────

function now() {
  return Timestamp.now();
}

function serializeTimestamps(data) {
  if (!data || typeof data !== 'object') return data;
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v === 'object' && typeof v.toDate === 'function') {
      out[k] = v.toDate().toISOString();
    } else {
      out[k] = v;
    }
  }
  return out;
}

function docToObj(snap) {
  if (!snap.exists) return null;
  return { id: snap.id, ...serializeTimestamps(snap.data()) };
}

function snapToArray(querySnap) {
  return querySnap.docs.map((d) => ({ id: d.id, ...serializeTimestamps(d.data()) }));
}

// ─── USERS ────────────────────────────────────────────────────────────────────

const Users = {
  col: () => db.collection('users'),

  async create(uid, { name, email, role = 'employee' }) {
    const data = {
      name,
      email,
      role,
      status: 'ACTIVE',
      createdAt: now(),
    };
    await Users.col().doc(uid).set(data);
    return { id: uid, ...data };
  },

  async findById(uid) {
    return docToObj(await Users.col().doc(uid).get());
  },

  async findByEmail(email) {
    const snap = await Users.col().where('email', '==', email).limit(1).get();
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  },
};

// ─── EMPLOYEES ────────────────────────────────────────────────────────────────

const Employees = {
  col: () => db.collection('employees'),

  async create(userId) {
    const data = {
      user_id: userId,
      department: null,
      designation: null,
      manager: null,
      buddy: null,
      joining_date: null,
      onboarding_stage: 'not_started',
      offer_accepted: false,
      os_type: null,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    };
    await Employees.col().doc(userId).set(data);
    return { id: userId, ...data };
  },

  async findByUserId(userId) {
    return docToObj(await Employees.col().doc(userId).get());
  },

  async findById(id) {
    return docToObj(await Employees.col().doc(id).get());
  },

  async findAll() {
    const snap = await Employees.col().get();
    const arr = snapToArray(snap);
    arr.sort((a, b) => (b.createdAt || '') > (a.createdAt || '') ? 1 : -1);
    return arr;
  },

  async update(id, fields) {
    const updates = { ...fields, updatedAt: now() };
    await Employees.col().doc(id).update(updates);
    return docToObj(await Employees.col().doc(id).get());
  },
};

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────

const Documents = {
  col: () => db.collection('documents'),

  async create({ employee_id, document_name, document_type, cloudinary_url, cloudinary_public_id, verification_status = 'pending' }) {
    const data = {
      employee_id,
      document_name,
      document_type,
      cloudinary_url,
      cloudinary_public_id,
      verification_status,
      created_at: now(),
    };
    const ref = await Documents.col().add(data);
    return { id: ref.id, ...data };
  },

  async findByEmployeeId(employeeId) {
    const snap = await Documents.col()
      .where('employee_id', '==', employeeId)
      .get();
    const arr = snapToArray(snap);
    arr.sort((a, b) => (b.created_at || '') > (a.created_at || '') ? 1 : -1);
    return arr;
  },

  async findByEmployeeIdAndType(employeeId, document_type) {
    const snap = await Documents.col()
      .where('employee_id', '==', employeeId)
      .where('document_type', '==', document_type)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...serializeTimestamps(d.data()) };
  },

  async findAll() {
    const snap = await Documents.col().get();
    const arr = snapToArray(snap);
    arr.sort((a, b) => (b.created_at || '') > (a.created_at || '') ? 1 : -1);
    return arr;
  },

  async findById(id) {
    return docToObj(await Documents.col().doc(id).get());
  },

  async update(id, fields) {
    await Documents.col().doc(id).update(fields);
    return docToObj(await Documents.col().doc(id).get());
  },

  async countByStatus(status) {
    const snap = await Documents.col().where('verification_status', '==', status).count().get();
    return snap.data().count;
  },
};

// ─── CHECKLIST ITEMS ──────────────────────────────────────────────────────────

const ChecklistItems = {
  col: () => db.collection('checklists'),

  async create({ employee_id, title, description, priority = 'medium', completed = false }) {
    const data = {
      employee_id,
      title,
      description: description || '',
      priority,
      completed,
      completed_at: null,
      created_at: now(),
    };
    const ref = await ChecklistItems.col().add(data);
    return { id: ref.id, ...data };
  },

  async bulkCreate(items) {
    const batch = db.batch();
    const created = [];
    for (const item of items) {
      const ref = ChecklistItems.col().doc();
      const data = {
        employee_id: item.employee_id,
        title: item.title,
        description: item.description || '',
        priority: item.priority || 'medium',
        completed: item.completed || false,
        completed_at: item.completed_at || null,
        created_at: now(),
      };
      batch.set(ref, data);
      created.push({ id: ref.id, ...data });
    }
    await batch.commit();
    return created;
  },

  async findByEmployeeId(employeeId) {
    const snap = await ChecklistItems.col()
      .where('employee_id', '==', employeeId)
      .get();
    // Sort: incomplete first, then by priority, then by created_at
    const items = snapToArray(snap);
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    items.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const pa = priorityOrder[a.priority] ?? 1;
      const pb = priorityOrder[b.priority] ?? 1;
      if (pa !== pb) return pa - pb;
      return (a.created_at?.toMillis?.() ?? 0) - (b.created_at?.toMillis?.() ?? 0);
    });
    return items;
  },

  async findByIdAndEmployee(id, employeeId) {
    const snap = await ChecklistItems.col().doc(id).get();
    if (!snap.exists) return null;
    const data = snap.data();
    if (data.employee_id !== employeeId) return null;
    return { id: snap.id, ...data };
  },

  async update(id, fields) {
    await ChecklistItems.col().doc(id).update(fields);
    return docToObj(await ChecklistItems.col().doc(id).get());
  },
};

// ─── TASKS ────────────────────────────────────────────────────────────────────

const Tasks = {
  col: () => db.collection('tasks'),

  async create({ employee_id, title, description, assigned_by, status = 'pending', deadline }) {
    const data = {
      employee_id,
      title,
      description: description || '',
      assigned_by,
      status,
      deadline: deadline ? Timestamp.fromDate(new Date(deadline)) : null,
      created_at: now(),
    };
    const ref = await Tasks.col().add(data);
    return { id: ref.id, ...data };
  },

  async bulkCreate(items) {
    const batch = db.batch();
    const created = [];
    for (const item of items) {
      const ref = Tasks.col().doc();
      const data = {
        employee_id: item.employee_id,
        title: item.title,
        description: item.description || '',
        assigned_by: item.assigned_by,
        status: item.status || 'pending',
        deadline: item.deadline ? Timestamp.fromDate(new Date(item.deadline)) : null,
        created_at: now(),
      };
      batch.set(ref, data);
      created.push({ id: ref.id, ...data });
    }
    await batch.commit();
    return created;
  },

  async findByEmployeeId(employeeId) {
    const snap = await Tasks.col()
      .where('employee_id', '==', employeeId)
      .get();
    const arr = snapToArray(snap);
    arr.sort((a, b) => (b.created_at || '') > (a.created_at || '') ? 1 : -1);
    return arr;
  },

  async findAll() {
    const snap = await Tasks.col().get();
    const arr = snapToArray(snap);
    arr.sort((a, b) => (b.created_at || '') > (a.created_at || '') ? 1 : -1);
    return arr;
  },

  async findById(id) {
    return docToObj(await Tasks.col().doc(id).get());
  },

  async update(id, fields) {
    await Tasks.col().doc(id).update(fields);
    return docToObj(await Tasks.col().doc(id).get());
  },

  async countByStatus(status) {
    const snap = await Tasks.col().where('status', '==', status).count().get();
    return snap.data().count;
  },
};

// ─── ACCESS REQUESTS ──────────────────────────────────────────────────────────

const AccessRequests = {
  col: () => db.collection('accessRequests'),

  async create({ employee_id, application_name, reason, status = 'pending' }) {
    const data = {
      employee_id,
      application_name,
      reason: reason || '',
      status,
      requested_at: now(),
      approved_by: null,
    };
    const ref = await AccessRequests.col().add(data);
    return { id: ref.id, ...data };
  },

  async findByEmployeeId(employeeId) {
    const snap = await AccessRequests.col()
      .where('employee_id', '==', employeeId)
      .get();
    const arr = snapToArray(snap);
    arr.sort((a, b) => (b.requested_at || '') > (a.requested_at || '') ? 1 : -1);
    return arr;
  },

  async findAll() {
    const snap = await AccessRequests.col().get();
    const arr = snapToArray(snap);
    arr.sort((a, b) => (b.requested_at || '') > (a.requested_at || '') ? 1 : -1);
    return arr;
  },

  async findById(id) {
    return docToObj(await AccessRequests.col().doc(id).get());
  },

  async update(id, fields) {
    await AccessRequests.col().doc(id).update(fields);
    return docToObj(await AccessRequests.col().doc(id).get());
  },

  async countByStatus(status) {
    const snap = await AccessRequests.col().where('status', '==', status).count().get();
    return snap.data().count;
  },
};

// ─── CHAT LOGS ────────────────────────────────────────────────────────────────

const ChatLogs = {
  col: () => db.collection('chatLogs'),

  async create({ employee_id, sender, message }) {
    const data = {
      employee_id,
      sender,
      message,
      timestamp: now(),
    };
    const ref = await ChatLogs.col().add(data);
    return { id: ref.id, ...data };
  },

  async findByEmployeeId(employeeId, limit = 100) {
    const snap = await ChatLogs.col()
      .where('employee_id', '==', employeeId)
      .get();
    const arr = snapToArray(snap);
    arr.sort((a, b) => (a.timestamp || '') > (b.timestamp || '') ? 1 : -1);
    return arr.slice(0, limit);
  },
};

// ─── SIGNATURES ───────────────────────────────────────────────────────────────

const Signatures = {
  col: () => db.collection('signatures'),

  async create({ employee_id, document_id, signature_data_url }) {
    const data = {
      employee_id,
      document_id: document_id || null,
      signature_data_url,
      signed_at: now(),
    };
    const ref = await Signatures.col().add(data);
    return { id: ref.id, ...data };
  },

  async findByEmployeeId(employeeId) {
    const snap = await Signatures.col().where('employee_id', '==', employeeId).get();
    const arr = snapToArray(snap);
    arr.sort((a, b) => (b.signed_at || '') > (a.signed_at || '') ? 1 : -1);
    return arr;
  },

  async findByDocumentId(documentId) {
    const snap = await Signatures.col().where('document_id', '==', documentId).get();
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...serializeTimestamps(d.data()) };
  },
};

module.exports = {
  Users,
  Employees,
  Documents,
  ChecklistItems,
  Tasks,
  AccessRequests,
  ChatLogs,
  Signatures,
  db,
  auth,
  FieldValue,
  Timestamp,
};
