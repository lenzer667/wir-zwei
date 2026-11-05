// Gemeinsamer Datenspeicher über Supabase.
// Die App arbeitet mit einer lokalen Kopie und schreibt Änderungen im Hintergrund in die Datenbank.
// Ohne Internet bleiben Änderungen in einer Warteschlange und werden später nachgeholt.
const SUPABASE_URL = 'https://zsiwfnozxndgiyaaejxo.supabase.co';
// Öffentlicher Schlüssel: Darf im Code stehen, die Daten schützen die Regeln in der Datenbank.
const SUPABASE_KEY = 'sb_publishable_Z0uUqYonFQlEOIroZ1EP2Q_NdKyzzjC';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const Auth = {
  user: null,
  async restore() {
    const { data } = await sb.auth.getSession();
    this.user = data.session ? data.session.user : null;
    return this.user;
  },
  // Anmeldung über den persönlichen Link: Name und Code stehen hinter dem # und gehen nur an Supabase.
  async signInWithLink(name, code) {
    const { data, error } = await sb.auth.signInWithPassword({ email: `${name}@wir-zwei.test`, password: code });
    if (error) throw error;
    this.user = data.user;
    return this.user;
  },
  // "fenja@wir-zwei.test" wird zu "Fenja"
  person() {
    if (!this.user || !this.user.email) return null;
    const name = this.user.email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  },
  async signOut() {
    await sb.auth.signOut({ scope: 'local' });
    this.user = null;
  },
};

const DB = (() => {
  const CACHE_KEY = 'wirzwei.cache.v2';
  const QUEUE_KEY = 'wirzwei.queue.v2';
  const LEGACY_KEY = 'wirzwei.data.v1'; // alte, nur lokale Daten: werden nie gelöscht
  const listeners = new Set();
  let data = {};
  let queue = [];
  let flushing = false;
  let channel = null;

  const readJSON = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
  };
  const saveCache = () => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
  };
  const saveQueue = () => {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); } catch {}
  };
  const notify = () => listeners.forEach((fn) => fn());
  const setLocal = (col, rec) => { (data[col] = data[col] || {})[rec.id] = rec; };

  async function flush() {
    if (flushing || !Auth.user) return;
    flushing = true;
    try {
      while (queue.length) {
        const op = queue[0];
        let result;
        if (op.type === 'upsert') {
          result = await sb.from('records').upsert(op.rows.map((r) => ({ collection: r.collection, id: r.id, data: r.data, updated_at: new Date().toISOString() })));
        } else if (op.type === 'delete') {
          result = await sb.from('records').delete().eq('collection', op.collection).eq('id', op.id);
        } else {
          result = await sb.from('records').delete().eq('collection', op.collection);
        }
        if (result.error) throw result.error;
        queue.shift();
        saveQueue();
      }
    } catch (err) {
      console.warn('Noch nicht gespeichert, neuer Versuch später:', err.message);
    } finally {
      flushing = false;
    }
  }

  function enqueue(op) {
    queue.push(op);
    saveQueue();
    flush();
  }

  function listen() {
    if (channel) return;
    channel = sb.channel('records-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'records' }, (change) => {
        if (change.eventType === 'DELETE') {
          const { collection, id } = change.old;
          if (data[collection]) delete data[collection][id];
        } else {
          setLocal(change.new.collection, change.new.data);
        }
        saveCache();
        notify();
      })
      .subscribe();
  }

  addEventListener('online', () => flush());

  return {
    // Holt alle Daten. Ohne Internet wird die zuletzt gespeicherte Kopie benutzt.
    async load() {
      queue = readJSON(QUEUE_KEY, []);
      await flush();
      const fresh = {};
      const PAGE = 1000;
      try {
        for (let from = 0; ; from += PAGE) {
          const { data: rows, error } = await sb.from('records').select('collection,id,data').range(from, from + PAGE - 1);
          if (error) throw error;
          rows.forEach((r) => { (fresh[r.collection] = fresh[r.collection] || {})[r.id] = r.data; });
          if (rows.length < PAGE) break;
        }
        data = fresh;
        saveCache();
      } catch (err) {
        console.warn('Offline, benutze gespeicherte Kopie:', err.message);
        data = readJSON(CACHE_KEY, {});
      }
      listen();
    },
    reset() {
      if (channel) { sb.removeChannel(channel); channel = null; }
      data = {};
      queue = [];
      try { localStorage.removeItem(CACHE_KEY); localStorage.removeItem(QUEUE_KEY); } catch {}
    },
    isEmpty: () => Object.keys(data).length === 0,

    // Alte Daten dieses Geräts aus der Zeit vor der Online-Datenbank
    legacy() {
      const old = readJSON(LEGACY_KEY, null);
      if (!old) return null;
      const hasContent = Object.entries(old).some(([k, v]) => !k.includes(':') && v && Object.keys(v).length);
      return hasContent ? old : null;
    },
    importLegacy() {
      const old = readJSON(LEGACY_KEY, {});
      const rows = [];
      Object.entries(old).forEach(([key, value]) => {
        if (key.includes(':')) {
          setLocal('meta', { id: key, done: true });
          rows.push({ collection: 'meta', id: key, data: { id: key, done: true } });
          return;
        }
        Object.values(value || {}).forEach((rec) => {
          setLocal(key, rec);
          rows.push({ collection: key, id: rec.id, data: rec });
        });
      });
      saveCache();
      enqueue({ type: 'upsert', rows });
    },

    list: (col) => Object.values(data[col] || {}),
    get: (col, id) => (data[col] || {})[id],
    put(col, rec) {
      setLocal(col, rec);
      saveCache();
      enqueue({ type: 'upsert', rows: [{ collection: col, id: rec.id, data: rec }] });
      notify();
    },
    remove(col, id) {
      if (data[col]) delete data[col][id];
      saveCache();
      enqueue({ type: 'delete', collection: col, id });
      notify();
    },
    clear(col) {
      delete data[col];
      saveCache();
      enqueue({ type: 'clear', collection: col });
      notify();
    },
    // Legt Vorschläge genau einmal an, gemerkt wird das in der gemeinsamen Datenbank.
    seedOnce(flag, col, recs) {
      const key = `seeded:${flag}`;
      if (DB.get('meta', key)) return;
      const rows = [{ collection: 'meta', id: key, data: { id: key, done: true } }];
      setLocal('meta', { id: key, done: true });
      recs.forEach((r) => {
        if (DB.get(col, r.id)) return;
        setLocal(col, r);
        rows.push({ collection: col, id: r.id, data: r });
      });
      saveCache();
      enqueue({ type: 'upsert', rows });
    },
    subscribe: (fn) => listeners.add(fn),
  };
})();
