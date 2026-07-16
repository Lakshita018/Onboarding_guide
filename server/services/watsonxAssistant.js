/**
 * watsonxAssistant.js
 * Abstraction layer for IBM watsonx Assistant.
 * Current implementation: Intelligent mock responses.
 * Future implementation: IBM watsonx Assistant API via REST.
 */

const RESPONSES = [
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
    reply: "Hello! I'm your IBM OnboardAI Assistant — here to guide you through your onboarding journey. How can I help you today?",
  },
  {
    keywords: ['document', 'upload', 'id proof', 'education', 'certificate', 'what documents'],
    reply: "You need to upload three documents: (1) Identity Proof (driver's license or passport), (2) Education Certificate (degree/diploma), and (3) Signed Offer Letter. Navigate to 'My Documents' in the sidebar to upload them.",
  },
  {
    keywords: ['offer', 'letter', 'accept', 'sign'],
    reply: "Your offer letter is in the 'My Documents' section. Once you review the terms, click 'Accept Offer' to confirm your joining. This will move you to the active onboarding stage.",
  },
  {
    keywords: ['laptop', 'mac', 'windows', 'hardware', 'computer', 'device'],
    reply: "Your laptop will be provided based on your OS selection during setup. Mac and Windows options are available. Configure your preference in the 'Setup Guide' section. IT will ensure it's ready on Day 1.",
  },
  {
    keywords: ['w3id', 'intranet', 'ibm id', 'login', 'credentials', 'password'],
    reply: "Your W3ID is your IBM global intranet identity. You'll receive setup instructions via email. Complete the W3ID setup within your first 48 hours as all IBM systems require it.",
  },
  {
    keywords: ['buddy', 'manager', 'team', 'mentor', 'who is my'],
    reply: "Your manager and onboarding buddy details are in the 'Team Info' section on your dashboard. Your buddy will reach out within the first week to help you settle in!",
  },
  {
    keywords: ['slack', 'teams', 'outlook', 'email', 'communication', 'tools'],
    reply: "IBM uses Microsoft Teams for collaboration and Outlook for email. Request access via the 'Access Requests' section. Slack may be used by specific teams — check with your manager.",
  },
  {
    keywords: ['checklist', 'task', 'what to do', 'next step', 'progress'],
    reply: "Your onboarding checklist is in the 'Checklist' section. Complete tasks in priority order — high-priority items like W3ID setup and document submission should be done first.",
  },
  {
    keywords: ['benefits', 'insurance', 'health', 'medical', 'dental'],
    reply: "IBM offers comprehensive benefits including health, dental, and vision insurance. You can review and enroll via the HR benefits portal. Enrollment must be completed within 30 days of joining.",
  },
  {
    keywords: ['github', 'jira', 'access', 'application', 'software', 'request'],
    reply: "Submit access requests for applications like GitHub Enterprise, Jira, or cloud portals via the 'Access Requests' section. Approvals typically take 1–2 business days.",
  },
  {
    keywords: ['setup', 'configure', 'install', 'os', 'mac', 'windows setup'],
    reply: "The 'Setup Guide' section provides step-by-step instructions tailored to your OS (Windows, Mac, or Linux). Select your OS to get personalized setup steps.",
  },
  {
    keywords: ['learning', 'course', 'training', 'ibm learn', 'education'],
    reply: "IBM has an extensive learning catalog. Check the 'Learning Resources' section for curated courses including IBM watsonx foundations, security awareness, and IBM Cloud certifications.",
  },
  {
    keywords: ['joining date', 'start date', 'when do i start', 'day 1', 'first day'],
    reply: "Your joining date is shown on your employee profile. If you need to confirm or change it, contact HR at hr@ibm.com. Make sure all documents are uploaded before your start date.",
  },
  {
    keywords: ['help', 'support', 'contact hr', 'hr contact', 'problem', 'issue'],
    reply: "For HR support, email hr@ibm.com or reach out via the IBM HR helpdesk portal. Your onboarding buddy and manager are also great contacts for day-to-day questions.",
  },
];

async function askAssistant(message) {
  // Simulate IBM API network latency
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));

  const lowerMsg = (message || '').toLowerCase();

  for (const item of RESPONSES) {
    if (item.keywords.some((kw) => lowerMsg.includes(kw))) {
      return { success: true, response: item.reply };
    }
  }

  // Default fallback
  return {
    success: true,
    response:
      "I'm here to help with your IBM onboarding! You can ask me about documents to upload, your checklist, IT setup, accessing tools, your team, benefits, or any onboarding questions. What would you like to know?",
  };
}

module.exports = { askAssistant };
