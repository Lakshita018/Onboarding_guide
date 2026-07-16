import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, ArrowUpDown } from 'lucide-react';
import Badge from '../common/Badge';

const EmployeeTable = ({ employees = [], onRefresh }) => {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortField(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  const filtered = employees.filter((emp) => {
    const name = emp.User?.name || '';
    const email = emp.User?.email || '';
    const dept = emp.department || '';
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || 
                        email.toLowerCase().includes(search.toLowerCase()) ||
                        dept.toLowerCase().includes(search.toLowerCase());
    
    const matchStage = stageFilter ? emp.onboarding_stage === stageFilter : true;
    
    return matchSearch && matchStage;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = '', valB = '';
    if (sortField === 'name') {
      valA = a.User?.name || '';
      valB = b.User?.name || '';
    } else if (sortField === 'department') {
      valA = a.department || '';
      valB = b.department || '';
    } else if (sortField === 'stage') {
      valA = a.onboarding_stage || '';
      valB = b.onboarding_stage || '';
    }
    
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Table controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D8D8D]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee, email, dept..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#E0E0E0] rounded-sm focus:outline-none focus:border-[#0F62FE] bg-[#F4F4F4] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="border border-[#E0E0E0] rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#0F62FE] bg-white w-full sm:w-44 cursor-pointer"
          >
            <option value="">All Stages</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E0E0E0] rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F4F4] border-b border-[#E0E0E0] text-[10px] font-bold text-[#525252] uppercase tracking-wider select-none">
                <th className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1.5">
                    Employee <ArrowUpDown className="w-3 h-3 text-[#8D8D8D]" />
                  </div>
                </th>
                <th className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('department')}>
                  <div className="flex items-center gap-1.5">
                    Department <ArrowUpDown className="w-3 h-3 text-[#8D8D8D]" />
                  </div>
                </th>
                <th className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('stage')}>
                  <div className="flex items-center gap-1.5">
                    Stage <ArrowUpDown className="w-3 h-3 text-[#8D8D8D]" />
                  </div>
                </th>
                <th className="px-6 py-3.5">Offer Status</th>
                <th className="px-6 py-3.5">Joining Date</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0] text-xs">
              {sorted.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#F4F4F4] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-[#161616]">{emp.User?.name}</p>
                    <p className="text-[10px] text-[#8D8D8D] mt-0.5">{emp.User?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#161616]">{emp.department || '-'}</p>
                    <p className="text-[10px] text-[#8D8D8D] mt-0.5">{emp.designation || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={emp.onboarding_stage || 'not_started'} />
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={emp.offer_accepted ? 'approved' : 'pending'} label={emp.offer_accepted ? 'Accepted' : 'Pending'} />
                  </td>
                  <td className="px-6 py-4 text-[#525252]">
                    {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : 'Immediate'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/admin/employees/${emp.id}`}>
                      <button className="p-1.5 bg-[#EDF4FF] hover:bg-blue-100 text-[#0F62FE] border-0 rounded-sm cursor-pointer transition-colors inline-flex items-center justify-center">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-[#8D8D8D]">
                    No employees matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTable;
