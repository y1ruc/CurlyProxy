self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

var PROXY = self.location.origin + '/proxy?url=';

self.addEventListener('fetch', function (event) {
    var url = new URL(event.request.url);

    if (url.origin === self.location.origin) return;

    if (event.request.method !== 'GET' && event.request.method !== 'HEAD') return;

    var evt = event;
    evt.respondWith(
        fetch(PROXY + encodeURIComponent(url.href), { method: event.request.method })
    );
});
