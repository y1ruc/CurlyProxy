/* CurlyProxy */
self.addEventListener("install",function(){self.skipWaiting()});
importScripts("/uv/uv.bundle.js");
importScripts("/uv/uv.config.js");
importScripts("/uv/uv.sw.js");
var uvsw=new UVServiceWorker();
self.addEventListener("fetch",function(e){e.respondWith(uvsw.fetch(e))});
self.addEventListener("activate",function(e){e.waitUntil(self.clients.claim())});
