import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Card from '../../components/common/Card';
import DocumentUpload from '../../components/employee/DocumentUpload';
import DocumentList from '../../components/employee/DocumentList';
import OfferViewer from '../../components/employee/OfferViewer';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acceptingOffer, setAcceptingOffer] = useState(false);

  const fetchProfileAndDocuments = async () => {
    try {
      const [profileRes, docsRes] = await Promise.all([
        api.get('/employee/profile'),
        api.get('/employee/documents')
      ]);
      setProfile(profileRes.data.profile);
      setDocuments(docsRes.data.documents || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndDocuments();
  }, []);

  const handleUploadSuccess = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleAcceptOffer = async () => {
    setAcceptingOffer(true);
    try {
      await api.put('/employee/offer/accept');
      // Refetch profile to update acceptance state visual badges
      const profileRes = await api.get('/employee/profile');
      setProfile(profileRes.data.profile);
    } catch (error) {
      console.error('Failed to accept offer:', error);
    } finally {
      setAcceptingOffer(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="dashboard" className="h-[400px]" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">My Documents</h1>
        <p className="text-sm text-[#525252] mt-1">
          Upload required compliance documents and sign your official offer letter.
        </p>
      </div>

      {/* Offer Letter Viewer section if not signed yet */}
      {profile && !profile.offer_accepted && (
        <div className="mb-6">
          <OfferViewer
            profile={profile}
            onAccept={handleAcceptOffer}
            loading={acceptingOffer}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card title="Upload Document">
            <DocumentUpload onUploadSuccess={handleUploadSuccess} />
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card title="Uploaded Documents" noPadding>
            <DocumentList documents={documents} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
