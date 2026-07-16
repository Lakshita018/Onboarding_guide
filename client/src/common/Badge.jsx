import React from 'react';

const VARIANTS = {
  // Status badges
  pending: 'bg-[#FFF8E1] text-[#8A6914] border border-[#F1C21B]',
  verified: 'bg-[#DEFBE6] text-[#198038] border border-[#24A148]',
  approved: 'bg-[#DEFBE6] text-[#198038] border border-[#24A148]',
  rejected: 'bg-[#FFF1F1] text-[#A2191F] border border-[#DA1E28]',
  completed: 'bg-[#DEFBE6] text-[#198038] border border-[#24A148]',
  in_progress: 'bg-[#EDF4FF] text-[#0043CE] border border-[#0F62FE]',
  not_started: 'bg-[#F4F4F4] text-[#525252] border border-[#8D8D8D]',
  active: 'bg-[#DEFBE6] text-[#198038] border border-[#24A148]',
  inactive: 'bg-[#F4F4F4] text-[#525252] border border-[#8D8D8D]',
  // Priority badges
  high: 'bg-[#FFF1F1] text-[#A2191F] border border-[#DA1E28]',
  medium: 'bg-[#FFF8E1] text-[#8A6914] border border-[#F1C21B]',
  low: 'bg-[#F4F4F4] text-[#525252] border border-[#8D8D8D]',
  // Role badges
  admin: 'bg-[#161616] text-white border border-[#393939]',
  employee: 'bg-[#EDF4FF] text-[#0043CE] border border-[#0F62FE]',
  // Custom
  blue: 'bg-[#EDF4FF] text-[#0043CE] border border-[#0F62FE]',
  gray: 'bg-[#F4F4F4] text-[#525252] border border-[#8D8D8D]',
  green: 'bg-[#DEFBE6] text-[#198038] border border-[#24A148]',
  red: 'bg-[#FFF1F1] text-[#A2191F] border border-[#DA1E28]',
  yellow: 'bg-[#FFF8E1] text-[#8A6914] border border-[#F1C21B]',
};

const LABELS = {
  pending: 'Pending',
  verified: 'Verified',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  in_progress: 'In Progress',
  not_started: 'Not Started',
  active: 'Active',
  inactive: 'Inactive',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  admin: 'Admin',
  employee: 'Employee',
};

const Badge = ({ variant = 'gray', label, className = '', dot = false }) => {
  const style = VARIANTS[variant] || VARIANTS.gray;
  const displayLabel = label ?? LABELS[variant] ?? variant;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium ${style} ${className}`}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      )}
      {displayLabel}
    </span>
  );
};

export default Badge;
