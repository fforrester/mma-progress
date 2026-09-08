/* =========================================================
   MMA PROGRESS — SERVICE WORKER
   Keeps the app's files cached so the interface can load offline.
   Training data itself is stored separately in localStorage.
   ========================================================= */

const CACHE_NAME = "mma-progress-v4";

const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./storage.js",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request)
    )
  );
});
