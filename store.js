// Datenspeicher. Aktuell liegt alles nur in diesem Browser.
// Die Form (Sammlung + Datensatz mit id) passt 1:1 auf eine Online-Datenbank,
// später muss für das Teilen zwischen zwei Handys nur diese Datei getauscht werden.
const DB = (() => {
  const KEY = 'wirzwei.data.v1';
  const listeners = new Set();
  let data = read();

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
  }
  function commit() {
    localStorage.setItem(KEY, JSON.stringify(data));
    listeners.forEach((fn) => fn());
  }
  // Andere Tabs zählen als "das andere Handy", praktisch zum Testen.
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    data = read();
    listeners.forEach((fn) => fn());
  });

  return {
    list: (col) => Object.values(data[col] || {}),
    get: (col, id) => (data[col] || {})[id],
    put(col, rec) {
      (data[col] = data[col] || {})[rec.id] = rec;
      commit();
    },
    remove(col, id) {
      if (data[col]) delete data[col][id];
      commit();
    },
    clear(col) {
      delete data[col];
      commit();
    },
    seedOnce(col, recs) {
      const flag = `seeded:${col}`;
      if (data[flag]) return;
      data[col] = Object.fromEntries(recs.map((r) => [r.id, r]));
      data[flag] = true;
      localStorage.setItem(KEY, JSON.stringify(data));
    },
    // Ergänzt Einträge genau einmal und lässt alles Vorhandene unangetastet.
    addOnce(flag, col, recs) {
      const key = `added:${flag}`;
      if (data[key]) return;
      data[col] = data[col] || {};
      recs.forEach((r) => { if (!data[col][r.id]) data[col][r.id] = r; });
      data[key] = true;
      localStorage.setItem(KEY, JSON.stringify(data));
    },
    subscribe: (fn) => listeners.add(fn),
  };
})();
