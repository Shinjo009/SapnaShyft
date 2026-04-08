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
 */
const NavItem = ({ id, label, icon, isActive, onClick, iconSize = 23 }) => {
  const iconStyle = {
    width: `${iconSize}px`,
    height: `${iconSize}px`,
    filter: isActive
      ? 'brightness(0) saturate(100%) invert(18%) sepia(18%) saturate(1454%) hue-rotate(145deg) brightness(96%) contrast(93%)'
      : 'none',
  };

  return (
    <button
      className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
      onClick={() => onClick(id)}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      type="button"
      data-tour={id === 'super-sync' ? 'nav-super-care' : id === 'packages' ? 'nav-packages' : undefined}
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
      <span className="nav-item__label" aria-hidden={isActive}>{label}</span>
    </button>
  );
};

export default NavItem;
