import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Card from '../../common/Card';
import Badge from '../../common/Badge';
import LoadingSkeleton from '../../common/LoadingSkeleton';

const AdminTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/admin/tasks');
        setTasks(res.data.tasks || []);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) return <LoadingSkeleton variant="table-row" lines={5} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">Task Manager</h1>
        <p className="text-sm text-[#525252] mt-1">Monitor assigned tasks across all employees.</p>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F4F4] border-b border-[#E0E0E0] text-xs font-semibold text-[#525252] uppercase tracking-wide">
                <th className="px-6 py-3">Task Title</th>
                <th className="px-6 py-3">Assigned To</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-[#F4F4F4] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-[#161616]">{task.title}</p>
                    <p className="text-xs text-[#8D8D8D] mt-0.5 line-clamp-1">{task.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#161616]">{task.Employee?.User?.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={task.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-[#525252]">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-sm text-[#525252]">
                    No tasks assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminTasksPage;
