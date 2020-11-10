var CACHE_NAME = "my-site-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

var urlsToCache = [
    "/",
    "/db.js",
    "/index.js",
    "/manifest.json",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

self.addEventListener("install", function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log("Cache opened");
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", function(e) {
    if(e.request.url.includes("/api/")) {
        e.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(e.request)
                    .then(response => {
                        if (response.status===200) {
                            cache.put(e.request.url, response.clone())
                        }
                        return response;
                    })
                    .catch(err => {
                        return cache.match(e.request);
                    });
            }).catch(err => console.log(err))
        );
        return;
    }

    e.respondWith(
        fetch(e.request).catch(function() {
            return caches.match(e.request).then(function(response) {
                if (response) {
                    return response;
                } else if (e.request.headers.get("accept").includes("text/html")) {
                    return caches.match("/");
                }
            });
        })
    );
})