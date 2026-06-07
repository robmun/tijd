// GHC Timer — Service Worker
// Versie: verhoog dit getal bij elke update van index.html
const CACHE_NAME = 'ghc-timer-v1';

// Alle bestanden die offline beschikbaar moeten zijn
const FILES_TO_CACHE = [
  './',
  './index.html',
  './apple-touch-icon.png',
  './manifest.json'
];

// Installatie: cache alle bestanden
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  // Activeer meteen, wacht niet op oude SW
  self.skipWaiting();
});

// Activatie: verwijder oude caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: serveer altijd uit cache (offline-first)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      // Niet in cache? Probeer netwerk, sla op in cache voor later
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      });
    })
  );
});
