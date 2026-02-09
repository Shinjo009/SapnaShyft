import React from 'react';
import PropTypes from 'prop-types';
import Typography from '../Typography';
import GenderArrow from '../../images/Gender-Arrow.svg';

/**
 * Select Component - Styled select dropdown field based on Figma specs
 * 
 * Specs:
 * - Height: 40px
 * - Padding: 0 16px
 * - Border radius: 8px
 * - Border: 0.838px solid rgba(221, 219, 219, 0.20)
 * - Background: rgba(4, 251, 206, 0.10)
 */
const Select = ({ 
  label,
  placeholder,
  value,
  onChange,
  options = [],
  error,
  className = '',
  ...props 
}) => {
  
  const baseClasses = `
    w-full
    h-10
    px-4
    rounded-lg
    bg-input-bg
    border
    border-input-border
    font-lato
    text-sm
    appearance-none
    cursor-pointer
    focus:outline-none
    focus:border-input-focus
    transition-colors
    text-left
  `.trim().replace(/\s+/g, ' ');
  
  const errorClasses = error ? 'border-red-500' : '';
  
  return (
    <div className="w-full space-y-1">
      <div className="relative w-full">
        <style>{`
          select option {
            background-color: #1a1a1a;
            color: white;
            padding: 8px 4px;
          }
          select option:checked {
            background: linear-gradient(#04fbce, #04fbce);
            background-color: #04fbce;
            color: black;
          }
          select {
            color: ${value ? 'white' : '#999'};
          }
        `}</style>
        <select
          value={value}
          onChange={onChange}
          className={`${baseClasses} ${errorClasses} ${className} pr-10`}
          {...props}
        >
          <option value="" disabled style={{ color: '#999' }}>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Arrow Icon */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <img src={GenderArrow} alt="dropdown arrow" className="w-5 h-5" />
        </div>
      </div>
      {error && (
        <Typography variant="label" className="text-red-500">
          {error}
        </Typography>
      )}
    </div>
  );
};

Select.propTypes = {
  /** Label text above select */
  label: PropTypes.string,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Select value */
  value: PropTypes.string,
  /** Change handler */
  onChange: PropTypes.func,
  /** Array of options with { value, label } */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  /** Error message to display */
  error: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Select;
