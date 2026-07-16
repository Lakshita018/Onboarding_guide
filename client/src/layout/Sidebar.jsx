import React from 'react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#393939] text-white flex flex-col h-screen">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="w-3 h-3 bg-[#0F62FE] rounded-sm"></span>
          IBM OnboardAI
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Menu
        </div>
        <div className="px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
          Dashboard
        </div>
        <div className="px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
          Checklist
        </div>
        <div className="px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
          Documents
        </div>
        <div className="px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg cursor-pointer">
          AI Assistant
        </div>
      </nav>
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400 text-center">
        v1.0.0
      </div>
    </aside>
  );
};

export default Sidebar;
