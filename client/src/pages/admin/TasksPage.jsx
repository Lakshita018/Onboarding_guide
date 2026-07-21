import React, { useEffect, useState } from 'react';
import { Plus, X, ClipboardList, Calendar, User } from 'lucide-react';
import api from '../../api/axios';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const EMPTY_FORM = { employee_id: '', title: '', description: '', priority: 'medium', deadline: '' };

const AdminTasksPage = () => {
  const [tasks, setTasks]         = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [error, setError]         = useState('');

  const fetchAll = async () => {
    try {
      const [tasksRes, empRes] = await Promise.all([
        api.get('/admin/tasks'),
        api.get('/admin/employees'),
      ]);
      setTasks(tasksRes.data.tasks || []);
      setEmployees(empRes.data.employees || []);
    } catch (e) {
      console.error('Failed to fetch tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee_id || !form.title) { setError('Employee and title are required.'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/admin/tasks', {
        employee_id: form.employee_id,
        title:       form.title,
        description: form.description,
        priority:    form.priority,
        deadline:    form.deadline || null,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchAll();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to assign task.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="table-row" lines={5} />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#161616]">Task Manager</h1>
          <p className="text-sm text-[#525252] mt-1">Assign and monitor onboarding tasks across all employees.</p>
        </div>
        <Button onClick={() => { setShowForm(true); setError(''); }} icon={Plus} className="text-xs uppercase tracking-wider">
          Assign Task
        </Button>
      </div>

      {/* Task creation form */}
      {showForm && (
        <Card title="Assign New Task">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-xs text-[#DA1E28] bg-[#FFF1F1] border border-[#DA1E28] rounded-sm px-3 py-2">{error}</p>}

            <div>
              <label className="block text-xs font-semibold text-[#525252] mb-1">Assign To Employee *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D8D8D]" />
                <select name="employee_id" value={form.employee_id} onChange={handleChange} required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E0E0E0] rounded-sm focus:outline-none focus:border-[#0F62FE] bg-white">
                  <option value="">Select employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.User?.name} — {emp.User?.email}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#525252] mb-1">Task Title *</label>
              <div className="relative">
                <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D8D8D]" />
                <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Complete W3ID Security Sync"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E0E0E0] rounded-sm focus:outline-none focus:border-[#0F62FE]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#525252] mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                placeholder="What does the employee need to do?"
                className="w-full border border-[#E0E0E0] rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#0F62FE] resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#525252] mb-1">Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange}
                  className="w-full border border-[#E0E0E0] bg-white rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#0F62FE]">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#525252] mb-1">Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D8D8D]" />
                  <input type="date" name="deadline" value={form.deadline} onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E0E0E0] rounded-sm focus:outline-none focus:border-[#0F62FE]" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                className="px-4 py-2 text-xs border border-[#E0E0E0] rounded-sm hover:bg-[#F4F4F4] transition-colors cursor-pointer flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <Button type="submit" loading={saving} disabled={saving} className="text-xs uppercase tracking-wider">
                Assign Task
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tasks table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F4F4] border-b border-[#E0E0E0] text-xs font-semibold text-[#525252] uppercase tracking-wide">
                <th className="px-6 py-3">Task</th>
                <th className="px-6 py-3">Assigned To</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-[#F4F4F4] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-[#161616]">{task.title}</p>
                    <p className="text-xs text-[#8D8D8D] mt-0.5 line-clamp-1">{task.description || '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#161616]">{task.Employee?.User?.name || '—'}</p>
                    <p className="text-xs text-[#8D8D8D]">{task.Employee?.User?.email || ''}</p>
                  </td>
                  <td className="px-6 py-4"><Badge variant={task.priority || 'medium'} /></td>
                  <td className="px-6 py-4"><Badge variant={task.status} /></td>
                  <td className="px-6 py-4 text-sm text-[#525252]">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-sm text-[#8D8D8D]">No tasks assigned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminTasksPage;
