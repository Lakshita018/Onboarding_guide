import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../../api/axios';
import Card from '../../common/Card';
import Badge from '../../common/Badge';
import LoadingSkeleton from '../../common/LoadingSkeleton';

const AdminEmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/admin/employees');
        setEmployees(res.data.employees || []);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const filtered = employees.filter(e => 
    e.User?.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.User?.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSkeleton variant="dashboard" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#161616]">Employees</h1>
          <p className="text-sm text-[#525252] mt-1">Manage all onboarding employees.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-[#8D8D8D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm border border-[#E0E0E0] rounded-sm focus:outline-none focus:border-[#0F62FE]"
          />
        </div>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F4F4] border-b border-[#E0E0E0] text-xs font-semibold text-[#525252] uppercase tracking-wide">
                <th className="px-6 py-3">Employee Name</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Stage</th>
                <th className="px-6 py-3">Offer Status</th>
                <th className="px-6 py-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#F4F4F4] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-[#161616]">{emp.User?.name}</p>
                    <p className="text-xs text-[#8D8D8D] mt-0.5">{emp.User?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#161616]">{emp.department || '-'}</p>
                    <p className="text-xs text-[#8D8D8D]">{emp.designation || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={emp.onboarding_stage} />
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={emp.offer_accepted ? 'approved' : 'pending'} label={emp.offer_accepted ? 'Accepted' : 'Pending'} />
                  </td>
                  <td className="px-6 py-4 text-sm text-[#525252]">
                    {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-[#525252]">
                    No employees found matching your search.
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

export default AdminEmployeesPage;
