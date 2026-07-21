import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, FileText, ClipboardList } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmployeeDetailsCard from '../../components/admin/EmployeeDetailsCard';
import DocumentReview from '../../components/admin/DocumentReview';
import EmployeeAssignment from '../../components/admin/EmployeeAssignment';
import TaskManager from '../../components/admin/TaskManager';

const EmployeeDetails = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingAssign, setSavingAssign] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [updatingDoc, setUpdatingDoc] = useState(false);

  const fetchEmployeeDetails = async () => {
    try {
      const res = await api.get(`/admin/employees/${id}`);
      setEmployee(res.data.employee);
    } catch (error) {
      console.error('Failed to fetch employee details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const handleAssign = async (assignData) => {
    setSavingAssign(true);
    try {
      await api.patch(`/admin/employees/${id}/assign`, assignData);
      setEmployee((prev) => ({
        ...prev,
        ...assignData,
      }));
    } catch (error) {
      console.error('Failed to save assignments:', error);
    } finally {
      setSavingAssign(false);
    }
  };

  const handleAssignTask = async (taskData) => {
    setSavingTask(true);
    try {
      await api.post('/admin/tasks', taskData);
      // Refetch details to display new task in listing
      fetchEmployeeDetails();
    } catch (error) {
      console.error('Failed to assign task:', error);
    } finally {
      setSavingTask(false);
    }
  };

  const handleVerifyDocument = async (docId, newStatus) => {
    setUpdatingDoc(true);
    try {
      await api.patch(`/admin/documents/${docId}/verify`, { status: newStatus });
      fetchEmployeeDetails();
    } catch (error) {
      console.error('Failed to verify document:', error);
    } finally {
      setUpdatingDoc(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="dashboard" className="h-[400px]" />;

  if (!employee) {
    return (
      <div className="space-y-4">
        <Link to="/admin/employees" className="text-xs text-[#0F62FE] hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Employees list
        </Link>
        <Card>
          <p className="text-sm text-[#8D8D8D] text-center py-6">Employee details not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header breadcrumbs navigation */}
      <div className="flex items-center gap-3">
        <Link to="/admin/employees">
          <button className="p-1.5 hover:bg-slate-200 bg-white border border-[#E0E0E0] rounded-sm transition-colors cursor-pointer inline-flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-[#525252]" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#161616] flex items-center gap-2">
            {employee.User?.name}
            <Badge variant={employee.onboarding_stage} />
          </h1>
          <p className="text-xs text-[#8D8D8D] mt-0.5">{employee.User?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side details and document review */}
        <div className="lg:col-span-2 space-y-6">
          <EmployeeDetailsCard employee={employee} />

          <DocumentReview
            documents={employee.Documents || []}
            onVerify={handleVerifyDocument}
            loading={updatingDoc}
          />

          {/* Assigned checklist/tasks listing */}
          <Card title="Onboarding Tasks History" subtitle="Manual and checklist items tracked for this employee.">
            {(employee.Tasks || []).length === 0 ? (
              <p className="text-xs text-[#8D8D8D] text-center py-4">No tasks assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {(employee.Tasks || []).map((task) => (
                  <div key={task.id} className="p-3 border border-[#E0E0E0] rounded-sm bg-white flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#161616]">{task.title}</h4>
                      <p className="text-[10px] text-[#8D8D8D] mt-0.5">{task.description || 'No description provided'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={task.status} />
                      {task.deadline && (
                        <span className="text-[9px] text-[#8D8D8D]">
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right side assignment configurations */}
        <div className="space-y-6">
          <EmployeeAssignment
            employee={employee}
            onAssign={handleAssign}
            loading={savingAssign}
          />

          <TaskManager
            employeeId={employee.id}
            onAssignTask={handleAssignTask}
            loading={savingTask}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
