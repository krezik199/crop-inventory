const CACHE_NAME = 'crop-inventory-v2';
const urlsToCache = [
  '/manifest.json',
];

// Install — cache minimal assets, skip waiting so new SW activates immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(() => {
        console.log('Some cache files could not be added');
      });
    })
  );
  self.skipWaiting();
});

// Activate — delete ALL old caches immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch — NETWORK FIRST for everything except icons/manifest
// This ensures iOS always gets the latest app code
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always go to network for API calls and page content
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname === '/' ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.startsWith('/_next/')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first only for static assets (icons, manifest)
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
