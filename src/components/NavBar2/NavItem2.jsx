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
        {locked ? (
          <span className="navbar2__lock-badge" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 12 12" fill="none">
              <rect x="2.25" y="5.25" width="7.5" height="5.25" rx="1" fill="currentColor" />
              <path
                d="M3.75 5.25V4.125C3.75 2.8125 4.6875 1.875 6 1.875C7.3125 1.875 8.25 2.8125 8.25 4.125V5.25"
                stroke="currentColor"
                strokeWidth="1.125"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>
        ) : null}
      </span>
      <span className={`navbar2__label ${isActive ? 'navbar2__label--concealed' : ''}`} aria-hidden={isActive}>
        {label}
      </span>
    </button>
  );
});

export default NavItem2;
