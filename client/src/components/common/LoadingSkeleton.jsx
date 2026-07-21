import React from 'react';

const LoadingSkeleton = ({ variant = 'text', className = '', lines = 3 }) => {
  const pulse = 'animate-pulse bg-[#E0E0E0] rounded';

  if (variant === 'card') {
    return (
      <div className={`bg-white border border-[#E0E0E0] rounded-sm p-6 ${className}`}>
        <div className={`h-4 ${pulse} w-1/3 mb-4`} />
        <div className={`h-8 ${pulse} w-full mb-3`} />
        <div className={`h-3 ${pulse} w-2/3`} />
      </div>
    );
  }

  if (variant === 'stat') {
    return (
      <div className={`bg-white border border-[#E0E0E0] rounded-sm p-6 ${className}`}>
        <div className={`h-3 ${pulse} w-1/2 mb-3`} />
        <div className={`h-8 ${pulse} w-1/3 mb-2`} />
        <div className={`h-2 ${pulse} w-full`} />
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <div className={`flex items-center gap-4 py-3 px-4 ${className}`}>
        <div className={`h-8 w-8 ${pulse} rounded-full flex-shrink-0`} />
        <div className="flex-1 space-y-2">
          <div className={`h-3 ${pulse} w-1/3`} />
          <div className={`h-2.5 ${pulse} w-1/2`} />
        </div>
        <div className={`h-5 ${pulse} w-16 rounded-full`} />
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`bg-white border border-[#E0E0E0] rounded-sm p-6`}>
              <div className={`h-3 ${pulse} w-1/2 mb-3`} />
              <div className={`h-7 ${pulse} w-1/3 mb-2`} />
              <div className={`h-2 ${pulse} w-full`} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`bg-white border border-[#E0E0E0] rounded-sm p-6`}>
              <div className={`h-4 ${pulse} w-2/3 mb-4`} />
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className={`h-3 ${pulse} w-full`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className={`h-3 ${pulse}`}
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
