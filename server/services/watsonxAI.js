/**
 * server/services/watsonxAI.js
 *
 * AI Recommendations Service — IBM watsonx AI / Granite abstraction.
 *
 * CURRENT IMPLEMENTATION: Rule-based recommendation engine.
 * FUTURE IMPLEMENTATION: Replace internals with IBM Granite-13B-chat via watsonx.ai API.
 * The interface contract is fixed — no other file needs to change when upgrading.
 */

const {
  ONBOARDING_STAGES,
  ONBOARDING_STAGE_ORDER,
  PRIORITY,
} = require('../config/constants');

// ─── Stage-based recommendation rules ────────────────────────────────────────
const STAGE_RULES = {
  [ONBOARDING_STAGES.PRE_JOINING]: [
    {
      title:       'Accept your offer letter',
      description: 'Your offer letter is waiting for your review and acceptance. This is your first step.',
      priority:    PRIORITY.HIGH,
      action:      'Go to Dashboard → Offer Letter',
      category:    'action',
    },
    {
      title:       'Upload required documents',
      description: 'HR needs your ID proof, educational certificates, and address proof before your joining date.',
      priority:    PRIORITY.HIGH,
      action:      'Go to Documents',
      category:    'action',
    },
    {
      title:       'Familiarise yourself with IBM values',
      description: 'Read about IBM\'s core values and culture on the Learning page.',
      priority:    PRIORITY.MEDIUM,
      action:      'Go to Learning',
      category:    'learning',
    },
  ],
  [ONBOARDING_STAGES.ORIENTATION]: [
    {
      title:       'Complete orientation checklist',
      description: 'Several orientation tasks are pending. Complete them to advance your onboarding stage.',
      priority:    PRIORITY.HIGH,
      action:      'Go to Checklist',
      category:    'action',
    },
    {
      title:       'Introduce yourself to your team',
      description: 'Send a brief introduction message in your team channel. Visit the Team page to see who\'s who.',
      priority:    PRIORITY.MEDIUM,
      action:      'Go to Team',
      category:    'social',
    },
    {
      title:       'Read the Employee Handbook',
      description: 'The handbook covers policies, leave, benefits, and everything you need to know.',
      priority:    PRIORITY.MEDIUM,
      action:      'Go to Learning',
      category:    'learning',
    },
  ],
  [ONBOARDING_STAGES.SYSTEM_SETUP]: [
    {
      title:       'Set up your development environment',
      description: 'Configure your workstation according to the IT setup guide in the Checklist.',
      priority:    PRIORITY.HIGH,
      action:      'Go to Checklist → System Setup',
      category:    'action',
    },
    {
      title:       'Request tool access',
      description: 'Submit access requests for Jira, Confluence, Slack, and any other tools you need.',
      priority:    PRIORITY.HIGH,
      action:      'Go to Access Requests',
      category:    'action',
    },
    {
      title:       'Configure corporate email',
      description: 'Set up your IBM email on all your devices and configure the email client.',
      priority:    PRIORITY.HIGH,
      action:      'Go to Checklist → Email Setup',
      category:    'action',
    },
  ],
  [ONBOARDING_STAGES.TEAM_INTEGRATION]: [
    {
      title:       'Schedule 1:1s with all team members',
      description: 'Meet each of your teammates individually. 30-minute introductory calls go a long way.',
      priority:    PRIORITY.HIGH,
      action:      'Go to Team',
      category:    'social',
    },
    {
      title:       'Connect with your onboarding buddy',
      description: 'Your buddy is your go-to person for day-to-day guidance. Schedule a kickoff call.',
      priority:    PRIORITY.HIGH,
      action:      'Go to Team',
      category:    'social',
    },
    {
      title:       'Complete mandatory compliance training',
      description: 'IBM Security & Compliance training must be completed before you reach full productivity.',
      priority:    PRIORITY.HIGH,
      action:      'Go to Learning',
      category:    'learning',
    },
  ],
  [ONBOARDING_STAGES.FULLY_PRODUCTIVE]: [
    {
      title:       'Explore advanced IBM learning paths',
      description: 'You\'ve completed onboarding! Explore IBM\'s certification programs and advanced learning paths.',
      priority:    PRIORITY.LOW,
      action:      'Go to Learning',
      category:    'learning',
    },
    {
      title:       'Set 90-day goals with your manager',
      description: 'Schedule a meeting with your manager to define your first-quarter objectives.',
      priority:    PRIORITY.MEDIUM,
      action:      'Go to Team',
      category:    'action',
    },
  ],
};

// ─── Progress-based nudges ────────────────────────────────────────────────────
function getProgressNudges(completionPercentage) {
  if (completionPercentage < 25) {
    return [{
      title:       'Great start! Keep the momentum going.',
      description: 'You\'ve begun your onboarding journey. Focus on high-priority checklist items first.',
      priority:    PRIORITY.MEDIUM,
      action:      'Go to Checklist',
      category:    'motivation',
    }];
  }
  if (completionPercentage < 50) {
    return [{
      title:       'You\'re 25%+ complete — well done!',
      description: 'Keep checking off tasks. High-priority items will advance your onboarding stage.',
      priority:    PRIORITY.LOW,
      action:      'Go to Checklist',
      category:    'motivation',
    }];
  }
  if (completionPercentage < 75) {
    return [{
      title:       'Over halfway there!',
      description: 'You\'re making excellent progress. Focus on the remaining high-priority items.',
      priority:    PRIORITY.LOW,
      action:      'Go to Checklist',
      category:    'motivation',
    }];
  }
  if (completionPercentage < 100) {
    return [{
      title:       'Almost fully onboarded!',
      description: 'Just a few tasks remain. Complete them to reach the "Fully Productive" stage.',
      priority:    PRIORITY.MEDIUM,
      action:      'Go to Checklist',
      category:    'motivation',
    }];
  }
  return [];
}

// ─── Public Interface ─────────────────────────────────────────────────────────
/**
 * Get AI-powered recommendations for an employee.
 *
 * @param {Object} employeeProfile - { onboarding_stage, completion_percentage, pending_documents, pending_tasks }
 * @returns {Promise<{ recommendations: Array }>}
 */
async function getRecommendations(employeeProfile) {
  const {
    onboarding_stage     = ONBOARDING_STAGES.PRE_JOINING,
    completion_percentage = 0,
  } = employeeProfile;

  const stageRecs   = STAGE_RULES[onboarding_stage] || [];
  const progressRec = getProgressNudges(completion_percentage);

  // Merge and deduplicate by title, cap at 5 recommendations
  const combined = [...stageRecs, ...progressRec].slice(0, 5);

  return { recommendations: combined };
}

/**
 * Analyse sentiment of a message (basic rule-based).
 * FUTURE: Replace with Granite model sentiment analysis.
 *
 * @param {string} text
 * @returns {Promise<{ sentiment: 'positive'|'neutral'|'negative', score: number }>}
 */
async function analyzeSentiment(text) {
  const positive = /great|excellent|happy|love|wonderful|amazing|good|thank|helpful/i;
  const negative = /bad|terrible|awful|hate|confused|lost|frustrated|stuck|problem|issue/i;

  if (positive.test(text)) return { sentiment: 'positive', score: 0.8 };
  if (negative.test(text)) return { sentiment: 'negative', score: 0.7 };
  return { sentiment: 'neutral', score: 0.5 };
}

module.exports = { getRecommendations, analyzeSentiment, ONBOARDING_STAGE_ORDER };
