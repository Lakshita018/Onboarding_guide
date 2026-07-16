import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Cpu, User } from 'lucide-react';
import api from '../../api/axios';
import Card from '../../common/Card';
import LoadingSkeleton from '../../common/LoadingSkeleton';

const ChatPage = () => {
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

    setMessages(prev => [...prev, userMessage]);
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
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="card" className="h-[600px]" />;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-[#161616]">AI Assistant</h1>
        <p className="text-sm text-[#525252] mt-1">
          Powered by IBM watsonx to help you with your onboarding.
        </p>
      </div>

      <Card noPadding className="flex-1 flex flex-col overflow-hidden bg-[#F4F4F4]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !sending && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 bg-[#EDF4FF] rounded-full flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6 text-[#0F62FE]" />
              </div>
              <h3 className="text-sm font-semibold text-[#161616]">IBM Onboarding Assistant</h3>
              <p className="text-xs text-[#8D8D8D] mt-2 max-w-sm">
                I can help you with tasks, document requirements, IT setup, and general IBM onboarding questions.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[85%] ${isBot ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isBot ? 'bg-[#0F62FE] text-white' : 'bg-[#393939] text-white'
                }`}>
                  {isBot ? <Cpu className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-sm text-sm ${
                  isBot ? 'bg-white border border-[#E0E0E0] text-[#161616]' : 'bg-[#0F62FE] text-white'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-[9px] mt-1.5 text-right ${isBot ? 'text-[#8D8D8D]' : 'text-blue-200'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            );
          })}
          
          {sending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-[#0F62FE] flex items-center justify-center flex-shrink-0">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <div className="p-3 rounded-sm bg-white border border-[#E0E0E0]">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#8D8D8D] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#8D8D8D] rounded-full animate-bounce delay-75" />
                  <span className="w-1.5 h-1.5 bg-[#8D8D8D] rounded-full animate-bounce delay-150" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-[#E0E0E0]">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your onboarding..."
              className="flex-1 border border-[#E0E0E0] rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#0F62FE] bg-[#F4F4F4] focus:bg-white transition-colors"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="px-4 py-2 bg-[#0F62FE] text-white rounded-sm hover:bg-[#0353E9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;
