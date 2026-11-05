// Strand-Duell: Volleyball mit Timm und Fenja, zu zweit auf einem Handy oder gegen den Computer.
const VolleyGame = (() => {
  const W = 400, GROUND = 272, NET_X = 200, NET_TOP = 170, BALL_R = 12;
  const GRAVITY = 520, HIT_SPEED = 400, WIN_SCORE = 7;
  const PLAYER_GRAVITY = 800, JUMP_SPEED = 335, RUN_SPEED = 235, CPU_SPEED = 175;
  const BODY_UP = 62, BODY_R = 28, STEP = 1 / 120;

  let s = null; // aktuelles Spiel

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function courtSVG() {
    return `<svg class="g-court" viewBox="0 0 ${W} 300" aria-label="Spielfeld am Strand">
      <defs><linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ccbf0"/><stop offset="1" stop-color="#c9f2f7"/></linearGradient></defs>
      <rect width="${W}" height="165" fill="url(#g-sky)"/>
      <circle cx="342" cy="44" r="20" fill="#ffd34d"/>
      <g class="b-cloud" fill="#fff" opacity=".9"><ellipse cx="72" cy="42" rx="24" ry="9"/><ellipse cx="60" cy="36" rx="12" ry="9"/><ellipse cx="82" cy="34" rx="14" ry="11"/></g>
      <rect y="150" width="${W}" height="50" fill="#35c5cf"/>
      <g class="b-wave"><path d="M-40 168Q-30 162 -20 168T0 168T20 168T40 168T60 168T80 168T100 168T120 168T140 168T160 168T180 168T200 168T220 168T240 168T260 168T280 168T300 168T320 168T340 168T360 168T380 168T400 168T420 168T440 168" stroke="#fff" stroke-width="2.5" fill="none" opacity=".6"/></g>
      <path d="M0 196Q110 184 210 194T${W} 190V300H0Z" fill="#f7dc9c"/>
      <path d="M0 ${GROUND + 4}H${W}" stroke="#e6c67f" stroke-width="2" stroke-dasharray="7 7"/>
      <ellipse id="g-shadow-a" rx="22" ry="4" cy="${GROUND + 3}" fill="#000" opacity=".15"/>
      <ellipse id="g-shadow-b" rx="22" ry="4" cy="${GROUND + 3}" fill="#000" opacity=".15"/>
      <ellipse id="g-shadow-ball" rx="10" ry="2.6" cy="${GROUND + 4}" fill="#000" opacity=".16"/>
      <path d="M${NET_X} ${GROUND + 6}V${NET_TOP - 6}" stroke="#7c5d43" stroke-width="6" stroke-linecap="round"/>
      <path d="M${NET_X - 4} ${NET_TOP}V${NET_TOP + 42}M${NET_X + 4} ${NET_TOP}V${NET_TOP + 42}" stroke="#fff" stroke-width="1.4"/>
      <path d="M${NET_X - 5} ${NET_TOP + 10}H${NET_X + 5}M${NET_X - 5} ${NET_TOP + 20}H${NET_X + 5}M${NET_X - 5} ${NET_TOP + 30}H${NET_X + 5}M${NET_X - 5} ${NET_TOP + 40}H${NET_X + 5}" stroke="#fff" stroke-width="1.2"/>
      <rect x="${NET_X - 6}" y="${NET_TOP - 3}" width="12" height="5" rx="2" fill="#fff"/>
      <g id="g-a" class="g-player">${BEACH_FENJA}</g>
      <g id="g-b" class="g-player">${BEACH_TIMM}</g>
      <g id="g-ball"><g id="g-ball-spin">${VOLLEYBALL}</g></g>
    </svg>`;
  }

  function makePlayer(id, name, side, x, min, max) {
    return { id, name, side, x, y: GROUND, vx: 0, vy: 0, min, max, target: null, cooldown: 0, hitTimer: 0, keyL: false, keyR: false, cpu: false };
  }

  function jump(p) {
    if (p.y >= GROUND) p.vy = -JUMP_SPEED;
  }

  function serve(side) {
    s.ball = { x: side === 'left' ? 100 : 300, y: 74, vx: 0, vy: 0, spin: 0 };
    s.cpuError = (Math.random() - 0.5) * 26;
    s.phase = 'play';
  }

  // ---------- Computer-Gegner ----------
  function landingX(b) {
    const h = GROUND - BODY_UP - b.y;
    const t = (b.vy + Math.sqrt(Math.max(0, b.vy * b.vy + 2 * GRAVITY * h))) / GRAVITY;
    return clamp(b.x + b.vx * t, BALL_R, W - BALL_R);
  }

  function steerCpu(p) {
    const b = s.ball;
    const mine = (p.side === 'left') === (b.x < NET_X);
    const land = landingX(b);
    const landsMine = (p.side === 'left') === (land < NET_X);
    if (mine || landsMine) {
      // etwas hinter den Ball stellen, damit er Richtung Netz fliegt
      const behind = p.side === 'left' ? -9 : 9;
      p.cpuTarget = land + behind + s.cpuError;
      const dx = Math.abs(b.x - p.x);
      if (dx < 30 && b.vy > 0 && b.y > p.y - 165 && b.y < p.y - 92) jump(p);
    } else {
      p.cpuTarget = (p.min + p.max) / 2;
    }
    const d = p.cpuTarget - p.x;
    p.vx = Math.abs(d) < 3 ? 0 : Math.sign(d) * CPU_SPEED;
  }

  // ---------- Physik ----------
  function stepPlayer(p, dt) {
    if (p.cpu) {
      steerCpu(p);
    } else if (p.target !== null) {
      const d = p.target - p.x;
      p.vx = Math.abs(d) < 3 ? 0 : Math.sign(d) * RUN_SPEED;
    } else {
      p.vx = (p.keyR ? RUN_SPEED : 0) - (p.keyL ? RUN_SPEED : 0);
    }
    p.x = clamp(p.x + p.vx * dt, p.min, p.max);
    p.vy += PLAYER_GRAVITY * dt;
    p.y += p.vy * dt;
    if (p.y >= GROUND) { p.y = GROUND; p.vy = 0; }
    p.cooldown = Math.max(0, p.cooldown - dt);
    p.hitTimer = Math.max(0, p.hitTimer - dt);
  }

  function collidePlayer(p, b) {
    if (p.cooldown > 0) return;
    const cx = p.x, cy = p.y - BODY_UP;
    const dx = b.x - cx, dy = b.y - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > BODY_R + BALL_R || dist === 0) return;
    const nx = dx / dist, ny = dy / dist;
    const toNet = p.side === 'left' ? 1 : -1;
    b.vx = clamp(nx * HIT_SPEED + p.vx * 0.35 + toNet * 70, -420, 420);
    b.vy = Math.min(ny * HIT_SPEED, -320) + Math.min(p.vy, 0) * 0.2;
    p.cooldown = 0.16;
    p.hitTimer = 0.24;
  }

  function stepBall(b, dt) {
    b.vy += GRAVITY * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.spin += b.vx * dt * 2.4;
    if (b.x < BALL_R) { b.x = BALL_R; b.vx = Math.abs(b.vx) * 0.9; }
    if (b.x > W - BALL_R) { b.x = W - BALL_R; b.vx = -Math.abs(b.vx) * 0.9; }
    // Netz: seitlich abprallen, oben von der Kante abspringen
    const half = 3;
    if (b.y > NET_TOP && Math.abs(b.x - NET_X) < half + BALL_R) {
      const dir = b.x < NET_X ? -1 : 1;
      b.x = NET_X + dir * (half + BALL_R);
      b.vx = dir * Math.max(40, Math.abs(b.vx) * 0.45);
    } else {
      const dx = b.x - NET_X, dy = b.y - NET_TOP;
      const d = Math.hypot(dx, dy);
      if (d < BALL_R + half && d > 0 && dy <= 0) {
        const nx = dx / d, ny = dy / d;
        const dot = b.vx * nx + b.vy * ny;
        if (dot < 0) { b.vx -= 1.7 * dot * nx; b.vy -= 1.7 * dot * ny; }
        b.x = NET_X + nx * (BALL_R + half);
        b.y = NET_TOP + ny * (BALL_R + half);
      }
    }
  }

  function scorePoint(winner) {
    winner.points = (winner.points || 0) + 1;
    s.phase = 'pause';
    s.pause = 1.1;
    s.nextServe = winner.side;
    updateScore();
    if (winner.points >= WIN_SCORE) return finish(winner);
    banner(`Punkt für ${s.cpuName === winner.name ? `Computer-${winner.name}` : winner.name}!`);
  }

  function step(dt) {
    stepPlayer(s.a, dt);
    stepPlayer(s.b, dt);
    if (s.phase === 'pause') {
      s.pause -= dt;
      if (s.pause <= 0) { banner(''); serve(s.nextServe); }
      return;
    }
    if (s.phase !== 'play') return;
    const b = s.ball;
    stepBall(b, dt);
    collidePlayer(s.a, b);
    collidePlayer(s.b, b);
    if (b.y + BALL_R >= GROUND + 4) {
      b.y = GROUND + 4 - BALL_R;
      scorePoint(b.x < NET_X ? s.b : s.a);
    }
  }

  // ---------- Darstellung ----------
  function paint() {
    const { a, b, ball } = s;
    s.elA.setAttribute('transform', `translate(${(a.x - 36).toFixed(1)} ${(a.y - 96).toFixed(1)}) scale(.72)`);
    s.elB.setAttribute('transform', `translate(${(b.x + 36).toFixed(1)} ${(b.y - 96).toFixed(1)}) scale(-.72 .72)`);
    s.elA.classList.toggle('hit', a.hitTimer > 0);
    s.elB.classList.toggle('hit', b.hitTimer > 0);
    s.shA.setAttribute('cx', a.x.toFixed(1));
    s.shB.setAttribute('cx', b.x.toFixed(1));
    s.elBall.setAttribute('transform', `translate(${ball.x.toFixed(1)} ${ball.y.toFixed(1)}) scale(1.09)`);
    s.elSpin.setAttribute('transform', `rotate(${ball.spin.toFixed(0)})`);
    s.shBall.setAttribute('cx', ball.x.toFixed(1));
  }

  function loop(t) {
    if (!s) return;
    let elapsed = Math.min(0.05, (t - s.last) / 1000);
    s.last = t;
    s.acc += elapsed;
    while (s.acc >= STEP) { step(STEP); s.acc -= STEP; if (!s) return; }
    paint();
    s.raf = requestAnimationFrame(loop);
  }

  function banner(text) {
    s.elBanner.textContent = text;
    s.elBanner.classList.toggle('show', !!text);
  }
  function updateScore() {
    s.root.querySelector('#g-score-a').textContent = s.a.points || 0;
    s.root.querySelector('#g-score-b').textContent = s.b.points || 0;
  }

  function finish(winner) {
    s.phase = 'over';
    const loser = winner === s.a ? s.b : s.a;
    const score = `${Math.max(s.a.points || 0, s.b.points || 0)}:${Math.min(s.a.points || 0, s.b.points || 0)}`;
    let title, sub;
    if (s.mode === 'duo') {
      DB.put('volley', { id: `v-${Date.now().toString(36)}`, winner: winner.name, loser: loser.name, score, at: Date.now() });
      title = `${winner.name} gewinnt ${score}!`;
      sub = `${loser.name} kocht heute 🍳`;
    } else if (winner.cpu) {
      title = `Computer-${winner.name} gewinnt ${score}`;
      sub = 'Revanche?';
    } else {
      title = `Du gewinnst ${score}!`;
      sub = `Computer-${loser.name} ist geschlagen.`;
    }
    s.root.querySelector('#g-end').innerHTML = `
      <div class="sheet center pop">
        <p class="eyebrow">Spiel vorbei</p>
        <h2>${title}</h2>
        <p class="muted">${sub}</p>
        <div class="sheet-actions">
          <button class="btn ghost" id="g-leave">Zurück</button>
          <button class="btn primary" id="g-again">Nochmal</button>
        </div>
      </div>`;
    s.root.querySelector('#g-end').classList.add('open');
    s.root.querySelector('#g-leave').onclick = stop;
    const { mode, me, onClose } = s;
    s.root.querySelector('#g-again').onclick = () => { stop(); start({ mode, me, onClose }); };
    if (typeof confetti === 'function') confetti();
  }

  // ---------- Steuerung ----------
  function bindPad(pad, player) {
    const toTarget = (e) => {
      const r = pad.getBoundingClientRect();
      const ratio = clamp((e.clientX - r.left) / r.width, 0, 1);
      player.target = player.min + ratio * (player.max - player.min);
    };
    pad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      pad.setPointerCapture(e.pointerId);
      pad.classList.add('down');
      toTarget(e);
      jump(player);
    });
    pad.addEventListener('pointermove', (e) => { if (pad.hasPointerCapture(e.pointerId)) toTarget(e); });
    const up = () => { player.target = null; pad.classList.remove('down'); };
    pad.addEventListener('pointerup', up);
    pad.addEventListener('pointercancel', up);
  }

  function onKey(e) {
    if (!s) return;
    const down = e.type === 'keydown';
    const human = s.mode === 'cpu' ? (s.a.cpu ? s.b : s.a) : null;
    const left = human || s.a, right = human || s.b;
    const map = { a: [left, 'keyL'], d: [left, 'keyR'], w: [left, 'jump'], ArrowLeft: [right, 'keyL'], ArrowRight: [right, 'keyR'], ArrowUp: [right, 'jump'] };
    const hit = map[e.key];
    if (!hit) return;
    e.preventDefault();
    if (hit[1] === 'jump') { if (down) jump(hit[0]); } else hit[0][hit[1]] = down;
  }

  // ---------- Start und Ende ----------
  function start({ mode, me, onClose }) {
    stop(true);
    const [nameA, nameB] = [COUPLE.people[1], COUPLE.people[0]]; // Fenja links, Timm rechts
    const root = document.createElement('div');
    root.id = 'game';
    root.innerHTML = `
      <header class="g-head">
        <div class="g-score"><span>${nameA}</span><strong id="g-score-a">0</strong><i>:</i><strong id="g-score-b">0</strong><span>${nameB}</span></div>
        <button class="g-close" id="g-close" aria-label="Spiel beenden">✕</button>
      </header>
      <div class="g-stage">${courtSVG()}<p class="g-banner" id="g-banner" role="status"></p></div>
      <div class="g-pads ${mode === 'cpu' ? 'solo' : ''}" id="g-pads"></div>
      <div class="g-end" id="g-end"></div>`;
    document.body.appendChild(root);

    const a = makePlayer('a', nameA, 'left', 100, 24, NET_X - 24);
    const b = makePlayer('b', nameB, 'right', 300, NET_X + 24, W - 24);
    s = {
      mode, me, onClose, root, a, b, phase: 'play', acc: 0, last: performance.now(), cpuError: 0, cpuName: null,
      elA: root.querySelector('#g-a'), elB: root.querySelector('#g-b'),
      shA: root.querySelector('#g-shadow-a'), shB: root.querySelector('#g-shadow-b'),
      elBall: root.querySelector('#g-ball'), elSpin: root.querySelector('#g-ball-spin'), shBall: root.querySelector('#g-shadow-ball'),
      elBanner: root.querySelector('#g-banner'),
    };

    const pads = root.querySelector('#g-pads');
    const padHTML = (cls, name) => `<div class="g-pad ${cls}" data-name="${name}"><strong>${name}</strong><span>Antippen zum Springen</span><span>Gedrückt halten und ziehen zum Laufen</span></div>`;
    if (mode === 'cpu') {
      const humanIsB = me === nameB;
      (humanIsB ? a : b).cpu = true;
      s.cpuName = (humanIsB ? a : b).name;
      pads.innerHTML = padHTML('', me);
      bindPad(pads.firstElementChild, humanIsB ? b : a);
    } else {
      pads.innerHTML = padHTML('', nameA) + padHTML('', nameB);
      bindPad(pads.children[0], a);
      bindPad(pads.children[1], b);
    }

    root.querySelector('#g-close').onclick = stop;
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    serve(Math.random() < 0.5 ? 'left' : 'right');
    paint();
    s.raf = requestAnimationFrame(loop);
  }

  function stop(silent) {
    if (!s) return;
    const { root, raf, onClose } = s;
    cancelAnimationFrame(raf);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('keyup', onKey);
    root.remove();
    s = null;
    if (silent !== true && onClose) onClose();
  }

  return { start, stop, debug: () => s };
})();
