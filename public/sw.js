// Minimal Service Worker to satisfy Chrome's PWA installability criteria
// This worker does not cache files to prevent caching issues, but acts as a pass-through
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch handler (required by Chrome)
  event.respondWith(fetch(event.request));
});
