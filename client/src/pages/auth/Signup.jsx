import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../common/Button';
import Card from '../../common/Card';
import { UserPlus, User, Mail, Lock, ArrowRight } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const result = await signup(name, email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background gradients for premium aesthetic */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0F62FE]/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-slate-900 border border-slate-800 text-white rounded-none shadow-2xl relative">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-600/15 rounded-full border border-blue-500/30 text-[#0F62FE]">
              <UserPlus className="w-8 h-8" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-slate-100 tracking-tight">IBM OnboardAI</h2>
          <p className="text-sm text-slate-400 text-center mt-1 mb-8">Create employee registration profile</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-950/40 border border-red-500/30 text-red-400 text-xs p-3 rounded-sm flex items-start gap-2"
                >
                  <span className="font-semibold">Error:</span> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 text-white text-sm outline-none transition duration-150 focus:border-[#0F62FE] focus:ring-1 focus:ring-[#0F62FE]"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 text-white text-sm outline-none transition duration-150 focus:border-[#0F62FE] focus:ring-1 focus:ring-[#0F62FE]"
                  placeholder="jane.doe@ibm.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-950/50 border border-slate-800 text-white text-sm outline-none transition duration-150 focus:border-[#0F62FE] focus:ring-1 focus:ring-[#0F62FE]"
                  placeholder="••••••••"
                />
              </div>
              <div className="text-[10px] text-slate-500 pl-1">
                Password must contain at least 6 characters.
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full py-3 bg-[#0F62FE] hover:bg-[#0b4ed2] border-0 text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition duration-200"
                disabled={loading}
              >
                {loading ? 'Creating Profile...' : 'Register Profile'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>

            <div className="text-center text-xs text-slate-500 border-t border-slate-800/80 pt-4 mt-2">
              Documents are securely stored and accessible only to authorized users.
            </div>
            
            <div className="text-center text-xs text-slate-400 mt-2">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-[#0F62FE] font-medium hover:underline focus:outline-none"
              >
                Log In
              </button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
