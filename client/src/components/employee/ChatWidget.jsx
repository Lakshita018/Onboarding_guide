import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Cpu, User, X } from 'lucide-react';
import api from '../../api/axios';
import Card from '../common/Card';
import LoadingSkeleton from '../common/LoadingSkeleton';

const ChatWidget = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'employee',
      message: input,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const res = await api.post('/chat', { message: userMessage.message });
      const botMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        message: res.data.response,
        timestamp: res.data.timestamp
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="card" className="h-[400px]" />;

  return (
    <Card noPadding className="h-[450px] flex flex-col overflow-hidden bg-[#F4F4F4] border border-[#E0E0E0] rounded-sm">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !sending && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-10 h-10 bg-[#EDF4FF] rounded-full flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5 text-[#0F62FE]" />
            </div>
            <h3 className="text-xs font-semibold text-[#161616]">IBM Onboarding Assistant</h3>
            <p className="text-[10px] text-[#8D8D8D] mt-1.5 max-w-[200px] leading-relaxed">
              Ask me about checklist tasks, W3ID setup, or required documents.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isBot = msg.sender === 'assistant';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 max-w-[85%] ${isBot ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white ${
                isBot ? 'bg-[#0F62FE]' : 'bg-[#393939]'
              }`}>
                {isBot ? <Cpu className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>
              <div className={`p-2.5 rounded-sm text-xs ${
                isBot ? 'bg-white border border-[#E0E0E0] text-[#161616]' : 'bg-[#0F62FE] text-white'
              }`}>
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <p className={`text-[8px] mt-1 text-right ${isBot ? 'text-[#8D8D8D]' : 'text-blue-200'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          );
        })}

        {sending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 max-w-[85%]">
            <div className="w-7 h-7 rounded-full bg-[#0F62FE] flex items-center justify-center flex-shrink-0">
              <Cpu className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="p-2.5 rounded-sm bg-white border border-[#E0E0E0]">
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-[#8D8D8D] rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-[#8D8D8D] rounded-full animate-bounce delay-75" />
                <span className="w-1 h-1 bg-[#8D8D8D] rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-[#E0E0E0]">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask questions..."
            className="flex-1 border border-[#E0E0E0] rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#0F62FE] bg-[#F4F4F4] focus:bg-white transition-colors"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="px-3 py-2 bg-[#0F62FE] text-white rounded-sm hover:bg-[#0353E9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </Card>
  );
};

export default ChatWidget;
