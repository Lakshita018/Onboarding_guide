import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../common/Button';
import { ShieldCheck, Mail, Lock, ArrowRight, Compass, Sparkles, Zap } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#0B0F19] text-white font-sans overflow-hidden">
      {/* Left side: Premium IBM Branding Graphic */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#020512] via-[#051138] to-[#0A258C] relative p-16 flex-col justify-between overflow-hidden border-r border-slate-900">
        {/* Animated glowing mesh balls */}
        <motion.div 
          animate={{ y: [0, -25, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-16 right-0 w-80 h-80 bg-[#0F62FE]/20 rounded-full blur-[110px]" 
        />

        {/* Header Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="p-2 bg-blue-600/15 rounded-lg border border-blue-500/20 text-[#0F62FE]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="font-bold text-lg tracking-wider text-slate-100 uppercase">IBM Onboarding</span>
        </div>

        {/* Welcome Text Section */}
        <div className="space-y-6 max-w-md my-auto z-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent"
          >
            Empowering Your Transitions at IBM
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-slate-400 text-sm leading-relaxed"
          >
            Welcome to the enterprise cognitive onboarding cockpit. Get direct access to system setups, compliance documents, and Granite-powered support checklists.
          </motion.p>

          {/* Feature points */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <span className="p-1 bg-slate-800 rounded-md text-blue-400"><Compass className="w-4 h-4" /></span>
              <span className="text-xs font-semibold text-slate-300">Intelligent transition pathways</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="p-1 bg-slate-800 rounded-md text-blue-400"><Sparkles className="w-4 h-4" /></span>
              <span className="text-xs font-semibold text-slate-300">Granite LLM recommendations</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="p-1 bg-slate-800 rounded-md text-blue-400"><Zap className="w-4 h-4" /></span>
              <span className="text-xs font-semibold text-slate-300">Real-time status synchronization</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 z-10">
          © 2026 International Business Machines Corporation. All rights reserved.
        </div>
      </div>

      {/* Right side: Modern Form Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-[#070A13]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Header Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-6">
            <ShieldCheck className="w-8 h-8 text-[#0F62FE]" />
            <span className="font-extrabold text-xl tracking-wider uppercase">IBM Onboarding</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Access Control</h2>
            <p className="text-xs text-slate-400">Log in to open your private dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-md"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0E1326] border border-slate-800 text-white text-xs pl-10 pr-3 py-3 rounded-md outline-none transition focus:border-[#0F62FE] focus:ring-1 focus:ring-[#0F62FE]"
                  placeholder="jane.doe@ibm.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0E1326] border border-slate-800 text-white text-xs pl-10 pr-3 py-3 rounded-md outline-none transition focus:border-[#0F62FE] focus:ring-1 focus:ring-[#0F62FE]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full py-3 bg-[#0F62FE] hover:bg-[#0b4ed2] border-0 text-white text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition duration-200 rounded-md"
                disabled={loading}
              >
                {loading ? 'Authorizing...' : 'Log In'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>

            <div className="text-center text-[10px] text-slate-500 border-t border-slate-900 pt-5 mt-4">
              Authorized employees only. Access requests logged for security audit.
            </div>

            <div className="text-center text-xs text-slate-400">
              Not registered?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-[#0F62FE] font-medium hover:underline focus:outline-none"
              >
                Register profile
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
