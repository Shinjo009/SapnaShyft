import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initGoogleAnalytics } from './analytics/googleAnalytics';
// import reportWebVitals from './reportWebVitals';

/**
 * CRA's webpack error overlay surfaces opaque cross-origin failures as "Script error."
 * That often fires on iOS/Safari when opening the Share sheet / Add to Home Screen against
 * a LAN `npm start` URL — it is not a real app crash and does not appear in production builds.
 */
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  const isOpaqueScriptError = (message) => {
    const text = String(message || '').trim().toLowerCase();
    return text === 'script error.' || text === 'script error';
  };

  window.addEventListener(
    'error',
    (event) => {
      if (!isOpaqueScriptError(event?.message)) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true,
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = event?.reason;
      const message = reason instanceof Error ? reason.message : reason;
      if (!isOpaqueScriptError(message)) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true,
  );
}

initGoogleAnalytics();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Tear down legacy PWA caches (e.g. old "Health Scan" service worker) so new branding and bundles load.
async function clearLegacyPwaCaches() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ('caches' in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    }
  } catch (error) {
    console.warn('PWA / cache cleanup failed:', error);
  }
}

void clearLegacyPwaCaches();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void clearLegacyPwaCaches();
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
