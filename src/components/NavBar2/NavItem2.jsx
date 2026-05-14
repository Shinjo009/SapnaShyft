import React, { forwardRef } from 'react';
import './navbar2.css';

/**
 * Single navbar tab — show label on inactive items, hide label on active item.
 * Aria-label always comes from the parent button.
 */
const NavItem2 = forwardRef(function NavItem2(
  { id, label, iconFilled, iconUnfilled, isActive, locked = false, onClick },
  ref
) {
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
        <img src={iconFilled} alt="" className="navbar2__icon navbar2__icon--filled" />
        <img src={iconUnfilled} alt="" className="navbar2__icon navbar2__icon--unfilled" />
      </span>
      <span className={`navbar2__label ${isActive ? 'navbar2__label--concealed' : ''}`} aria-hidden={isActive}>
        {label}
      </span>
    </button>
  );
});

export default NavItem2;
