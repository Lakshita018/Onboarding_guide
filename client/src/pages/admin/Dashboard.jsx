import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, CheckSquare, Key, TrendingUp } from 'lucide-react';
import api from '../../api/axios';
import Card from '../../common/Card';
import LoadingSkeleton from '../../common/LoadingSkeleton';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.stats);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSkeleton variant="dashboard" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">Admin Dashboard</h1>
        <p className="text-sm text-[#525252] mt-1">Overview of company-wide onboarding progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: stats.totalEmployees, icon: Users, color: 'text-[#0F62FE]', bg: 'bg-[#EDF4FF]' },
          { label: 'Pending Documents', value: stats.pendingDocuments, icon: FileText, color: 'text-[#8A6914]', bg: 'bg-[#FFF8E1]' },
          { label: 'Pending Access', value: stats.pendingAccess, icon: Key, color: 'text-[#A2191F]', bg: 'bg-[#FFF1F1]' },
          { label: 'Pending Tasks', value: stats.pendingTasks, icon: CheckSquare, color: 'text-[#198038]', bg: 'bg-[#DEFBE6]' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-[#8D8D8D] uppercase tracking-wide mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#161616]">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-sm ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Onboarding Funnel">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#525252]">Completed</span>
                <span className="font-semibold text-[#161616]">{stats.completed}</span>
              </div>
              <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                <div className="bg-[#24A148] h-2 rounded-full" style={{ width: `${(stats.completed / stats.totalEmployees) * 100 || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#525252]">In Progress</span>
                <span className="font-semibold text-[#161616]">{stats.inProgress}</span>
              </div>
              <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                <div className="bg-[#0F62FE] h-2 rounded-full" style={{ width: `${(stats.inProgress / stats.totalEmployees) * 100 || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#525252]">Not Started</span>
                <span className="font-semibold text-[#161616]">{stats.notStarted}</span>
              </div>
              <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                <div className="bg-[#8D8D8D] h-2 rounded-full" style={{ width: `${(stats.notStarted / stats.totalEmployees) * 100 || 0}%` }} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
