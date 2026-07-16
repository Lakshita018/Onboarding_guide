import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SetupGuide from '../../components/employee/SetupGuide';

const SetupPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/employee/profile');
      setProfile(res.data.profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (osType) => {
    setSaving(true);
    try {
      await api.put('/employee/profile/os', { os_type: osType });
      setProfile((prev) => ({ ...prev, os_type: osType }));
    } catch (error) {
      console.error('Failed to save OS preference:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="card" className="h-[300px]" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">IT Setup Guide</h1>
        <p className="text-sm text-[#525252] mt-1">
          Configure your operating system preference for your developer laptop.
        </p>
      </div>

      <SetupGuide
        currentOs={profile?.os_type}
        onSave={handleSave}
        loading={saving}
      />
    </div>
  );
};

export default SetupPage;
