import React from 'react';

const LoadingSkeleton = ({ className = '', count = 1 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse bg-gray-200 rounded-sm h-4 w-full ${className}`}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
