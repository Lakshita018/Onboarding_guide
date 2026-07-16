import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Card from '../../common/Card';
import DocumentUpload from '../../components/employee/DocumentUpload';
import DocumentList from '../../components/employee/DocumentList';
import LoadingSkeleton from '../../common/LoadingSkeleton';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/employee/documents');
      setDocuments(res.data.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSuccess = (newDoc) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  if (loading) return <LoadingSkeleton variant="dashboard" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">My Documents</h1>
        <p className="text-sm text-[#525252] mt-1">
          Upload and manage your onboarding documents securely.
        </p>
      </div>

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
