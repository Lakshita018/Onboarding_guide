import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  footer,
}) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className={`w-full ${sizes[size]} bg-white rounded-sm shadow-xl border border-[#E0E0E0] flex flex-col max-h-[90vh]`}
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              {(title || onClose) && (
                <div className="flex items-start justify-between px-6 py-4 border-b border-[#E0E0E0] flex-shrink-0">
                  <div>
                    {title && (
                      <h2 className="text-base font-semibold text-[#161616]">{title}</h2>
                    )}
                    {subtitle && (
                      <p className="text-xs text-[#8D8D8D] mt-0.5">{subtitle}</p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-sm text-[#525252] hover:bg-[#F4F4F4] hover:text-[#161616] transition-colors ml-4 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
              {footer && (
                <div className="px-6 py-4 border-t border-[#E0E0E0] flex items-center justify-end gap-3 flex-shrink-0">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
