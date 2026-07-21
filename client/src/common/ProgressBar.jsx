import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({
  value = 0,
  max = 100,
  showLabel = true,
  size = 'md',
  color = 'blue',
  className = '',
  label = '',
  animate = true,
}) => {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setDisplayValue(value), 100);
      return () => clearTimeout(timer);
    }
  }, [value, animate]);

  const percentage = Math.min(Math.round((displayValue / max) * 100), 100);

  const heights = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  const colors = {
    blue: 'bg-[#0F62FE]',
    green: 'bg-[#24A148]',
    yellow: 'bg-[#F1C21B]',
    red: 'bg-[#DA1E28]',
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-xs font-medium text-[#525252]">{label}</span>
          )}
          {showLabel && (
            <span className="text-xs font-semibold text-[#161616] ml-auto">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-[#E0E0E0] rounded-full overflow-hidden ${heights[size]}`}
      >
        <motion.div
          className={`${heights[size]} ${colors[color]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
