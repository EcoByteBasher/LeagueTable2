const CACHE_NAME = "zwift-cache2-v2";
const OFFLINE_URLS = ["index.html", "manifest.json", "rmacc-192.png", "rmacc-512.png", "ios-rmacc-512.png"];

// On install: cache static assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
});

// Network-first for CSV, cache-first fallback for others
self.addEventListener("fetch", event => {
  const url = event.request.url;

  if (url.endsWith(".csv")) {
    // Always try network first for CSV (to get updates), fallback to cache
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first for app shell assets
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});

// Optional: Clean up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

