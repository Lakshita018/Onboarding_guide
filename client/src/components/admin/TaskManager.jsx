import React, { useState } from 'react';
import { ClipboardList, Calendar } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const TaskManager = ({ employeeId, onAssignTask, loading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    onAssignTask?.({
      employee_id: employeeId,
      title,
      description,
      priority,
      deadline: deadline || null,
    });
    // Reset form fields
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDeadline('');
  };

  return (
    <Card title="Assign Compliance Task" subtitle="Create and dispatch onboarding checklist requirements to the candidate.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#525252] mb-1">Task Title</label>
          <div className="relative">
            <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D8D8D]" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete W3ID Security Sync"
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E0E0E0] rounded-sm focus:outline-none focus:border-[#0F62FE]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#525252] mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what the candidate needs to complete..."
            className="w-full border border-[#E0E0E0] rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#0F62FE] h-20 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#525252] mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border border-[#E0E0E0] bg-white rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#0F62FE]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#525252] mb-1">Deadline Date</label>
            <div className="relative">
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full border border-[#E0E0E0] rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#0F62FE] select-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={loading || !title}
            loading={loading}
            className="text-xs uppercase tracking-wider bg-[#0F62FE] hover:bg-[#0353E9] text-white py-2 px-4 rounded-sm"
          >
            Assign Task
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TaskManager;
