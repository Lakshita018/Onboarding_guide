import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CheckSquare, FileText, Key, MessageSquare,
  ArrowRight, Cpu, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../api/axios';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import TeamInfo from '../../components/employee/TeamInfo';
import NextRecommendedTask from '../../components/employee/NextRecommendedTask';
import Checklist from '../../components/employee/Checklist';

const StatCard = ({ icon: Icon, label, value, color, to, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <Link to={to}>
      <div className="bg-white border border-[#E0E0E0] rounded-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-medium text-[#8D8D8D] uppercase tracking-wide mb-2">{label}</p>
            <p className="text-xl font-bold text-[#161616]">{value}</p>
          </div>
          <div className={`p-2 rounded-sm ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[9px] font-medium text-[#0F62FE] opacity-0 group-hover:opacity-100 transition-opacity">
          View details <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  </motion.div>
);

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [profile, setProfile] = useState(null);
  const [checklist, setChecklist] = useState({ checklist: [], progress: { percentage: 0, completed: 0, total: 0 } });
  const [documents, setDocuments] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshingRec, setRefreshingRec] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchData = async () => {
    try {
      const [profileRes, checklistRes, docsRes, recRes] = await Promise.all([
        api.get('/employee/profile'),
        api.get('/employee/checklist'),
        api.get('/employee/documents'),
        api.get('/employee/recommendations'),
      ]);
      setProfile(profileRes.data.profile);
      setChecklist(checklistRes.data);
      setDocuments(docsRes.data.documents || []);
      setRecommendation(recRes.data.recommendations?.recommendedTasks?.[0] || null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshRecommendation = async () => {
    setRefreshingRec(true);
    try {
      const res = await api.get('/employee/recommendations');
      setRecommendation(res.data.recommendations?.recommendedTasks?.[0] || null);
    } catch (err) {
      console.error('Failed to refresh recommendation:', err);
    } finally {
      setRefreshingRec(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;
    socket.on('employeeUpdated', (data) => {
      setNotification(data.message);
      fetchData();
      setTimeout(() => setNotification(null), 5000);
    });
    return () => socket.off('employeeUpdated');
  }, [socket]);

  const handleChecklistToggle = async (id, currentStatus) => {
    try {
      await api.patch(`/employee/checklist/${id}`, { completed: !currentStatus });
      // Refetch data to update checklist preview and progress bar
      const checklistRes = await api.get('/employee/checklist');
      setChecklist(checklistRes.data);
      handleRefreshRecommendation();
    } catch (error) {
      console.error('Failed to update checklist item:', error);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const pendingDocs = documents.filter(d => d.verification_status === 'pending').length;
  const verifiedDocs = documents.filter(d => d.verification_status === 'verified').length;

  if (loading) return <LoadingSkeleton variant="dashboard" />;

  return (
    <div className="space-y-6">
      {/* Real-time notification banner */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-[#EDF4FF] border border-[#0F62FE] rounded-sm px-4 py-3 flex items-center gap-3"
        >
          <Cpu className="w-4 h-4 text-[#0F62FE] flex-shrink-0" />
          <p className="text-sm text-[#0043CE] font-medium">{notification}</p>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-[#161616]">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-[#525252] mt-1">
            {profile?.designation && profile?.department
              ? `${profile.designation} · ${profile.department}`
              : 'Your onboarding journey starts here.'}
          </p>
        </div>
        <Badge variant={profile?.onboarding_stage || 'not_started'} dot />
      </motion.div>

      {/* Progress Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-[#0F62FE] to-[#0043CE] rounded-sm p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold opacity-80 uppercase tracking-wide mb-1">Onboarding Progress</p>
            <p className="text-2xl font-bold">{checklist.progress.percentage}% Complete</p>
            <p className="text-sm opacity-75 mt-1">
              {checklist.progress.completed} of {checklist.progress.total} tasks completed
            </p>
          </div>
          <TrendingUp className="w-10 h-10 opacity-30" />
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <motion.div
            className="bg-white rounded-full h-2"
            initial={{ width: 0 }}
            animate={{ width: `${checklist.progress.percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckSquare} label="Checklist" value={`${checklist.progress.completed}/${checklist.progress.total}`} color="bg-[#EDF4FF] text-[#0F62FE]" to="/checklist" delay={0.1} />
        <StatCard icon={FileText} label="Documents" value={`${verifiedDocs}/${documents.length}`} color="bg-[#DEFBE6] text-[#198038]" to="/documents" delay={0.15} />
        <StatCard icon={Key} label="Access Requests" value={documents.length > 0 ? '→' : '0'} color="bg-[#FFF8E1] text-[#8A6914]" to="/access" delay={0.2} />
        <StatCard icon={MessageSquare} label="AI Assistant" value="Chat" color="bg-[#F4F4F4] text-[#525252]" to="/chat" delay={0.25} />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checklist preview */}
        <div className="lg:col-span-2">
          <Card
            title="Onboarding Checklist"
            subtitle="Your pending onboarding tasks"
            headerActions={
              <Link to="/checklist" className="text-xs text-[#0F62FE] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            }
          >
            <Checklist tasks={checklist.checklist.slice(0, 5)} onToggle={handleChecklistToggle} />
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-4">
          {/* Offer Status */}
          <Card title="Offer Status" accent={!profile?.offer_accepted}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                profile?.offer_accepted ? 'bg-[#DEFBE6]' : 'bg-[#FFF8E1]'
              }`}>
                {profile?.offer_accepted ? (
                  <span className="text-[#198038] text-lg font-bold">✓</span>
                ) : (
                  <TrendingUp className="w-5 h-5 text-[#8A6914] rotate-90" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[#161616]">
                  {profile?.offer_accepted ? 'Offer Accepted' : 'Offer Pending'}
                </p>
                <p className="text-xs text-[#8D8D8D]">
                  {profile?.offer_accepted ? "You're all set!" : 'Review and accept your offer'}
                </p>
              </div>
            </div>
            {!profile?.offer_accepted && (
              <Link to="/documents">
                <button className="mt-4 w-full py-2 text-xs font-medium bg-[#0F62FE] text-white rounded-sm hover:bg-[#0353E9] transition-colors">
                  View Offer Letter
                </button>
              </Link>
            )}
          </Card>

          {/* Next Recommended Task Card */}
          <NextRecommendedTask
            recommendation={recommendation}
            onRefresh={handleRefreshRecommendation}
            loading={refreshingRec}
          />

          {/* Team Structure Info Card */}
          <TeamInfo profile={profile} />

          {/* Security Note */}
          <div className="bg-[#F4F4F4] border border-[#E0E0E0] rounded-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-3.5 h-3.5 text-[#525252]" />
              <p className="text-xs font-semibold text-[#525252]">Security Notice</p>
            </div>
            <p className="text-xs text-[#8D8D8D] leading-relaxed">
              Documents are securely stored and accessible only to authorized users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
