const CACHE_NAME = 'ruta-recuperacion-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/components.css',
  './css/dashboard.css',
  './css/mobile.css',
  './js/app.js',
  './js/state.js',
  './js/google/auth.js',
  './js/google/sheets.js',
  './js/google/docs.js',
  './js/google/calendar.js',
  './js/google/drive.js',
  './js/modules/patient.js',
  './js/modules/family.js',
  './js/modules/debts.js',
  './js/modules/exercises.js',
  './js/modules/psychoeducation.js',
  './js/modules/sos.js',
  './js/utils/sound.js',
  './js/utils/charts.js',
  './js/utils/export.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching app shell...');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[Service Worker] Cache pre-fill partial error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests and exclude external google apis from cache storage to avoid stale OAuth
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('googleapis.com') || event.request.url.includes('accounts.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback for html navigation
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
