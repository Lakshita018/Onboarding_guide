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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

const Topbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'IBM OnboardAI';
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
      {/* Page Title */}
      <div>
        <h1 className="text-sm font-semibold text-[#161616]">{pageTitle}</h1>
        <p className="text-[10px] text-[#8D8D8D]">IBM OnboardAI Platform</p>
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
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm hover:bg-[#F4F4F4] transition-colors"
            whileHover={{ scale: 1.01 }}
          >
            <div className="w-7 h-7 rounded-full bg-[#0F62FE] flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-[#161616] leading-tight">
                {user?.name}
              </p>
              <div className="flex items-center gap-1">
                {user?.role === 'admin' ? (
                  <Shield className="w-2.5 h-2.5 text-[#0F62FE]" />
                ) : null}
                <span className="text-[10px] text-[#8D8D8D] capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#8D8D8D] transition-transform hidden sm:block ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-[#E0E0E0] rounded-sm shadow-lg z-50 overflow-hidden"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-[#F4F4F4]">
                  <p className="text-xs font-semibold text-[#161616]">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-[#8D8D8D] mt-0.5 capitalize">
                    {user?.role} Account
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <DropdownItem
                    icon={User}
                    label="Profile"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <DropdownItem
                    icon={Settings}
                    label="Settings"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="border-t border-[#F4F4F4] my-1" />
                  <DropdownItem
                    icon={LogOut}
                    label="Sign Out"
                    danger
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

const DropdownItem = ({ icon: Icon, label, onClick, danger = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2 text-xs font-medium transition-colors ${
      danger
        ? 'text-[#DA1E28] hover:bg-[#FFF1F1]'
        : 'text-[#161616] hover:bg-[#F4F4F4]'
    }`}
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </button>
);

export default Topbar;
