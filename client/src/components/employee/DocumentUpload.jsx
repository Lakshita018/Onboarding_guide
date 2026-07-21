import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, AlertCircle, File } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../common/Button';

const DOCUMENT_TYPES = [
  { value: 'id_proof', label: 'Identity Proof', desc: 'Passport, driver\'s license, Aadhaar' },
  { value: 'education_certificate', label: 'Education Certificate', desc: 'Degree, diploma, or marksheet' },
  { value: 'offer_letter', label: 'Signed Offer Letter', desc: 'IBM offer letter with your signature' },
];

const DocumentUpload = ({ onUploadSuccess, existingDocuments = [] }) => {
  const [selectedType, setSelectedType] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (f) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpg', 'image/jpeg'];
    const ext = f.name.split('.').pop().toLowerCase();
    const allowedExts = ['pdf', 'png', 'jpg', 'jpeg'];
    if (!allowedExts.includes(ext)) return 'Only PDF, PNG, JPG, JPEG files are allowed.';
    if (f.size > 10 * 1024 * 1024) return 'File size must be under 10 MB.';
    return null;
  };

  const handleFile = (f) => {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError('');
    setFile(f);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleSubmit = async () => {
    if (!file) { setError('Please select a file.'); return; }
    if (!selectedType) { setError('Please select a document type.'); return; }

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', selectedType);

      const res = await api.post('/employee/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFile(null);
      setSelectedType('');
      onUploadSuccess?.(res.data.document);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Document type selection */}
      <div>
        <p className="text-xs font-semibold text-[#525252] uppercase tracking-wide mb-3">
          Select Document Type
        </p>
        <div className="grid grid-cols-1 gap-2">
          {DOCUMENT_TYPES.map((type) => {
            const alreadyUploaded = existingDocuments.some(d => d.document_type === type.value);
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`w-full text-left px-4 py-3 rounded-sm border transition-all ${
                  selectedType === type.value
                    ? 'border-[#0F62FE] bg-[#EDF4FF]'
                    : 'border-[#E0E0E0] bg-white hover:border-[#8D8D8D]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${selectedType === type.value ? 'text-[#0F62FE]' : 'text-[#161616]'}`}>
                    {type.label}
                  </p>
                  {alreadyUploaded && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#FFF8E1] text-[#8A6914] border border-[#F1C21B] rounded-sm">
                      REPLACE
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8D8D8D] mt-0.5">{type.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drop zone */}
      <div>
        <p className="text-xs font-semibold text-[#525252] uppercase tracking-wide mb-3">
          Upload File
        </p>
        <motion.div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          animate={{ borderColor: dragOver ? '#0F62FE' : file ? '#24A148' : '#E0E0E0' }}
          className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'bg-[#EDF4FF]' : file ? 'bg-[#DEFBE6]' : 'bg-[#F4F4F4] hover:bg-white'
          }`}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />

          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <CheckCircle className="w-10 h-10 text-[#24A148]" />
                <p className="text-sm font-semibold text-[#161616]">{file.name}</p>
                <p className="text-xs text-[#8D8D8D]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-1 text-xs text-[#DA1E28] hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <Upload className="w-10 h-10 text-[#8D8D8D]" />
                <p className="text-sm font-medium text-[#161616]">
                  Drop your file here, or <span className="text-[#0F62FE]">browse</span>
                </p>
                <p className="text-xs text-[#8D8D8D]">PDF, PNG, JPG up to 10 MB</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-xs text-[#DA1E28] bg-[#FFF1F1] border border-[#DA1E28] rounded-sm px-3 py-2"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="primary"
        loading={uploading}
        disabled={!file || !selectedType}
        onClick={handleSubmit}
        className="w-full"
        icon={Upload}
      >
        Upload Document
      </Button>
    </div>
  );
};

export default DocumentUpload;
