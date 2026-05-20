/**
 * Blocks OS/browser edge back-swipe on the Home screen in installed PWA mode.
 * iOS standalone WebKit handles navigation gestures outside normal touch listeners;
 * pairing a history trap with a left-edge capture shield is the most reliable approach.
 */

const HOME_BACK_GUARD_STATE_KEY = '__ssHomeBackGuard';

export const isStandalonePwa = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return Boolean(
    window.matchMedia?.('(display-mode: standalone)')?.matches
    || window.matchMedia?.('(display-mode: fullscreen)')?.matches
    || window.navigator.standalone === true,
  );
};

const buildHomeGuardState = () => ({ [HOME_BACK_GUARD_STATE_KEY]: true, appPage: 'home' });

/**
 * Push dummy history entries so edge-swipe pops a guard state instead of leaving Home.
 */
export const seedPwaHomeHistoryTrap = () => {
  if (typeof window === 'undefined' || !window.history) {
    return;
  }

  const state = buildHomeGuardState();
  const url = window.location.href;
  window.history.replaceState(state, '', url);
  window.history.pushState(state, '', url);
  window.history.pushState(state, '', url);
};

/**
 * Re-push immediately on any back navigation while the guard is active (capture phase).
 */
export const installPwaHomeHistoryTrap = () => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  seedPwaHomeHistoryTrap();

  const onPopState = () => {
    const state = buildHomeGuardState();
    window.history.pushState(state, '', window.location.href);
  };

  const onPageShow = (event) => {
    if (event.persisted) {
      seedPwaHomeHistoryTrap();
    }
  };

  window.addEventListener('popstate', onPopState, true);
  window.addEventListener('pageshow', onPageShow);
  return () => {
    window.removeEventListener('popstate', onPopState, true);
    window.removeEventListener('pageshow', onPageShow);
  };
};

const PWA_HOME_EDGE_BLOCK_PX = 44;
const PWA_HOME_EDGE_VERTICAL_TOLERANCE_PX = 80;

/**
 * Capture-phase touch guard for the left screen edge in standalone PWA.
 */
export const installPwaHomeEdgeTouchGuard = () => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const touchState = {
    active: false,
    startX: 0,
    startY: 0,
  };

  const onTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch || touch.clientX > PWA_HOME_EDGE_BLOCK_PX) {
      touchState.active = false;
      return;
    }
    touchState.active = true;
    touchState.startX = touch.clientX;
    touchState.startY = touch.clientY;
  };

  const onTouchMove = (event) => {
    if (!touchState.active) {
      return;
    }
    const touch = event.touches?.[0];
    if (!touch) {
      return;
    }
    const deltaX = touch.clientX - touchState.startX;
    const deltaY = touch.clientY - touchState.startY;
    if (Math.abs(deltaY) > PWA_HOME_EDGE_VERTICAL_TOLERANCE_PX || deltaX < -12) {
      touchState.active = false;
      return;
    }
    if (deltaX > 0) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const onTouchEnd = () => {
    touchState.active = false;
  };

  const listenerOptions = { passive: false, capture: true };
  document.addEventListener('touchstart', onTouchStart, listenerOptions);
  document.addEventListener('touchmove', onTouchMove, listenerOptions);
  document.addEventListener('touchend', onTouchEnd, listenerOptions);
  document.addEventListener('touchcancel', onTouchEnd, listenerOptions);

  return () => {
    document.removeEventListener('touchstart', onTouchStart, listenerOptions);
    document.removeEventListener('touchmove', onTouchMove, listenerOptions);
    document.removeEventListener('touchend', onTouchEnd, listenerOptions);
    document.removeEventListener('touchcancel', onTouchEnd, listenerOptions);
  };
};

export const installPwaHomeBackGuard = () => {
  if (!isStandalonePwa()) {
    return () => {};
  }

  const { documentElement, body } = document;
  documentElement.classList.add('ss-pwa-home-guard');
  body.classList.add('ss-pwa-home-guard');

  const removeHistoryTrap = installPwaHomeHistoryTrap();
  const removeEdgeTouchGuard = installPwaHomeEdgeTouchGuard();

  return () => {
    documentElement.classList.remove('ss-pwa-home-guard');
    body.classList.remove('ss-pwa-home-guard');
    removeHistoryTrap();
    removeEdgeTouchGuard();
  };
};
