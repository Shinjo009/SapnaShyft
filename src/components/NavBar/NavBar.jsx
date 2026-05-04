import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './NavBar.css';
import NavItem from './NavItem';
import homeIcon from '../../images/home.svg';
import superCareIcon from '../../images/SuperCare.svg';
import superClubIcon from '../../images/SuperClub.svg';
import packagesIcon from '../../images/Packages.svg';
import { prefetchRouteChunk } from '../../utils/routePrefetch';

const ORB_HALF = 20;
/** One motion curve for orb, notch, and floating icon (ms). */
const NAV_MOVE_DURATION_MS = 360;
/** easeInOutCubic — smooth acceleration and deceleration */
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const getCenterForItem = (itemId, navWidth, navItems) => {
  const index = Math.max(0, navItems.findIndex((item) => item.id === itemId));
  const horizontalPadding = 14;
  const itemWidth = 72;
  const totalItemsWidth = itemWidth * navItems.length;
  const availableGapSpace = navWidth - horizontalPadding * 2 - totalItemsWidth;
  const gap = navItems.length > 1 ? availableGapSpace / (navItems.length - 1) : 0;
  return horizontalPadding + itemWidth / 2 + index * (itemWidth + gap);
};

const buildNotchGeometry = (navWidth, centerX) => {
  const baseCenter = 53.999;
  const offset = centerX - baseCenter;
  const wedgeWidthScale = 1.3;
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

const buildNavbarPathString = (navWidth, centerX) => {
  const { wedgeDepth, x1, cx1, cy1, cx2, cy2, x2, cx3, cy3, cx4, cy4, x3, x4 } = buildNotchGeometry(
    navWidth,
    centerX
  );
  return `M${navWidth} 43H0V0H${x1}C${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${wedgeDepth}C${cx3} ${cy3} ${cx4} ${cy4} ${x3} 0.00585938L${x4} 0H${navWidth}V43Z`;
};

function applyDomNavVisuals(pathEl, orbEl, liftEl, centerX, navWidth, { liftY = 0, liftOpacity = 1 }) {
  const d = buildNavbarPathString(navWidth, centerX);
  if (pathEl) {
    pathEl.setAttribute('d', d);
  }
  const tx = `${centerX - ORB_HALF}px`;
  if (orbEl) {
    orbEl.style.transform = `translate3d(${tx}, 0, 0)`;
  }
  if (liftEl) {
    liftEl.style.transform = `translate3d(${tx}, ${liftY}px, 0)`;
    liftEl.style.opacity = String(liftOpacity);
  }
}

/**
 * NavBar Component - Bottom navigation bar with 4 items
 *
 * Props:
 * - defaultActive: Initial active item (default: 'home')
 * - onNavigate: Callback when navigation item is clicked
 */
const NavBar = ({ defaultActive = 'home', onNavigate }) => {
  const navItems = useMemo(
    () => [
      { id: 'home', label: 'Home', icon: homeIcon, iconSize: 19 },
      { id: 'packages', label: 'Packages', icon: packagesIcon, iconSize: 19 },
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
  const [navbarWidth, setNavbarWidth] = useState(null);
  const navRef = useRef(null);
  const notchPathRef = useRef(null);
  const orbRef = useRef(null);
  const liftRef = useRef(null);
  const notchAnimationRef = useRef(null);
  /** Must match this mount’s tab — never reuse a previous page’s orb X (causes huge cross-screen rAF + jank). */
  const animatedCenterRef = useRef(getCenterForItem(defaultActive, 360, navItems));
  const activeItemRef = useRef(activeItem);
  activeItemRef.current = activeItem;

  const floatingNavItem = navItems.find((item) => item.id === activeItem) || navItems[0];

  const prevDefaultActiveRef = useRef(null);
  useLayoutEffect(() => {
    if (prevDefaultActiveRef.current === defaultActive) {
      return;
    }
    prevDefaultActiveRef.current = defaultActive;
    const w = navbarWidth || 360;
    setActiveItem(defaultActive);
    animatedCenterRef.current = getCenterForItem(defaultActive, w, navItems);
  }, [defaultActive, navbarWidth, navItems]);

  useEffect(() => {
    return () => {
      if (notchAnimationRef.current !== null) {
        cancelAnimationFrame(notchAnimationRef.current);
      }
    };
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
      }
    });

    observer.observe(navRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  /**
   * When the bar is measured or resized, snap geometry to the current tab (no `activeItem`
   * dep — avoids running before the move animation and canceling the glide).
   */
  useLayoutEffect(() => {
    if (!navbarWidth || !navRef.current) {
      return;
    }
    if (navRef.current.classList.contains('navbar--transitioning')) {
      return;
    }
    const w = navbarWidth;
    const pathEl = notchPathRef.current;
    const orbEl = orbRef.current;
    const liftEl = liftRef.current;
    if (!pathEl || !orbEl || !liftEl) {
      return;
    }
    const c = getCenterForItem(activeItemRef.current, w, navItems);
    animatedCenterRef.current = c;
    applyDomNavVisuals(pathEl, orbEl, liftEl, c, w, { liftY: 0, liftOpacity: 1 });
    navRef.current.classList.add('navbar--active-icon-in-float');
  }, [navbarWidth, navItems]);

  const handleItemClick = useCallback(
    (id) => {
      const clicked = navItems.find((item) => item.id === id);
      if (clicked?.locked) {
        return;
      }

      prefetchRouteChunk(id);

      if (id === activeItem) {
        if (onNavigate) {
          onNavigate(id);
        }
        return;
      }

      setActiveItem(id);

      if (onNavigate) {
        onNavigate(id);
      }
    },
    [activeItem, navItems, onNavigate]
  );

  useEffect(() => {
    const navWidth = navbarWidth || 360;
    const pathEl = notchPathRef.current;
    const orbEl = orbRef.current;
    const liftEl = liftRef.current;
    const navEl = navRef.current;

    if (!pathEl || !orbEl || !liftEl || !navEl) {
      return undefined;
    }

    const target = getCenterForItem(activeItem, navWidth, navItems);
    if (!Number.isFinite(target)) {
      return undefined;
    }

    if (notchAnimationRef.current !== null) {
      cancelAnimationFrame(notchAnimationRef.current);
      notchAnimationRef.current = null;
    }

    const reduceMotion =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const from = animatedCenterRef.current;
    const delta = target - from;

    const finish = () => {
      animatedCenterRef.current = target;
      applyDomNavVisuals(pathEl, orbEl, liftEl, target, navWidth, { liftY: 0, liftOpacity: 1 });
      navEl.classList.add('navbar--active-icon-in-float');
      navEl.classList.remove('navbar--transitioning');
      orbEl.style.removeProperty('will-change');
      liftEl.style.removeProperty('will-change');
      notchAnimationRef.current = null;
    };

    if (Math.abs(delta) < 0.5 || reduceMotion) {
      finish();
      return undefined;
    }

    navEl.classList.remove('navbar--active-icon-in-float');
    navEl.classList.add('navbar--transitioning');
    orbEl.style.willChange = 'transform';
    liftEl.style.willChange = 'transform, opacity';

    const duration = NAV_MOVE_DURATION_MS;
    const start = performance.now();
    /** Vertical offset (px): lift starts slightly low, eases up with horizontal glide */
    const LIFT_START_Y = 10;

    const tick = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(t);
      const x = from + delta * eased;
      animatedCenterRef.current = x;

      const liftEase = 1 - (1 - t) ** 2;
      const liftY = LIFT_START_Y * (1 - liftEase);
      const liftOpacity = Math.min(1, t * 2.4);

      applyDomNavVisuals(pathEl, orbEl, liftEl, x, navWidth, { liftY, liftOpacity });

      if (t > 0.1) {
        navEl.classList.add('navbar--active-icon-in-float');
      }

      if (t < 1) {
        notchAnimationRef.current = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };

    applyDomNavVisuals(pathEl, orbEl, liftEl, from, navWidth, {
      liftY: LIFT_START_Y,
      liftOpacity: 0,
    });

    notchAnimationRef.current = requestAnimationFrame(tick);

    return () => {
      if (notchAnimationRef.current !== null) {
        cancelAnimationFrame(notchAnimationRef.current);
        notchAnimationRef.current = null;
      }
      navEl.classList.remove('navbar--transitioning');
      orbEl.style.removeProperty('will-change');
      liftEl.style.removeProperty('will-change');
    };
  }, [activeItem, navbarWidth, navItems]);

  const initialPathD = buildNavbarPathString(navbarWidth || 360, animatedCenterRef.current);

  return (
    <nav className="navbar navbar--orb-floating" ref={navRef}>
      <svg className="navbar__notch-svg" viewBox={`0 0 ${navbarWidth || 360} 43`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="navbar-gradient" x1="0" y1="43" x2="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(6, 53, 51, 0.65)" />
            <stop offset="1" stopColor="rgba(0, 0, 0, 0.65)" />
          </linearGradient>
        </defs>
        <path
          ref={notchPathRef}
          className="navbar__notch-path"
          d={initialPathD}
          fill="url(#navbar-gradient)"
          stroke="none"
        />
      </svg>
      <div className="navbar__active-orb" ref={orbRef} aria-hidden="true" />
      <div className="navbar__active-icon-lift" ref={liftRef} aria-hidden="true">
        <img
          src={floatingNavItem?.icon || homeIcon}
          alt=""
          className="navbar__active-orb-icon"
          style={{ '--nav-orb-icon-size': `${floatingNavItem?.iconSize || 23}px` }}
        />
      </div>
      <div className="navbar__container">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            iconSize={item.iconSize}
            locked={Boolean(item.locked)}
            isActive={activeItem === item.id}
            useFloatingActiveOrb
            hideActiveIconInItem={false}
            onClick={handleItemClick}
          />
        ))}
      </div>
    </nav>
  );
};

export default NavBar;
