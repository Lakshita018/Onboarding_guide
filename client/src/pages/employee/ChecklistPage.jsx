import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Checklist from '../../components/employee/Checklist';

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Task Listing">
            <Checklist tasks={data.checklist} onToggle={handleToggle} />
          </Card>
        </div>

        <div>
          <Card title="Overall Progress">
            <ProgressBar
              value={data.progress.completed}
              max={data.progress.total}
              label={`${data.progress.completed} of ${data.progress.total} tasks completed`}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChecklistPage;
