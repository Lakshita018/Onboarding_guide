/**
 * watsonxAI.js
 * Abstraction layer for IBM watsonx AI / Granite Foundation Model.
 * Initial implementation is a rule-based engine simulating AI recommendations.
 */

async function getNextRecommendedTask(employeeData) {
  // Simulate network/API latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { department, onboarding_stage, os_type } = employeeData || {};
  
  let recommendedTask = "Complete your onboarding checklist";

  if (onboarding_stage === 'pre-joining') {
    recommendedTask = "Upload Signed Offer Letter & Tax Documents";
  } else if (os_type && os_type.toLowerCase() === 'mac') {
    recommendedTask = "Set up macOS Developer Profile & Security Certificates";
  } else if (os_type && os_type.toLowerCase() === 'windows') {
    recommendedTask = "Set up Windows Hello & BitLocker Encryption";
  } else if (department && (department.toLowerCase().includes('engineer') || department.toLowerCase().includes('tech'))) {
    recommendedTask = "Request application access to GitHub Enterprise";
  }

  return {
    task: recommendedTask
  };
}

// Keeping the rich recommendations structure for future phases
async function generateRecommendations(employeeDetails) {
  const result = await getNextRecommendedTask(employeeDetails);
  
  // Return broader recommendation payloads
  return {
    learningResources: [
      {
        title: 'IBM Watsonx Foundation Course',
        type: 'course',
        duration: '60 mins',
        url: '#'
      }
    ],
    accessRequests: [
      {
        application: 'GitHub Enterprise',
        reason: 'Required for dev collaboration.'
      }
    ],
    recommendedTasks: [
      {
        title: result.task,
        description: 'Auto-recommended by IBM Granite OnboardAI models.',
        priority: 'high'
      }
    ]
  };
}

module.exports = {
  getNextRecommendedTask,
  generateRecommendations
};
