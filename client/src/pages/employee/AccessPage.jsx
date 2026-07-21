import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import AccessRequest from '../../components/employee/AccessRequest';

// IBM tool links — pre-populated quick-access cards
const IBM_LINKS = [
  { label: 'W3ID Portal',        description: 'IBM single sign-on identity portal',         href: '#' },
  { label: 'IBM Outlook',        description: 'Corporate email via Outlook Web Access',      href: '#' },
  { label: 'Slack',              description: 'Team messaging and collaboration',             href: '#' },
  { label: 'Microsoft Teams',    description: 'Video conferencing and chat',                  href: '#' },
  { label: 'Your Learning',      description: 'IBM learning & certification platform',        href: '#' },
  { label: 'BOB',                description: 'IBM AI assistant for internal productivity',   href: '#' },
  { label: 'Concert',            description: 'IT operations and observability platform',     href: '#' },
  { label: 'HR Portal',          description: 'Benefits, payroll, and HR self-service',      href: '#' },
  { label: 'Internal App Store', description: 'Browse and request internal IBM tools',       href: '#' },
];

const AccessPage = () => {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [appName, setAppName]     = useState('');
  const [reason, setReason]       = useState('');
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

  const handleOpenNewRequest = (defaultAppName = '') => {
    setAppName(defaultAppName);
    setReason('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appName || !reason) return;

    setSubmitting(true);
    try {
      const res = await api.post('/employee/access-request', { application_name: appName, reason });
      setRequests((prev) => [res.data.request, ...prev]);
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
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">Access Requests</h1>
        <p className="text-sm text-[#525252] mt-1">
          Request access to software, tools, and platforms.
        </p>
      </div>

      {/* IBM Quick-Access Links */}
      <div>
        <h2 className="text-sm font-semibold text-[#161616] mb-3">IBM Tools &amp; Platforms</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {IBM_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block p-4 border border-[#E0E0E0] rounded-sm bg-white hover:border-[#0F62FE] hover:bg-[#EDF5FF] transition-colors group"
            >
              <p className="text-xs font-bold text-[#161616] group-hover:text-[#0F62FE]">{link.label}</p>
              <p className="text-[11px] text-[#525252] mt-0.5">{link.description}</p>
              <p className="text-[10px] text-[#0F62FE] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Open →
              </p>
            </a>
          ))}
        </div>
        <p className="text-[10px] text-[#8D8D8D] mt-2">
          Links will be activated once your access is provisioned by your admin.
        </p>
      </div>

      {/* My Access Requests */}
      <div>
        <h2 className="text-sm font-semibold text-[#161616] mb-3">My Requests</h2>
        <AccessRequest
          requests={requests}
          onOpenNewRequest={handleOpenNewRequest}
        />
      </div>

      {/* New Request Modal */}
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
