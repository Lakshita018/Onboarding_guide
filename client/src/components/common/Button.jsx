import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon = null,
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-sm transition-all duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0F62FE]';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-sm',
  };

  const variants = {
    primary:
      'bg-[#0F62FE] text-white hover:bg-[#0353E9] active:bg-blue-900 disabled:bg-[#C6C6C6] disabled:text-[#8D8D8D] disabled:cursor-not-allowed',
    secondary:
      'bg-[#393939] text-white hover:bg-[#262626] active:bg-[#161616] disabled:bg-[#C6C6C6] disabled:text-[#8D8D8D] disabled:cursor-not-allowed',
    outline:
      'border border-[#8D8D8D] text-[#161616] bg-transparent hover:bg-[#F4F4F4] active:bg-[#E0E0E0] disabled:text-[#C6C6C6] disabled:border-[#C6C6C6] disabled:cursor-not-allowed',
    danger:
      'bg-[#DA1E28] text-white hover:bg-red-700 active:bg-red-900 disabled:bg-[#C6C6C6] disabled:cursor-not-allowed',
    ghost:
      'text-[#0F62FE] bg-transparent hover:bg-[#EDF4FF] active:bg-blue-100 disabled:text-[#C6C6C6] disabled:cursor-not-allowed',
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      whileHover={!isDisabled ? { scale: 1.01 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Processing...
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default Button;
