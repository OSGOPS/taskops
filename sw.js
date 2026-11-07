/* TaskOps Service Worker
   Minimal SW — just enough for the browser to treat the page as
   a PWA and offer "Add to Home Screen". The GAS app itself is
   cross-origin so we can't cache it; we cache the shell only.
*/
const CACHE = 'taskops-shell-v1';
const SHELL = ['/', '/index.html', '/manifest.json',
                '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Only cache same-origin shell requests; let GAS requests pass through
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
