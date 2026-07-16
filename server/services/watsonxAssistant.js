/**
 * server/services/watsonxAssistant.js
 *
 * AI Chat Service — IBM watsonx Assistant abstraction.
 *
 * CURRENT IMPLEMENTATION: Mock responses with intent detection.
 * FUTURE IMPLEMENTATION: Replace sendMessage internals with IBM watsonx Assistant REST API.
 * The interface contract is fixed — no other file needs to change when upgrading.
 */

const INTENTS = {
  GREETING:      'greeting',
  CHECKLIST:     'checklist',
  DOCUMENTS:     'documents',
  ACCESS:        'access_request',
  SYSTEM_SETUP:  'system_setup',
  LEAVE:         'leave_policy',
  BENEFITS:      'benefits',
  TEAM:          'team_info',
  PROGRESS:      'onboarding_progress',
  HELP:          'help',
  FAREWELL:      'farewell',
  UNKNOWN:       'unknown',
};

// ─── Intent Detection ─────────────────────────────────────────────────────────
function detectIntent(message) {
  const msg = message.toLowerCase();

  if (/^(hi|hello|hey|good\s+(morning|afternoon|evening)|greetings)/i.test(msg))
    return INTENTS.GREETING;
  if (/checklist|task|to.?do|pending|complete/i.test(msg))
    return INTENTS.CHECKLIST;
  if (/document|upload|id proof|certificate|passport|aadhaar|pan/i.test(msg))
    return INTENTS.DOCUMENTS;
  if (/access|permission|jira|slack|confluence|aws|github|tool/i.test(msg))
    return INTENTS.ACCESS;
  if (/setup|workstation|laptop|install|configure|software|os|mac|windows|linux/i.test(msg))
    return INTENTS.SYSTEM_SETUP;
  if (/leave|vacation|holiday|pto|time.?off/i.test(msg))
    return INTENTS.LEAVE;
  if (/benefit|insurance|health|stipend|perk|salary/i.test(msg))
    return INTENTS.BENEFITS;
  if (/team|manager|buddy|colleague|who.*work|org.?chart/i.test(msg))
    return INTENTS.TEAM;
  if (/progress|percent|stage|complete|far|status/i.test(msg))
    return INTENTS.PROGRESS;
  if (/(bye|goodbye|thank|see you)/i.test(msg))
    return INTENTS.FAREWELL;
  if (/help|support|assist|guide|what can/i.test(msg))
    return INTENTS.HELP;

  return INTENTS.UNKNOWN;
}

// ─── Response Templates ───────────────────────────────────────────────────────
const RESPONSES = {
  [INTENTS.GREETING]: {
    replies: [
      "Hello! Welcome to IBM OnboardAI 👋 I'm here to guide you through every step of your onboarding. What would you like to know?",
      "Hi there! Great to have you here. I can help with your checklist, documents, access requests, system setup, and more. How can I assist?",
    ],
    suggestions: ['Show my checklist', 'Upload documents', 'Request access', 'Onboarding progress'],
  },
  [INTENTS.CHECKLIST]: {
    replies: [
      "Your personalized onboarding checklist is in the **Checklist** section. It's organized by priority — complete the high-priority items first to stay on track.",
      "Head over to the **Checklist** tab to see all your pending tasks. Items are color-coded by priority: red for high, yellow for medium, green for low.",
    ],
    suggestions: ['What are high-priority tasks?', 'How do I mark a task complete?', 'Onboarding progress'],
  },
  [INTENTS.DOCUMENTS]: {
    replies: [
      "You can upload your documents in the **Documents** section. Accepted formats: PDF, PNG, JPG, and DOCX. Maximum file size is 10MB. All documents are securely stored and only accessible to authorized personnel.",
      "Required documents include: Government ID proof, educational certificates, and address proof. Go to **Documents** to upload them. Your HR team will verify each one.",
    ],
    suggestions: ['What documents are required?', 'Check document status', 'Upload a document'],
  },
  [INTENTS.ACCESS]: {
    replies: [
      "You can request access to applications like Jira, Confluence, Slack, AWS, and GitHub from the **Access Requests** section. Provide a reason for each request to speed up approval.",
      "Access requests are reviewed by your manager. Navigate to **Access Requests**, submit your request, and you'll be notified once it's approved or rejected.",
    ],
    suggestions: ['Request Jira access', 'Request Slack access', 'Check request status'],
  },
  [INTENTS.SYSTEM_SETUP]: {
    replies: [
      "For system setup, head to the **Checklist** section and look for the System Setup category. It walks you through workstation configuration, email setup, and required software installation.",
      "Your IT setup guide is in the **Checklist** under System Setup. If you need specific software access, use the **Access Requests** section.",
    ],
    suggestions: ['Configure email', 'Install required software', 'Request tool access'],
  },
  [INTENTS.LEAVE]: {
    replies: [
      "IBM provides a comprehensive leave policy including paid time off, sick leave, and parental leave. Full details are in the Employee Handbook available in the **Learning** section.",
      "Leave policies vary by location and employment type. Check the **Learning** section for the Employee Handbook, or contact your HR partner for specifics.",
    ],
    suggestions: ['View learning resources', 'Contact HR', 'Read employee handbook'],
  },
  [INTENTS.BENEFITS]: {
    replies: [
      "IBM offers competitive benefits including health insurance, professional development stipends, and employee stock purchase plans. Details are in the **Learning** section under Employee Benefits.",
      "For a full benefits overview, visit the **Learning** section. You can also ask your onboarding buddy or manager for quick guidance.",
    ],
    suggestions: ['View learning resources', 'Ask my buddy', 'Employee handbook'],
  },
  [INTENTS.TEAM]: {
    replies: [
      "Your team information, including your manager and onboarding buddy, is in the **Team** section. You can find contact details and a short bio for each person.",
      "Head to the **Team** tab to see your immediate team members, manager, and buddy. It's a great place to start scheduling your 1:1 introduction calls.",
    ],
    suggestions: ['View team page', 'Message my buddy', 'Schedule 1:1s'],
  },
  [INTENTS.PROGRESS]: {
    replies: [
      "Your onboarding progress is shown on your **Dashboard**. The progress bar reflects completed checklist items. You're doing great — keep it up!",
      "Check the **Dashboard** for a real-time view of your onboarding completion percentage. Focus on high-priority checklist items to advance your stage.",
    ],
    suggestions: ['Go to dashboard', 'View checklist', 'What stage am I in?'],
  },
  [INTENTS.HELP]: {
    replies: [
      "I can help you with:\n• **Checklist** — your onboarding tasks\n• **Documents** — uploading and tracking verification\n• **Access Requests** — tool and software access\n• **System Setup** — workstation configuration\n• **Team** — meeting your colleagues\n• **Learning** — resources and training\n\nWhat would you like to explore?",
    ],
    suggestions: ['Show my checklist', 'Upload documents', 'Request access', 'Meet my team'],
  },
  [INTENTS.FAREWELL]: {
    replies: [
      "You're all set! Good luck with your onboarding journey. I'm here anytime you need guidance. Welcome to IBM! 🎉",
      "Great chatting with you! Come back anytime you have questions. Your IBM journey is just beginning!",
    ],
    suggestions: ['Go to dashboard', 'View checklist'],
  },
  [INTENTS.UNKNOWN]: {
    replies: [
      "I'm not sure I understood that. I can help with your checklist, documents, access requests, system setup, team, and learning resources. Could you rephrase your question?",
      "I didn't quite catch that. Try asking about your onboarding checklist, document uploads, access requests, or use the menu to navigate the platform.",
    ],
    suggestions: ['Show my checklist', 'Upload documents', 'Request access', 'Get help'],
  },
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Public Interface ─────────────────────────────────────────────────────────
/**
 * Send a message to the AI assistant and receive a response.
 *
 * @param {string} employeeId  - The employee's ID (for context in future real implementation)
 * @param {string} message     - The user's message text
 * @param {Object} context     - Optional context (onboarding stage, etc.)
 * @returns {Promise<{ reply: string, suggestions: string[], intent: string }>}
 */
async function sendMessage(employeeId, message, context = {}) {
  // Simulate a slight processing delay for realism
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

  const intent   = detectIntent(message);
  const template = RESPONSES[intent] || RESPONSES[INTENTS.UNKNOWN];
  const reply    = pickRandom(template.replies);

  // Personalise if we have context
  let finalReply = reply;
  if (context.name && intent === INTENTS.GREETING) {
    finalReply = reply.replace('Hello!', `Hello, ${context.name}!`).replace('Hi there!', `Hi, ${context.name}!`);
  }

  return {
    reply:       finalReply,
    suggestions: template.suggestions || [],
    intent,
  };
}

module.exports = { sendMessage, INTENTS };
