import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Card from '../../components/common/Card';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import AdminStats from '../../components/admin/AdminStats';

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

  if (loading) return <LoadingSkeleton variant="dashboard" className="h-[400px]" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">Admin Dashboard</h1>
        <p className="text-sm text-[#525252] mt-1">Overview of company-wide onboarding progress.</p>
      </div>

      {/* Modular Admin Stats Cards Grid */}
      <AdminStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Onboarding Funnel">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#525252]">Completed</span>
                <span className="font-semibold text-[#161616]">{stats?.completed ?? 0}</span>
              </div>
              <div className="w-full bg-[#E0E0E0] rounded-full h-1.5">
                <div 
                  className="bg-[#24A148] h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${(stats?.completed / stats?.totalEmployees) * 100 || 0}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#525252]">In Progress</span>
                <span className="font-semibold text-[#161616]">{stats?.inProgress ?? 0}</span>
              </div>
              <div className="w-full bg-[#E0E0E0] rounded-full h-1.5">
                <div 
                  className="bg-[#0F62FE] h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${(stats?.inProgress / stats?.totalEmployees) * 100 || 0}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#525252]">Not Started</span>
                <span className="font-semibold text-[#161616]">{stats?.notStarted ?? 0}</span>
              </div>
              <div className="w-full bg-[#E0E0E0] rounded-full h-1.5">
                <div 
                  className="bg-[#8D8D8D] h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${(stats?.notStarted / stats?.totalEmployees) * 100 || 0}%` }} 
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
