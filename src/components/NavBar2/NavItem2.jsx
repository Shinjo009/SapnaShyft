import React, { forwardRef } from 'react';
import './navbar2.css';

/**
 * Single BNB-14 tab — Figma shows label only on active item; aria-label always from parent button.
 */
const NavItem2 = forwardRef(function NavItem2(
  { id, label, icon, iconSize = 20, isActive, locked = false, onClick },
  ref
) {
  const iconStyle = {
    '--nav2-icon-size': `${iconSize}px`,
  };

  return (
    <button
      ref={ref}
      type="button"
      className={`navbar2__slot ${isActive ? 'navbar2__slot--active' : ''} ${locked ? 'navbar2__slot--locked' : ''}`}
      onClick={() => {
        if (!locked) {
          onClick(id);
        }
      }}
      aria-label={locked ? `${label} (unavailable)` : label}
      aria-disabled={locked ? true : undefined}
      aria-current={isActive ? 'page' : undefined}
      data-tour={
        id === 'super-sync' ? 'nav-super-care' : id === 'packages' ? 'nav-packages' : undefined
      }
    >
      <span className="navbar2__icon-wrap" aria-hidden="true">
        <img src={icon} alt="" className="navbar2__icon" style={iconStyle} />
      </span>
      {isActive ? (
        <span className="navbar2__label">{label}</span>
      ) : null}
    </button>
  );
});

export default NavItem2;
