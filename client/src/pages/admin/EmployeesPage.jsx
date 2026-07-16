import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmployeeTable from '../../components/admin/EmployeeTable';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (loading) return <LoadingSkeleton variant="dashboard" className="h-[400px]" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">Employees</h1>
        <p className="text-sm text-[#525252] mt-1">
          中央管理: Review and configure active corporate candidate cohorts.
        </p>
      </div>

      <EmployeeTable employees={employees} onRefresh={fetchEmployees} />
    </div>
  );
};

export default EmployeesPage;
