import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Apple, Terminal } from 'lucide-react';
import api from '../../api/axios';
import Card from '../../common/Card';
import Button from '../../common/Button';
import LoadingSkeleton from '../../common/LoadingSkeleton';

const OS_OPTIONS = [
  { id: 'windows', label: 'Windows', icon: Monitor, desc: 'ThinkPad or similar standard laptop' },
  { id: 'mac', label: 'macOS', icon: Apple, desc: 'MacBook Pro for development' },
  { id: 'linux', label: 'Linux', icon: Terminal, desc: 'Ubuntu pre-installed for engineering' },
];

const SetupPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedOs, setSelectedOs] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/employee/profile');
        setProfile(res.data.profile);
        if (res.data.profile.os_type) setSelectedOs(res.data.profile.os_type);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!selectedOs) return;
    setSaving(true);
    try {
      await api.put('/employee/profile/os', { os_type: selectedOs });
      setProfile(prev => ({ ...prev, os_type: selectedOs }));
    } catch (error) {
      console.error('Failed to save OS preference:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="card" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">IT Setup Guide</h1>
        <p className="text-sm text-[#525252] mt-1">
          Select your preferred operating system for your work machine.
        </p>
      </div>

      <Card title="Hardware Preference">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {OS_OPTIONS.map((os) => {
            const Icon = os.icon;
            const isSelected = selectedOs === os.id;
            return (
              <div
                key={os.id}
                onClick={() => setSelectedOs(os.id)}
                className={`p-4 border rounded-sm cursor-pointer transition-all ${
                  isSelected ? 'border-[#0F62FE] bg-[#EDF4FF]' : 'border-[#E0E0E0] bg-white hover:border-[#8D8D8D]'
                }`}
              >
                <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-[#0F62FE]' : 'text-[#525252]'}`} />
                <h3 className={`text-sm font-semibold ${isSelected ? 'text-[#0F62FE]' : 'text-[#161616]'}`}>
                  {os.label}
                </h3>
                <p className="text-xs text-[#8D8D8D] mt-1">{os.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            loading={saving} 
            disabled={!selectedOs || selectedOs === profile?.os_type}
          >
            {profile?.os_type ? 'Update Preference' : 'Save Preference'}
          </Button>
        </div>
      </Card>

      {profile?.os_type && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card title="Next Steps">
            <div className="space-y-4 text-sm text-[#525252]">
              <p>Your hardware request has been logged. Our IT team will prepare your {profile.os_type} machine.</p>
              <ul className="list-disc pl-5 space-y-2 text-[#8D8D8D]">
                <li>You will receive an email with tracking details once dispatched.</li>
                <li>Upon receiving the device, follow the enclosed quick-start guide.</li>
                <li>Connect to the corporate VPN using your W3ID credentials.</li>
              </ul>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default SetupPage;
