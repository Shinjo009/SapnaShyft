import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initGoogleAnalytics } from './analytics/googleAnalytics';
// import reportWebVitals from './reportWebVitals';

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
