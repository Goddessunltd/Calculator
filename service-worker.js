var CACHE = 'bliss-calc-v1';
var FILES = [
  'https://goddessunltd.github.io/Calculator/index.html',
  'https://goddessunltd.github.io/Calculator/rate-calculator.html',
  'https://goddessunltd.github.io/Calculator/daily-totaler.html',
  'https://goddessunltd.github.io/Calculator/manifest.json'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('docs.google.com') || e.request.url.includes('corsproxy.io')) return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (response && response.status === 200 && response.type !== 'opaque') {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        }
        return response;
      }).catch(function() {
        if (e.request.mode === 'navigate') {
          return caches.match('https://goddessunltd.github.io/Calculator/index.html');
        }
      });
    })
  );
});
