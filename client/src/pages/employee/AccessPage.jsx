import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import api from '../../api/axios';
import Card from '../../common/Card';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import LoadingSkeleton from '../../common/LoadingSkeleton';

const AccessPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [appName, setAppName] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/employee/access-requests');
      setRequests(res.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appName || !reason) return;
    
    setSubmitting(true);
    try {
      const res = await api.post('/employee/access-request', { application_name: appName, reason });
      setRequests(prev => [res.data.request, ...prev]);
      setModalOpen(false);
      setAppName('');
      setReason('');
    } catch (error) {
      console.error('Failed to submit request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="table-row" lines={5} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#161616]">Access Requests</h1>
          <p className="text-sm text-[#525252] mt-1">
            Request access to software, tools, and platforms.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setModalOpen(true)}>New Request</Button>
      </div>

      <Card noPadding>
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[#525252]">No access requests found.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F4F4F4]">
            {requests.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 flex items-center justify-between hover:bg-[#F4F4F4] transition-colors"
              >
                <div>
                  <h3 className="text-sm font-semibold text-[#161616]">{req.application_name}</h3>
                  <p className="text-xs text-[#8D8D8D] mt-1 line-clamp-1 max-w-lg">{req.reason}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={req.status} />
                  <span className="text-[10px] text-[#8D8D8D]">
                    {new Date(req.requested_at).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Request Application Access"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#525252] mb-1">Application Name</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. GitHub Enterprise, Jira, AWS"
              className="w-full border border-[#E0E0E0] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#0F62FE]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#525252] mb-1">Business Justification</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you need access to this application?"
              className="w-full border border-[#E0E0E0] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#0F62FE] h-24 resize-none"
              required
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} type="button">Cancel</Button>
            <Button type="submit" loading={submitting}>Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AccessPage;
