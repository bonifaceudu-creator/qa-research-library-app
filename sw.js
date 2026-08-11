const CACHE_NAME = "qa-research-library-v2";

const CORE_FILES = [
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

    "./images/iso-icon.png",
    "./images/research-icon.png",
    "./images/calibration-icon.png",
    "./images/sop-icon.png",
    "./images/report-icon.png"
];


/* =========================
   INSTALL
========================= */

self.addEventListener("install", function(event) {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(function(cache) {

                return cache.addAll(CORE_FILES);

            })

    );

    self.skipWaiting();

});


/* =========================
   ACTIVATE
========================= */

self.addEventListener("activate", function(event) {

    event.waitUntil(

        caches.keys().then(function(cacheNames) {

            return Promise.all(

                cacheNames
                    .filter(function(cacheName) {

                        return cacheName !== CACHE_NAME;

                    })
                    .map(function(cacheName) {

                        return caches.delete(cacheName);

                    })

            );

        })

    );

    self.clients.claim();

});


/* =========================
   FETCH
========================= */

self.addEventListener("fetch", function(event) {

    event.respondWith(

        caches.match(event.request)
            .then(function(cachedResponse) {

                if (cachedResponse) {

                    return cachedResponse;

                }


                return fetch(event.request)
                    .then(function(response) {

                        if (
                            response &&
                            response.status === 200 &&
                            response.type === "basic"
                        ) {

                            const responseClone =
                                response.clone();


                            caches.open(CACHE_NAME)
                                .then(function(cache) {

                                    cache.put(
                                        event.request,
                                        responseClone
                                    );

                                });

                        }

                        return response;

                    });

            })

    );

});