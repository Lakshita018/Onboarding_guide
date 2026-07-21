import React from 'react';
import { FileText, CheckCircle, XCircle, Download, ExternalLink } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

const DocumentReview = ({ documents = [], onVerify, loading }) => {
  return (
    <Card title="Uploaded Onboarding Documents" subtitle="Review candidate identity proofs, education certificates, and contract papers.">
      {documents.length === 0 ? (
        <div className="text-center py-10">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#8D8D8D]" />
          <p className="text-xs text-[#8D8D8D]">No documents uploaded by the candidate yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#E0E0E0] rounded-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4F4F4] border-b border-[#E0E0E0] text-[10px] font-bold text-[#525252] uppercase tracking-wider">
                <th className="px-4 py-3">Document Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Uploaded Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {documents.map((doc) => {
                const docUrl = doc.cloudinary_url || doc.file_path || '#';
                return (
                  <tr key={doc.id} className="hover:bg-[#F4F4F4] transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#161616]">
                      <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <FileText className="w-3.5 h-3.5 text-[#8D8D8D]" />
                        {doc.document_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-[#525252]">{doc.document_type}</td>
                    <td className="px-4 py-3 text-[#8D8D8D]">
                      {new Date(doc.uploaded_at || doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={doc.verification_status || 'pending'} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-[#525252] hover:bg-[#E0E0E0] rounded transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="Open Document File"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {doc.verification_status === 'pending' && (
                          <>
                            <button
                              onClick={() => onVerify?.(doc.id, 'verified')}
                              disabled={loading}
                              className="p-1 bg-[#DEFBE6] hover:bg-[#DEFBE6]/80 text-[#198038] rounded transition-colors inline-flex items-center justify-center border-0 cursor-pointer"
                              title="Approve / Verify"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onVerify?.(doc.id, 'rejected')}
                              disabled={loading}
                              className="p-1 bg-[#FFF1F1] hover:bg-[#FFF1F1]/80 text-[#A2191F] rounded transition-colors inline-flex items-center justify-center border-0 cursor-pointer"
                              title="Reject"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default DocumentReview;
