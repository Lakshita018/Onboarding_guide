import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronLeft,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

const NavItem = ({ item, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === item.to;

  return (
    <NavLink to={item.to} className="block">
      <motion.div
        className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors relative overflow-hidden cursor-pointer ${
          isActive
            ? 'bg-[#0F62FE] text-white'
            : 'text-[#C6C6C6] hover:bg-[#4D4D4D] hover:text-white'
        }`}
        whileHover={{ x: isActive ? 0 : 2 }}
        transition={{ duration: 0.15 }}
      >
        {isActive && (
          <motion.div
            className="absolute left-0 top-0 w-0.5 h-full bg-white opacity-60"
            layoutId="activeBar"
          />
        )}
        <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#8D8D8D]'}`} />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap overflow-hidden"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </NavLink>
  );
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const navItems = user?.role === 'admin' ? ADMIN_NAV : EMPLOYEE_NAV;

  return (
    <motion.aside
      className="bg-[#262626] text-white flex flex-col h-screen flex-shrink-0 relative z-10 border-r border-[#393939]"
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-14 border-b border-[#393939] px-4 flex-shrink-0 overflow-hidden ${
          collapsed ? 'justify-center' : 'gap-3'
        }`}
      >
        <div className="w-7 h-7 bg-[#0F62FE] rounded-sm flex items-center justify-center flex-shrink-0">
          <Cpu className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className="text-sm font-bold text-white tracking-tight whitespace-nowrap">
                IBM Onboarding
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-semibold text-[#6F6F6F] uppercase tracking-widest">
            {user?.role === 'admin' ? 'Administration' : 'Navigation'}
          </div>
        )}
        {navItems.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User Info */}
      <div className={`border-t border-[#393939] p-3 flex-shrink-0 overflow-hidden ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0F62FE] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-[#8D8D8D] capitalize">{user?.role}</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#0F62FE] flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 w-6 h-6 bg-[#393939] border border-[#525252] rounded-full flex items-center justify-center text-[#C6C6C6] hover:text-white hover:bg-[#525252] transition-colors z-20"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
