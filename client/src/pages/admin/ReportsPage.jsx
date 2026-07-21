import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const AdminReportsPage = () => {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const empRes = await api.get('/admin/employees');
        const employees = empRes.data.employees || [];

        const detailed = await Promise.all(
          employees.map(emp => api.get(`/admin/employees/${emp.id}`).then(r => r.data.employee).catch(() => emp))
        );
        setRows(detailed);
      } catch (e) {
        console.error('Reports fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingSkeleton variant="dashboard" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">Onboarding Reports</h1>
        <p className="text-sm text-[#525252] mt-1">Per-employee onboarding compliance summary.</p>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4F4F4] border-b border-[#E0E0E0] text-[10px] font-bold text-[#525252] uppercase tracking-wider">
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3">Manager</th>
                <th className="px-5 py-3">Buddy</th>
                <th className="px-5 py-3">Documents</th>
                <th className="px-5 py-3">Tasks</th>
                <th className="px-5 py-3">Checklist</th>
                <th className="px-5 py-3">Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {rows.map(emp => {
                const docs      = emp.Documents || [];
                const tasks     = emp.Tasks || [];
                const checklist = emp.ChecklistItems || [];
                const verified  = docs.filter(d => d.verification_status === 'verified').length;
                const rejected  = docs.filter(d => d.verification_status === 'rejected').length;
                const pending   = docs.filter(d => d.verification_status === 'pending').length;
                const doneT     = tasks.filter(t => t.status === 'completed').length;
                const doneC     = checklist.filter(c => c.completed).length;
                const totalC    = checklist.length;
                const pct       = totalC ? Math.round((doneC / totalC) * 100) : 0;

                return (
                  <tr key={emp.id} className="hover:bg-[#F4F4F4] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#161616]">{emp.User?.name || '—'}</p>
                      <p className="text-[10px] text-[#8D8D8D]">{emp.User?.email || ''}</p>
                    </td>
                    <td className="px-5 py-3.5"><Badge variant={emp.onboarding_stage || 'not_started'} /></td>
                    <td className="px-5 py-3.5 text-[#525252]">{emp.manager || '—'}</td>
                    <td className="px-5 py-3.5 text-[#525252]">{emp.buddy || '—'}</td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <span className="text-[#198038] font-medium">{verified} approved</span>
                        {rejected > 0 && <span className="block text-[#DA1E28]">{rejected} rejected</span>}
                        {pending  > 0 && <span className="block text-[#8A6914]">{pending} pending</span>}
                        {docs.length === 0 && <span className="text-[#8D8D8D]">None uploaded</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {tasks.length === 0 ? <span className="text-[#8D8D8D]">—</span> : (
                        <span>{doneT}/{tasks.length} done</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {totalC === 0 ? <span className="text-[#8D8D8D]">—</span> : (
                        <span>{doneC}/{totalC} done</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#E0E0E0] rounded-full h-1.5">
                          <div className="bg-[#0F62FE] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-semibold text-[#161616]">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan="8" className="px-5 py-10 text-center text-[#8D8D8D]">No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminReportsPage;
