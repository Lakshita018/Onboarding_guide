/**
 * watsonxAssistant.js
 * Abstraction layer for IBM watsonx Assistant.
 * Initial implementation is a mock response generator.
 */

async function askAssistant(message) {
  // Simulate network/API latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  const lowerMsg = message ? message.toLowerCase() : '';

  let replyText = "Hello, I am your onboarding assistant.";

  // Basic mock responses based on onboarding questions
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    replyText = "Hello! I'm your IBM OnboardAI Assistant. How can I help you with your onboarding today?";
  } else if (lowerMsg.includes('benefits') || lowerMsg.includes('insurance')) {
    replyText = "IBM offers comprehensive health, dental, and vision insurance. You can review and enroll via the 'Onboarding Checklist' or the HR benefits portal within your first 30 days.";
  } else if (lowerMsg.includes('laptop') || lowerMsg.includes('mac') || lowerMsg.includes('windows') || lowerMsg.includes('hardware')) {
    replyText = "Depending on your selection during pre-joining, your laptop (Mac or Windows) will be shipped to your address or handed to you by IT on Day 1. Ensure you accept the hardware policy checklist item!";
  } else if (lowerMsg.includes('offer') || lowerMsg.includes('letter')) {
    replyText = "You can view and accept your offer letter directly from the 'Documents' tab on your dashboard.";
  } else if (lowerMsg.includes('buddy') || lowerMsg.includes('manager')) {
    replyText = "Your designated manager and onboarding buddy details are visible in the 'Team Info' section of your employee dashboard. They are there to help you settle in!";
  }

  return {
    success: true,
    response: replyText
  };
}

module.exports = {
  askAssistant,
};
