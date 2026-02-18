import React from 'react';
import PropTypes from 'prop-types';
import Typography from '../Typography';

/**
 * Button Component - Primary button based on Figma specs
 * 
 * Specs:
 * - Height: 40px
 * - Padding: 10px 24px
 * - Border radius: 24px
 * - Border: 1px solid #969696
 * - Background: linear-gradient(90deg, #296359 0%, #41AB99 100%)
 * - Box shadow: 0 12px 20px 0 rgba(255, 255, 255, 0.15)
 */
const Button = ({ 
  children,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  
  const baseClasses = `
    flex
    justify-center
    items-center
    gap-2
    w-full
    h-10
    px-6
    py-2.5
    rounded-3xl
    border
    border-button-border
    transition-all
    duration-200
  `.trim().replace(/\s+/g, ' ');
  
  const stateClasses = disabled || loading
    ? 'opacity-50 cursor-not-allowed'
    : 'hover:opacity-90 active:scale-[0.98] cursor-pointer';
  
  return (
    <button
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${stateClasses} ${className}`}
      style={{
        background: 'linear-gradient(90deg, #296359 0%, #41AB99 100%)',
        boxShadow: '0 12px 20px 0 rgba(255, 255, 255, 0.15)'
      }}
      {...props}
    >
      {loading ? (
        <Typography variant="button">Loading...</Typography>
      ) : (
        <Typography variant="button">{children}</Typography>
      )}
    </button>
  );
};

Button.propTypes = {
  /** Button text */
  children: PropTypes.node.isRequired,
  /** Click handler */
  onClick: PropTypes.func,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Loading state */
  loading: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Button;
