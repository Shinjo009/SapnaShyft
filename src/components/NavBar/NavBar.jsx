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

  const getNavbarPath = () => {
    const navWidth = 360;
    const index = navItems.findIndex(item => item.id === activeItem);
    
    // Define exact center positions for each nav item
    const itemCenters = [45, 135, 225, 315]; // Center of each of the 4 sections
    const adjustments = [-7, -12, -4, 0]; // Manual adjustments for each item
    const notchCenter = 42; // Center point of the notch in the original SVG
    const offset = itemCenters[index] - notchCenter + adjustments[index];
    
    // Original notch coordinates, now offset
    const x1 = offset + 1.00098;
    const cx1 = offset + 12.5007;
    const cx2 = offset + 16.5007;
    const x2 = offset + 42; // Middle of curve
    const cx3 = offset + 67.4999;
    const cx4 = offset + 68.5005;
    const x3 = offset + 82.5;
    
    return `M${navWidth} 71H0V0H${x1}C${cx1} 0.000773432 ${cx2} 30.3581 ${x2} 30.3584C${cx3} 30.3584 ${cx4} 0.000176487 ${x3} 0H${navWidth}V71Z`;
  };

  return (
    <nav className="navbar">
      <svg className="navbar__notch-svg" viewBox="0 0 360 71" preserveAspectRatio="none">
        <path 
          d={getNavbarPath()}
          fill="rgba(0, 0, 0, 0.5)" 
          stroke="rgba(153, 153, 153, 0.2)" 
          strokeWidth="1"
        />
      </svg>
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
