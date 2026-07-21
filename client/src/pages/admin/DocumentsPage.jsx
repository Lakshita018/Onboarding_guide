import React, { useEffect, useState } from 'react';
import { ExternalLink, MessageSquare, X } from 'lucide-react';
import api from '../../api/axios';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const TYPE_LABELS = {
  id_proof: 'Identity Proof',
  education_certificate: 'Education Certificate',
  offer_letter: 'Signed Offer Letter',
};

const ReviewModal = ({ doc, onClose, onSubmit, saving }) => {
  const [comment, setComment] = useState(doc.review_comment || '');
  const [status, setStatus]   = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-sm border border-[#E0E0E0] w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0E0E0]">
          <h3 className="text-sm font-bold text-[#161616]">Review Document</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#F4F4F4] rounded cursor-pointer border-0 bg-transparent">
            <X className="w-4 h-4 text-[#525252]" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-[#525252] font-semibold mb-0.5">Document</p>
            <p className="text-sm font-medium text-[#161616]">{doc.document_name}</p>
            <p className="text-xs text-[#8D8D8D]">{TYPE_LABELS[doc.document_type] || doc.document_type}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#525252] mb-1">Review Comment (optional)</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
              placeholder="e.g. Please upload a clearer scan."
              className="w-full border border-[#E0E0E0] rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#0F62FE] resize-none" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" disabled={saving}
              onClick={() => onSubmit(doc.id, 'rejected', comment)}
              className="flex-1 justify-center border-[#DA1E28] text-[#DA1E28] hover:bg-[#FFF1F1]">
              Reject
            </Button>
            <Button size="sm" disabled={saving} loading={saving}
              onClick={() => onSubmit(doc.id, 'verified', comment)}
              className="flex-1 justify-center bg-[#198038] hover:bg-[#0e6027] text-white border-0">
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [saving, setSaving]       = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/admin/documents');
      setDocuments(res.data.documents || []);
    } catch (e) {
      console.error('Failed to fetch documents:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleVerify = async (id, status, review_comment) => {
    setSaving(true);
    try {
      await api.patch(`/admin/documents/${id}/verify`, { status, review_comment });
      setReviewing(null);
      fetchDocuments();
    } catch (e) {
      console.error('Failed to verify:', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="table-row" lines={5} />;

  return (
    <div className="space-y-6">
      {reviewing && (
        <ReviewModal doc={reviewing} onClose={() => setReviewing(null)} onSubmit={handleVerify} saving={saving} />
      )}

      <div>
        <h1 className="text-xl font-bold text-[#161616]">Document Review</h1>
        <p className="text-sm text-[#525252] mt-1">View and verify employee onboarding documents.</p>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F4F4] border-b border-[#E0E0E0] text-xs font-semibold text-[#525252] uppercase tracking-wide">
                <th className="px-6 py-3">Document</th>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Uploaded</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Review Note</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-[#F4F4F4] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-[#161616]">{doc.document_name}</p>
                    <p className="text-xs text-[#8D8D8D] mt-0.5">{TYPE_LABELS[doc.document_type] || doc.document_type}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#161616]">{doc.Employee?.User?.name || '—'}</p>
                    <p className="text-xs text-[#8D8D8D]">{doc.Employee?.User?.email || ''}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#525252]">
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4"><Badge variant={doc.verification_status || 'pending'} /></td>
                  <td className="px-6 py-4">
                    {doc.review_comment ? (
                      <p className="text-xs text-[#525252] italic max-w-[160px] truncate" title={doc.review_comment}>
                        "{doc.review_comment}"
                      </p>
                    ) : <span className="text-xs text-[#8D8D8D]">—</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {doc.cloudinary_url && (
                        <a href={doc.cloudinary_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-[#0F62FE] text-[#0F62FE] rounded-sm hover:bg-[#EDF4FF] transition-colors">
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                      )}
                      <button onClick={() => setReviewing(doc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-[#E0E0E0] text-[#525252] rounded-sm hover:bg-[#F4F4F4] transition-colors cursor-pointer bg-transparent">
                        <MessageSquare className="w-3 h-3" /> Review
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-sm text-[#8D8D8D]">No documents uploaded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDocumentsPage;
