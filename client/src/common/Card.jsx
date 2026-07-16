import React from 'react';

const Card = ({ children, title, subtitle, className = '', headerActions }) => {
  return (
    <div className={`bg-white border border-gray-200 shadow-sm transition-shadow duration-150 hover:shadow-md ${className}`}>
      {(title || subtitle || headerActions) && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      <div className="px-6 py-5">
        {children}
      </div>
    </div>
  );
};

export default Card;
