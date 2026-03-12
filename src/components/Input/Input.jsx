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
 * - Background: rgba(255, 255, 255, 0.05)
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
  const isPhoneInput = type === 'tel';
  
  const baseClasses = `
    flex
    flex-col
    justify-center
    items-start
    self-stretch
    w-full
    h-10
    box-border
    px-[15px]
    py-[10px]
    rounded-lg
    border
    border-transparent
    bg-input-bg
    font-lato
    text-white
    text-label
    placeholder:text-label-gray
    focus:outline-none
    focus:border-white/20
    focus:shadow-[0_0_10px_0_rgba(144,223,158,0.30)]
    transition-all
  `.trim().replace(/\s+/g, ' ');

  const typeClasses = isPhoneInput ? 'text-[13px] placeholder:text-[13px] placeholder:leading-4' : '';
  
  const errorClasses = error ? 'border border-red-500' : '';
  
  return (
    <div className="w-full space-y-1">
      {label && (
        <Typography variant="label" as="label">
          {label}
        </Typography>
      )}
      <input
        type={type}
        inputMode={props.inputMode || (isPhoneInput ? 'numeric' : undefined)}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${baseClasses} ${typeClasses} ${errorClasses} ${className}`}
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