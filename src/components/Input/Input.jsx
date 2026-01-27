import React from 'react';
import PropTypes from 'prop-types';
import Typography from '../Typography';

/**
 * Input Component - Styled input field based on Figma specs
 * 
 * Specs:
 * - Height: 40px
 * - Padding: 0 16px
 * - Border radius: 8px
 * - Border: 0.838px solid rgba(221, 219, 219, 0.20)
 * - Background: rgba(4, 251, 206, 0.10)
 */
const Input = ({ 
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  className = '',
  ...props 
}) => {
  
  const baseClasses = `
    flex
    flex-col
    justify-center
    items-start
    w-full
    h-10
    px-4
    rounded-lg
    bg-input-bg
    border
    border-input-border
    font-lato
    text-white
    text-sm
    placeholder:text-label-gray
    focus:outline-none
    focus:border-input-focus
    transition-colors
  `.trim().replace(/\s+/g, ' ');
  
  const errorClasses = error ? 'border-red-500' : '';
  
  return (
    <div className="w-full space-y-1">
      {label && (
        <Typography variant="label" as="label">
          {label}
        </Typography>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${baseClasses} ${errorClasses} ${className}`}
        {...props}
      />
      {error && (
        <Typography variant="label" className="text-red-500">
          {error}
        </Typography>
      )}
    </div>
  );
};

Input.propTypes = {
  /** Label text above input */
  label: PropTypes.string,
  /** Input type (text, email, tel, password, etc.) */
  type: PropTypes.string,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Input value */
  value: PropTypes.string,
  /** Change handler */
  onChange: PropTypes.func,
  /** Error message to display */
  error: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Input;