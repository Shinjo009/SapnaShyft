import React, { useState } from 'react';
import './NavBar.css';
import NavItem from './NavItem';
import homeIcon from '../../images/home.svg';
import superSyncIcon from '../../images/SuperSync.svg';
import superClubIcon from '../../images/SuperClub.svg';
import packagesIcon from '../../images/Packages.svg';

/**
 * NavBar Component - Bottom navigation bar with 4 items
 * 
 * Props:
 * - defaultActive: Initial active item (default: 'home')
 * - onNavigate: Callback when navigation item is clicked
 */
const NavBar = ({ defaultActive = 'home', onNavigate }) => {
  const [activeItem, setActiveItem] = useState(defaultActive);

  const navItems = [
    { id: 'home', label: 'Home', icon: homeIcon, width: '21.7px', height: '23.734px' },
    { id: 'super-sync', label: 'Super Sync', icon: superSyncIcon },
    { id: 'super-club', label: 'Super Club', icon: superClubIcon },
    { id: 'packages', label: 'Packages', icon: packagesIcon, width: '24.413px', height: '24.413px', flexShrink: 0 },
  ];

  const handleItemClick = (id) => {
    setActiveItem(id);
    if (onNavigate) {
      onNavigate(id);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            isActive={activeItem === item.id}
            onClick={handleItemClick}
            width={item.width}
            height={item.height}
            flexShrink={item.flexShrink}
          />
        ))}
      </div>
    </nav>
  );
};

export default NavBar;
