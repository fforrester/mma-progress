/* =========================================================
   MMA PROGRESS — SERVICE WORKER

   Makes the app work offline.

   When online:
   - Get the latest app files from the website.
   - Save a copy for offline use.

   When offline:
   - Use the most recently saved copy.
   ========================================================= */

   const CACHE_NAME = "mma-progress";

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
   
   
   /* ---------- SAVE APP FILES FOR OFFLINE USE ---------- */
   
   self.addEventListener("install", event => {
     event.waitUntil(
       caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES))
     );
   
     self.skipWaiting();
   });
   
   
   /* ---------- ACTIVATE NEW SERVICE WORKER ---------- */
   
   self.addEventListener("activate", event => {
     event.waitUntil(self.clients.claim());
   });
   
   
   /* ---------- GET LATEST FILE, OR USE CACHE IF OFFLINE ---------- */
   
   self.addEventListener("fetch", event => {
     event.respondWith(
       fetch(event.request)
         .then(response => {
           const copy = response.clone();
   
           caches.open(CACHE_NAME).then(cache => {
             cache.put(event.request, copy);
           });
   
           return response;
         })
         .catch(() => caches.match(event.request))
     );
   });