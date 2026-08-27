const CACHE = 'abastecimento-v4';
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

  // Network-first: tenta buscar a versão mais nova primeiro.
  // Só usa o cache se estiver offline (a internet falhar).
  // Isso garante que qualquer atualização no GitHub chegue no celular
  // assim que houver internet, sem precisar limpar cache manualmente.
  e.respondWith(
    fetch(e.request).then(resp => {
      if(resp && resp.status === 200 && resp.type !== 'opaque'){
        const copy = resp.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, copy));
      }
      return resp;
    }).catch(() =>
      caches.match(e.request).then(cached => cached || caches.match('./index.html'))
    )
  );
});
