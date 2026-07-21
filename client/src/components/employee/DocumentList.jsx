import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, XCircle, File } from 'lucide-react';
import Badge from '../../common/Badge';

const TYPE_LABELS = {
  id_proof: 'Identity Proof',
  education_certificate: 'Education Certificate',
  offer_letter: 'Signed Offer Letter',
};

const DocumentList = ({ documents = [] }) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto mb-3 text-[#E0E0E0]" />
        <p className="text-sm font-medium text-[#525252]">No documents uploaded yet</p>
        <p className="text-xs text-[#8D8D8D] mt-1">Upload your documents above to get started</p>
      </div>
    );
  }

  const StatusIcon = ({ status }) => {
    if (status === 'verified') return <CheckCircle className="w-4 h-4 text-[#24A148]" />;
    if (status === 'rejected') return <XCircle className="w-4 h-4 text-[#DA1E28]" />;
    return <Clock className="w-4 h-4 text-[#F1C21B]" />;
  };

  return (
    <div className="divide-y divide-[#F4F4F4]">
      {documents.map((doc, i) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center gap-4 py-4 px-1 hover:bg-[#F4F4F4] rounded-sm transition-colors"
        >
          <div className="p-2.5 bg-[#EDF4FF] rounded-sm flex-shrink-0">
            <File className="w-4 h-4 text-[#0F62FE]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#161616] truncate">{doc.document_name}</p>
            <p className="text-xs text-[#8D8D8D] mt-0.5">
              {TYPE_LABELS[doc.document_type] || doc.document_type}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <p className="text-[10px] text-[#8D8D8D]">
              {new Date(doc.created_at).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
              })}
            </p>
            <div className="flex items-center gap-1.5">
              <StatusIcon status={doc.verification_status} />
              <Badge variant={doc.verification_status} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DocumentList;
