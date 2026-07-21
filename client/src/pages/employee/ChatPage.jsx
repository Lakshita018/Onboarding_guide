import React, { useRef } from 'react';
import { Cpu } from 'lucide-react';
import ChatWidget from '../../components/employee/ChatWidget';

const PILLS = [
  { label: '📅 Joining date',    question: 'When is my joining date?' },
  { label: '👤 Manager & buddy', question: 'Who is my manager and buddy?' },
  { label: '📍 Office location', question: 'Where is my office location?' },
  { label: '📄 Documents',       question: 'What documents do I need to submit?' },
  { label: '🔐 W3ID & access',   question: 'How do I set up my W3ID?' },
  { label: '🏥 Benefits',        question: 'What are my IBM benefits?' },
  { label: '💻 IT setup',        question: 'How do I set up my Mac laptop?' },
  { label: '👩‍💼 HR contact',      question: 'Who is my HR contact?' },
];

const ChatPage = () => {
  const chatRef = useRef(null);

  const handlePill = (question) => {
    chatRef.current?.sendMessage(question);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#161616] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#0F62FE]" />
            AI Onboarding Assistant
          </h1>
          <p className="text-sm text-[#525252] mt-1">
            Powered by IBM watsonx — ask me anything about your onboarding.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#DEFBE6] border border-[#24A148]/30 rounded-full">
          <span className="w-1.5 h-1.5 bg-[#24A148] rounded-full animate-pulse" />
          <span className="text-[10px] font-semibold text-[#198038]">Online</span>
        </div>
      </div>

      {/* Clickable topic pills */}
      <div className="flex flex-wrap gap-2">
        {PILLS.map((pill) => (
          <button
            key={pill.label}
            onClick={() => handlePill(pill.question)}
            className="text-[10px] px-2.5 py-1 bg-[#F4F4F4] border border-[#E0E0E0] rounded-full text-[#525252] hover:border-[#0F62FE] hover:text-[#0F62FE] hover:bg-[#EDF4FF] transition-colors cursor-pointer"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Chat widget */}
      <ChatWidget ref={chatRef} />
    </div>
  );
};

export default ChatPage;
