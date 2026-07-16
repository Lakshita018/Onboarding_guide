/**
 * shared/constants.js
 *
 * Single source of truth for all roles, stages, statuses, and
 * categorisation values used across both client and server.
 *
 * NEVER hardcode these strings in components or controllers.
 */

// ─── User Roles ────────────────────────────────────────────────────────────────
const ROLES = Object.freeze({
  EMPLOYEE: 'employee',
  ADMIN:    'admin',
});

// ─── Onboarding Stages (ordered) ───────────────────────────────────────────────
const ONBOARDING_STAGES = Object.freeze({
  PRE_JOINING:        'PRE_JOINING',
  ORIENTATION:        'ORIENTATION',
  SYSTEM_SETUP:       'SYSTEM_SETUP',
  TEAM_INTEGRATION:   'TEAM_INTEGRATION',
  FULLY_PRODUCTIVE:   'FULLY_PRODUCTIVE',
});

/** Ordered array — useful for progress calculation */
const ONBOARDING_STAGE_ORDER = [
  ONBOARDING_STAGES.PRE_JOINING,
  ONBOARDING_STAGES.ORIENTATION,
  ONBOARDING_STAGES.SYSTEM_SETUP,
  ONBOARDING_STAGES.TEAM_INTEGRATION,
  ONBOARDING_STAGES.FULLY_PRODUCTIVE,
];

// ─── Document Types ─────────────────────────────────────────────────────────────
const DOCUMENT_TYPES = Object.freeze({
  ID_PROOF:      'id_proof',
  EDUCATION:     'education',
  ADDRESS_PROOF: 'address_proof',
  OFFER_LETTER:  'offer_letter',
  OTHER:         'other',
});

// ─── Document Verification Statuses ────────────────────────────────────────────
const DOCUMENT_STATUS = Object.freeze({
  PENDING:  'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
});

// ─── Task Statuses ──────────────────────────────────────────────────────────────
const TASK_STATUS = Object.freeze({
  PENDING:     'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED:   'completed',
  OVERDUE:     'overdue',
});

// ─── Access Request Statuses ────────────────────────────────────────────────────
const ACCESS_STATUS = Object.freeze({
  PENDING:  'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

// ─── Checklist Priorities ───────────────────────────────────────────────────────
const PRIORITY = Object.freeze({
  HIGH:   'high',
  MEDIUM: 'medium',
  LOW:    'low',
});

// ─── Checklist Categories ───────────────────────────────────────────────────────
const CHECKLIST_CATEGORY = Object.freeze({
  DOCUMENTS: 'documents',
  SETUP:     'setup',
  HR:        'hr',
  LEARNING:  'learning',
  TEAM:      'team',
});

// ─── OS Types ───────────────────────────────────────────────────────────────────
const OS_TYPES = Object.freeze({
  MAC:     'mac',
  WINDOWS: 'windows',
  LINUX:   'linux',
});

// ─── Employee Status ────────────────────────────────────────────────────────────
const EMPLOYEE_STATUS = Object.freeze({
  ACTIVE:   'active',
  INACTIVE: 'inactive',
});

// ─── Chat Sender Types ──────────────────────────────────────────────────────────
const CHAT_SENDER = Object.freeze({
  USER:      'user',
  ASSISTANT: 'assistant',
});

// ─── Socket.IO Event Names ──────────────────────────────────────────────────────
const SOCKET_EVENTS = Object.freeze({
  EMPLOYEE_UPDATED:  'employeeUpdated',
  TASK_ASSIGNED:     'taskAssigned',
  DOCUMENT_APPROVED: 'documentApproved',
  NOTIFICATION:      'notification',
  ADMIN_ALERT:       'adminAlert',
  JOIN_ROOM:         'joinRoom',
});

// ─── Allowed File MIME Types ────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = Object.freeze([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

// ─── File Size Limits ───────────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ─── API Response Helpers ───────────────────────────────────────────────────────
const apiSuccess = (data, message = 'Success') => ({
  success: true,
  data,
  message,
});

const apiError = (message = 'An error occurred', errors = null) => ({
  success: false,
  data:    null,
  message,
  ...(errors ? { errors } : {}),
});

// ─── Exports ────────────────────────────────────────────────────────────────────
module.exports = {
  ROLES,
  ONBOARDING_STAGES,
  ONBOARDING_STAGE_ORDER,
  DOCUMENT_TYPES,
  DOCUMENT_STATUS,
  TASK_STATUS,
  ACCESS_STATUS,
  PRIORITY,
  CHECKLIST_CATEGORY,
  OS_TYPES,
  EMPLOYEE_STATUS,
  CHAT_SENDER,
  SOCKET_EVENTS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
  apiSuccess,
  apiError,
};
