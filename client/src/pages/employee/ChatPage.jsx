import React from 'react';
import ChatWidget from '../../components/employee/ChatWidget';

const ChatPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">AI Assistant</h1>
        <p className="text-sm text-[#525252] mt-1">
          Powered by IBM watsonx to help you with your onboarding.
        </p>
      </div>

      <ChatWidget />
    </div>
  );
};

export default ChatPage;
