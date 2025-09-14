// Simple Button Component
// A reusable button component with different styles and sizes

import React from 'react';

/**
 * Button Component
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Button content (text, icons, etc.)
 * @param {string} props.variant - Button style variant ('default', 'outline', 'secondary', 'destructive')
 * @param {string} props.size - Button size ('sm', 'default', 'lg')
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {Function} props.onClick - Click handler function
 * @param {Object} props.otherProps - Any other button props (type, id, etc.)
 */
const Button = ({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  disabled = false,
  onClick,
  ...otherProps 
}) => {
  // Base button styles that apply to all buttons
  const baseStyles = `
    inline-flex items-center justify-center gap-2 
    rounded-md font-medium transition-colors 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Different button style variants
  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 shadow-sm',
    destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
  };

  // Different button sizes
  const sizeStyles = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-10 px-4 py-2',
    lg: 'h-12 px-8 text-lg'
  };

  // Combine all styles
  const buttonClasses = `
    ${baseStyles} 
    ${variantStyles[variant] || variantStyles.default} 
    ${sizeStyles[size] || sizeStyles.default} 
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...otherProps}
    >
      {children}
    </button>
  );
};

export default Button;
