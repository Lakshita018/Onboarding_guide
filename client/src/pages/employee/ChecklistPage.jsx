import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import Card from '../../common/Card';
import Badge from '../../common/Badge';
import ProgressBar from '../../common/ProgressBar';
import LoadingSkeleton from '../../common/LoadingSkeleton';

const ChecklistPage = () => {
  const [data, setData] = useState({ checklist: [], progress: { percentage: 0, completed: 0, total: 0 } });
  const [loading, setLoading] = useState(true);

  const fetchChecklist = async () => {
    try {
      const res = await api.get('/employee/checklist');
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklist();
  }, []);

  const handleToggle = async (id, currentStatus) => {
    try {
      await api.patch(`/employee/checklist/${id}`, { completed: !currentStatus });
      fetchChecklist();
    } catch (error) {
      console.error('Failed to update checklist item:', error);
    }
  };

  if (loading) return <LoadingSkeleton variant="dashboard" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">Onboarding Checklist</h1>
        <p className="text-sm text-[#525252] mt-1">
          Complete these tasks to finish your onboarding process.
        </p>
      </div>

      <Card>
        <div className="mb-6">
          <ProgressBar 
            value={data.progress.completed} 
            max={data.progress.total} 
            label="Overall Progress" 
            size="lg" 
          />
        </div>

        <div className="space-y-3">
          {data.checklist.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-4 p-4 rounded-sm border transition-colors ${
                item.completed ? 'bg-[#F4F4F4] border-[#E0E0E0]' : 'bg-white border-[#E0E0E0] hover:border-[#8D8D8D]'
              }`}
            >
              <button 
                onClick={() => handleToggle(item.id, item.completed)}
                className={`w-5 h-5 rounded-sm border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  item.completed ? 'bg-[#24A148] border-[#24A148]' : 'border-[#8D8D8D] hover:border-[#0F62FE]'
                }`}
              >
                {item.completed && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.completed ? 'text-[#8D8D8D] line-through' : 'text-[#161616]'}`}>
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-[#8D8D8D] mt-1">{item.description}</p>
                )}
              </div>
              
              <Badge variant={item.priority} />
            </motion.div>
          ))}
          
          {data.checklist.length === 0 && (
            <div className="text-center py-8 text-[#8D8D8D]">
              <p className="text-sm">No tasks assigned yet.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ChecklistPage;
