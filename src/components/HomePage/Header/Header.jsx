import React from 'react';
import './Header.css';

/**
 * Header Component - HomePage header with greeting, menu, and search
 * 
 * Props:
 * - name: User name to display in greeting
 * - onMenuClick: Callback when hamburger menu is clicked
 * - onSearchClick: Callback when search icon is clicked
 */
const Header = ({ name = 'User', onMenuClick, onSearchClick }) => {
  return (
    <header className="header">
      <div className="header__container">
        {/* Hamburger Menu */}
        <button 
          className="header__menu-btn"
          onClick={onMenuClick}
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.75 6H20.25M3.75 12H20.25M3.75 18H20.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Greeting Text */}
        <h1 className="header__greeting">Hello {name}!</h1>

        {/* Search Icon */}
        <button 
          className="header__search-btn"
          onClick={onSearchClick}
          aria-label="Search"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 14H14.71L14.43 13.73C15.0549 13.0039 15.5117 12.1487 15.7675 11.2256C16.0234 10.3024 16.072 9.33413 15.91 8.38998C15.44 5.60998 13.12 3.38997 10.32 3.04997C9.33559 2.92544 8.33576 3.02775 7.397 3.34906C6.45824 3.67038 5.60542 4.20219 4.90381 4.90381C4.20219 5.60542 3.67038 6.45824 3.34906 7.397C3.02775 8.33576 2.92544 9.33559 3.04997 10.32C3.38997 13.12 5.60998 15.44 8.38998 15.91C9.33413 16.072 10.3024 16.0234 11.2256 15.7675C12.1487 15.5117 13.0039 15.0549 13.73 14.43L14 14.71V15.5L18.25 19.75C18.66 20.16 19.33 20.16 19.74 19.75C20.15 19.34 20.15 18.67 19.74 18.26L15.5 14ZM9.49997 14C7.00997 14 4.99997 11.99 4.99997 9.49997C4.99997 7.00997 7.00997 4.99997 9.49997 4.99997C11.99 4.99997 14 7.00997 14 9.49997C14 11.99 11.99 14 9.49997 14Z" fill="white"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
