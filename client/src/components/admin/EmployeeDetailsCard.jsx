import React from 'react';
import { Mail, Calendar, Briefcase, Landmark, Terminal } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

const EmployeeDetailsCard = ({ employee }) => {
  return (
    <Card 
      title="Profile Details" 
      subtitle={`Registered on ${employee?.User?.created_at ? new Date(employee.User.created_at).toLocaleDateString() : '-'}`}
    >
      <div className="space-y-4">
        {/* Basic fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2.5 text-xs text-[#525252]">
            <Briefcase className="w-4 h-4 text-[#8D8D8D]" />
            <div>
              <p className="font-bold text-[9px] uppercase tracking-wider text-[#8D8D8D]">Designation</p>
              <p className="font-semibold text-[#161616] mt-0.5">{employee?.designation || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-[#525252]">
            <Landmark className="w-4 h-4 text-[#8D8D8D]" />
            <div>
              <p className="font-bold text-[9px] uppercase tracking-wider text-[#8D8D8D]">Department</p>
              <p className="font-semibold text-[#161616] mt-0.5">{employee?.department || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-[#525252]">
            <Mail className="w-4 h-4 text-[#8D8D8D]" />
            <div>
              <p className="font-bold text-[9px] uppercase tracking-wider text-[#8D8D8D]">Email address</p>
              <p className="font-semibold text-[#161616] mt-0.5">{employee?.User?.email || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-[#525252]">
            <Calendar className="w-4 h-4 text-[#8D8D8D]" />
            <div>
              <p className="font-bold text-[9px] uppercase tracking-wider text-[#8D8D8D]">Joining date</p>
              <p className="font-semibold text-[#161616] mt-0.5">
                {employee?.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'Immediate'}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic configurations */}
        <div className="pt-3 border-t border-[#F4F4F4] grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-bold text-[9px] uppercase tracking-wider text-[#8D8D8D] mb-1.5">Onboarding stage</p>
            <Badge variant={employee?.onboarding_stage || 'not_started'} />
          </div>
          <div>
            <p className="font-bold text-[9px] uppercase tracking-wider text-[#8D8D8D] mb-1.5">OS setup preference</p>
            {employee?.os_type ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#161616]">
                <Terminal className="w-3.5 h-3.5 text-[#0F62FE]" />
                <span className="capitalize">{employee.os_type}</span>
              </span>
            ) : (
              <span className="text-xs text-[#8D8D8D]">No preference selected yet</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeDetailsCard;
