import React, { useEffect, useMemo, useRef, useState } from 'react';
import './NavBar.css';
import NavItem from './NavItem';
import homeIcon from '../../images/home.svg';
import superCareIcon from '../../images/SuperCare.svg';
import superClubIcon from '../../images/SuperClub.svg';
import packagesIcon from '../../images/Packages.svg';
import { prefetchRouteChunk } from '../../utils/routePrefetch';

let lastNavActiveItem = 'home';
let lastNavCenter = 53.999;

const getCenterForItem = (itemId, navWidth, navItems) => {
  const index = Math.max(0, navItems.findIndex((item) => item.id === itemId));
  const horizontalPadding = 14;
  const itemWidth = 72;
  const totalItemsWidth = itemWidth * navItems.length;
  const availableGapSpace = navWidth - horizontalPadding * 2 - totalItemsWidth;
  const gap = navItems.length > 1 ? availableGapSpace / (navItems.length - 1) : 0;
  return horizontalPadding + itemWidth / 2 + index * (itemWidth + gap);
};

/**
 * NavBar Component - Bottom navigation bar with 4 items
 * 
 * Props:
 * - defaultActive: Initial active item (default: 'home')
 * - onNavigate: Callback when navigation item is clicked
 */
const NavBar = ({ defaultActive = 'home', onNavigate }) => {
  const [activeItem, setActiveItem] = useState(lastNavActiveItem || defaultActive);
  const [navbarWidth, setNavbarWidth] = useState(null);
  const [animatedCenter, setAnimatedCenter] = useState(lastNavCenter);
  const [notchDepthScale, setNotchDepthScale] = useState(1);
  const [isNotchTransitioning, setIsNotchTransitioning] = useState(false);
  const navRef = useRef(null);
  const notchAnimationRef = useRef(null);
  const animatedCenterRef = useRef(lastNavCenter);

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
    lastNavActiveItem = defaultActive;
  }, [defaultActive]);

  useEffect(() => {
    return () => {
      if (notchAnimationRef.current !== null) {
        cancelAnimationFrame(notchAnimationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Single source of truth for navbar width. ResizeObserver delivers the
    // initial size through its own callback (from pre-computed `contentRect`,
    // not a forced layout read) inside the first animation frame, so we no
    // longer need a synchronous getBoundingClientRect() in useLayoutEffect —
    // that was a commit-phase reflow that showed up in Lighthouse.
    if (!navRef.current || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const measured = entry?.contentRect?.width || 0;
      if (measured > 0) {
        setNavbarWidth(measured);
      }
    });

    observer.observe(navRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleItemClick = (id) => {
    // Kick off the destination's lazy chunk before doing anything else so the
    // fetch overlaps with React's state update instead of blocking mount.
    prefetchRouteChunk(id);

    if (id === activeItem) {
      if (onNavigate) {
        onNavigate(id);
      }
      return;
    }

    setActiveItem(id);
    lastNavActiveItem = id;

    // Navigate immediately so destination rendering starts without delay.
    if (onNavigate) {
      onNavigate(id);
    }
  };

  useEffect(() => {
    const navWidth = navbarWidth || 360;
    const target = getCenterForItem(activeItem, navWidth, navItems);

    if (!Number.isFinite(target)) {
      return undefined;
    }

    if (notchAnimationRef.current !== null) {
      cancelAnimationFrame(notchAnimationRef.current);
      notchAnimationRef.current = null;
    }

    const from = animatedCenterRef.current;
    const delta = target - from;
    if (Math.abs(delta) < 0.5) {
      animatedCenterRef.current = target;
      lastNavCenter = target;
      setAnimatedCenter(target);
      setNotchDepthScale(1);
      setIsNotchTransitioning(false);
      return undefined;
    }

    const duration = 320;
    const minDepthScale = 0.14;
    const start = performance.now();
    const easeOutCubic = (t) => 1 - ((1 - t) ** 3);
    setIsNotchTransitioning(true);

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);
      const nextCenter = from + delta * eased;
      const flattenCurve = Math.sin(Math.PI * progress);
      const nextDepthScale = 1 - ((1 - minDepthScale) * flattenCurve);
      animatedCenterRef.current = nextCenter;
      lastNavCenter = nextCenter;
      setAnimatedCenter(nextCenter);
      setNotchDepthScale(nextDepthScale);

      if (progress < 1) {
        notchAnimationRef.current = requestAnimationFrame(tick);
      } else {
        setNotchDepthScale(1);
        setIsNotchTransitioning(false);
        notchAnimationRef.current = null;
      }
    };

    notchAnimationRef.current = requestAnimationFrame(tick);

    return () => {
      if (notchAnimationRef.current !== null) {
        cancelAnimationFrame(notchAnimationRef.current);
        notchAnimationRef.current = null;
      }
      setIsNotchTransitioning(false);
    };
  }, [activeItem, navbarWidth, navItems]);

  useEffect(() => {
    const navWidth = navbarWidth || 360;
    const target = getCenterForItem(activeItem, navWidth, navItems);
    if (!Number.isFinite(target)) {
      return;
    }

    lastNavCenter = target;
  }, [activeItem, navbarWidth, navItems]);

  const getNotchGeometry = () => {
    const navWidth = navbarWidth || 360;
    const baseCenter = 53.999;

    // Keep notch aligned with visual icon centers from NavItem/NavBar CSS.
    const targetCenter = animatedCenter;
    const offset = targetCenter - baseCenter;

    // Tunable wedge geometry
    const wedgeWidthScale = 1.06 + (0.24 * notchDepthScale);
    const wedgeDepth = 28 * notchDepthScale;

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

    return {
      navWidth,
      wedgeDepth,
      x1,
      cx1,
      cy1,
      cx2,
      cy2,
      x2,
      cx3,
      cy3,
      cx4,
      cy4,
      x3,
      x4,
    };
  };

  const getNavbarPath = () => {
    const { navWidth, wedgeDepth, x1, cx1, cy1, cx2, cy2, x2, cx3, cy3, cx4, cy4, x3, x4 } = getNotchGeometry();
    return `M${navWidth} 43H0V0H${x1}C${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${wedgeDepth}C${cx3} ${cy3} ${cx4} ${cy4} ${x3} 0.00585938L${x4} 0H${navWidth}V43Z`;
  };

  return (
    <nav className={`navbar ${isNotchTransitioning ? 'navbar--transitioning' : ''}`} ref={navRef}>
      <svg className="navbar__notch-svg" viewBox={`0 0 ${navbarWidth || 360} 43`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="navbar-gradient" x1="0" y1="43" x2="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(6, 53, 51, 0.65)" />
            <stop offset="1" stopColor="rgba(0, 0, 0, 0.65)" />
          </linearGradient>
        </defs>
        <path
          className="navbar__notch-path"
          d={getNavbarPath()}
          fill="url(#navbar-gradient)"
          stroke="none"
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
