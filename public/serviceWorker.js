/*
  Kill-switch service worker to evict legacy cached app shells.
  This file is intentionally simple so old registrations update to this,
  clear caches, and unregister themselves.
*/

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      for (const client of clients) {
        client.postMessage({ type: 'LEGACY_SW_CLEARED' });
      }
    } finally {
      await self.registration.unregister();
    }
  })());
});

self.addEventListener('fetch', () => {
  // Never intercept requests. Let network deliver latest assets.
});
