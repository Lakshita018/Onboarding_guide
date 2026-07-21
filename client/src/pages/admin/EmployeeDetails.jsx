import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmployeeDetailsCard from '../../components/admin/EmployeeDetailsCard';
import DocumentReview from '../../components/admin/DocumentReview';
import EmployeeAssignment from '../../components/admin/EmployeeAssignment';
import TaskManager from '../../components/admin/TaskManager';

const STATUS_COLOR = {
  pending:  'bg-[#FFF8E1] text-[#B45309] border border-[#FDE68A]',
  approved: 'bg-[#DEFBE6] text-[#198038] border border-[#A7F0BA]',
  rejected: 'bg-[#FFF1F1] text-[#DA1E28] border border-[#FFBDBD]',
};

const EmployeeDetails = () => {
  const { id } = useParams();
  const [employee, setEmployee]     = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [savingAssign, setSavingAssign] = useState(false);
  const [savingTask, setSavingTask]     = useState(false);
  const [updatingDoc, setUpdatingDoc]   = useState(false);

  const fetchEmployeeDetails = async () => {
    try {
      const [empRes, sigRes] = await Promise.all([
        api.get(`/admin/employees/${id}`),
        api.get(`/admin/employees/${id}/signatures`),
      ]);
      setEmployee(empRes.data.employee);
      setSignatures(sigRes.data.signatures || []);
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
      setEmployee((prev) => ({ ...prev, ...assignData }));
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
      fetchEmployeeDetails();
    } catch (error) {
      console.error('Failed to assign task:', error);
    } finally {
      setSavingTask(false);
    }
  };

  const handleVerifyDocument = async (docId, newStatus, reviewComment) => {
    setUpdatingDoc(true);
    try {
      await api.patch(`/admin/documents/${docId}/verify`, {
        status: newStatus,
        review_comment: reviewComment || undefined,
      });
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

  const accessRequests = employee.AccessRequests || [];
  const tasks          = employee.Tasks          || [];

  return (
    <div className="space-y-6">
      {/* Header */}
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
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <EmployeeDetailsCard employee={employee} />

          <DocumentReview
            documents={employee.Documents || []}
            onVerify={handleVerifyDocument}
            loading={updatingDoc}
          />

          {/* Assigned tasks */}
          <Card title="Onboarding Tasks" subtitle="Tasks assigned to this employee.">
            {tasks.length === 0 ? (
              <p className="text-xs text-[#8D8D8D] text-center py-4">No tasks assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
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

          {/* Access Requests */}
          <Card title="Access Requests" subtitle="All access requests submitted by this employee.">
            {accessRequests.length === 0 ? (
              <p className="text-xs text-[#8D8D8D] text-center py-4">No access requests found.</p>
            ) : (
              <div className="space-y-2">
                {accessRequests.map((req) => (
                  <div key={req.id} className="p-3 border border-[#E0E0E0] rounded-sm bg-white flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#161616]">{req.application_name}</p>
                      <p className="text-[10px] text-[#525252] mt-0.5">{req.reason || '—'}</p>
                      <p className="text-[9px] text-[#8D8D8D] mt-0.5">
                        {req.requested_at ? new Date(req.requested_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${STATUS_COLOR[req.status] || STATUS_COLOR.pending}`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Digital Signatures */}
          <Card title="Digital Signatures" subtitle="Signatures submitted during onboarding.">
            {signatures.length === 0 ? (
              <p className="text-xs text-[#8D8D8D] text-center py-4">No signatures on file.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {signatures.map((sig) => (
                  <div key={sig.id} className="border border-[#E0E0E0] rounded-sm p-2 bg-[#F4F4F4]">
                    <img
                      src={sig.signature_data_url}
                      alt="Employee signature"
                      className="max-h-20 w-full object-contain bg-white rounded-sm"
                    />
                    <p className="text-[9px] text-[#8D8D8D] text-right mt-1">
                      {sig.signed_at ? new Date(sig.signed_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
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
