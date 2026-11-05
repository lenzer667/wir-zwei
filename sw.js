// Netzwerk zuerst, damit Updates sofort ankommen. Ohne Internet startet die App aus dem Cache.
const CACHE = 'wirzwei-v18';
const SHELL = ['./', 'index.html', 'styles.css', 'data.js', 'store.js', 'figuren-seite.js', 'decor.js', 'game.js', 'app.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'assets/herbst.jpg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Die Supabase-Bibliothek hat eine feste Version, sie darf dauerhaft aus dem Speicher kommen.
  if (e.request.method === 'GET' && url.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(
      caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      }))
    );
    return;
  }
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    // no-cache: Der Browser fragt immer beim Server nach, ob es eine neue Version gibt.
    fetch(e.request, { cache: 'no-cache' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
