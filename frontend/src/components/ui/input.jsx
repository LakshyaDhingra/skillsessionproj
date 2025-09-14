// Simple Input Component
// A reusable input field component with consistent styling

import React from 'react';

/**
 * Input Component
 * A styled input field that can be used throughout the application
 * @param {Object} props - Component properties
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Current input value
 * @param {Function} props.onChange - Function called when input changes
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.id - Input ID for labels
 * @param {boolean} props.required - Whether input is required
 * @param {Object} props.otherProps - Any other input props
 */
const Input = ({ 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  className = '', 
  disabled = false,
  id,
  required = false,
  ...otherProps 
}) => {
  // Base input styles
  const inputStyles = `
    flex h-10 w-full rounded-md border border-gray-300 
    bg-white px-3 py-2 text-sm 
    placeholder:text-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50
    transition-colors
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={inputStyles}
      disabled={disabled}
      id={id}
      required={required}
      {...otherProps}
    />
  );
};

export default Input;
