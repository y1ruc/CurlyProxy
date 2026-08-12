/* CurlyProxy Service Worker */
self.addEventListener('install', () => self.skipWaiting());

importScripts('./uv.bundle.js');
importScripts('./uv.config.js');
importScripts('./uv.sw.js');

const sw = new UVServiceWorker();
self.addEventListener('fetch', (event) => event.respondWith(sw.fetch(event)));

self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
