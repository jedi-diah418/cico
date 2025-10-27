// Service Worker for Offline Functionality
// Version: 1.2.0

const CACHE_VERSION = 'calorie-tracker-v1.2.0';
const CACHE_NAME = `calorie-tracker-${CACHE_VERSION}`;

// Files to cache for offline use
const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Install event - cache all static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installed successfully');
                // Force the waiting service worker to become active
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName.startsWith('calorie-tracker-') && cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activated successfully');
                // Take control of all pages immediately
                return self.clients.claim();
            })
    );
});

// Fetch event - use network-first strategy for app files, cache-first for external resources
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    const url = new URL(event.request.url);
    const isAppFile = url.origin === self.location.origin &&
                      (url.pathname.endsWith('.js') ||
                       url.pathname.endsWith('.html') ||
                       url.pathname.endsWith('.css'));

    if (isAppFile) {
        // Network-first strategy for app files - always try to get fresh version
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        console.log('[Service Worker] Fetched fresh from network:', event.request.url);
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                        return response;
                    }
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache
                    console.log('[Service Worker] Network failed, serving from cache:', event.request.url);
                    return caches.match(event.request);
                })
        );
    } else {
        // Cache-first strategy for external resources (like Chart.js from CDN)
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('[Service Worker] Serving from cache:', event.request.url);
                        return cachedResponse;
                    }

                    // Not in cache, fetch from network
                    console.log('[Service Worker] Fetching from network:', event.request.url);
                    return fetch(event.request)
                        .then((response) => {
                            if (!response || response.status !== 200 || response.type === 'error') {
                                return response;
                            }

                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                            return response;
                        })
                        .catch((error) => {
                            console.error('[Service Worker] Fetch failed:', error);
                            return new Response('Offline - Resource not available', {
                                status: 503,
                                statusText: 'Service Unavailable',
                                headers: new Headers({
                                    'Content-Type': 'text/plain'
                                })
                            });
                        });
                })
        );
    }
});

// Message event - handle update requests
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[Service Worker] Received SKIP_WAITING message');
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CHECK_UPDATE') {
        console.log('[Service Worker] Checking for updates...');
        event.ports[0].postMessage({
            type: 'UPDATE_STATUS',
            version: CACHE_VERSION
        });
    }
});

// Push notification support (for future features)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('Calorie Tracker', options)
    );
});
