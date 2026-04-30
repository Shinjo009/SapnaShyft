import React from 'react';
import PropTypes from 'prop-types';
import brandLogo from '../../images/Cube/SuperShyft - white logo.svg';
import brandLogoWhite from '../../images/Cube/SuperShyft - white logo.svg';

/**
 * Logo Component - Reusable logo with configurable size
 *
 * variant="onDark" — white mark (same asset as SplashScreen2) for dark auth / welcome UIs.
 * variant="brand" — default red mark for light backgrounds.
 */
const Logo = ({
  size = 'md',
  variant = 'brand',
  className = '',
  alt = 'Supershyft',
  ...props
}) => {
  const src = variant === 'onDark' ? brandLogoWhite : brandLogo;

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  return (
    <div className={`app-supershyft-logo flex justify-center items-center ${className}`} {...props}>
      <img src={src} alt={alt} className={`${sizeClasses[size]} object-contain max-w-none`} />
    </div>
  );
};

Logo.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['brand', 'onDark']),
  className: PropTypes.string,
  alt: PropTypes.string,
};

export default Logo;