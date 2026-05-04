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
export default function NavItem({
  id,
  label,
  icon,
  isActive,
  onClick,
  iconSize = 23,
  locked = false,
  useFloatingActiveOrb = false,
  hideActiveIconInItem = false,
}) {
  const iconStyle = {
    '--nav-icon-size': `${iconSize}px`,
    filter:
      isActive && !useFloatingActiveOrb
        ? 'brightness(0) saturate(100%) invert(18%) sepia(18%) saturate(1454%) hue-rotate(145deg) brightness(96%) contrast(93%)'
        : 'none',
  };

  return (
    <button
      className={`nav-item ${isActive ? 'nav-item--active' : ''} ${useFloatingActiveOrb ? 'nav-item--floating-orb-mode' : ''} ${
        hideActiveIconInItem && isActive ? 'nav-item--hide-active-icon' : ''
      } ${locked ? 'nav-item--locked' : ''}`}
      onClick={() => {
        if (locked) {
          return;
        }
        onClick(id);
      }}
      aria-label={locked ? `${label} (unavailable)` : label}
      aria-disabled={locked ? true : undefined}
      aria-current={isActive ? 'page' : undefined}
      type="button"
      data-tour={id === 'super-sync' ? 'nav-super-care' : id === 'packages' ? 'nav-packages' : undefined}
    >
      <div className="nav-item__icon-wrapper">
        <div className={`nav-item__circle ${isActive ? 'is-active' : ''}`} />
        <div className="nav-item__icon-slot">
          <img src={icon} alt="" className="nav-item__icon" style={iconStyle} />
          {locked ? (
            <span className="nav-item__lock-badge" aria-hidden="true">
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
        </div>
      </div>
      <span className="nav-item__label" aria-hidden={isActive}>
        {label}
      </span>
    </button>
  );
}
