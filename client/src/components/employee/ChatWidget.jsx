import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Cpu, User, Sparkles } from 'lucide-react';
import api from '../../api/axios';
import LoadingSkeleton from '../common/LoadingSkeleton';

// Render **bold** markdown in message text
const renderMessage = (text) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="font-semibold">{part}</strong>
      : <span key={i}>{part}</span>
  );
};

const SUGGESTED_PROMPTS = [
  { label: 'When is my joining date?',            icon: '📅' },
  { label: 'Who is my manager and buddy?',         icon: '👤' },
  { label: 'What is my job location and HR contact?', icon: '📍' },
];

const ChatWidget = forwardRef((props, ref) => {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const messagesEndRef            = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/chat/history');
        setMessages(res.data.history || []);
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMessage = {
      id: Date.now(),
      sender: 'employee',
      message: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const res = await api.post('/chat', { message: trimmed });
      setMessages((prev) => [
        ...prev,
        {
          id:        Date.now() + 1,
          sender:    'assistant',
          message:   res.data.response,
          timestamp: res.data.timestamp,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handlePromptClick = (label) => {
    sendMessage(label);
  };

  // Expose sendMessage so ChatPage can trigger it from the pill buttons
  useImperativeHandle(ref, () => ({ sendMessage }));

  const showEmpty = !loading && messages.length === 0 && !sending;

  if (loading) return <LoadingSkeleton variant="card" className="h-[560px]" />;

  return (
    <div className="flex flex-col h-[560px] bg-[#F4F4F4] border border-[#E0E0E0] rounded-sm overflow-hidden">

      {/* ── Messages area ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Empty state */}
        {showEmpty && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 pb-4">
            <div className="w-12 h-12 bg-[#EDF4FF] rounded-full flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6 text-[#0F62FE]" />
            </div>
            <h3 className="text-sm font-semibold text-[#161616] mb-1">IBM Onboarding Assistant</h3>
            <p className="text-[11px] text-[#8D8D8D] leading-relaxed max-w-[240px] mb-6">
              Powered by watsonx · Ask me anything about your onboarding — joining date, manager, documents, IT setup, and more.
            </p>

            {/* Suggested prompts */}
            <div className="w-full max-w-sm space-y-2">
              <p className="text-[10px] font-semibold text-[#525252] uppercase tracking-wider mb-3 flex items-center gap-1.5 justify-center">
                <Sparkles className="w-3 h-3" /> Suggested questions
              </p>
              {SUGGESTED_PROMPTS.map((p) => (
                <motion.button
                  key={p.label}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePromptClick(p.label)}
                  className="w-full text-left px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-sm text-xs text-[#161616] hover:border-[#0F62FE] hover:bg-[#EDF4FF] transition-colors flex items-center gap-2.5"
                >
                  <span className="text-sm">{p.icon}</span>
                  <span>{p.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';
            return (
              <motion.div
                key={msg.id || msg.timestamp}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-start ml-auto flex-row-reverse'} max-w-[88%]`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white mt-0.5 ${
                  isBot ? 'bg-[#0F62FE]' : 'bg-[#393939]'
                }`}>
                  {isBot ? <Cpu className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble */}
                <div className={`px-3 py-2.5 rounded-sm text-xs leading-relaxed ${
                  isBot
                    ? 'bg-white border border-[#E0E0E0] text-[#161616]'
                    : 'bg-[#0F62FE] text-white'
                }`}>
                  {/* Render line-by-line with bold support */}
                  <div className="space-y-1 whitespace-pre-wrap">
                    {msg.message.split('\n').map((line, i) => (
                      <p key={i}>{renderMessage(line)}</p>
                    ))}
                  </div>
                  <p className={`text-[9px] mt-1.5 text-right ${isBot ? 'text-[#8D8D8D]' : 'text-blue-200'}`}>
                    {(() => {
                      const d = msg.timestamp ? new Date(msg.timestamp) : null;
                      return d && !isNaN(d) ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    })()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {sending && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2.5 items-start max-w-[88%]"
          >
            <div className="w-7 h-7 rounded-full bg-[#0F62FE] flex items-center justify-center flex-shrink-0">
              <Cpu className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="px-3 py-3 rounded-sm bg-white border border-[#E0E0E0]">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-[#0F62FE] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[#0F62FE] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[#0F62FE] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested prompts — sit just above the input bar ─────────── */}
      <div className="px-3 pt-2 pb-0 bg-white border-t border-[#E0E0E0] flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p.label}
            onClick={() => handlePromptClick(p.label)}
            disabled={sending}
            className="text-[10px] px-3 py-1.5 bg-[#F4F4F4] border border-[#E0E0E0] rounded-full text-[#525252] hover:border-[#0F62FE] hover:text-[#0F62FE] hover:bg-[#EDF4FF] transition-colors disabled:opacity-40"
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {/* ── Input area ────────────────────────────────────────────────── */}
      <div className="p-3 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your joining date, manager, documents..."
            className="flex-1 border border-[#E0E0E0] rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#0F62FE] bg-[#F4F4F4] focus:bg-white transition-colors"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="px-3 py-2 bg-[#0F62FE] text-white rounded-sm hover:bg-[#0353E9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-[9px] text-[#8D8D8D] mt-1.5 text-center">
          Powered by IBM watsonx · Context-aware onboarding assistant
        </p>
      </div>
    </div>
  );
});

export default ChatWidget;
