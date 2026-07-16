import React from 'react';
import Card from '../../common/Card';
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard } from 'lucide-react';
import Button from '../../common/Button';

const EmployeeDashboard = () => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-6 text-slate-800 font-sans">
      <div className="w-full max-w-lg bg-white border border-gray-200 shadow-md p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-50 text-[#0F62FE] rounded-full border border-blue-100">
            <LayoutDashboard className="w-10 h-10 animate-pulse" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'IBM Employee'}!
        </h1>
        
        <p className="text-sm text-gray-500 leading-relaxed">
          Your onboarding workspace has been initialized successfully.
        </p>

        <div className="p-4 bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-600 rounded-sm">
          Employee Dashboard Coming Soon
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
          <span>Role: Employee</span>
          <Button 
            onClick={logout} 
            variant="secondary" 
            className="flex items-center gap-1.5 py-1.5 px-3 border border-slate-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout Session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
