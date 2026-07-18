var CACHE = 'gazetainss-v1';
var BASE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(ev) {
  ev.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(BASE); }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(ev) {
  ev.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(ev) {
  if (ev.request.method !== 'GET') return;
  ev.respondWith(
    fetch(ev.request).then(function(resp) {
      if (resp && resp.status === 200 && (resp.type === 'basic' || resp.type === 'cors')) {
        var clone = resp.clone();
        caches.open(CACHE).then(function(c) { c.put(ev.request, clone); });
      }
      return resp;
    }).catch(function() {
      return caches.match(ev.request);
    })
  );
});
