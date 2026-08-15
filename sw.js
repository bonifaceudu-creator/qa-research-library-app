const CACHE_NAME = "qa-research-library-v4";

// 1. List EVERY file your app needs to display the library
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./library.html",
    "./document.html",
    "./style.css",
    "./manifest.json",

    "./images/logo.png",
    "./images/icon-192.png",
    "./images/icon-512.png",
    "./images/hero-ajao.png",

    "./images/iso-icon.webp",
    "./images/research-icon.webp",
    "./images/calibration-icon.webp",
    "./images/sop-icon.webp",
    "./images/report-icon.webp",
    "./images/steel-coils.webp",
    "./images/training-icon.webp",
];


// 2. Install Event: Force the phone to download and save all assets immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching all library files for offline use');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting()) // Force immediate activation
  );
});

// 3. Activate Event: Clean up any old app versions safely
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old app cache version');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 4. Fetch Event: The critical fix for Glo network drops
self.addEventListener('fetch', (event) => {
  // Only intercept standard local app requests
  if (event.request.mode === 'navigate' || event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // IF FILE IS IN STORAGE: Serve it instantly (0 milliseconds lag, bypasses Glo)
        if (cachedResponse) {
          // Sneakily check network in the background to update the file for next time
          fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {/* Ignore network errors silently in background */});
          
          return cachedResponse;
        }

        // IF FILE IS NOT IN STORAGE: Go to the network but enforce a strict timeout
        return fetchWithTimeout(event.request, 8000).catch(() => {
          // If Glo completely timeouts or fails, return your main offline HTML page
          return caches.match('./index.html');
        });
      })
    );
  }
});

// 5. Helper function to kill stalled Glo connections before they freeze the screen
function fetchWithTimeout(request, timeout = 8000) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Glo Network Timeout')), timeout))
  ]);
}
