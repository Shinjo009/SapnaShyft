import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './NavBar.css';
import NavItem from './NavItem';
import homeIcon from '../../images/home.svg';
import superCareIcon from '../../images/SuperCare.svg';
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
  const [navbarWidth, setNavbarWidth] = useState(null);
  const [isNotchReady, setIsNotchReady] = useState(false);
  const navRef = useRef(null);
  const navigateTimerRef = useRef(null);

  const navItems = useMemo(
    () => [
      { id: 'home', label: 'Home', icon: homeIcon, iconSize: 19 },
      { id: 'super-sync', label: 'Super Care', icon: superCareIcon, iconSize: 23 },
      { id: 'super-club', label: 'Super Club', icon: superClubIcon, iconSize: 23 },
      { id: 'packages', label: 'Packages', icon: packagesIcon, iconSize: 19 },
    ],
    []
  );

  useEffect(() => {
    setActiveItem(defaultActive);
  }, [defaultActive]);

  useEffect(() => {
    return () => {
      if (navigateTimerRef.current) {
        clearTimeout(navigateTimerRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (!navRef.current) {
      return;
    }

    const measured = navRef.current.getBoundingClientRect().width;
    if (measured > 0) {
      setNavbarWidth(measured);
      setIsNotchReady(true);
    }
  }, []);

  useEffect(() => {
    if (!navRef.current || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const measured = entry?.contentRect?.width || 0;
      if (measured > 0) {
        setNavbarWidth(measured);
        setIsNotchReady(true);
      }
    });

    observer.observe(navRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleItemClick = (id) => {
    if (id === activeItem) {
      if (onNavigate) {
        onNavigate(id);
      }
      return;
    }

    setActiveItem(id);

    if (onNavigate) {
      if (navigateTimerRef.current) {
        clearTimeout(navigateTimerRef.current);
      }

      // Brief delay allows the icon pop animation to play before route transition.
      navigateTimerRef.current = setTimeout(() => {
        onNavigate(id);
      }, 140);
    }
  };

  const getNotchGeometry = () => {
    const navWidth = navbarWidth || 360;
    const index = Math.max(0, navItems.findIndex((item) => item.id === activeItem));
    const baseCenter = 53.999;

    // Keep notch aligned with visual icon centers from NavItem/NavBar CSS.
    const horizontalPadding = 14;
    const itemWidth = 72;
    const totalItemsWidth = itemWidth * navItems.length;
    const availableGapSpace = navWidth - horizontalPadding * 2 - totalItemsWidth;
    const gap = navItems.length > 1 ? availableGapSpace / (navItems.length - 1) : 0;
    const targetCenter = horizontalPadding + itemWidth / 2 + index * (itemWidth + gap);
    const offset = targetCenter - baseCenter;

    // Tunable wedge geometry
    const wedgeWidthScale = 1.1;
    const wedgeDepth = 28;

    const scaleAroundCenter = (value) => {
      const delta = value - baseCenter;
      return baseCenter + delta * wedgeWidthScale;
    };

    const x1 = scaleAroundCenter(15.999) + offset;
    const cx1 = scaleAroundCenter(27.4988) + offset;
    const cy1 = 0.000794526;
    const cx2 = scaleAroundCenter(32.0001) + offset;
    const cy2 = wedgeDepth;
    const x2 = 53.999 + offset;
    const cx3 = scaleAroundCenter(75.8262) + offset;
    const cy3 = wedgeDepth;
    const cx4 = scaleAroundCenter(79.9357) + offset;
    const cy4 = 0.505321;
    const x3 = scaleAroundCenter(93.6729) + offset;
    const x4 = scaleAroundCenter(93.999) + offset;

    return { navWidth, wedgeDepth, x1, cx1, cy1, cx2, cy2, x2, cx3, cy3, cx4, cy4, x3, x4 };
  };

  const getNavbarMiddlePath = () => {
    const sideStaticWidth = 8;
    const { navWidth, wedgeDepth, x1, cx1, cy1, cx2, cy2, x2, cx3, cy3, cx4, cy4, x3, x4 } = getNotchGeometry();
    const middleStart = sideStaticWidth;
    const middleEnd = navWidth - sideStaticWidth;

    return `M${middleEnd} 43H${middleStart}V0H${x1}C${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${wedgeDepth}C${cx3} ${cy3} ${cx4} ${cy4} ${x3} 0.00585938L${x4} 0H${middleEnd}V43Z`;
  };

  const getNavbarLeftCapPath = () => {
    const navWidth = navbarWidth || 360;
    const sideStaticWidth = 8;
    const leftEnd = Math.min(sideStaticWidth, navWidth / 2);
    return `M${leftEnd} 43H0V0H${leftEnd}V43Z`;
  };

  const getNavbarRightCapPath = () => {
    const navWidth = navbarWidth || 360;
    const sideStaticWidth = 8;
    const rightStart = Math.max(navWidth - sideStaticWidth, navWidth / 2);
    return `M${navWidth} 43H${rightStart}V0H${navWidth}V43Z`;
  };

  return (
    <nav className="navbar" ref={navRef}>
      <svg className="navbar__notch-svg" viewBox={`0 0 ${navbarWidth || 360} 43`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="navbar-gradient" x1={(navbarWidth || 360) / 2} y1="43" x2={(navbarWidth || 360) / 2} y2="-40.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#063533" />
            <stop offset="1" stopColor="#186A9E" />
          </linearGradient>
        </defs>
        <path
          className="navbar__notch-cap"
          d={getNavbarLeftCapPath()}
          fill="url(#navbar-gradient)"
          fillOpacity="0.65"
        />
        <path
          className={`navbar__notch-path ${isNotchReady ? 'navbar__notch-path--ready' : ''}`}
          d={getNavbarMiddlePath()}
          fill="url(#navbar-gradient)"
          fillOpacity="0.65"
        />
        <path
          className="navbar__notch-cap"
          d={getNavbarRightCapPath()}
          fill="url(#navbar-gradient)"
          fillOpacity="0.65"
        />
      </svg>
      <div className="navbar__container">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            iconSize={item.iconSize}
            isActive={activeItem === item.id}
            onClick={handleItemClick}
          />
        ))}
      </div>
    </nav>
  );
};

export default NavBar;
