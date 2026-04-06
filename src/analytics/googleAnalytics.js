import { GA_MEASUREMENT_ID } from '../config/appConfig';

let gtagReady = false;
let pendingPagePath = null;

function sendPagePath(pagePath) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return;
  const path = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
  });
}

/**
 * Loads gtag.js once. Safe to call with an empty measurement ID (no-op).
 * Set `REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX` in `.env` for your GA4 property.
 */
export function initGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  script.onload = () => {
    gtagReady = true;
    if (pendingPagePath != null) {
      sendPagePath(pendingPagePath);
      pendingPagePath = null;
    }
  };
  document.head.appendChild(script);
}

/**
 * Records a screen change as a GA4 page_view (virtual path for this SPA).
 * @param {string} screenKey - Same string you use for `currentPage` in App (e.g. `home`, `super-club`).
 */
export function trackAppScreen(screenKey) {
  if (!GA_MEASUREMENT_ID || !screenKey) return;
  const path = `/${String(screenKey)}`;
  if (!gtagReady) {
    pendingPagePath = path;
    return;
  }
  sendPagePath(path);
}

/**
 * Optional custom GA4 event (e.g. `purchase`, `sign_up`). Only fires after gtag script has loaded.
 * @param {string} name
 * @param {Record<string, unknown>} [params]
 */
export function gaEvent(name, params = {}) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag || !gtagReady) return;
  window.gtag('event', name, params);
}
