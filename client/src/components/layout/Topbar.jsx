import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Shield,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Breadcrumbs from './Breadcrumbs';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/documents': 'My Documents',
  '/checklist': 'Onboarding Checklist',
  '/setup': 'Setup Guide',
  '/access': 'Access Requests',
  '/learning': 'Learning Resources',
  '/chat': 'AI Assistant',
  '/admin': 'Admin Dashboard',
  '/admin/employees': 'Employees',
  '/admin/tasks': 'Task Manager',
  '/admin/documents': 'Document Review',
  '/admin/reports': 'Reports',
};

const Topbar = ({ onMenuClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'IBM Onboarding';
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-[#E0E0E0] flex items-center justify-between px-6 flex-shrink-0 z-10">
      {/* Page Title & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger menu */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 mr-1 rounded-md text-[#525252] hover:bg-[#F4F4F4] hover:text-[#161616] md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
        <h1 className="sm:hidden text-sm font-semibold text-[#161616] truncate max-w-[150px]">{pageTitle}</h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <motion.button
          className="relative p-2 rounded-sm text-[#525252] hover:bg-[#F4F4F4] hover:text-[#161616] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#DA1E28] rounded-full" />
        </motion.button>

        {/* Divider */}
        <div className="w-px h-5 bg-[#E0E0E0]" />

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-sm hover:bg-[#F4F4F4] transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            {/* Avatar initials */}
            <div className="w-7 h-7 bg-[#EDF4FF] border border-[#0F62FE]/15 rounded-full flex items-center justify-center text-[#0F62FE] text-xs font-bold">
              {initials}
            </div>
            {/* User name & role info */}
            <div className="hidden sm:block text-left max-w-[100px]">
              <p className="text-xs font-semibold text-[#161616] leading-none truncate">{user?.name}</p>
              <p className="text-[10px] text-[#8D8D8D] leading-none capitalize mt-0.5">{user?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#525252]" />
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-1.5 w-44 bg-white border border-[#E0E0E0] rounded-sm shadow-lg overflow-hidden py-1 z-30"
              >
                <div className="px-3 py-2 border-b border-[#F4F4F4] sm:hidden">
                  <p className="text-xs font-semibold text-[#161616] truncate">{user?.name}</p>
                  <p className="text-[10px] text-[#8D8D8D] capitalize mt-0.5">{user?.role}</p>
                </div>
                
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    // Profile details action placeholder
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#161616] hover:bg-[#F4F4F4] transition-colors flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-[#8D8D8D]" />
                  Profile details
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    // Settings panel action placeholder
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#161616] hover:bg-[#F4F4F4] transition-colors flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5 text-[#8D8D8D]" />
                  Settings
                </button>
                
                <div className="h-px bg-[#E0E0E0] my-1" />

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#DA1E28] hover:bg-[#FFF1F1] transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout session
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
