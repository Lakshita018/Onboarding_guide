import React, { useState } from 'react';
import { User, ShieldAlert } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const EmployeeAssignment = ({ employee, onAssign, loading }) => {
  const [manager, setManager] = useState(employee?.manager || '');
  const [buddy, setBuddy] = useState(employee?.buddy || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAssign?.({ manager, buddy });
  };

  return (
    <Card title="Onboarding Assignments" subtitle="Assign manager and buddy contacts to guide the candidate.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#525252] mb-1">Assigned Manager</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D8D8D]" />
            <input
              type="text"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="e.g. John Smith"
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E0E0E0] rounded-sm focus:outline-none focus:border-[#0F62FE]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#525252] mb-1">Onboarding Buddy</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D8D8D]" />
            <input
              type="text"
              value={buddy}
              onChange={(e) => setBuddy(e.target.value)}
              placeholder="e.g. Alex Brown"
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E0E0E0] rounded-sm focus:outline-none focus:border-[#0F62FE]"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={loading || (manager === employee?.manager && buddy === employee?.buddy)}
            loading={loading}
            className="text-xs uppercase tracking-wider bg-[#0F62FE] hover:bg-[#0353E9] text-white py-2 px-4 rounded-sm"
          >
            Save Assignments
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EmployeeAssignment;
