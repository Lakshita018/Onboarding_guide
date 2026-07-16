import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Card from '../../common/Card';
import Badge from '../../common/Badge';
import Button from '../../common/Button';
import LoadingSkeleton from '../../common/LoadingSkeleton';

const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/admin/documents');
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

  const handleVerify = async (id, status) => {
    try {
      await api.patch(`/admin/documents/${id}/verify`, { status });
      fetchDocuments();
    } catch (error) {
      console.error('Failed to verify document:', error);
    }
  };

  if (loading) return <LoadingSkeleton variant="table-row" lines={5} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#161616]">Document Review</h1>
        <p className="text-sm text-[#525252] mt-1">Verify and approve employee documents.</p>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F4F4] border-b border-[#E0E0E0] text-xs font-semibold text-[#525252] uppercase tracking-wide">
                <th className="px-6 py-3">Document</th>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#F4F4F4] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-[#161616]">{doc.document_name}</p>
                    <p className="text-xs text-[#8D8D8D] mt-0.5 uppercase">{doc.document_type.replace('_', ' ')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#161616]">{doc.Employee?.User?.name}</p>
                    <p className="text-xs text-[#8D8D8D]">{doc.Employee?.User?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={doc.verification_status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {doc.verification_status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleVerify(doc.id, 'rejected')}>Reject</Button>
                        <Button size="sm" onClick={() => handleVerify(doc.id, 'verified')}>Verify</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-sm text-[#525252]">
                    No documents uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDocumentsPage;
