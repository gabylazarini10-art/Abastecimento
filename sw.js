const CACHE = 'abastecimento-v1';
const ARQUIVOS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ARQUIVOS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetched = fetch(e.request).then(resp=>{
        if(resp && resp.status===200){
          const copy = resp.clone();
          caches.open(CACHE).then(cache=>cache.put(e.request, copy));
        }
        return resp;
      }).catch(()=>cached);
      return cached || fetched;
    })
  );
});
