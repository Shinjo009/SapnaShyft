import React from 'react';
import PropTypes from 'prop-types';
import brandLogo from '../../images/SuperShyft - Logo [Final]-03 4.png';

/**
 * Logo Component - Reusable logo with configurable size
 * 
 * Can be used in:
 * - Headers
 * - Login/Signup screens
 * - Splash screens
 * - Navigation bars
 */
const Logo = ({ 
  size = 'md',
  className = '',
  alt = 'Supershyft',
  ...props 
}) => {
  
  // Size presets (can be customized per design)
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };
  
  return (
    <div className={`app-supershyft-logo flex justify-center items-center ${className}`} {...props}>
      <img
        src={brandLogo}
        alt={alt}
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
};

Logo.propTypes = {
  /** Size preset: sm (48px), md (64px), lg (96px), xl (128px) */
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Alt text for accessibility */
  alt: PropTypes.string,
};

export default Logo;