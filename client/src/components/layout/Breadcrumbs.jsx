import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const PATH_MAP = {
  dashboard: 'Dashboard',
  documents: 'My Documents',
  checklist: 'Checklist',
  setup: 'Setup Guide',
  access: 'Access Requests',
  learning: 'Learning',
  chat: 'AI Assistant',
  admin: 'Admin Console',
  employees: 'Employees',
  tasks: 'Task Manager',
  reports: 'Reports',
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-[#525252] font-medium py-1 select-none">
      <Link 
        to="/" 
        className="flex items-center gap-1 hover:text-[#0F62FE] transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayLabel = PATH_MAP[value] || value.charAt(0).toUpperCase() + value.slice(1);

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-[#8D8D8D] flex-shrink-0" />
            {isLast ? (
              <span className="text-[#161616] font-semibold truncate max-w-[160px]">
                {displayLabel}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-[#0F62FE] transition-colors truncate max-w-[120px]"
              >
                {displayLabel}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
