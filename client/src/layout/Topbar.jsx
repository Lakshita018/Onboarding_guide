import React from 'react';

const Topbar = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-500">Workspace / Dashboard</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col text-right">
          <span className="text-sm font-semibold text-gray-800">Jane Doe</span>
          <span className="text-xs text-gray-400">Employee</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#0F62FE] text-white flex items-center justify-center font-bold">
          JD
        </div>
      </div>
    </header>
  );
};

export default Topbar;
