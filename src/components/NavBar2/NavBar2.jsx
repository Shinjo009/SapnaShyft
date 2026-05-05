import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './navbar2.css';
import NavItem2 from './NavItem2';
import homeIcon from '../../images/home.svg';
import superCareIcon from '../../images/SuperCare.svg';
import superClubIcon from '../../images/SuperClub.svg';
import packagesIcon from '../../images/Packages.svg';
import { prefetchRouteChunk } from '../../utils/routePrefetch';

/**
 * Bottom navigation — compact active cell (10px 12px 6px), gap 3px,
 * border-top indicator, flex column centered. Icons ~20px (club/care ~23px).
 *
 * Props: `defaultActive`, `onNavigate`.
 */
export default function NavBar2({ defaultActive = 'home', onNavigate }) {
  const navItems = useMemo(
    () => [
      { id: 'home', label: 'Home', icon: homeIcon, iconSize: 20 },
      { id: 'packages', label: 'Packages', icon: packagesIcon, iconSize: 20 },
      { id: 'super-club', label: 'Super Club', icon: superClubIcon, iconSize: 23 },
      {
        id: 'super-sync',
        label: 'Super Care',
        icon: superCareIcon,
        iconSize: 23,
      },
    ],
    []
  );

  const [activeItem, setActiveItem] = useState(defaultActive);
  const prevDefaultActiveRef = useRef(null);

  useLayoutEffect(() => {
    if (prevDefaultActiveRef.current === defaultActive) {
      return;
    }
    prevDefaultActiveRef.current = defaultActive;
    setActiveItem(defaultActive);
  }, [defaultActive]);

  const handleItemClick = useCallback(
    (id) => {
      const clicked = navItems.find((item) => item.id === id);
      if (clicked?.locked) {
        return;
      }

      prefetchRouteChunk(id);

      if (id === activeItem) {
        onNavigate?.(id);
        return;
      }

      setActiveItem(id);
      onNavigate?.(id);
    },
    [activeItem, navItems, onNavigate]
  );

  return (
    <nav className="navbar2" aria-label="Main navigation">
      <div className="navbar2__glow">
        <div className="navbar2__bar">
          <div className="navbar2__rail">
            {navItems.map((item) => (
              <NavItem2
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                iconSize={item.iconSize}
                locked={Boolean(item.locked)}
                isActive={activeItem === item.id}
                onClick={handleItemClick}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
