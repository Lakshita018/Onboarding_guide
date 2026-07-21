import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Checklist from '../../components/employee/Checklist';
import { useSocket } from '../../context/SocketContext';

const STATUS_CYCLE = { pending: 'in_progress', in_progress: 'completed', completed: 'pending' };
const STATUS_LABEL = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' };
const STATUS_COLOR = {
  pending:     'bg-[#F4F4F4] text-[#525252] border border-[#E0E0E0]',
  in_progress: 'bg-[#EDF5FF] text-[#0F62FE] border border-[#D0E2FF]',
  completed:   'bg-[#DEFBE6] text-[#198038] border border-[#A7F0BA]',
};

const ChecklistPage = () => {
  const [checklistData, setChecklistData] = useState({
    checklist: [],
    progress: { percentage: 0, completed: 0, total: 0 },
  });
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const socket = useSocket();

  const fetchAll = async () => {
    try {
      const [clRes, taskRes] = await Promise.all([
        api.get('/employee/checklist'),
        api.get('/employee/tasks'),
      ]);
      setChecklistData(clRes.data);
      setTasks(taskRes.data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch checklist/tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Listen for real-time task assignment from admin
  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      if (payload.type === 'task_assigned') {
        setTasks((prev) => [payload.data, ...prev]);
      }
    };
    socket.on('employeeUpdated', handler);
    return () => socket.off('employeeUpdated', handler);
  }, [socket]);

  const handleChecklistToggle = async (id, currentStatus) => {
    try {
      await api.patch(`/employee/checklist/${id}`, { completed: !currentStatus });
      fetchAll();
    } catch (error) {
      console.error('Failed to update checklist item:', error);
    }
  };

  const handleTaskStatusCycle = async (taskId, currentStatus) => {
    const nextStatus = STATUS_CYCLE[currentStatus] || 'pending';
    setUpdatingId(taskId);
    try {
      const res = await api.patch(`/employee/tasks/${taskId}/status`, { status: nextStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: res.data.task?.status || nextStatus } : t))
      );
    } catch (error) {
      console.error('Failed to update task status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const taskProgress = tasks.length
    ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)
    : 0;

  if (loading) return <LoadingSkeleton variant="dashboard" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">Onboarding Checklist &amp; Tasks</h1>
        <p className="text-sm text-[#525252] mt-1">
          Track your onboarding checklist items and admin-assigned tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Onboarding Checklist">
            <Checklist tasks={checklistData.checklist} onToggle={handleChecklistToggle} />
          </Card>

          {/* Admin-assigned tasks */}
          <Card
            title="Assigned Tasks"
            subtitle="Tasks assigned by your onboarding admin. Click status badge to update."
          >
            {tasks.length === 0 ? (
              <p className="text-xs text-[#8D8D8D] text-center py-6">No tasks assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 border border-[#E0E0E0] rounded-sm bg-white flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#161616]">{task.title}</h4>
                      {task.description && (
                        <p className="text-[11px] text-[#525252] mt-0.5">{task.description}</p>
                      )}
                      {task.deadline && (
                        <p className="text-[10px] text-[#8D8D8D] mt-1">
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleTaskStatusCycle(task.id, task.status)}
                      disabled={updatingId === task.id}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 transition-opacity ${
                        STATUS_COLOR[task.status] || STATUS_COLOR.pending
                      } ${updatingId === task.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
                    >
                      {STATUS_LABEL[task.status] || task.status}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Progress sidebar */}
        <div className="space-y-4">
          <Card title="Checklist Progress">
            <ProgressBar
              value={checklistData.progress.completed}
              max={checklistData.progress.total}
              label={`${checklistData.progress.completed} of ${checklistData.progress.total} items done`}
            />
          </Card>

          <Card title="Task Progress">
            <ProgressBar
              value={tasks.filter((t) => t.status === 'completed').length}
              max={tasks.length || 1}
              label={`${tasks.filter((t) => t.status === 'completed').length} of ${tasks.length} tasks completed`}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChecklistPage;
