import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-4 py-2 font-medium text-sm transition-all duration-150 outline-none flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#0F62FE] text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-500",
    secondary: "bg-[#393939] text-white hover:bg-gray-700 active:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-200"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
