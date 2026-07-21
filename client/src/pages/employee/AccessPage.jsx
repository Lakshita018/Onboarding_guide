import React, { useEffect, useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import AccessRequest from '../../components/employee/AccessRequest';

// ─── Registration steps for popup-only tools ─────────────────────────────────
const REGISTRATION_STEPS = {
  'W3ID Portal': {
    title: 'How to Set Up Your W3ID',
    description: 'Your W3ID is your IBM global identity — it provides single sign-on access to all IBM internal systems, tools, and platforms. Follow the steps below to activate and secure your account.',
    steps: [
      'Check your personal email inbox for a welcome message from IBM HR — your initial W3ID username and temporary password have been shared there.',
      'Open the W3ID portal using the link below and enter your username and temporary password to sign in for the first time.',
      'You will be immediately prompted to reset your password. Choose a strong password that meets IBM\'s security policy (minimum 12 characters, including uppercase, lowercase, numbers, and special characters).',
      'Once logged in, navigate to your account settings and create a Passkey — this enables fast, passwordless authentication on trusted devices.',
      'Finally, set up Multi-Factor Authentication (MFA) or Two-Factor Authentication (2FA). IBM recommends using the IBM Verify app for push notifications, or a TOTP authenticator as a backup.',
      'Your W3ID is now fully active. Use it to access all IBM platforms including Your Learning, BOB, Seismic, HR Portal, and the IBM intranet.',
    ],
    url: 'https://w3.ibm.com/#/',
  },
  'BOB': {
    title: 'How to Register for BOB',
    description: 'BOB (IBM AI Assistant) is IBM\'s internal AI productivity assistant powered by watsonx.',
    steps: [
      'Ensure your W3ID is set up and active — BOB requires W3ID authentication.',
      'Open the BOB portal using the link below.',
      'Click "Sign in with W3ID" on the landing page.',
      'Authenticate using your IBM W3ID credentials (email + password + MFA).',
      'On first login, accept the IBM AI usage policy and data terms.',
      'You will be redirected to your personalised BOB dashboard.',
      'Bookmark the portal for quick access: https://w3.ibm.com/w3publisher/bob',
    ],
    url: 'https://w3.ibm.com/w3publisher/bob',
  },
  'Your Learning': {
    title: 'How to Register for Your Learning',
    description: 'Your Learning is IBM\'s official learning & certification platform with thousands of courses, badges, and learning paths.',
    steps: [
      'Ensure your W3ID is active — Your Learning uses IBM SSO.',
      'Open the Your Learning portal using the link below.',
      'Click "Log in" and authenticate with your W3ID credentials.',
      'On first visit, complete your learner profile — add your role, department, and learning interests.',
      'Explore the mandatory onboarding learning plan assigned to your role.',
      'Complete the required courses (Security Awareness, POSH, IBM Code of Conduct) within 30 days of joining.',
      'Earn badges and certifications that appear on your IBM employee profile.',
    ],
    url: 'https://yourlearning.ibm.com/',
  },
};

// ─── IBM tool cards ───────────────────────────────────────────────────────────
// popup: true  → clicking opens the registration steps modal
// popup: false → clicking opens the URL directly in a new tab
const IBM_LINKS = [
  { label: 'W3ID Portal',        description: 'IBM single sign-on identity portal',                    href: 'https://w3.ibm.com/#/',                 popup: true  },
  { label: 'IBM Outlook',        description: 'Corporate email via Outlook Web Access',                href: 'https://outlook.office365.com',          popup: false },
  { label: 'Slack',              description: 'Team messaging and collaboration',                       href: 'https://slack.com',                      popup: false },
  { label: 'Seismic',            description: 'IBM sales enablement and content management platform',  href: 'https://ibm.seismic.com/apps/home',      popup: false },
  { label: 'Your Learning',      description: 'IBM learning & certification platform',                 href: 'https://yourlearning.ibm.com/',          popup: true  },
  { label: 'BOB',                description: 'IBM AI assistant for internal productivity',            href: 'https://w3.ibm.com/w3publisher/bob',     popup: true  },
  { label: 'Concert',            description: 'IT operations and observability platform',              href: '#',                                      popup: false },
  { label: 'HR Portal',          description: 'Benefits, payroll, and HR self-service',               href: '#',                                      popup: false },
  { label: 'Internal App Store', description: 'Browse and request internal IBM tools',                href: '#',                                      popup: false },
];

// ─── Registration Steps Modal ─────────────────────────────────────────────────
const RegistrationModal = ({ tool, onClose }) => {
  if (!tool) return null;
  const info = REGISTRATION_STEPS[tool];
  if (!info) return null;

  return (
    <Modal isOpen={!!tool} onClose={onClose} title={info.title} size="md">
      <div className="space-y-4">
        {/* Description */}
        <p className="text-xs text-[#525252] leading-relaxed">{info.description}</p>

        {/* Steps */}
        <div>
          <p className="text-[10px] font-bold text-[#525252] uppercase tracking-wider mb-3">
            Registration Steps
          </p>
          <ol className="space-y-3">
            {info.steps.map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0F62FE] text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-[#161616] leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E0E0E0] pt-4 flex items-center justify-between">
          <p className="text-[10px] text-[#8D8D8D]">
            Requires an active IBM W3ID to access.
          </p>
          <a
            href={info.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0F62FE] text-white text-xs font-semibold rounded-sm hover:bg-[#0353E9] transition-colors"
          >
            Open {tool} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </Modal>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AccessPage = () => {
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [activeTool, setActiveTool] = useState(null); // which popup tool is open

  const [appName, setAppName]       = useState('');
  const [reason, setReason]         = useState('');
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

  useEffect(() => { fetchRequests(); }, []);

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

  const handleToolClick = (e, link) => {
    if (link.popup) {
      e.preventDefault();
      setActiveTool(link.label);
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
              target={link.popup ? undefined : '_blank'}
              rel="noopener noreferrer"
              onClick={(e) => handleToolClick(e, link)}
              className="block p-4 border border-[#E0E0E0] rounded-sm bg-white hover:border-[#0F62FE] hover:bg-[#EDF5FF] transition-colors group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <p className="text-xs font-bold text-[#161616] group-hover:text-[#0F62FE]">
                  {link.label}
                </p>
                {link.popup && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#EDF4FF] text-[#0F62FE] border border-[#0F62FE]/20 rounded-full font-semibold">
                    Guide
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#525252] mt-0.5">{link.description}</p>
              <p className="text-[10px] text-[#0F62FE] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {link.popup ? 'View registration guide →' : 'Open →'}
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
        <AccessRequest requests={requests} onOpenNewRequest={handleOpenNewRequest} />
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

      {/* Registration Guide Popup — BOB & Your Learning only */}
      <RegistrationModal tool={activeTool} onClose={() => setActiveTool(null)} />
    </div>
  );
};

export default AccessPage;
