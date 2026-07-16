import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  title,
  subtitle,
  className = '',
  headerActions,
  hoverable = false,
  noPadding = false,
  accent = false,
}) => {
  const base =
    'bg-white border border-[#E0E0E0] rounded-sm shadow-sm overflow-hidden';
  const hoverStyle = hoverable
    ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
    : '';
  const accentStyle = accent ? 'border-l-4 border-l-[#0F62FE]' : '';

  return (
    <motion.div
      className={`${base} ${hoverStyle} ${accentStyle} ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {(title || subtitle || headerActions) && (
        <div className="px-6 py-4 border-b border-[#E0E0E0] flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-[#161616] leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#8D8D8D] mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'px-6 py-5'}>{children}</div>
    </motion.div>
  );
};

export default Card;
