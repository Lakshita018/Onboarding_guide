import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Monitor,
  Key,
  BookOpen,
  MessageSquare,
  Users,
  ClipboardList,
  FolderOpen,
  BarChart2,
} from 'lucide-react';

const EMPLOYEE_NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'My Documents', icon: FileText, to: '/documents' },
  { label: 'Checklist', icon: CheckSquare, to: '/checklist' },
  { label: 'Setup Guide', icon: Monitor, to: '/setup' },
  { label: 'Access Requests', icon: Key, to: '/access' },
  { label: 'Learning', icon: BookOpen, to: '/learning' },
  { label: 'AI Assistant', icon: MessageSquare, to: '/chat' },
];

const ADMIN_NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Employees', icon: Users, to: '/admin/employees' },
  { label: 'Tasks', icon: ClipboardList, to: '/admin/tasks' },
  { label: 'Documents', icon: FolderOpen, to: '/admin/documents' },
  { label: 'Reports', icon: BarChart2, to: '/admin/reports' },
];

const MobileSidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navItems = user?.role === 'admin' ? ADMIN_NAV : EMPLOYEE_NAV;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40 md:hidden"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-64 bg-[#262626] text-white z-50 flex flex-col md:hidden border-r border-[#393939]"
          >
            {/* Header */}
            <div className="flex items-center justify-between h-14 border-b border-[#393939] px-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#0F62FE] rounded-sm flex items-center justify-center">
                  <Cpu className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-white tracking-tight">IBM Onboarding</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-[#C6C6C6] hover:text-white hover:bg-[#393939] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation list */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
              <div className="px-3 pb-2 text-[10px] font-semibold text-[#6F6F6F] uppercase tracking-widest">
                {user?.role === 'admin' ? 'Administration' : 'Navigation'}
              </div>
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink key={item.to} to={item.to} onClick={onClose} className="block">
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#0F62FE] text-white'
                          : 'text-[#C6C6C6] hover:bg-[#4D4D4D] hover:text-white'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#8D8D8D]'}`} />
                      <span>{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>

            {/* Footer User Info */}
            <div className="border-t border-[#393939] p-4 flex items-center gap-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#0F62FE] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-[#8D8D8D] capitalize">{user?.role}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;
