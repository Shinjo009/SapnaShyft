import React from 'react';
import './NavItem.css';

/**
 * NavItem Component - Individual navigation item
 * 
 * Props:
 * - id: Unique identifier for the nav item
 * - label: Text label displayed below icon
 * - icon: SVG icon path
 * - isActive: Boolean indicating if this item is currently active
 * - onClick: Callback when item is clicked
 * - width: Optional custom width for icon
 * - height: Optional custom height for icon
 * - flexShrink: Optional flex-shrink value
 */
const NavItem = ({ id, label, icon, isActive, onClick, width, height, flexShrink }) => {
  const iconStyle = {
    filter: isActive ? 'brightness(0) saturate(100%) invert(31%) sepia(10%) saturate(2239%) hue-rotate(131deg) brightness(94%) contrast(92%)' : 'none',
    ...(width && { width }),
    ...(height && { height }),
    ...(flexShrink !== undefined && { flexShrink }),
  };

  return (
    <button
      className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
      onClick={() => onClick(id)}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="nav-item__icon-wrapper">
        {isActive && <div className="nav-item__circle" />}
        <img 
          src={icon} 
          alt="" 
          className="nav-item__icon"
          style={iconStyle}
        />
      </div>
      <span className="nav-item__label">{label}</span>
    </button>
  );
};

export default NavItem;
