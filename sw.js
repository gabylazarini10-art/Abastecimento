const CACHE = 'abastecimento-v3';
const ARQUIVOS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ARQUIVOS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  if(e.request.method !== 'GET') return;
  // Offline-first: tenta cache primeiro, busca na rede em background
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const network = fetch(e.request).then(resp => {
          if(resp && resp.status === 200 && resp.type !== 'opaque'){
            cache.put(e.request, resp.clone());
          }
          return resp;
        }).catch(() => cached);
        // Retorna cache imediatamente se disponível, senão espera a rede
        return cached || network;
      })
    )
  );
});
