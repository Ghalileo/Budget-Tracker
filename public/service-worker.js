console.log("Hi! I am your budget tracker service worker!  Lets rock and roll kid!");

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/manifest.webmanifest",
    "/style.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
  ];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

//Installs service worker to application
self.addEventListener("install", function(evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Files pre-cached successfully");
            return cache.addAll(FILES_TO_CACHE);
        })
    )

    self.skipWaiting();
});

//Activates Previously installed service worker
self.addEventListener("activate", function(evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if(key !== CACHE_NAME && key !== DATA_CACHE_NAME){
                        console.log("Removing all cache data", key);
                        return caches.delete(key);
                    }
                })
            )
        })
    )

    self.clients.claim();
});

self.addEventListener("fetch", (evt) => {
    //cache requests successfully to the present api
    if(evt.request.url.includes("/")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                    .then(response => {
                        // Stores and clones cache is reponse was successful
                        if(response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }
                        return response;
                    })
            })
        )
    }
})

//Utilizes static assets using offline-first if request is not for the api
evt.respondWith(
    caches.match(evt.request).then((response) => {
        return response || fetch(evt.request);
    })
)