// Netzwerk zuerst, damit Updates sofort ankommen. Ohne Internet startet die App aus dem Cache.
const CACHE = 'wirzwei-v20';

// Benachrichtigungen: Supabase schickt Titel und Ziel, das Handy zeigt sie an.
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Wir zwei', {
    body: d.body || '',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    tag: d.tag || undefined,
    data: { url: d.url || './' },
  }));
});

// Antippen öffnet die App, oder holt sie nach vorne, wenn sie schon offen ist.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = new URL(e.notification.data && e.notification.data.url ? e.notification.data.url : './', self.registration.scope).href;
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => c.url.startsWith(self.registration.scope));
      if (open) { open.navigate(target).catch(() => {}); return open.focus(); }
      return self.clients.openWindow(target);
    })
  );
});
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
