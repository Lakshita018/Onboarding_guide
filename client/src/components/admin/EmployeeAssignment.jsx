import React, { useState } from 'react';
import { User, ChevronDown } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const MANAGERS = ['Deepika Aman', 'Kanwaldeep Singh', 'Rachna'];
const BUDDIES  = ['Vikas Verma', 'Kanan Ganjoo', 'Ankit Sharma', 'Krishna Balga'];

const SelectField = ({ label, value, onChange, options, placeholder }) => (
  <div>
    <label className="block text-xs font-semibold text-[#525252] mb-1">{label}</label>
    <div className="relative">
      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D8D8D] pointer-events-none" />
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8D8D8D] pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-8 py-2 text-xs border border-[#E0E0E0] rounded-sm focus:outline-none focus:border-[#0F62FE] appearance-none bg-white"
        required
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  </div>
);

const EmployeeAssignment = ({ employee, onAssign, loading }) => {
  const [manager, setManager] = useState(employee?.manager || '');
  const [buddy, setBuddy]     = useState(employee?.buddy || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAssign?.({ manager, buddy });
  };

  const unchanged = manager === (employee?.manager || '') && buddy === (employee?.buddy || '');

  return (
    <Card title="Onboarding Assignments" subtitle="Assign manager and buddy contacts to guide the candidate.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <SelectField
          label="Assigned Manager"
          value={manager}
          onChange={setManager}
          options={MANAGERS}
          placeholder="Select a manager…"
        />

        <SelectField
          label="Onboarding Buddy"
          value={buddy}
          onChange={setBuddy}
          options={BUDDIES}
          placeholder="Select a buddy…"
        />

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={loading || unchanged || !manager || !buddy}
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
