import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Card from '../../components/common/Card';
import DocumentUpload from '../../components/employee/DocumentUpload';
import DocumentList from '../../components/employee/DocumentList';
import OfferViewer from '../../components/employee/OfferViewer';
import DigitalSignature from '../../components/employee/DigitalSignature';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const DocumentsPage = () => {
  const [documents, setDocuments]         = useState([]);
  const [profile, setProfile]             = useState(null);
  const [signatures, setSignatures]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [acceptingOffer, setAcceptingOffer] = useState(false);
  const [savingSig, setSavingSig]         = useState(false);
  const [sigSaved, setSigSaved]           = useState(false);

  const fetchProfileAndDocuments = async () => {
    try {
      const [profileRes, docsRes, sigRes] = await Promise.all([
        api.get('/employee/profile'),
        api.get('/employee/documents'),
        api.get('/employee/signatures'),
      ]);
      setProfile(profileRes.data.profile);
      setDocuments(docsRes.data.documents || []);
      setSignatures(sigRes.data.signatures || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndDocuments();
  }, []);

  const handleUploadSuccess = () => {
    fetchProfileAndDocuments();
  };

  const handleAcceptOffer = async () => {
    setAcceptingOffer(true);
    try {
      await api.put('/employee/offer/accept');
      const profileRes = await api.get('/employee/profile');
      setProfile(profileRes.data.profile);
    } catch (error) {
      console.error('Failed to accept offer:', error);
    } finally {
      setAcceptingOffer(false);
    }
  };

  const handleSaveSignature = async (dataUrl) => {
    setSavingSig(true);
    try {
      const res = await api.post('/employee/signatures', { signature_data_url: dataUrl });
      setSignatures((prev) => [res.data.signature, ...prev]);
      setSigSaved(true);
      setTimeout(() => setSigSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save signature:', error);
    } finally {
      setSavingSig(false);
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
        <div className="lg:col-span-1 space-y-6">
          <Card title="Upload Document">
            <DocumentUpload onUploadSuccess={handleUploadSuccess} existingDocuments={documents} />
          </Card>

          {/* Digital Signature */}
          <Card title="Digital Signature" subtitle="Draw and save your signature for onboarding records.">
            {sigSaved && (
              <div className="mb-3 text-xs text-[#198038] bg-[#DEFBE6] border border-[#A7F0BA] rounded-sm px-3 py-2">
                ✓ Signature saved successfully.
              </div>
            )}
            {signatures.length > 0 && (
              <div className="mb-3 space-y-2">
                <p className="text-xs font-semibold text-[#525252]">Saved Signatures</p>
                {signatures.map((sig) => (
                  <div key={sig.id} className="border border-[#E0E0E0] rounded-sm p-1 bg-[#F4F4F4]">
                    <img
                      src={sig.signature_data_url}
                      alt="Saved signature"
                      className="max-h-16 w-full object-contain"
                    />
                    <p className="text-[9px] text-[#8D8D8D] text-right mt-0.5">
                      {sig.signed_at ? new Date(sig.signed_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <DigitalSignature onSave={handleSaveSignature} loading={savingSig} />
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
