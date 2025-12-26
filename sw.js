const CACHE_NAME = 'aztomiq-v1';
const IS_DEV = false;
  const STATIC_ASSETS = [
  './',
  './manifest.json',
  './assets/css/global.css',
  './assets/js/global.js',
      './en/',
            './en/index.html',
            './vi/',
            './vi/index.html',
            './assets/features/blog/style.css',
            './assets/features/blog/script.js',
            './en/blog/',
            './vi/blog/',
            './assets/features/hello-world/style.css',
            './assets/features/hello-world/script.js',
            './en/hello-world/',
            './vi/hello-world/'
                  ];

          // Install Event
          self.addEventListener('install', (e) => {
          if (IS_DEV) {
          self.skipWaiting();
          return;
          }
          console.log('[SW] Installing...');
          e.waitUntil(
          caches.open(CACHE_NAME).then((cache) => {
          console.log('[SW] Caching App Shell');
          return cache.addAll(STATIC_ASSETS);
          })
          );
          self.skipWaiting();
          });

          // Activate Event
          self.addEventListener('activate', (e) => {
          console.log('[SW] Activating...');
          e.waitUntil(
          caches.keys().then((keys) =>
          Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
          )
          )
          );
          self.clients.claim();
          });

          // Fetch Event
          self.addEventListener('fetch', (e) => {
          if (IS_DEV) return; // Skip cache in dev mode

          if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) {
          return;
          }

          e.respondWith(
          caches.open(CACHE_NAME).then(async (cache) => {
          const cachedResponse = await cache.match(e.request);
          const fetchPromise = fetch(e.request).then((networkResponse) => {
          if (networkResponse.ok) {
          cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
          }).catch((err) => {
          console.warn('[SW] Network fail:', err);
          });
          return cachedResponse || fetchPromise;
          })
          );
          });