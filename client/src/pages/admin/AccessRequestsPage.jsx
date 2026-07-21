import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useSocket } from '../../context/SocketContext';

const STATUS_COLOR = {
  pending:  'bg-[#FFF8E1] text-[#B45309] border border-[#FDE68A]',
  approved: 'bg-[#DEFBE6] text-[#198038] border border-[#A7F0BA]',
  rejected: 'bg-[#FFF1F1] text-[#DA1E28] border border-[#FFBDBD]',
};

const AccessRequestsPage = () => {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [comment, setComment]     = useState('');
  const [saving, setSaving]       = useState(false);
  const socket = useSocket();

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/access-requests');
      setRequests(res.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch access requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Real-time: if a new request comes in via socket, prepend it
  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      if (payload.type === 'access_request_submitted') {
        fetchRequests();
      }
    };
    socket.on('adminNotification', handler);
    return () => socket.off('adminNotification', handler);
  }, [socket]);

  const handleAction = async (status) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await api.patch(`/admin/access-requests/${selected.id}`, { status, comment });
      setRequests((prev) =>
        prev.map((r) => (r.id === selected.id ? { ...r, status: res.data.request?.status || status } : r))
      );
      setSelected(null);
      setComment('');
    } catch (error) {
      console.error('Failed to update request:', error);
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  if (loading) return <LoadingSkeleton variant="table-row" lines={6} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#161616]">Access Requests</h1>
          <p className="text-sm text-[#525252] mt-1">
            Review and approve employee access requests for tools and platforms.
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="text-xs font-semibold bg-[#FF6B35] text-white px-2.5 py-1 rounded-full">
            {pendingCount} pending
          </span>
        )}
      </div>

      <Card noPadding>
        {requests.length === 0 ? (
          <p className="text-xs text-[#8D8D8D] text-center py-10">No access requests found.</p>
        ) : (
          <div className="divide-y divide-[#E0E0E0]">
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-[#F4F4F4] transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#161616]">
                      {req.Employee?.User?.name || 'Unknown'}
                    </span>
                    <span className="text-[10px] text-[#8D8D8D]">
                      {req.Employee?.User?.email}
                    </span>
                  </div>
                  <p className="text-xs text-[#525252] mt-0.5">
                    <span className="font-semibold text-[#161616]">{req.application_name}</span>
                    {req.reason ? ` — ${req.reason}` : ''}
                  </p>
                  <p className="text-[10px] text-[#8D8D8D] mt-0.5">
                    {req.requested_at ? new Date(req.requested_at).toLocaleDateString() : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${
                      STATUS_COLOR[req.status] || STATUS_COLOR.pending
                    }`}
                  >
                    {req.status}
                  </span>
                  {req.status === 'pending' && (
                    <Button
                      variant="ghost"
                      className="text-xs py-1 px-3 border border-[#E0E0E0] hover:border-[#0F62FE] hover:text-[#0F62FE]"
                      onClick={() => { setSelected(req); setComment(''); }}
                    >
                      Review
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => { setSelected(null); setComment(''); }}
        title="Review Access Request"
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            <div className="bg-[#F4F4F4] rounded-sm p-3 space-y-1 text-xs">
              <p><span className="font-semibold text-[#525252]">Employee: </span>{selected.Employee?.User?.name}</p>
              <p><span className="font-semibold text-[#525252]">Application: </span>{selected.application_name}</p>
              <p><span className="font-semibold text-[#525252]">Reason: </span>{selected.reason || '—'}</p>
              <p><span className="font-semibold text-[#525252]">Requested: </span>
                {selected.requested_at ? new Date(selected.requested_at).toLocaleDateString() : '—'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#525252] mb-1">
                Comment <span className="font-normal text-[#8D8D8D]">(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a note for the employee..."
                className="w-full border border-[#E0E0E0] rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#0F62FE] h-20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                onClick={() => { setSelected(null); setComment(''); }}
                type="button"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAction('rejected')}
                loading={saving}
                className="bg-[#DA1E28] hover:bg-[#BA1B23] text-white text-xs"
              >
                Reject
              </Button>
              <Button
                onClick={() => handleAction('approved')}
                loading={saving}
                className="bg-[#198038] hover:bg-[#0E6027] text-white text-xs"
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AccessRequestsPage;
