/**
 * server/config/constants.js
 *
 * Re-exports shared constants and adds any server-only constants.
 * Import from here inside the server — never import directly from shared/.
 */

const shared = require('../../shared/constants');

// ─── Server-only constants ───────────────────────────────────────────────────
const BCRYPT_SALT_ROUNDS = 12;
const DEFAULT_PAGE_SIZE  = 20;

const DEFAULT_CHECKLIST = [
  // PRE_JOINING
  {
    title:       'Review and accept offer letter',
    description: 'Open your offer letter, read the terms, and formally accept it through the platform.',
    category:    shared.CHECKLIST_CATEGORY.HR,
    priority:    shared.PRIORITY.HIGH,
    order_index: 1,
  },
  {
    title:       'Upload government ID proof',
    description: 'Upload a scanned copy of your passport, national ID, or driving licence.',
    category:    shared.CHECKLIST_CATEGORY.DOCUMENTS,
    priority:    shared.PRIORITY.HIGH,
    order_index: 2,
  },
  {
    title:       'Upload educational certificates',
    description: 'Upload your highest degree certificate and any relevant certifications.',
    category:    shared.CHECKLIST_CATEGORY.DOCUMENTS,
    priority:    shared.PRIORITY.HIGH,
    order_index: 3,
  },
  {
    title:       'Upload address proof',
    description: 'Provide a recent utility bill or bank statement as address proof.',
    category:    shared.CHECKLIST_CATEGORY.DOCUMENTS,
    priority:    shared.PRIORITY.MEDIUM,
    order_index: 4,
  },
  // ORIENTATION
  {
    title:       'Complete HR orientation session',
    description: 'Attend the virtual or in-person HR orientation to learn about company policies.',
    category:    shared.CHECKLIST_CATEGORY.HR,
    priority:    shared.PRIORITY.HIGH,
    order_index: 5,
  },
  {
    title:       'Read the employee handbook',
    description: 'Review the full employee handbook available in the Learning section.',
    category:    shared.CHECKLIST_CATEGORY.LEARNING,
    priority:    shared.PRIORITY.MEDIUM,
    order_index: 6,
  },
  // SYSTEM_SETUP
  {
    title:       'Set up your workstation',
    description: 'Configure your OS, install required software, and set up your development environment.',
    category:    shared.CHECKLIST_CATEGORY.SETUP,
    priority:    shared.PRIORITY.HIGH,
    order_index: 7,
  },
  {
    title:       'Configure corporate email',
    description: 'Set up your IBM email account on all your devices and configure email client.',
    category:    shared.CHECKLIST_CATEGORY.SETUP,
    priority:    shared.PRIORITY.HIGH,
    order_index: 8,
  },
  {
    title:       'Request application access',
    description: 'Submit access requests for all tools you need (Jira, Confluence, Slack, etc.).',
    category:    shared.CHECKLIST_CATEGORY.SETUP,
    priority:    shared.PRIORITY.HIGH,
    order_index: 9,
  },
  // TEAM_INTEGRATION
  {
    title:       'Meet your team members',
    description: 'Schedule 1:1 calls with each member of your immediate team.',
    category:    shared.CHECKLIST_CATEGORY.TEAM,
    priority:    shared.PRIORITY.MEDIUM,
    order_index: 10,
  },
  {
    title:       'Connect with your onboarding buddy',
    description: 'Reach out to your assigned buddy for guidance on day-to-day processes.',
    category:    shared.CHECKLIST_CATEGORY.TEAM,
    priority:    shared.PRIORITY.MEDIUM,
    order_index: 11,
  },
  {
    title:       'Complete IBM Security & Compliance training',
    description: 'Finish the mandatory security awareness and compliance modules in the Learning section.',
    category:    shared.CHECKLIST_CATEGORY.LEARNING,
    priority:    shared.PRIORITY.HIGH,
    order_index: 12,
  },
];

module.exports = {
  ...shared,
  BCRYPT_SALT_ROUNDS,
  DEFAULT_PAGE_SIZE,
  DEFAULT_CHECKLIST,
};
