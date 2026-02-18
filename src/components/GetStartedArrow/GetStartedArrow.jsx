import React from 'react';
import PropTypes from 'prop-types';

/**
 * GetStartedArrow Component - Arrow with opacity gradient for Get Started button
 * 
 * Props:
 * - opacity: One of '100' (100%), '80' (80%), '60' (60%)
 */
const GetStartedArrow = ({ opacity = '100' }) => {
  // Map opacity values to hex alpha values
  const opacityMap = {
    '100': 'FF', // 100% - #FFFFFFFF
    '80': 'CC',  // 80% - #FFFFFFCC
    '60': '99',  // 60% - #FFFFFF99
  };

  const color = `#FFFFFF${opacityMap[opacity]}`;

  return (
    <svg 
      width="14" 
      height="28" 
      viewBox="0 0 14 28" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M10.0994 14L1.84994 22.2495L3.49961 23.8992L12.5739 14.8248C12.7927 14.606 12.9155 14.3094 12.9155 14C12.9155 13.6906 12.7927 13.3939 12.5739 13.1752L3.49961 4.10083L1.84994 5.7505L10.0994 14Z" 
        fill={color}
      />
    </svg>
  );
};

GetStartedArrow.propTypes = {
  /** Opacity level: '100' (100%), '80' (80%), '60' (60%) */
  opacity: PropTypes.oneOf(['100', '80', '60']),
};

export default GetStartedArrow;
