/**
 * server/utils/constants.js
 *
 * Backend utility constants — single source of truth for all string enumerations.
 * Import this file instead of hardcoding string literals anywhere in the server.
 *
 * NOTE: This re-exports from shared/constants and adds any server-only helpers.
 */

// ─── User Roles ───────────────────────────────────────────────────────────────
const ROLES = {
  EMPLOYEE: 'employee',
  ADMIN:    'admin',
};

// ─── Onboarding Stages ────────────────────────────────────────────────────────
// Full stage machine (used internally and in DB)
const ONBOARDING_STAGES = {
  PRE_JOINING:       'PRE_JOINING',
  ORIENTATION:       'ORIENTATION',
  SYSTEM_SETUP:      'SYSTEM_SETUP',
  TEAM_INTEGRATION:  'TEAM_INTEGRATION',
  FULLY_PRODUCTIVE:  'FULLY_PRODUCTIVE',
};

// Simplified aliases used in seed / API inputs (maps to full stages)
const ONBOARDING_STAGE_ALIASES = {
  not_started: 'PRE_JOINING',
  in_progress: 'ORIENTATION',
  completed:   'FULLY_PRODUCTIVE',
};

/** Ordered list — used for progress % calculation */
const ONBOARDING_STAGE_ORDER = [
  ONBOARDING_STAGES.PRE_JOINING,
  ONBOARDING_STAGES.ORIENTATION,
  ONBOARDING_STAGES.SYSTEM_SETUP,
  ONBOARDING_STAGES.TEAM_INTEGRATION,
  ONBOARDING_STAGES.FULLY_PRODUCTIVE,
];

/**
 * Resolve a stage value that may be an alias ('not_started') or a full stage name.
 * Returns the canonical DB value.
 */
function resolveStage(value) {
  if (!value) return ONBOARDING_STAGES.PRE_JOINING;
  if (ONBOARDING_STAGE_ALIASES[value]) return ONBOARDING_STAGE_ALIASES[value];
  if (Object.values(ONBOARDING_STAGES).includes(value)) return value;
  return ONBOARDING_STAGES.PRE_JOINING;
}

// ─── Task Statuses ────────────────────────────────────────────────────────────
const TASK_STATUS = {
  PENDING:     'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED:   'completed',
  OVERDUE:     'overdue',
};

// ─── Document Types ───────────────────────────────────────────────────────────
const DOCUMENT_TYPES = {
  ID_PROOF:             'id_proof',
  EDUCATION_CERTIFICATE:'education_certificate',
  OFFER_LETTER:         'offer_letter',
  ADDRESS_PROOF:        'address_proof',
  OTHER:                'other',
};

// ─── Document Verification Statuses ──────────────────────────────────────────
const DOCUMENT_STATUS = {
  PENDING:  'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

// ─── Access Request Statuses ──────────────────────────────────────────────────
const ACCESS_STATUS = {
  PENDING:  'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// ─── Checklist Priorities ─────────────────────────────────────────────────────
const PRIORITY = {
  HIGH:   'high',
  MEDIUM: 'medium',
  LOW:    'low',
};

// ─── Checklist Categories ─────────────────────────────────────────────────────
const CHECKLIST_CATEGORY = {
  DOCUMENTS: 'documents',
  SETUP:     'setup',
  HR:        'hr',
  LEARNING:  'learning',
  TEAM:      'team',
};

// ─── OS Types ─────────────────────────────────────────────────────────────────
const OS_TYPES = {
  MAC:     'mac',
  WINDOWS: 'windows',
  LINUX:   'linux',
};

// ─── Employee Status ──────────────────────────────────────────────────────────
const EMPLOYEE_STATUS = {
  ACTIVE:   'active',
  INACTIVE: 'inactive',
};

// ─── Chat Sender Types ────────────────────────────────────────────────────────
const CHAT_SENDER = {
  USER:      'user',
  ASSISTANT: 'assistant',
};

// ─── Socket.IO Event Names ────────────────────────────────────────────────────
const SOCKET_EVENTS = {
  EMPLOYEE_UPDATED:  'employeeUpdated',
  TASK_ASSIGNED:     'taskAssigned',
  DOCUMENT_APPROVED: 'documentApproved',
  NOTIFICATION:      'notification',
  ADMIN_ALERT:       'adminAlert',
  JOIN_ROOM:         'joinRoom',
};

// ─── File Upload Constraints ──────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE_MB    = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ─── bcrypt ───────────────────────────────────────────────────────────────────
const BCRYPT_SALT_ROUNDS = 12;

// ─── API Response Helpers ─────────────────────────────────────────────────────
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

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  ROLES,
  ONBOARDING_STAGES,
  ONBOARDING_STAGE_ALIASES,
  ONBOARDING_STAGE_ORDER,
  resolveStage,
  TASK_STATUS,
  DOCUMENT_TYPES,
  DOCUMENT_STATUS,
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
  BCRYPT_SALT_ROUNDS,
  apiSuccess,
  apiError,
};
