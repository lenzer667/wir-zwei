// Figuren, Laufanimation, Jahreszeiten-Effekte und schwebende Herzen.

// ---------- Figuren ----------
const SKIN = '#f9d7bb';

// Fenja: lange Locken, dunkelbraun mit rötlichem Schimmer, grau-blaue Augen, Sommersprossen
const FENJA_BACK_HAIR = `
    <path d="M50 3C30 1 15 14 13 32Q5 38 9 46Q3 54 8 62Q2 71 9 78Q6 87 15 90Q18 98 28 95Q34 92 33 80H67Q66 92 72 95Q82 98 85 90Q94 87 91 78Q98 71 92 62Q97 54 91 46Q95 38 87 32C85 14 70 1 50 3Z" fill="#54291a"/>
    <path d="M13 46Q19 50 14 55Q9 60 15 64Q20 68 15 73Q11 78 17 82M21 58Q26 62 22 67Q18 72 23 76Q27 80 24 86" stroke="#7a3a1e" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M87 46Q81 50 86 55Q91 60 85 64Q80 68 85 73Q89 78 83 82M79 58Q74 62 78 67Q82 72 77 76Q73 80 76 86" stroke="#a84f22" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M91 58Q86 63 90 68Q94 73 89 78M75 70Q71 75 74 80" stroke="#cf6d30" stroke-width="2" stroke-linecap="round" fill="none"/>`;

const FENJA_FACE = `
    <path d="M23 36C23 16 77 16 77 36C77 53 62 65 50 65C38 65 23 53 23 36Z" fill="#fbdfca"/>
    <path d="M30 30Q37 26 44 29M56 29Q63 26 70 30" stroke="#5c3320" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <ellipse cx="32" cy="50" rx="5" ry="3" fill="#ff9fae" opacity=".5"/><ellipse cx="68" cy="50" rx="5" ry="3" fill="#ff9fae" opacity=".5"/>
    <g fill="#c98a66" opacity=".75"><circle cx="35" cy="47" r=".7"/><circle cx="39" cy="50" r=".7"/><circle cx="43" cy="48" r=".6"/><circle cx="46" cy="50.500" r=".6"/><circle cx="54" cy="50.500" r=".6"/><circle cx="57" cy="48" r=".6"/><circle cx="61" cy="50" r=".7"/><circle cx="65" cy="47" r=".7"/></g>
    <g class="eyes">
      <ellipse cx="38" cy="40" rx="7.400" ry="8.600" fill="#fff"/><ellipse cx="62" cy="40" rx="7.400" ry="8.600" fill="#fff"/>
      <ellipse cx="38.500" cy="40.500" rx="6" ry="7.600" fill="#4f7490"/><ellipse cx="61.500" cy="40.500" rx="6" ry="7.600" fill="#4f7490"/>
      <ellipse cx="38.500" cy="44" rx="4.400" ry="3.800" fill="#9dbfd4"/><ellipse cx="61.500" cy="44" rx="4.400" ry="3.800" fill="#9dbfd4"/>
      <circle cx="38.500" cy="40" r="3.200" fill="#1a2632"/><circle cx="61.500" cy="40" r="3.200" fill="#1a2632"/>
      <circle cx="36" cy="36.800" r="2.400" fill="#fff"/><circle cx="59" cy="36.800" r="2.400" fill="#fff"/>
      <circle cx="41" cy="44" r="1.100" fill="#fff"/><circle cx="64" cy="44" r="1.100" fill="#fff"/>
      <path d="M29 38C31 31 44 29 46 35M71 38C69 31 56 29 54 35" stroke="#2b1a17" stroke-width="2.500" stroke-linecap="round" fill="none"/>
      <path d="M29 38L26.500 36M71 38L73.500 36" stroke="#2b1a17" stroke-width="1.400" stroke-linecap="round"/>
    </g>
    <path d="M49 50.500Q50 51.800 51 50.500" stroke="#d99a86" stroke-width="1.300" stroke-linecap="round" fill="none"/>
    <path d="M43 55.500Q47 54 50 55.200Q53 54 57 55.500Q50 61.500 43 55.500Z" fill="#d9626f"/>
    <path d="M43 55.500Q50 57.500 57 55.500" stroke="#a83f50" stroke-width="1" stroke-linecap="round" fill="none"/>`;

// Seitenscheitel, die Stirn bleibt frei
const FENJA_TOP = `
    <path d="M60 6C38 2 19 15 18 42C23 29 36 19 60 14Z" fill="#5f2f1c"/>
    <path d="M60 6C74 7 83 21 82 42C78 29 70 18 60 14Z" fill="#6e3720"/>
    <path d="M30 18C37 11 46 9 54 10M66 11C72 14 76 20 78 27" stroke="#a84f22" stroke-width="2.400" stroke-linecap="round" fill="none"/>`;

const FENJA_LOCKS = `
    <path d="M21 34Q15 40 20 46Q24 52 19 58Q15 64 21 70" stroke="#5f2f1c" stroke-width="5.500" stroke-linecap="round" fill="none"/>
    <path d="M79 34Q85 40 80 46Q76 52 81 58Q85 64 79 70" stroke="#a84f22" stroke-width="5.500" stroke-linecap="round" fill="none"/>
    <path d="M81 42Q77 47 81 52M79 60Q83 64 79 68" stroke="#cf6d30" stroke-width="1.600" stroke-linecap="round" fill="none"/>`;

const FENJA_HEAD = `${FENJA_FACE}${FENJA_TOP}${FENJA_LOCKS}`;

// Zöpfe beim Volleyball
const fenjaBraid = (x, dark, light) => [50, 58, 66, 74, 82].map((y, i) =>
  `<ellipse cx="${x + (i % 2 ? 2 : -2)}" cy="${y}" rx="7" ry="5.500" fill="${i % 2 ? light : dark}"/>`).join('')
  + `<rect x="${x - 5}" y="87" width="10" height="4" rx="2" fill="#2fc4c9"/><path d="M${x - 5} 91Q${x} 101 ${x + 5} 91Z" fill="${dark}"/>`;
const FENJA_BRAIDS_BACK = `<circle cx="50" cy="29" r="29" fill="#54291a"/>`;
const FENJA_BRAIDED_HEAD = `${FENJA_FACE}${FENJA_TOP}${fenjaBraid(17, '#5f2f1c', '#7a3a1e')}${fenjaBraid(83, '#8a4120', '#a84f22')}`;

// Timm: nach hinten gestylte Haare, eckige dunkle Brille, Oberlippen- und Kinnbart
const TIMM_HEAD = `
    <path d="M22 40Q17 42 19 49Q21 54 25 53ZM78 40Q83 42 81 49Q79 54 75 53Z" fill="#f2c9a8"/>
    <path d="M25 34C25 15 75 15 75 34C75 53 64 67 50 67C36 67 25 53 25 34Z" fill="#f9d7bb"/>
    <path d="M26 45C28 58 39 67 50 67C61 67 72 58 74 45C72 52 66 58 60 59Q50 56 40 59C34 58 28 52 26 45Z" fill="#5a3b2a" opacity=".24"/>
    <path d="M41 53Q46 50 50 51.500Q54 50 59 53Q54 54 50 53.200Q46 54 41 53Z" fill="#4a2e20"/>
    <path d="M43 61Q50 59 57 61Q56 67 50 67.500Q44 67 43 61Z" fill="#4a2e20"/>
    <path d="M24 39C20 30 22 19 28 13C36 2 56 -4 70 4C81 9 83 24 77 39C76 33 74 28 72 25C61 28 45 22 33 23C29 27 26 32 24 39Z" fill="#33201a"/>
    <path d="M30 20C39 8 56 3 72 12M35 23C45 13 59 11 75 20M45 24C53 18 62 18 72 24" stroke="#5e4131" stroke-width="2.400" stroke-linecap="round" fill="none"/>
    <path d="M24 39C24 33 25 29 28 25M77 39C77 33 76 29 73 25" stroke="#4a3226" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M31 33Q38 29 46 32M54 32Q62 29 69 33" stroke="#2b1a14" stroke-width="3" stroke-linecap="round" fill="none"/>
    <g class="eyes">
      <ellipse cx="39" cy="42" rx="4.800" ry="5.200" fill="#fff"/><ellipse cx="61" cy="42" rx="4.800" ry="5.200" fill="#fff"/>
      <ellipse cx="39.500" cy="42.300" rx="3.900" ry="4.600" fill="#5e3a1f"/><ellipse cx="60.500" cy="42.300" rx="3.900" ry="4.600" fill="#5e3a1f"/>
      <circle cx="39.500" cy="42.300" r="2.200" fill="#1a100b"/><circle cx="60.500" cy="42.300" r="2.200" fill="#1a100b"/>
      <circle cx="38" cy="40.300" r="1.400" fill="#fff"/><circle cx="59" cy="40.300" r="1.400" fill="#fff"/>
    </g>
    <g fill="#fff" fill-opacity=".1" stroke="#1d1411" stroke-width="2.800">
      <rect x="28" y="35" width="22" height="15" rx="2.500"/><rect x="50" y="35" width="22" height="15" rx="2.500"/>
    </g>
    <path d="M28 39L23 38M72 39L77 38" stroke="#1d1411" stroke-width="2.800" stroke-linecap="round"/>
    <path d="M44 56.500Q50 60 56 56.500" stroke="#8c4a3e" stroke-width="2" stroke-linecap="round" fill="none"/>`;

const FENJA_SVG = `
<g class="ch">
  <ellipse cx="50" cy="133" rx="25" ry="3.5" fill="#000" opacity=".3"/>
  <g class="bob">
    ${FENJA_BACK_HAIR}
    <g class="leg a"><rect x="37" y="100" width="12" height="27" rx="6" fill="#4b352c"/><ellipse cx="44" cy="128" rx="9" ry="4.5" fill="#d9a066"/></g>
    <g class="leg b"><rect x="51" y="100" width="12" height="27" rx="6" fill="#5a4136"/><ellipse cx="58" cy="128" rx="9" ry="4.5" fill="#e4ae76"/></g>
    <g class="arm"><path d="M33 78Q24 88 25 99" stroke="#b98a5e" stroke-width="10" stroke-linecap="round" fill="none"/><circle cx="25" cy="102" r="5" fill="${SKIN}"/></g>
    <path d="M33 72Q50 65 67 72L72 105Q50 111 28 105Z" fill="#c79a6c"/>
    <path d="M40 76V105M50 74V107M60 76V105" stroke="#a97e54" stroke-width="2" stroke-linecap="round"/>
    <path d="M68 78Q80 86 90 92" stroke="#b98a5e" stroke-width="10" stroke-linecap="round" fill="none"/>
    <rect x="39" y="60" width="22" height="14" rx="6" fill="#d8ae80"/>
    ${FENJA_HEAD}
  </g>
</g>`;

const TIMM_SVG = `
<g class="ch" transform="translate(84 -6)">
  <ellipse cx="50" cy="139" rx="25" ry="3.5" fill="#000" opacity=".3"/>
  <g class="bob">
    <g class="leg a"><rect x="37" y="100" width="12" height="33" rx="6" fill="#2c2730"/><ellipse cx="44" cy="134" rx="9" ry="4.5" fill="#e9e1d8"/></g>
    <g class="leg b"><rect x="51" y="100" width="12" height="33" rx="6" fill="#37313c"/><ellipse cx="58" cy="134" rx="9" ry="4.5" fill="#f5eee6"/></g>
    <g class="arm back"><path d="M68 78Q76 88 75 99" stroke="#463e4e" stroke-width="10" stroke-linecap="round" fill="none"/><circle cx="75" cy="102" r="5" fill="${SKIN}"/></g>
    <ellipse cx="50" cy="68" rx="21" ry="9" fill="#332d3a"/>
    <path d="M32 72Q50 65 68 72L72 106Q50 112 28 106Z" fill="#4c4455" stroke="#6b6176" stroke-width="1"/>
    <path d="M38 93H62L65 104H35Z" fill="#3d3645"/>
    <path d="M45 73V84M55 73V84" stroke="#d8cfc4" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M32 78Q20 88 8 98" stroke="#463e4e" stroke-width="10" stroke-linecap="round" fill="none"/>
    ${TIMM_HEAD}
  </g>
</g>`;

function coupleSVG(cls = '') {
  return `<svg class="couple ${cls}" viewBox="0 -12 184 156" aria-hidden="true">
    ${FENJA_SVG}${TIMM_SVG}
    <circle cx="92" cy="94" r="6" fill="${SKIN}"/>
    <path class="clasp" d="M92 78C88 72 81 74 83 81C84 84 88 87 92 90C96 87 100 84 101 81C103 74 96 72 92 78Z" fill="#ff5f82"/>
  </svg>`;
}

const CATS = {
  grey: { fur: '#94908b', dark: '#5d5956', eye: '#2a2220', extra: '<path d="M20 19Q21 25 19 30M28 17Q29 24 27 30M36 19Q37 24 35 28M44 11V15M48 10V15M52 11V15" stroke="#5d5956" stroke-width="2.4" stroke-linecap="round" fill="none"/>' },
  light: { fur: '#aaa49c', dark: '#6d6861', eye: '#2a2220', extra: '<path d="M18 21Q19 26 17 31M26 18Q27 25 25 31M34 18Q35 24 33 30M44 11V15M48 10V15M52 11V15" stroke="#6d6861" stroke-width="2.4" stroke-linecap="round" fill="none"/>' },
};

function catSVG(kind, cls = '') {
  return `<svg class="cat ${cls}" viewBox="0 0 64 48" aria-hidden="true">${catInner(kind)}</svg>`;
}

function catInner(kind) {
  const c = CATS[kind];
  const leg = (x, group) => `<rect class="paw ${group}" x="${x}" y="33" width="6" height="12" rx="3" fill="${c.dark}"/>`;
  return `
    <ellipse cx="30" cy="45.5" rx="22" ry="2" fill="#000" opacity=".3"/>
    <path class="tail" d="M14 30Q3 26 6 11" stroke="${c.fur}" stroke-width="5" stroke-linecap="round" fill="none"/>
    ${leg(14, 'a')}${leg(38, 'a')}${leg(22, 'b')}${leg(30, 'b')}
    <ellipse cx="28" cy="27" rx="18" ry="11" fill="${c.fur}"/>
    <path d="M38 14L39 2L47 10ZM50 10L57 2L58 14Z" fill="${c.fur}"/><path d="M40 11L40.6 5L45 9.5ZM52 9.5L56 5L56.6 11Z" fill="#ff9fae"/>
    <circle cx="48" cy="20" r="12" fill="${c.fur}"/>
    ${c.extra}
    <g class="eyes"><circle cx="43.5" cy="20" r="3.3" fill="${c.eye}"/><circle cx="52.5" cy="20" r="3.3" fill="${c.eye}"/><circle cx="43.5" cy="20" r="1.6" fill="#120e0d"/><circle cx="52.5" cy="20" r="1.6" fill="#120e0d"/><circle cx="42.6" cy="18.8" r=".9" fill="#fff"/><circle cx="51.6" cy="18.8" r=".9" fill="#fff"/></g>
    <path d="M48 24.5L46.6 23H49.4Z" fill="#ff8d9c"/>
    <path d="M38 23L33 22M38 26L33 27M58 23L62 22M58 26L62 27" stroke="#f3ece3" stroke-width=".8" opacity=".7"/>`;
}

// Sonnenbrille mit dunklen Gläsern und kleinem Glanz
function shades(rim, x1, x2) {
  const lens = (x) => `<rect x="${x}" y="32" width="22" height="20" rx="7" fill="#12161f" stroke="${rim}" stroke-width="2.6"/>
    <path d="M${x + 5} 45L${x + 13} 36M${x + 10} 47L${x + 17} 39" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>`;
  return `${lens(x1)}${lens(x2)}<path d="M${x1 + 22} 39Q${(x1 + 22 + x2) / 2} 36 ${x2} 39" stroke="${rim}" stroke-width="2.6" fill="none"/>`;
}

// ---------- Schnee-Szene für die Winterliste ----------
function winterScene() {
  const sync = -((performance.now() / 1000) % 2.8);
  const flakes = [[24, 5], [62, 7], [104, 4.6], [146, 6.4], [188, 5.4], [232, 7.2], [274, 4.8], [316, 6.6], [352, 5.2], [384, 7]]
    .map(([x, d], i) => `<circle class="w-flake" cx="${x}" cy="-6" r="${1.3 + (i % 3) * 0.5}" style="animation-duration:${d}s;animation-delay:calc(var(--sync) - ${(i * 0.7).toFixed(1)}s)"/>`).join('');
  const pine = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="34" width="6" height="12" fill="#4a3428"/><path d="M0 -18L18 12H8L22 36H-22L-8 12H-18Z" fill="#1f5a56"/><path d="M0 -18L9 -3Q2 0 -1 -3Q-4 0 -9 -3ZM-13 21Q-5 25 0 21Q6 26 13 21L8 12Q2 16 0 13Q-4 16 -8 12Z" fill="#eef7ff"/></g>`;
  // Der Wurf ist für beide gleich, für Timm gespiegelt und um eine halbe Runde versetzt.
  const throwBall = `
    <g class="sb-x"><g class="sb-y"><circle class="sb" r="7" fill="#fff" stroke="#b7d6ee" stroke-width="1.2"/></g></g>
    <g transform="translate(306 134)"><g class="splat" fill="#fff">
      <circle r="8"/><circle cx="-11" cy="-7" r="3.4"/><circle cx="11" cy="-9" r="3"/><circle cx="13" cy="6" r="3.4"/><circle cx="-12" cy="8" r="2.8"/><circle cx="0" cy="-14" r="2.6"/><circle cx="1" cy="13" r="2.6"/>
    </g></g>`;
  const throwArm = (color, mitten) => `<g class="w-arm"><path d="M34 78Q29 90 32 104" stroke="${color}" stroke-width="11" stroke-linecap="round" fill="none"/><circle cx="32" cy="107" r="6.5" fill="${mitten}"/><circle class="hand-ball" cx="32" cy="115" r="6.5" fill="#fff" stroke="#b7d6ee" stroke-width="1"/></g>`;
  const boots = (fur, trousers) => `
    <rect x="37" y="102" width="12" height="24" rx="5" fill="${trousers}"/><rect x="51" y="102" width="12" height="24" rx="5" fill="${trousers}"/>
    <path d="M35 120H50V132H33Q31 124 35 120Z" fill="#6a4630"/><path d="M50 120H65V132H48Q47 124 50 120Z" fill="#6a4630"/>
    <rect x="34" y="118" width="16" height="5" rx="2.5" fill="${fur}"/><rect x="50" y="118" width="16" height="5" rx="2.5" fill="${fur}"/>`;

  return `<figure class="beach-scene winter-scene" style="--sync:${sync.toFixed(3)}s">
    <svg viewBox="0 0 400 220" role="img" aria-label="Timm und Fenja machen in warmer Winterkleidung eine Schneeballschlacht">
      <defs><linearGradient id="w-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14264d"/><stop offset=".7" stop-color="#3f6ea3"/><stop offset="1" stop-color="#9cc8e6"/></linearGradient></defs>
      <rect width="400" height="160" fill="url(#w-sky)"/>
      <path class="w-aurora" d="M-10 44Q70 12 150 40T300 26T410 36V62Q300 50 220 62T70 62T-10 70Z" fill="#6fe6c8" opacity=".2"/>
      <g fill="#fff"><circle class="w-star" cx="40" cy="20" r="1.3"/><circle class="w-star b" cx="118" cy="14" r="1"/><circle class="w-star" cx="172" cy="30" r="1.2"/><circle class="w-star b" cx="236" cy="12" r="1.3"/><circle class="w-star" cx="290" cy="30" r="1"/><circle class="w-star b" cx="86" cy="42" r="1"/></g>
      <circle cx="344" cy="36" r="18" fill="#fdf3cf"/><circle cx="351" cy="31" r="15" fill="#223f70"/>
      <path d="M0 122Q70 96 140 116T280 108T400 118V170H0Z" fill="#c7dff2"/>
      ${pine(38, 92, 0.95)}${pine(362, 88, 1.05)}${pine(100, 100, 0.65)}
      <g transform="translate(276 92)">
        <path d="M0 18L24 0L48 18V44H0Z" fill="#7a4c34"/>
        <path d="M-5 20L24 -3L53 20L47 23L24 5L1 23Z" fill="#eef7ff"/>
        <rect class="w-window" x="17" y="22" width="14" height="13" rx="2" fill="#ffd47a"/>
        <path d="M24 22V35M17 28H31" stroke="#7a4c34" stroke-width="1.4"/>
      </g>
      <path d="M0 150Q110 134 210 146T400 140V220H0Z" fill="#f2f8ff"/>
      <path d="M0 176Q90 166 190 176T400 170" stroke="#d3e5f5" stroke-width="2" fill="none"/>

      <g transform="translate(200 158)">
        <ellipse cy="38" rx="20" ry="3.5" fill="#6e93b5" opacity=".28"/>
        <circle cy="24" r="16" fill="#fff" stroke="#cfe2f3"/><circle cy="0" r="11" fill="#fff" stroke="#cfe2f3"/>
        <circle cx="-4" cy="-3" r="1.4" fill="#27304a"/><circle cx="4" cy="-3" r="1.4" fill="#27304a"/>
        <path d="M0 0L9 2L0 3Z" fill="#ff8a3c"/>
        <path d="M-9 9Q0 14 9 9" stroke="#d6455d" stroke-width="4" stroke-linecap="round" fill="none"/>
        <rect x="-9" y="-13" width="18" height="3" rx="1.5" fill="#27304a"/><rect x="-6" y="-22" width="12" height="10" rx="1.5" fill="#27304a"/>
      </g>

      <ellipse cx="80" cy="192" rx="24" ry="4" fill="#6e93b5" opacity=".3"/>
      <ellipse cx="320" cy="192" rx="24" ry="4" fill="#6e93b5" opacity=".3"/>

      <g transform="translate(44 94) scale(.72)"><g class="w-body">
        ${FENJA_BACK_HAIR}
        ${boots('#f3e3c8', '#3c3550')}
        <path d="M28 72Q50 64 72 72L76 110Q50 116 24 110Z" fill="#c8364f"/>
        <path d="M27 84Q50 89 73 84M26 97Q50 102 74 97" stroke="#a42540" stroke-width="2" fill="none"/>
        <path d="M50 70V112" stroke="#a42540" stroke-width="1.6"/>
        <path d="M66 78Q74 88 72 100" stroke="#b22d47" stroke-width="11" stroke-linecap="round" fill="none"/><circle cx="72" cy="103" r="6.5" fill="#f3e3c8"/>
        <rect x="36" y="60" width="28" height="14" rx="7" fill="#f3e3c8"/>
        <path d="M58 70L63 92H54Z" fill="#e9d3af"/>
        ${FENJA_HEAD}
        <path d="M22 30Q25 3 50 3Q75 3 78 30Q50 19 22 30Z" fill="#d6455d"/>
        <path d="M34 8L32 25M50 4V21M66 8L68 25" stroke="#a42540" stroke-width="2.2"/>
        <path d="M21 31Q50 19 79 31" stroke="#f3e3c8" stroke-width="8" stroke-linecap="round" fill="none"/>
        <circle cx="50" cy="2" r="9" fill="#f3e3c8"/>
        ${throwArm('#b22d47', '#f3e3c8')}
      </g></g>

      <g transform="translate(356 94) scale(-.72 .72)"><g class="w-body" style="--phase:-1.4s">
        ${boots('#d8c7a8', '#262a38')}
        <path d="M27 72Q50 64 73 72L78 112Q50 118 22 112Z" fill="#27527a" stroke="#3a6c99" stroke-width="1"/>
        <path d="M26 86Q50 91 74 86M25 100Q50 105 75 100" stroke="#1c3f60" stroke-width="2.2" fill="none"/>
        <path d="M50 70V114" stroke="#e6a93a" stroke-width="2"/>
        <path d="M67 78Q75 88 73 100" stroke="#20466a" stroke-width="11" stroke-linecap="round" fill="none"/><circle cx="73" cy="103" r="6.5" fill="#e6a93a"/>
        <rect x="35" y="60" width="30" height="14" rx="7" fill="#e6a93a"/>
        <path d="M58 70L64 94H54Z" fill="#cf9328"/>
        ${TIMM_HEAD}
        <path d="M22 30Q25 0 50 0Q75 0 78 30Q50 20 22 30Z" fill="#1f8fa6"/>
        <path d="M21 30Q50 20 79 30" stroke="#17758a" stroke-width="9" stroke-linecap="round" fill="none"/>
        <path d="M32 27V33M42 24V30M52 24V30M62 25V31M70 28V34" stroke="#4fb4c8" stroke-width="1.8"/>
        ${throwArm('#20466a', '#e6a93a')}
      </g></g>

      <g>${throwBall}</g>
      <g transform="translate(400 0) scale(-1 1)" style="--phase:-1.4s">${throwBall}</g>
      <g fill="#fff" opacity=".9">${flakes}</g>
    </svg>
    <figcaption>Unser Schnee-Winter</figcaption>
  </figure>`;
}

// ---------- Strand-Szene für die Sommerliste ----------
const beachArm = (cls, x1, x2, x3) => `<g class="v-arm ${cls}"><path d="M${x1} 78Q${x2} 88 ${x3} 100" stroke="${SKIN}" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="${x3}" cy="103" r="5" fill="${SKIN}"/></g>`;
const BEACH_LEGS = `
    <rect x="37" y="100" width="12" height="28" rx="6" fill="${SKIN}"/><ellipse cx="44" cy="129" rx="8" ry="4" fill="${SKIN}"/>
    <rect x="51" y="100" width="12" height="28" rx="6" fill="${SKIN}"/><ellipse cx="58" cy="129" rx="8" ry="4" fill="${SKIN}"/>`;

// Die Strand-Figuren, auch fürs Volleyball-Spiel
const BEACH_FENJA = `
        ${FENJA_BRAIDS_BACK}
        ${beachArm('far', 60, 66, 65)}
        ${BEACH_LEGS}
        <rect x="44" y="60" width="12" height="14" rx="5" fill="${SKIN}"/>
        <path d="M35 72Q50 66 65 72L69 100H31Z" fill="#ff6f61"/>
        <path d="M33 88H67" stroke="#fff" stroke-width="3" opacity=".85"/>
        <path d="M30 98H70L72 112H53L50 106L47 112H28Z" fill="#159fb0"/>
        ${beachArm('near', 67, 72, 71)}
        ${FENJA_BRAIDED_HEAD}
        <path d="M24 31Q50 17 76 31" stroke="#2fc4c9" stroke-width="5" stroke-linecap="round" fill="none"/>
        ${shades('#ff7d92', 27, 51)}`;

const BEACH_TIMM = `
        ${beachArm('far', 60, 66, 65)}
        ${BEACH_LEGS}
        <rect x="44" y="60" width="12" height="14" rx="5" fill="#f2c9a8"/>
        <path d="M34 72Q50 66 66 72L69 100H31Z" fill="#1f8fa6"/>
        <path d="M44 68Q50 76 56 68" stroke="#f9d7bb" stroke-width="4" fill="none"/>
        <path d="M30 98H70L73 118H53L50 108L47 118H27Z" fill="#ff9f1c"/>
        <path d="M34 106V116M66 106V116" stroke="#fff" stroke-width="2.5"/>
        ${beachArm('near', 67, 72, 71)}
        ${TIMM_HEAD}
        ${shades('#0b0d12', 28, 50)}`;

const VOLLEYBALL = `
        <circle r="11" fill="#fff" stroke="#27566b" stroke-width="1.4"/>
        <path d="M-10 -3Q0 -9 10 -4M-9 5Q2 2 8 -8M-3 10Q-2 0 -7 -8M4 10Q8 3 11 2" stroke="#27566b" stroke-width="1.2" fill="none"/>
        <path d="M-10 -3Q0 -9 10 -4Q8 -11 0 -11Q-7 -10 -10 -3Z" fill="#ffc83d"/>
        <path d="M-3 10Q-2 3 4 10Q0 11.5 -3 10Z" fill="#27a6d9"/>`;

function beachScene() {
  // Alle Animationen hängen an derselben Uhr, damit der Ball beim Neuzeichnen nicht springt.
  const sync = -((performance.now() / 1000) % 2.8);

  return `<figure class="beach-scene" style="--sync:${sync.toFixed(3)}s">
    <svg viewBox="0 0 400 220" role="img" aria-label="Timm und Fenja spielen mit Sonnenbrillen Beachvolleyball">
      <defs>
        <linearGradient id="b-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ccbf0"/><stop offset="1" stop-color="#c9f2f7"/></linearGradient>
        <linearGradient id="b-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1fb6c9"/><stop offset="1" stop-color="#6fe0d4"/></linearGradient>
      </defs>
      <rect width="400" height="110" fill="url(#b-sky)"/>
      <g class="b-rays" stroke="#ffd34d" stroke-width="4" stroke-linecap="round">
        <path d="M340 6V14M340 66V74M306 40H314M366 40H374M316 16L322 22M358 58L364 64M316 64L322 58M358 22L364 16"/>
      </g>
      <circle cx="340" cy="40" r="20" fill="#ffd34d"/>
      <g class="b-cloud" fill="#fff" opacity=".92"><ellipse cx="80" cy="30" rx="26" ry="10"/><ellipse cx="66" cy="24" rx="13" ry="10"/><ellipse cx="90" cy="22" rx="15" ry="12"/></g>
      <g class="b-cloud slow" fill="#fff" opacity=".78"><ellipse cx="230" cy="52" rx="20" ry="7"/><ellipse cx="240" cy="46" rx="11" ry="8"/></g>
      <rect y="94" width="400" height="56" fill="url(#b-sea)"/>
      <g class="b-wave"><path d="M-40 112Q-30 106 -20 112T0 112T20 112T40 112T60 112T80 112T100 112T120 112T140 112T160 112T180 112T200 112T220 112T240 112T260 112T280 112T300 112T320 112T340 112T360 112T380 112T400 112T420 112T440 112" stroke="#fff" stroke-width="2.5" fill="none" opacity=".65"/></g>
      <path d="M0 136Q110 122 210 134T400 128V220H0Z" fill="#f7dc9c"/>
      <g fill="#dcb86e"><circle cx="46" cy="205" r="1.6"/><circle cx="118" cy="198" r="1.4"/><circle cx="160" cy="212" r="1.6"/><circle cx="246" cy="206" r="1.4"/><circle cx="300" cy="214" r="1.6"/><circle cx="352" cy="204" r="1.4"/></g>

      <path d="M23 142Q15 100 27 66" stroke="#9a6a3c" stroke-width="7" stroke-linecap="round" fill="none"/>
      <g class="b-palm" fill="#2f9e60"><path d="M27 66Q6 54 -10 72Q10 62 27 68Z"/><path d="M27 66Q50 50 70 66Q48 60 27 69Z"/><path d="M27 66Q20 42 0 38Q18 48 25 68Z"/><path d="M27 66Q38 42 58 38Q40 50 29 68Z"/></g>

      <ellipse cx="201" cy="197" rx="16" ry="3" fill="#000" opacity=".12"/>
      <path d="M212 160V76" stroke="#7c5d43" stroke-width="4" stroke-linecap="round"/>
      <path d="M191 102L212 80V124L191 148Z" fill="#fff" fill-opacity=".28"/>
      <path d="M196 97V143M201 92V138M207 86V130M191 113L212 91M191 125L212 103M191 137L212 114" stroke="#fff" stroke-width="1.1"/>
      <path d="M191 102L212 80" stroke="#fff" stroke-width="4"/>
      <path d="M191 196V96" stroke="#7c5d43" stroke-width="5" stroke-linecap="round"/>

      <ellipse cx="80" cy="192" rx="24" ry="4" fill="#000" opacity=".15"/>
      <ellipse cx="320" cy="192" rx="24" ry="4" fill="#000" opacity=".15"/>

      <g transform="translate(44 94) scale(.72)"><g class="v-body">${BEACH_FENJA}</g></g>

      <g transform="translate(356 94) scale(-.72 .72)"><g class="v-body" style="--phase:-1.4s">${BEACH_TIMM}</g></g>

      <g class="ball-x"><ellipse class="ball-shadow" cy="197" rx="10" ry="2.4" fill="#000" opacity=".16"/></g>
      <g class="ball-x"><g class="ball-y"><g class="ball-spin">${VOLLEYBALL}</g></g></g>
    </svg>
    <figcaption>Unser Strand-Sommer</figcaption>
  </figure>`;
}

// ---------- Effekte ----------
const Decor = (() => {
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PREF = 'wirzwei.walkers';
  const heartLayer = document.createElement('div');
  heartLayer.id = 'heart-layer';
  heartLayer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(heartLayer);

  function hearts(x, y, n = 6, glyphs = ['♥']) {
    if (reduced()) return;
    for (let i = 0; i < n; i++) {
      const h = document.createElement('span');
      h.className = 'float-heart';
      h.setAttribute('aria-hidden', 'true');
      h.textContent = glyphs[i % glyphs.length];
      h.style.left = x + 'px';
      h.style.top = y + 'px';
      h.style.setProperty('--dx', Math.round(Math.random() * 90 - 45) + 'px');
      h.style.setProperty('--rot', Math.round(Math.random() * 60 - 30) + 'deg');
      h.style.fontSize = 14 + Math.random() * 14 + 'px';
      h.style.animationDelay = i * 60 + 'ms';
      heartLayer.appendChild(h);
      setTimeout(() => h.remove(), 1700 + i * 60);
    }
  }

  // Fallende Blätter, Schnee usw. passend zur Jahreszeit
  const PARTICLES = { autumn: ['🍂', '🍁'], winter: ['❄️', '❅'], spring: ['🌸', '🌼'], summer: ['✨', '🌻'] };
  let ambienceKey = null;
  const ambience = document.createElement('div');
  ambience.id = 'ambience';
  ambience.setAttribute('aria-hidden', 'true');
  document.body.prepend(ambience);

  function setAmbience(key) {
    if (key === ambienceKey) return;
    ambienceKey = key;
    document.body.dataset.season = key;
    if (reduced()) return;
    const g = PARTICLES[key];
    ambience.innerHTML = Array.from({ length: 11 }, (_, i) => {
      const dur = 10 + Math.random() * 10;
      return `<span style="left:${Math.random() * 96}%;font-size:${13 + Math.random() * 13}px;animation-duration:${dur}s;animation-delay:${-Math.random() * dur}s;--sway:${Math.round(Math.random() * 90 - 45)}px">${g[i % g.length]}</span>`;
    }).join('');
  }

  // Lichterkette oben auf der Seite
  const lights = document.createElement('div');
  lights.id = 'lights';
  lights.setAttribute('aria-hidden', 'true');
  const bulbs = [[28, 16], [84, 26], [140, 30], [196, 26], [252, 16], [308, 16], [364, 26]];
  lights.innerHTML = `<svg viewBox="0 0 400 44">
    <path d="M0 2Q70 36 140 26T280 12T400 26" stroke="#7a5a44" stroke-width="1.4" fill="none"/>
    ${bulbs.map(([x, y], i) => `<g class="bulb" style="animation-delay:${(i * 0.37).toFixed(2)}s"><circle cx="${x}" cy="${y + 3}" r="9" fill="#ffc768" opacity=".28"/><circle cx="${x}" cy="${y + 3}" r="3.8" fill="#ffd98c"/></g>`).join('')}
  </svg>`;
  document.body.prepend(lights);

  // ---------- Laufende Figuren ----------
  const walkers = document.createElement('div');
  walkers.id = 'walkers';
  walkers.setAttribute('aria-hidden', 'true');
  walkers.innerHTML = `<div class="walk-inner">
    ${catSVG('light', 'c3')}${catSVG('grey', 'c1')}${coupleSVG()}
  </div>`;
  // Die Bühne schneidet alles außerhalb des Bildschirms ab, sonst zoomen Handys die Seite heraus.
  const stage = document.createElement('div');
  stage.id = 'walk-stage';
  stage.appendChild(walkers);
  // Die Figuren laufen in einem eigenen Streifen auf der Startseite und verdecken so nichts.
  function mount(slot) {
    if (slot && prefOn()) slot.appendChild(stage);
  }
  const inner = walkers.firstElementChild;

  let enabled = false;
  let x = 24, dir = 1, last = 0, state = 'walk', until = 0, walked = 0;
  let pauseAfter = 160 + Math.random() * 180;

  const prefOn = () => { try { return localStorage.getItem(PREF) !== 'off'; } catch { return true; } };
  function setPref(on) {
    try { localStorage.setItem(PREF, on ? 'on' : 'off'); } catch {}
    show(on);
  }
  function show(on) {
    const should = on && prefOn();
    if (should === enabled) return;
    enabled = should;
    walkers.classList.toggle('hidden', !should);
    if (should && !reduced()) { last = 0; requestAnimationFrame(tick); }
    if (should && reduced()) { walkers.style.transform = 'translate3d(16px,0,0)'; }
  }
  function setState(next) {
    state = next;
    inner.classList.toggle('walking', next === 'walk');
  }
  function coupleCenter() {
    const r = inner.querySelector('.couple').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + 6 };
  }
  function tick(t) {
    if (!enabled) return;
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    const gw = walkers.offsetWidth;
    const W = stage.clientWidth || innerWidth;
    if (state === 'walk') {
      const step = 32 * dt;
      x += dir * step;
      walked += step;
      if (x > W || x < -gw) {
        setState('offstage');
        until = t + 2000 + Math.random() * 4000;
      } else if (walked > pauseAfter && x > 0 && x + gw < W) {
        walked = 0;
        pauseAfter = 260 + Math.random() * 300;
        setState('pause');
        until = t + 2600;
        const c = coupleCenter();
        hearts(c.x, c.y, 3);
      }
    } else if (t > until) {
      if (state === 'offstage') {
        dir = -dir;
        x = dir > 0 ? -gw : W;
      }
      setState('walk');
    }
    walkers.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    inner.classList.toggle('flip', dir < 0);
    requestAnimationFrame(tick);
  }
  setState('walk');

  // Antippen macht Herzen, blockiert aber nie Buttons oder Eingabefelder darunter.
  document.addEventListener('pointerdown', (e) => {
    if (!enabled) return;
    const r = walkers.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    if (e.target.closest('button, input, textarea, a, label, summary, .dish, #nav, .backdrop')) return;
    hearts(e.clientX, r.top + 10, 7);
    if (reduced()) return;
    inner.classList.add('happy');
    setTimeout(() => inner.classList.remove('happy'), 1100);
    if (state === 'walk') { setState('pause'); until = performance.now() + 1500; }
  });

  return { hearts, setAmbience, show, mount, setPref, prefOn };
})();
