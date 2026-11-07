// ---------- Hilfsfunktionen ----------
const $app = document.getElementById('app');
const $nav = document.getElementById('nav');
const $overlay = document.getElementById('overlay');
const $toast = document.getElementById('toast');

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const today = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); };
const dayDiff = (a, b) => Math.round((b - a) / 86400000);
const fmtDate = (d) => d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtShort = (ts) => new Date(ts).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const hash = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

const START = new Date(COUPLE.start[0], COUPLE.start[1] - 1, COUPLE.start[2]);

function addMonths(date, n) {
  const d = new Date(date.getFullYear(), date.getMonth() + n, 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(date.getDate(), last));
  return d;
}
function togetherParts(now) {
  let months = (now.getFullYear() - START.getFullYear()) * 12 + now.getMonth() - START.getMonth();
  if (addMonths(START, months) > now) months--;
  return { months, days: dayDiff(addMonths(START, months), now) };
}
function plural(n, one, many) { return `${n} ${n === 1 ? one : many}`; }

function milestones() {
  const list = [];
  [[6, '6 Monate'], [12, '1 Jahr'], [18, '1,5 Jahre'], [24, '2 Jahre'], [36, '3 Jahre'], [48, '4 Jahre'], [60, '5 Jahre'], [120, '10 Jahre']]
    .forEach(([m, label]) => list.push({ label, date: addMonths(START, m) }));
  [100, 200, 300, 500, 1000, 2000, 3000].forEach((n) => list.push({ label: `${n} Tage`, date: new Date(START.getTime() + n * 86400000) }));
  return list.map((m) => ({ ...m, date: new Date(m.date.getFullYear(), m.date.getMonth(), m.date.getDate()) })).sort((a, b) => a.date - b.date);
}

function seasonOf(date) {
  const month = date.getMonth() + 1;
  return Object.keys(SEASONS).find((k) => SEASONS[k].months.includes(month));
}
function seasonEnd(date) {
  const m = date.getMonth() + 1;
  const endMonth = SEASONS[seasonOf(date)].months[2]; // letzter Monat der Jahreszeit
  const year = date.getFullYear() + (m > endMonth ? 1 : 0);
  return new Date(year, endMonth, 0);
}

// ---------- Zustand ----------
const ME_KEY = 'wirzwei.me';
let me = localStorage.getItem(ME_KEY);
const other = () => COUPLE.people.find((p) => p !== me);
const UI = { view: 'home', season: seasonOf(today()), movieFilter: 'open', noteSent: false, enter: true };

const seedRecs = (season, items) => items.map((item, i) => ({
  id: `seed-${season}-${i}`, season,
  text: item.text || item, emoji: item.emoji || null,
  order: i, doneBy: null, doneAt: null,
}));
function seedSuggestions() {
  DB.seedOnce('bucket', 'bucket', Object.entries(BUCKET_SEEDS).flatMap(([season, items]) => seedRecs(season, items)));
}

// Nach dem Login: Daten holen und beim allerersten Mal fragen, ob alte Daten mit sollen.
async function enterApp() {
  UI.loading = true;
  render();
  await DB.load();
  UI.loading = false;
  if (DB.isEmpty() && DB.legacy()) {
    render();
    openOverlay(`
      <div class="sheet center">
        <h2>Daten übernehmen?</h2>
        <p class="muted">Auf diesem Gerät liegen Einträge von früher. Sollen sie in eure gemeinsame App?</p>
        <div class="sheet-actions">
          <button class="btn ghost" data-action="import-no">Nein</button>
          <button class="btn primary" data-action="import-yes">Ja, übernehmen</button>
        </div>
      </div>`);
    return;
  }
  seedSuggestions();
  render();
  if (me) {
    celebrateMilestoneOnce();
    noticeWishes();
    // Ist schon erlaubt, wird das Handy still noch einmal gemeldet, falls sich etwas geändert hat.
    if (pushGranted()) savePushSubscription().catch(() => {});
    if (location.hash === '#zettel') { history.replaceState(null, '', location.pathname); UI.view = 'home'; render(); }
    if (location.hash === '#wuensche') { history.replaceState(null, '', location.pathname); goto('wishes'); markWishesSeen(); }
  }
}

// ---------- Icons ----------
const ICONS = {
  home: '<path d="M12 20.5C5.5 16 3 12.6 3 9.2 3 6.6 5 4.8 7.3 4.8c1.9 0 3.6 1 4.7 3 1.1-2 2.8-3 4.7-3C19 4.8 21 6.6 21 9.2c0 3.4-2.5 6.8-9 11.3Z"/>',
  food: '<path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2.5 1-4 3.6-4 7 0 2 1.2 3 4 3m0-10v18"/>',
  movies: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M8 5v14M16 5v14M3 10h5M3 14h5M16 10h5M16 14h5"/>',
  bucket: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1.2 1.2L7 4.8M3.5 12l1.2 1.2L7 10.8M3.5 18l1.2 1.2L7 16.8"/>',
  game: '<circle cx="12" cy="12" r="9"/><path d="M12 3c-1 4 0 7 3 9s6 2 6 2M12 12c-3 1-6 4-6.5 6.5M12 12c-2-3-5.500-4-8.500-3"/>',
};
const icon = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;

// ---------- Startseite ----------
function viewHome() {
  const now = today();
  const days = dayDiff(START, now);
  const { months, days: rest } = togetherParts(now);
  const all = milestones();
  const todayMs = all.find((m) => +m.date === +now);
  const nextIdx = all.findIndex((m) => m.date > now);
  const next = all[nextIdx];
  const prevDate = nextIdx > 0 ? all[nextIdx - 1].date : START;
  const left = dayDiff(now, next.date);
  const pct = Math.round((dayDiff(prevDate, now) / dayDiff(prevDate, next.date)) * 100);

  const matches = foodMatches().length;
  const openMovies = DB.list('movies').filter((m) => !m.watched).length;
  const season = seasonOf(now);
  const seasonItems = DB.list('bucket').filter((b) => b.season === season);
  const seasonDone = seasonItems.filter((b) => b.doneAt).length;

  return `
    <header class="top">
      <div>
        <p class="eyebrow">Hey ${esc(me)}</p>
        <h1 class="brand">Wir zwei</h1>
      </div>
      <button class="avatar" data-action="switch-user" aria-label="Person wechseln">${esc(me[0])}</button>
    </header>

    <section class="hero">
      <div class="glow"></div>
      <div class="hero-float" aria-hidden="true"><i>♥</i><i>♥</i><i>♥</i><i>♥</i><i>♥</i></div>
      <p class="hero-names">${esc(COUPLE.people[0])} <span class="beat">♥</span> ${esc(COUPLE.people[1])}</p>
      <p class="hero-num" data-days="${days}" aria-label="${days} Tage">${days.toLocaleString('de-DE')}</p>
      <p class="hero-unit">Tage zusammen</p>
      <p class="hero-sub">${plural(months, 'Monat', 'Monate')} und ${plural(rest, 'Tag', 'Tage')}, seit dem ${fmtDate(START)}</p>
      <div class="walk-slot"></div>
    </section>

    ${todayMs ? `<section class="card today-ms"><p class="eyebrow">Heute ist es so weit</p><h2>${esc(todayMs.label)}!</h2><p>Herzlichen Glückwunsch, ihr zwei.</p></section>` : ''}

    <section class="card countdown">
      <div class="countdown-head">
        <div>
          <p class="eyebrow">Nächstes Highlight</p>
          <h2>${esc(next.label)}</h2>
          <p class="muted">${fmtDate(next.date)}</p>
        </div>
        <div class="countdown-num"><strong>${left}</strong><span>${left === 1 ? 'Tag' : 'Tage'}</span></div>
      </div>
      <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
    </section>

    ${wishHint()}

    ${pushCard()}

    ${viewNotes()}

    <section class="tiles">
      <button class="tile" data-action="nav" data-to="food"><strong>${matches}</strong><span>Essens-Matches</span></button>
      <button class="tile" data-action="nav" data-to="movies"><strong>${openMovies}</strong><span>Filme offen</span></button>
      <button class="tile" data-action="nav" data-to="bucket"><strong>${seasonDone}/${seasonItems.length}</strong><span>${SEASONS[season].name}-Liste</span></button>
    </section>

    <button class="install hidden" id="install" data-action="install">App auf den Startbildschirm legen</button>
  `;
}

function viewNotes() {
  const notes = DB.list('notes').sort((a, b) => a.at - b.at);
  const unread = notes.filter((n) => n.to === me && !n.readAt);
  const history = notes.filter((n) => n.to === me && n.readAt).reverse();
  const pending = notes.filter((n) => n.from === me && !n.readAt).length;

  const sealed = unread.length ? `
    <button class="sealed" data-action="open-note" data-id="${esc(unread[0].id)}">
      <span class="sealed-heart">💌</span>
      <span><strong>${esc(other())} hat dir einen Zettel dagelassen</strong><small>Tippen zum Öffnen</small></span>
    </button>` : '';

  return `
    <section class="card notes">
      <p class="eyebrow">Liebeszettel</p>
      ${sealed}
      <form data-form="note">
        <label class="sr" for="note-text">Zettel für ${esc(other())}</label>
        <textarea id="note-text" name="text" rows="2" maxlength="280" required placeholder="Schreib ${esc(other())} was Schönes …"></textarea>
        <div class="row">
          <small class="muted">${pending ? `${plural(pending, 'Zettel wartet', 'Zettel warten')} auf ${esc(other())}` : `${esc(other())} sieht ihn beim nächsten Öffnen`}</small>
          <button class="btn primary small">Dalassen</button>
        </div>
      </form>
      ${history.length ? `
        <details class="note-history">
          <summary>Deine Zettel von ${esc(other())} (${history.length})</summary>
          ${history.map((n) => `<blockquote>${esc(n.text)}<cite>${fmtShort(n.at)}</cite></blockquote>`).join('')}
        </details>` : ''}
    </section>
  `;
}

// ---------- Essen ----------
const allDishes = () => [...DISHES, ...DB.list('dishes')];
const swipeId = (user, dishId) => `${user}:${dishId}`;

function foodMatches() {
  const [a, b] = COUPLE.people;
  return allDishes().filter((d) => DB.get('swipes', swipeId(a, d.id))?.like && DB.get('swipes', swipeId(b, d.id))?.like);
}
function foodDeck() {
  return allDishes()
    .filter((d) => !DB.get('swipes', swipeId(me, d.id)))
    .sort((x, y) => hash(x.id + me) - hash(y.id + me));
}

function viewFood() {
  const deck = foodDeck();
  const matches = foodMatches();
  const stack = deck.slice(0, 3).reverse();

  return `
    <header class="page-head">
      <h1>Was essen wir?</h1>
      <p class="muted">Wischt beide durch. Rechts heißt ja, links heißt nein.</p>
    </header>

    <button class="pick-btn" data-action="food-random">
      <span>🎲</span>
      <span><strong>Zufallsgericht</strong><small>Eins aus allen ${allDishes().length} Gerichten</small></span>
    </button>

    ${deck.length ? `
      <div class="deck" id="deck">
        ${stack.map((d, i) => {
          const depth = stack.length - 1 - i;
          return `<article class="dish ${depth === 0 ? 'top' : ''}" style="--depth:${depth}; --hue:${Math.abs(hash(d.id)) % 360}" data-id="${esc(d.id)}">
            <span class="stamp yes">Ja!</span><span class="stamp no">Nö</span>
            <span class="dish-emoji">${esc(d.emoji)}</span>
            <h2>${esc(d.name)}</h2>
          </article>`;
        }).join('')}
      </div>
      <div class="swipe-buttons">
        <button class="round no" data-action="swipe" data-like="0" aria-label="Nein">✕</button>
        <span class="muted">noch ${deck.length}</span>
        <button class="round yes" data-action="swipe" data-like="1" aria-label="Ja">♥</button>
      </div>
    ` : `
      <div class="card empty">
        ${catSVG('grey', 'empty-cat')}
        <h2>Du bist durch</h2>
        <p class="muted">${matches.length ? 'Unten stehen eure Matches.' : `Sobald ${esc(other())} auch gewischt hat, erscheinen hier eure Matches.`}</p>
      </div>
    `}

    <section class="section">
      <div class="row">
        <h2>Eure Matches <span class="count">${matches.length}</span></h2>
        ${matches.length ? '<button class="btn ghost small" data-action="food-pick">Heute entscheiden</button>' : ''}
      </div>
      ${matches.length
        ? `<div class="chips">${matches.map((d) => `<span class="chip">${esc(d.emoji)} ${esc(d.name)}</span>`).join('')}</div>`
        : '<p class="muted">Noch nichts. Sobald ihr beide dasselbe mögt, taucht es hier auf.</p>'}
    </section>

    <section class="section">
      <h2>Gericht ergänzen</h2>
      <form class="inline-form" data-form="dish">
        <label class="sr" for="dish-name">Name des Gerichts</label>
        <input id="dish-name" name="name" maxlength="50" required placeholder="z. B. Omas Rouladen" autocomplete="off">
        <button class="btn primary">Dazu</button>
      </form>
      <button class="btn link" data-action="food-reset">Neue Runde starten</button>
    </section>
  `;
}

function bindSwipe() {
  const card = $app.querySelector('.dish.top');
  if (!card) return;
  let startX = 0, startY = 0, dx = 0, active = false;

  card.addEventListener('pointerdown', (e) => {
    active = true; startX = e.clientX; startY = e.clientY; dx = 0;
    card.setPointerCapture(e.pointerId);
    card.style.transition = 'none';
  });
  card.addEventListener('pointermove', (e) => {
    if (!active) return;
    dx = e.clientX - startX;
    const dy = (e.clientY - startY) * 0.25;
    card.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 18}deg)`;
    card.style.setProperty('--yes', Math.max(0, Math.min(1, dx / 90)));
    card.style.setProperty('--no', Math.max(0, Math.min(1, -dx / 90)));
  });
  const end = () => {
    if (!active) return;
    active = false;
    card.style.transition = '';
    if (Math.abs(dx) > 90) flyOut(card, dx > 0);
    else { card.style.transform = ''; card.style.setProperty('--yes', 0); card.style.setProperty('--no', 0); }
  };
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);
}

function flyOut(card, like) {
  card.style.setProperty(like ? '--yes' : '--no', 1);
  card.style.transform = `translate(${like ? 130 : -130}vw, 30px) rotate(${like ? 24 : -24}deg)`;
  setTimeout(() => recordSwipe(card.dataset.id, like), reducedMotion() ? 0 : 220);
}

function recordSwipe(dishId, like) {
  DB.put('swipes', { id: swipeId(me, dishId), user: me, dish: dishId, like });
  if (like && DB.get('swipes', swipeId(other(), dishId))?.like) {
    const d = allDishes().find((x) => x.id === dishId);
    showMatch(d);
  }
}

function showMatch(d) {
  openOverlay(`
    <div class="sheet center pop">
      <p class="eyebrow">Match!</p>
      ${coupleSVG('happy match-couple')}
      <span class="big-emoji">${esc(d.emoji)}</span>
      <h2>${esc(d.name)}</h2>
      <p class="muted">Ihr habt beide Lust darauf.</p>
      <button class="btn primary wide" data-action="close">Weiterwischen</button>
    </div>`);
  confetti();
}

// Würfelt aus allen Gerichten, egal ob gewischt oder nicht.
function foodRandom() {
  const dishes = allDishes();
  if (!dishes.length) return;
  openOverlay(`
    <div class="sheet center">
      <p class="eyebrow">Heute gibt's</p>
      <span class="big-emoji" id="dish-emoji">🎲</span>
      <p class="slot" id="slot"></p>
      <div class="sheet-actions hidden" id="slot-actions">
        <button class="btn ghost" data-action="food-random">Nochmal</button>
        <button class="btn primary" data-action="close">Passt!</button>
      </div>
    </div>`);
  const slot = document.getElementById('slot');
  const emoji = document.getElementById('dish-emoji');
  const winner = dishes[Math.floor(Math.random() * dishes.length)];
  const show = (d) => { slot.textContent = d.name; emoji.textContent = d.emoji; };
  const finish = () => {
    show(winner);
    slot.classList.add('landed');
    document.getElementById('slot-actions').classList.remove('hidden');
    Decor.hearts(innerWidth / 2, innerHeight / 2 - 40, 6, ['✨', '♥']);
  };
  if (reducedMotion() || dishes.length === 1) return finish();
  let i = Math.floor(Math.random() * dishes.length);
  const timer = setInterval(() => show(dishes[i++ % dishes.length]), 80);
  setTimeout(() => { clearInterval(timer); finish(); }, 1300);
}

// ---------- Filme ----------
function viewMovies() {
  const all = DB.list('movies').sort((a, b) => b.at - a.at);
  const open = all.filter((m) => !m.watched);
  const seen = all.filter((m) => m.watched);
  const list = UI.movieFilter === 'open' ? open : seen;

  return `
    <header class="page-head">
      <h1>Filmabend</h1>
      <p class="muted">Sammelt, was ihr schauen wollt. Den Rest entscheidet der Zufall.</p>
    </header>

    <button class="pick-btn" data-action="movie-pick" ${open.length ? '' : 'disabled'}>
      <span>🎲</span>
      <span><strong>Was schauen wir heute?</strong><small>${open.length ? `Zufällig aus ${plural(open.length, 'Titel', 'Titeln')}` : 'Füge zuerst ein paar Titel hinzu'}</small></span>
    </button>

    <form class="movie-form" data-form="movie">
      <label class="sr" for="movie-title">Titel</label>
      <input id="movie-title" name="title" maxlength="80" required placeholder="Film oder Serie" autocomplete="off">
      <div class="row">
        <div class="seg">
          <label><input type="radio" name="kind" value="Film" checked><span>Film</span></label>
          <label><input type="radio" name="kind" value="Serie"><span>Serie</span></label>
        </div>
        <button class="btn primary">Hinzufügen</button>
      </div>
    </form>

    <div class="tabs">
      <button class="${UI.movieFilter === 'open' ? 'on' : ''}" data-action="movie-filter" data-to="open">Offen (${open.length})</button>
      <button class="${UI.movieFilter === 'seen' ? 'on' : ''}" data-action="movie-filter" data-to="seen">Gesehen (${seen.length})</button>
    </div>

    ${list.length ? `<ul class="list">${list.map((m) => `
      <li class="item ${m.watched ? 'done' : ''}">
        <button class="check" data-action="movie-toggle" data-id="${esc(m.id)}" aria-pressed="${!!m.watched}" aria-label="${esc(m.title)} als gesehen markieren"></button>
        <div class="item-body"><strong>${esc(m.title)}</strong><small>${esc(m.kind)} · von ${esc(m.by)}</small></div>
        <button class="del" data-action="movie-remove" data-id="${esc(m.id)}" aria-label="${esc(m.title)} löschen">✕</button>
      </li>`).join('')}</ul>`
      : `<p class="muted empty-line">${UI.movieFilter === 'open' ? 'Noch nichts auf der Liste.' : 'Noch nichts gesehen.'}</p>`}
  `;
}

function moviePick() {
  const open = DB.list('movies').filter((m) => !m.watched);
  if (!open.length) return;
  openOverlay(`
    <div class="sheet center">
      <p class="eyebrow">Heute schaut ihr</p>
      <p class="slot" id="slot"></p>
      <p class="muted" id="slot-kind">&nbsp;</p>
      <div class="sheet-actions hidden" id="slot-actions">
        <button class="btn ghost" data-action="movie-pick">Nochmal</button>
        <button class="btn primary" data-action="close">Passt!</button>
      </div>
    </div>`);
  const slot = document.getElementById('slot');
  const winner = open[Math.floor(Math.random() * open.length)];
  const finish = () => {
    slot.textContent = winner.title;
    slot.classList.add('landed');
    document.getElementById('slot-kind').textContent = `${winner.kind} · von ${winner.by}`;
    document.getElementById('slot-actions').classList.remove('hidden');
  };
  if (reducedMotion() || open.length === 1) return finish();
  let i = 0;
  const timer = setInterval(() => { slot.textContent = open[i++ % open.length].title; }, 80);
  setTimeout(() => { clearInterval(timer); finish(); }, 1300);
}

// ---------- Bucket Lists ----------
function viewBucket() {
  const now = today();
  const key = UI.season;
  const s = SEASONS[key];
  const items = DB.list('bucket').filter((b) => b.season === key)
    .sort((a, b) => (!!a.doneAt - !!b.doneAt) || (a.order - b.order));
  const done = items.filter((b) => b.doneAt).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const isCurrent = seasonOf(now) === key;
  const daysLeft = dayDiff(now, seasonEnd(now));

  return `
    <header class="page-head">
      <h1>Bucket Lists</h1>
      <p class="muted">Für jede Jahreszeit eine eigene.</p>
    </header>

    <div class="seasons" role="tablist">
      ${Object.entries(SEASONS).map(([k, v]) => `
        <button role="tab" aria-selected="${k === key}" class="${k === key ? 'on' : ''}" style="--season:${v.color}" data-action="season" data-to="${k}">
          <span>${v.emoji}</span>${esc(v.name)}
        </button>`).join('')}
    </div>

    ${key === 'summer' ? beachScene() : ''}
    ${key === 'winter' ? winterScene() : ''}

    ${key === 'autumn' ? `
      <button class="poster" data-action="poster" aria-label="Eure Herbst-Bucket-List groß ansehen">
        <img src="assets/herbst.jpg" alt="Timm, Fenja und ihre drei Katzen als Anime-Figuren mit Kürbis">
        <span>Unsere Herbstliste ♥</span>
      </button>` : ''}

    <section class="card season-card" style="--season:${s.color}">
      <div class="row">
        <h2>${s.emoji} ${esc(s.name)}</h2>
        <strong class="season-count">${done}/${items.length}</strong>
      </div>
      <div class="bar season-bar"><i style="width:${pct}%"></i></div>
      <p class="muted">${isCurrent ? `Noch ${plural(daysLeft, 'Tag', 'Tage')} ${esc(s.name)}.` : 'Schon mal vorplanen.'}</p>
    </section>

    ${items.length ? '' : `<p class="muted empty-line">Noch nichts geplant. Was wollt ihr im ${esc(s.name)} erleben?</p>`}

    <ul class="list" style="--season:${s.color}">
      ${items.map((b) => `
        <li class="item seasonal ${b.doneAt ? 'done' : ''}">
          <button class="check" data-action="bucket-toggle" data-id="${esc(b.id)}" aria-pressed="${!!b.doneAt}" aria-label="${esc(b.text)} abhaken"></button>
          ${b.emoji ? `<span class="item-emoji" aria-hidden="true">${esc(b.emoji)}</span>` : ''}
          <div class="item-body"><strong>${esc(b.text)}</strong>${b.doneAt ? `<small>${esc(b.doneBy)} hat's abgehakt · ${fmtShort(b.doneAt)}</small>` : ''}</div>
          <button class="del" data-action="bucket-remove" data-id="${esc(b.id)}" aria-label="${esc(b.text)} löschen">✕</button>
        </li>`).join('')}
    </ul>

    <form class="inline-form" data-form="bucket">
      <label class="sr" for="bucket-text">Neuer Eintrag</label>
      <input id="bucket-text" name="text" maxlength="80" required placeholder="${key === 'summer' ? 'z. B. Beachvolleyball spielen' : `Was wollt ihr im ${esc(s.name)} machen?`}" autocomplete="off">
      <button class="btn primary">Dazu</button>
    </form>
  `;
}

// ---------- Benachrichtigungen ----------
// Öffentlicher Schlüssel: darf im Code stehen. Der geheime Gegenpart liegt nur bei Supabase.
const PUSH_PUBLIC_KEY = 'BF6lYZjIQcuha8by_hSIREUF-gBPZ3cpqODAo7vLBm-GDOXTqhhX8ENhlREcSSDnkxIDAeIJ3L7yfS4YRhifrQc';
const PUSH_LATER_KEY = 'wirzwei.push.later';

const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const pushGranted = () => pushSupported() && Notification.permission === 'granted';

function keyBytes(b64) {
  const s = (b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

// Speichert das Handy in der Datenbank, damit Supabase weiß, wohin es schicken soll.
async function savePushSubscription() {
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(PUSH_PUBLIC_KEY) });
  const json = sub.toJSON();
  const id = `${me}-${Math.abs(hash(json.endpoint)).toString(36)}`;
  if (!DB.get('push', id)) DB.put('push', { id, person: me, sub: json, at: Date.now() });
}

async function enablePush() {
  if (!pushSupported()) { toast('Dieses Handy kann keine Benachrichtigungen von der App bekommen'); return; }
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') { toast('Benachrichtigungen sind nicht erlaubt'); render(); return; }
  try {
    await savePushSubscription();
    toast('Benachrichtigungen sind an');
  } catch (err) {
    toast('Einschalten hat nicht geklappt');
  }
  render();
}

function pushCard() {
  if (!pushSupported() || Notification.permission !== 'default') return '';
  try { if (localStorage.getItem(PUSH_LATER_KEY)) return ''; } catch {}
  return `
    <section class="card push-card">
      <div class="row">
        <span class="push-bell" aria-hidden="true">🔔</span>
        <p><strong>Benachrichtigungen einschalten</strong><small class="muted">Damit du neue Zettel sofort siehst</small></p>
      </div>
      <div class="row">
        <button class="btn link" data-action="push-later">Später</button>
        <button class="btn primary small" data-action="push-enable">Einschalten</button>
      </div>
    </section>`;
}

// ---------- Wünsche für die App ----------
const WISH_STATUS = { open: 'Offen', doing: 'In Arbeit', done: 'Erfüllt' };

const unseenWishes = () => DB.list('wishes').filter((w) => w.by !== me && !w.seen);

function wishHint() {
  const fresh = unseenWishes();
  if (!fresh.length) return '';
  const who = esc(fresh[0].by);
  return `
    <button class="wish-hint" data-action="open-wishes">
      <span class="wish-hint-star" aria-hidden="true">✨</span>
      <span><strong>${fresh.length === 1 ? `${who} hat einen neuen Wunsch` : `${who} hat ${fresh.length} neue Wünsche`}</strong><small>Antippen zum Lesen</small></span>
    </button>`;
}

function viewWishes() {
  const wishes = DB.list('wishes').sort((a, b) => b.at - a.at);
  const canManage = me === COUPLE.people[0];
  return `
    <header class="page-head">
      <button class="wish-back" data-action="nav" data-to="home">← Zurück</button>
      <h1>Wünsche für die App</h1>
      <p class="muted">Was soll noch besser werden?</p>
    </header>

    <form class="card wish-form" data-form="wish">
      <label class="sr" for="wish-text">Dein Wunsch</label>
      <textarea id="wish-text" name="text" rows="3" maxlength="400" required placeholder="Schreib einfach drauflos"></textarea>
      <button class="btn primary wide">Abschicken</button>
    </form>

    ${wishes.length ? `<ul class="list">${wishes.map((w) => `
      <li class="card wish">
        <p class="wish-text">${esc(w.text)}</p>
        <div class="wish-meta">
          <small class="muted">${esc(w.by)}, ${fmtShort(w.at)}</small>
          <span class="wish-tag ${esc(w.status)}">${esc(WISH_STATUS[w.status] || 'Offen')}</span>
        </div>
        ${canManage ? `<div class="wish-actions">
          ${Object.entries(WISH_STATUS).map(([key, label]) => `<button class="${w.status === key ? 'on' : ''}" data-action="wish-status" data-id="${esc(w.id)}" data-to="${key}" aria-pressed="${w.status === key}">${label}</button>`).join('')}
        </div>` : ''}
        ${canManage || w.by === me ? `<button class="wish-del" data-action="wish-remove" data-id="${esc(w.id)}" aria-label="Wunsch löschen">✕</button>` : ''}
      </li>`).join('')}</ul>` : '<p class="muted empty-line">Noch keine Wünsche. Was fehlt euch noch?</p>'}
  `;
}

// Wer die Seite offen hat, hat neue Wünsche gesehen.
function markWishesSeen() {
  unseenWishes().forEach((w) => DB.put('wishes', { ...w, seen: true }));
}

// Einmalige Freude, wenn der eigene Wunsch umgesetzt wurde.
function noticeWishes() {
  if (!Auth.user || !me || $overlay.classList.contains('open')) return;
  const done = DB.list('wishes').find((w) => w.by === me && w.status === 'done' && !w.noticed);
  if (!done) return;
  DB.put('wishes', { ...done, noticed: true });
  openOverlay(`
    <div class="sheet center pop">
      <p class="eyebrow">Dein Wunsch wurde erfüllt ❤️</p>
      <p class="wish-text">${esc(done.text)}</p>
      <button class="btn primary wide" data-action="close">Schön</button>
    </div>`);
  Decor.hearts(innerWidth / 2, innerHeight / 2 - 60, 10);
}

// ---------- Spielen ----------
function viewGame() {
  const games = DB.list('volley').sort((x, y) => y.at - x.at);
  const wins = (name) => games.filter((g) => g.winner === name).length;
  const [a, b] = [COUPLE.people[1], COUPLE.people[0]];

  return `
    <header class="page-head">
      <h1>Strand-Duell</h1>
      <p class="muted">Wer zuerst ${7} Punkte hat, gewinnt. Wer verliert, kocht.</p>
    </header>

    ${beachScene()}

    <section class="card duel">
      <p class="eyebrow">Euer Duell</p>
      <div class="duel-score">
        <div><strong>${wins(a)}</strong><span>${esc(a)}</span></div>
        <i>:</i>
        <div><strong>${wins(b)}</strong><span>${esc(b)}</span></div>
      </div>
      ${games.length ? `<ul class="duel-list">${games.slice(0, 3).map((g) => `<li>${esc(g.winner)} gewinnt ${esc(g.score)}<small>${fmtShort(g.at)}</small></li>`).join('')}</ul>` : '<p class="muted">Noch kein Spiel. Zeit für das erste Duell!</p>'}
    </section>

    <button class="btn primary big" data-action="game-start" data-mode="duo">Zu zweit spielen</button>
    <button class="btn ghost big" data-action="game-start" data-mode="cpu">Gegen den Computer</button>
    <p class="muted game-note">Wir können zu zweit an einem Handy spielen. Lust zu verlieren?</p>
  `;
}

// ---------- Rendern ----------
const VIEWS = { home: viewHome, food: viewFood, movies: viewMovies, bucket: viewBucket, game: viewGame, wishes: viewWishes };
const NAV = [['home', 'Wir'], ['food', 'Essen'], ['movies', 'Filme'], ['bucket', 'Listen'], ['game', 'Spielen']];

function viewLogin() {
  return `
    <section class="welcome">
      <div class="glow"></div>
      ${coupleSVG('welcome-couple')}
      <h1 class="brand big">Wir zwei</h1>
      <p class="muted">${esc(UI.loginError || 'Öffne einfach deinen persönlichen Link, dann bist du sofort drin.')}</p>
    </section>`;
}

function viewLoading() {
  return `<section class="welcome"><div class="glow"></div>${coupleSVG('welcome-couple')}<p class="muted">Eure Daten werden geladen …</p></section>`;
}

function viewWelcome() {
  return `
    <section class="welcome">
      <div class="glow"></div>
      ${coupleSVG('happy welcome-couple')}
      <p class="eyebrow">Willkommen bei</p>
      <h1 class="brand big">Wir zwei</h1>
      <p class="muted">Wer bist du?</p>
      <div class="who">
        ${COUPLE.people.map((p) => `<button class="who-btn" data-action="set-user" data-name="${esc(p)}"><span class="avatar">${esc(p[0])}</span>${esc(p)}</button>`).join('')}
      </div>
    </section>`;
}

function render() {
  $app.className = UI.enter ? 'enter' : '';
  UI.enter = false;
  Decor.setAmbience(UI.view === 'bucket' ? UI.season : seasonOf(today()));
  // Auf der Sommer- und Winterliste spielen die beiden in ihrer Szene, statt durchs Bild zu laufen.
  const THEME_COLORS = { summer: '#5ccbf0', winter: '#14264d' };
  const scene = !me ? '' : UI.view === 'game' ? 'summer' : UI.view === 'bucket' && THEME_COLORS[UI.season] ? UI.season : '';
  document.body.dataset.list = scene;
  document.querySelector('meta[name=theme-color]').content = THEME_COLORS[scene] || '#17100e';
  const signedIn = !!Auth.user && !UI.loading;
  Decor.show(signedIn && !!me && UI.view === 'home');
  if (!signedIn || !me) {
    $app.innerHTML = !Auth.user ? viewLogin() : UI.loading ? viewLoading() : viewWelcome();
    $nav.innerHTML = '';
    $nav.classList.add('hidden');
    return;
  }
  $app.innerHTML = VIEWS[UI.view]();
  if (UI.view === 'home') Decor.mount($app.querySelector('.walk-slot'));
  if (UI.view === 'home' && !UI.counted) {
    UI.counted = true;
    countUp($app.querySelector('.hero-num'));
  }
  $nav.classList.remove('hidden');
  $nav.innerHTML = NAV.map(([k, label]) => `
    <button class="${UI.view === k ? 'on' : ''}" data-action="nav" data-to="${k}" ${UI.view === k ? 'aria-current="page"' : ''}>
      ${icon(k)}<span>${label}</span>
    </button>`).join('');
  if (UI.view === 'food') bindSwipe();
  if (UI.view === 'home' && installEvent) document.getElementById('install')?.classList.remove('hidden');
}

function countUp(el) {
  const target = Number(el.dataset.days);
  if (reducedMotion() || !target) return;
  const t0 = performance.now();
  const frame = (t) => {
    const p = Math.min(1, (t - t0) / 1100);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('de-DE');
    if (p < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function goto(view) {
  UI.view = view;
  UI.enter = true;
  render();
  scrollTo(0, 0);
}

// Nicht neu zeichnen, während jemand tippt, sonst wäre der Text weg.
let renderPending = false;
DB.subscribe(() => {
  if (UI.view === 'wishes' && unseenWishes().length) { markWishesSeen(); return; }
  noticeWishes();
  const el = document.activeElement;
  if (el && /INPUT|TEXTAREA/.test(el.tagName) && el.type !== 'radio') { renderPending = true; return; }
  render();
});
document.addEventListener('focusout', () => {
  if (!renderPending) return;
  setTimeout(() => {
    const el = document.activeElement;
    if (el && /INPUT|TEXTAREA/.test(el.tagName)) return;
    renderPending = false;
    render();
  }, 0);
});

// ---------- Overlay, Toast, Konfetti ----------
function openOverlay(html) {
  $overlay.innerHTML = `<div class="backdrop" data-action="close-backdrop">${html}</div>`;
  $overlay.classList.add('open');
}
function closeOverlay() {
  $overlay.classList.remove('open');
  $overlay.innerHTML = '';
}

let toastTimer;
function toast(msg, undo) {
  clearTimeout(toastTimer);
  $toast.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button id="undo">Rückgängig</button>' : ''}`;
  $toast.classList.add('show');
  if (undo) document.getElementById('undo').onclick = () => { undo(); $toast.classList.remove('show'); };
  toastTimer = setTimeout(() => $toast.classList.remove('show'), 4000);
}

function confetti() {
  if (reducedMotion()) return;
  const colors = ['#ff4d6d', '#ffb547', '#ff8a4c', '#fff1e6', '#7cc7ff'];
  const box = document.createElement('div');
  box.className = 'confetti';
  box.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = Math.random() * 0.4 + 's';
    p.style.animationDuration = 1.6 + Math.random() * 1.4 + 's';
    p.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3500);
}

function celebrateMilestoneOnce() {
  const now = today();
  if (!milestones().some((m) => +m.date === +now)) return;
  const key = `wirzwei.party.${now.toISOString().slice(0, 10)}`;
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, '1');
  setTimeout(confetti, 400);
}

// ---------- Aktionen ----------
function removeWithUndo(col, id, label) {
  const rec = DB.get(col, id);
  if (!rec) return;
  DB.remove(col, id);
  toast(`„${label}“ gelöscht`, () => DB.put(col, rec));
}

const ACTIONS = {
  nav: (d) => goto(d.to),
  'set-user': (d) => { me = d.name; localStorage.setItem(ME_KEY, me); closeOverlay(); UI.enter = true; render(); },
  'switch-user': () => openOverlay(`
    <div class="sheet center">
      <h2>Hey ${esc(me)}</h2>
      <button class="btn primary wide" data-action="open-wishes">✨ Wünsche für die App</button>
      ${!pushSupported() ? '' : pushGranted()
        ? '<p class="muted push-on">🔔 Benachrichtigungen sind an</p><button class="btn ghost wide" data-action="push-test">Test-Benachrichtigung senden</button>'
        : Notification.permission === 'denied'
          ? '<p class="muted push-on">🔕 Benachrichtigungen sind blockiert. Erlauben kannst du sie in Chrome über das Schloss neben der Adresse oder in den App-Einstellungen des Handys.</p>'
          : '<button class="btn ghost wide" data-action="push-enable">🔔 Benachrichtigungen einschalten</button>'}
      <button class="btn ghost wide" data-action="toggle-walkers">${Decor.prefOn() ? 'Laufende Figuren ausblenden' : 'Laufende Figuren einblenden'}</button>
      <button class="btn link" data-action="close">Schließen</button>
    </div>`),
  'import-yes': () => {
    closeOverlay();
    DB.importLegacy();
    seedSuggestions();
    render();
    toast('Eure Daten sind übernommen');
  },
  'import-no': () => {
    closeOverlay();
    seedSuggestions();
    render();
  },
  'game-start': (d) => VolleyGame.start({ mode: d.mode, me, onClose: render }),
  'push-enable': () => { closeOverlay(); enablePush(); },
  // Zeigt direkt auf diesem Handy eine Benachrichtigung, ganz ohne Server.
  // Erscheint sie nicht, liegt es an den Einstellungen des Handys.
  'push-test': async () => {
    closeOverlay();
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification('Test von Wir zwei', { body: 'Wenn du das siehst, kann dein Handy Benachrichtigungen anzeigen.', icon: 'icons/icon-192.png', badge: 'icons/badge.png', tag: 'test' });
      toast('Test geschickt. Schau oben in die Leiste.');
    } catch (err) {
      toast('Test hat nicht geklappt: ' + (err && err.message ? err.message : 'unbekannter Fehler'));
    }
  },
  'push-later': () => {
    try { localStorage.setItem(PUSH_LATER_KEY, '1'); } catch {}
    render();
  },
  'open-wishes': () => {
    closeOverlay();
    goto('wishes');
    markWishesSeen();
  },
  'wish-status': (d) => {
    const w = DB.get('wishes', d.id);
    if (!w) return;
    // Wird ein Wunsch wieder geöffnet und später erneut erfüllt, gibt es auch wieder die Meldung.
    DB.put('wishes', { ...w, status: d.to, noticed: d.to === 'done' ? !!w.noticed : false });
  },
  'wish-remove': (d) => removeWithUndo('wishes', d.id, (DB.get('wishes', d.id)?.text || '').slice(0, 24)),
  'toggle-walkers': () => { Decor.setPref(!Decor.prefOn()); closeOverlay(); render(); },
  poster: () => openOverlay(`
    <div class="poster-full pop">
      <img src="assets/herbst.jpg" alt="Eure Herbst- und Halloween-Bucket-List als Bild">
      <button class="btn primary wide" data-action="close">Schließen</button>
    </div>`),
  close: closeOverlay,
  'open-note': (d) => {
    const n = DB.get('notes', d.id);
    if (!n) return;
    DB.put('notes', { ...n, readAt: Date.now() });
    openOverlay(`
      <div class="sheet paper pop">
        <p class="eyebrow">Von ${esc(n.from)} · ${fmtShort(n.at)}</p>
        <p class="note-text">${esc(n.text)}</p>
        <button class="btn primary wide" data-action="close">Schön ♥</button>
      </div>`);
    Decor.hearts(innerWidth / 2, innerHeight / 2 - 60, 10);
  },
  swipe: (d) => {
    const card = $app.querySelector('.dish.top');
    if (card) flyOut(card, d.like === '1');
  },
  'food-random': foodRandom,
  'food-pick': () => {
    const m = foodMatches();
    if (!m.length) return;
    const d = m[Math.floor(Math.random() * m.length)];
    openOverlay(`
      <div class="sheet center pop">
        <p class="eyebrow">Heute gibt's</p>
        <span class="big-emoji">${esc(d.emoji)}</span>
        <h2>${esc(d.name)}</h2>
        <div class="sheet-actions">
          <button class="btn ghost" data-action="food-pick">Nochmal</button>
          <button class="btn primary" data-action="close">Guten Hunger</button>
        </div>
      </div>`);
  },
  'food-reset': () => openOverlay(`
    <div class="sheet center">
      <h2>Neue Runde starten?</h2>
      <p class="muted">Eure Wischer und Matches werden für euch beide gelöscht. Selbst ergänzte Gerichte bleiben.</p>
      <div class="sheet-actions">
        <button class="btn ghost" data-action="close">Abbrechen</button>
        <button class="btn primary" data-action="food-reset-yes">Neue Runde</button>
      </div>
    </div>`),
  'food-reset-yes': () => { closeOverlay(); DB.clear('swipes'); toast('Neue Runde, wischt los'); },
  'movie-filter': (d) => { UI.movieFilter = d.to; render(); },
  'movie-pick': moviePick,
  'movie-toggle': (d) => { const m = DB.get('movies', d.id); if (m) DB.put('movies', { ...m, watched: !m.watched }); },
  'movie-remove': (d) => removeWithUndo('movies', d.id, DB.get('movies', d.id)?.title),
  season: (d) => { UI.season = d.to; render(); },
  'bucket-toggle': (d, el) => {
    const b = DB.get('bucket', d.id);
    if (!b) return;
    const nowDone = !b.doneAt;
    if (nowDone) {
      const r = el.getBoundingClientRect();
      const glyph = { autumn: '🍂', winter: '❄️', spring: '🌸', summer: '🏐' }[b.season];
      Decor.hearts(r.left + r.width / 2, r.top, 7, ['♥', glyph]);
    }
    DB.put('bucket', { ...b, doneAt: nowDone ? Date.now() : null, doneBy: nowDone ? me : null });
    if (nowDone) {
      const rest = DB.list('bucket').filter((x) => x.season === b.season && !x.doneAt).length;
      if (rest === 0) { confetti(); toast(`${SEASONS[b.season].name}-Liste komplett!`); }
    }
  },
  'bucket-remove': (d) => removeWithUndo('bucket', d.id, DB.get('bucket', d.id)?.text),
  install: async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    installEvent = null;
    render();
  },
};

const FORMS = {
  wish: (f) => {
    DB.put('wishes', { id: uid(), text: f.text, by: me, at: Date.now(), status: 'open', seen: false, noticed: false });
    toast('Dein Wunsch ist angekommen');
    Decor.hearts(innerWidth / 2, innerHeight / 2, 7, ['✨', '♥']);
  },
  note: (f) => {
    DB.put('notes', { id: uid(), from: me, to: other(), text: f.text, at: Date.now(), readAt: null });
    toast(`Zettel liegt für ${other()} bereit`);
    Decor.hearts(innerWidth / 2, innerHeight / 2, 9);
  },
  dish: (f) => {
    DB.put('dishes', { id: `c-${uid()}`, name: f.name, emoji: '🍽️' });
    toast(`${f.name} ist jetzt im Stapel`);
  },
  movie: (f) => {
    DB.put('movies', { id: uid(), title: f.title, kind: f.kind, by: me, at: Date.now(), watched: false });
    UI.movieFilter = 'open';
  },
  bucket: (f) => {
    DB.put('bucket', { id: uid(), season: UI.season, text: f.text, order: Date.now(), doneBy: null, doneAt: null });
  },
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  if (el.dataset.action === 'close-backdrop') {
    if (e.target === el) closeOverlay();
    return;
  }
  ACTIONS[el.dataset.action]?.(el.dataset, el);
});

document.addEventListener('submit', (e) => {
  const form = e.target.closest('[data-form]');
  if (!form) return;
  e.preventDefault();
  const values = Object.fromEntries(new FormData(form));
  Object.keys(values).forEach((k) => { values[k] = values[k].trim(); });
  if (Object.values(values).some((v) => !v)) return;
  document.activeElement?.blur();
  FORMS[form.dataset.form](values);
  renderPending = false;
  render();
});

// ---------- App-Installation ----------
let installEvent = null;
addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installEvent = e;
  document.getElementById('install')?.classList.remove('hidden');
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

// Wird ein Link in eine schon offene Seite eingefügt, lädt sie neu und meldet an.
addEventListener('hashchange', () => {
  // Nur persönliche Links lösen eine Anmeldung aus, Sprungziele aus Benachrichtigungen nicht.
  if (/^#(timm|fenja)-/.test(location.hash)) location.reload();
});

// Beim Start: Ist noch jemand angemeldet, geht es direkt in die App.
(async () => {
  render();
  await Auth.restore();
  // Persönlicher Link, z. B. …/wir-zwei/#fenja-CODE: einmal öffnen genügt, danach bleibt man angemeldet.
  const link = location.hash.match(/^#(timm|fenja)-([A-Za-z0-9]+)$/);
  if (link) {
    history.replaceState(null, '', location.pathname);
    if (!Auth.user || Auth.person().toLowerCase() !== link[1]) {
      try {
        await Auth.signInWithLink(link[1], link[2]);
      } catch (err) {
        UI.loginError = 'Dieser Link funktioniert leider nicht.';
        Auth.user = null;
      }
    }
  }
  if (Auth.user) {
    me = Auth.person();
    await enterApp();
  } else {
    render();
  }
})();
