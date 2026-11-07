// Von vorne fürs Startbild und den Match-Jubel: Beide schauen zur Kamera und halten sich an der Hand.
// Eine andere Ausgabe der App bringt in config.js eigene Figuren mit (APP.sprites.front und .side).
// "place" rückt Figuren aus einem anderen Bild an dieselbe Stelle wie die von Timm und Fenja.
const FRONT_PARTS = APP.sprites.front || {
  fenja: {
    body: [150, 20, 500, 650], 'arm-l': [40, 380, 250, 90], 'arm-r': [550, 380, 210, 90],
    'leg-l': [250, 612, 168, 410], 'leg-r': [418, 612, 175, 410],
    pivots: { 'arm-l': [281, 424], 'arm-r': [558, 424] },
  },
  timm: {
    body: [915, 0, 380, 674], 'arm-l': [790, 370, 250, 115], 'arm-r': [1190, 370, 250, 115],
    'leg-l': [960, 612, 155, 410], 'leg-r': [1115, 612, 165, 410],
    pivots: { 'arm-l': [1032, 400], 'arm-r': [1198, 400] },
  },
};

function frontImage(who, part) {
  const [x, y, w, h] = FRONT_PARTS[who][part];
  return `<image href="${APP.sprites.dir}${APP.sprites[who]}-${part}.png" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
}

function frontFigure(who, armL, armR) {
  const arm = (part, rot) => {
    const [px, py] = FRONT_PARTS[who].pivots[part];
    return `<g class="sp-part" style="--r:${rot}deg;transform-origin:${px}px ${py}px">${frontImage(who, part)}</g>`;
  };
  const arms = `${arm('arm-l', armL)}${arm('arm-r', armR)}`;
  // Bei langen offenen Haaren hängen die Arme hinter den Haaren.
  const behind = FRONT_PARTS[who].armsBehind;
  return `<g class="sp-bob"><g transform="${FRONT_PARTS[who].place || ''}">${frontImage(who, 'leg-l')}${frontImage(who, 'leg-r')}${behind ? arms : ''}${frontImage(who, 'body')}${behind ? '' : arms}</g></g>`;
}

function frontCouple(cls = '') {
  return `<svg class="couple sprite-couple ${cls}" viewBox="130 -10 1030 1040" aria-hidden="true">
    <ellipse cx="420" cy="1012" rx="170" ry="16" fill="#000" opacity=".22"/>
    <ellipse cx="925" cy="1012" rx="170" ry="16" fill="#000" opacity=".22"/>
    ${frontFigure('fenja', -68, 44)}
    <g transform="translate(-190 0)">${frontFigure('timm', -38, 68)}</g>
    <path class="clasp" d="M672 520C650 485 605 500 618 542C624 565 650 585 672 602C694 585 720 565 726 542C739 500 694 485 672 520Z" fill="#ff5f82"/>
  </svg>`;
}

// Timm und Fenja von der Seite. Alle Teile liegen in den Koordinaten des Originalbilds.
const SIDE_PARTS = APP.sprites.side || {
  fenja: {
    y0: 8, foot: 503, body: [620, 8, 225, 316], leg: [705, 300, 135, 205], hip: [757, 318],
    arm: [90, 186, 140, 62], armPivot: [222, 216], shoulder: [752, 212],
    sleeve: `<path d="M226 193L184 193Q178 216 184 240L226 240Z" fill="#2a2525" stroke="#120e0d" stroke-width="4" stroke-linejoin="round"/>`,
  },
  timm: {
    y0: 512, foot: 1012, body: [630, 512, 230, 320], leg: [700, 812, 130, 205], hip: [752, 828],
    arm: [102, 692, 150, 74], armPivot: [244, 722], shoulder: [758, 722],
    sleeve: '',
  },
};

function sideImage(who, name, [x, y, w, h]) {
  return `<image href="${APP.sprites.dir}${APP.sprites[who]}-side-${name}.png" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
}

function sideLeg(who, name, cls) {
  const p = SIDE_PARTS[who];
  return `<g class="sp-part ${cls}" style="--r:0deg;--amp:24deg;transform-origin:${p.hip[0]}px ${p.hip[1]}px">${sideImage(who, name, p.leg)}</g>`;
}

// Der Arm liegt im Bild waagerecht. Er wird an die Schulter gesetzt und von dort aus gedreht.
function sideArm(who, name, cls, rot, amp, extra = '') {
  const p = SIDE_PARTS[who];
  const dx = p.shoulder[0] - p.armPivot[0];
  const dy = p.shoulder[1] - p.armPivot[1];
  return `<g transform="translate(${dx} ${dy})"><g class="sp-part ${cls}" style="--r:${rot}deg;--amp:${amp}deg;transform-origin:${p.armPivot[0]}px ${p.armPivot[1]}px">${sideImage(who, name, p.arm)}${p.sleeve}${extra}</g></g>`;
}

const SIDE_LINE = 'stroke="#17100d" stroke-width="5" stroke-linejoin="round"';
const SIDE_SKIN = '#fbcfa8';

// Bein mit kurzer Hose: nackte Haut, darüber die Hose, unten die Schuhe aus dem Bild
function bareLeg(who, wear, back, cls) {
  const p = SIDE_PARTS[who];
  return `<g class="sp-part ${cls}" style="--r:0deg;--amp:24deg;transform-origin:${p.hip[0]}px ${p.hip[1]}px">
    ${wear.leg(back)}${sideImage(who, back ? 'shoe-back' : 'shoe', wear.shoe)}${wear.shorts(back)}</g>`;
}

// Kleidung für die Seitenansicht, über die Bilder gezeichnet
const SIDE_WEAR = {
  fenja: {
    winter: {
      sleeve: `<path d="M228 192L128 198Q112 205 112 218Q112 232 128 240L228 242Z" fill="#b22d47" ${SIDE_LINE}/><ellipse cx="108" cy="220" rx="16" ry="21" fill="#f3e3c8" ${SIDE_LINE}/>`,
      body: `<path d="M720 196Q760 180 806 196L814 310Q765 322 714 310Z" fill="#c8364f" ${SIDE_LINE}/>
        <path d="M718 245Q765 257 810 245M716 285Q765 297 812 285" stroke="#a42540" stroke-width="5" fill="none"/>`,
      head: `<path d="M736 172Q770 190 804 170L808 200Q770 216 732 200Z" fill="#f3e3c8" ${SIDE_LINE}/>
        <path d="M648 112Q652 10 752 12Q824 14 832 84Q740 58 648 112Z" fill="#d6455d" ${SIDE_LINE}/>
        <path d="M644 118Q738 58 836 86L832 108Q740 84 650 140Z" fill="#f3e3c8" ${SIDE_LINE}/>
        <circle cx="668" cy="34" r="26" fill="#f3e3c8" ${SIDE_LINE}/>`,
    },
    beach: {
      shoe: [705, 471, 135, 34],
      leg: (back) => `<path d="M733 392L729 472Q757 482 783 472L780 392Z" fill="${back ? '#d9b393' : SIDE_SKIN}" ${SIDE_LINE}/>`,
      shorts: (back) => `<path d="M716 312H800L807 402Q772 410 757 401Q744 410 709 402Z" fill="${back ? '#1c2a44' : '#2c3a5e'}" ${SIDE_LINE}/>`,
      sleeve: `<path d="M230 194Q192 188 190 216Q192 242 230 238Z" fill="#ff6f61" ${SIDE_LINE}/>`,
      body: `<path d="M720 196Q760 182 806 196L812 316Q765 326 714 316Z" fill="#ff6f61" ${SIDE_LINE}/>
        <path d="M717 262Q765 274 809 262" stroke="#fff" stroke-width="9" fill="none"/>
        <path d="M714 314Q765 324 812 314L816 332Q765 342 710 332Z" fill="#2c3a5e" ${SIDE_LINE}/>`,
      head: `<defs><linearGradient id="lens-side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2b62d9"/><stop offset=".6" stop-color="#27d2b5"/><stop offset="1" stop-color="#d9365f"/></linearGradient></defs>
        <path d="M744 114L824 108Q834 110 830 126L820 148Q802 156 784 148L760 130L744 127Z" fill="url(#lens-side)" ${SIDE_LINE}/>`,
    },
  },
  timm: {
    winter: {
      sleeve: `<path d="M252 696L128 706Q110 712 110 726Q110 742 128 748L252 758Z" fill="#20466a" ${SIDE_LINE}/><ellipse cx="106" cy="727" rx="16" ry="21" fill="#e6a93a" ${SIDE_LINE}/>`,
      body: `<path d="M714 704Q760 690 808 704L814 820Q760 832 708 820Z" fill="#27527a" ${SIDE_LINE}/>
        <path d="M712 752Q760 764 810 752M710 792Q760 804 812 792" stroke="#1c3f60" stroke-width="5" fill="none"/>`,
      head: `<path d="M734 690Q770 708 806 688L810 716Q770 732 730 716Z" fill="#e6a93a" ${SIDE_LINE}/>
        <path d="M648 610Q650 510 752 512Q842 514 850 590Q750 556 648 610Z" fill="#1f8fa6" ${SIDE_LINE}/>
        <path d="M642 616Q748 554 854 592L850 616Q750 582 650 640Z" fill="#17758a" ${SIDE_LINE}/>`,
    },
    beach: {
      shoe: [700, 981, 130, 36],
      leg: (back) => `<path d="M728 898L724 985Q752 995 782 985L778 898Z" fill="${back ? '#d9b393' : SIDE_SKIN}" ${SIDE_LINE}/>`,
      shorts: (back) => `<path d="M712 822H796L803 908Q768 916 752 907Q738 916 705 908Z" fill="${back ? '#124a5c' : '#1a6a82'}" ${SIDE_LINE}/>`,
      sleeve: `<path d="M254 700Q212 692 210 726Q212 758 254 752Z" fill="#2f9fc0" ${SIDE_LINE}/>`,
      body: `<path d="M714 704Q760 692 808 704L814 826Q760 836 708 826Z" fill="#2f9fc0" ${SIDE_LINE}/>
        <path d="M712 766Q760 778 811 766" stroke="#fff" stroke-width="9" fill="none"/>
        <path d="M708 824Q760 834 814 824L818 842Q760 852 704 842Z" fill="#1a6a82" ${SIDE_LINE}/>`,
      head: `<path d="M738 622L838 616Q848 620 842 640L832 666Q812 676 790 662L764 642L738 636Z" fill="#15171c" ${SIDE_LINE}/>
        <path d="M790 628L822 626L806 650Z" fill="#fff" opacity=".14"/>`,
    },
  },
};

// Fertige Pose fürs Spiel und die Szenen: Beine stehen, nur der vordere Arm bewegt sich.
function sidePose(who, outfit, armCls) {
  const wear = (APP.sprites.wear === false ? null : SIDE_WEAR[who][outfit]) || {};
  const p = SIDE_PARTS[who];
  const [bx, by, br] = p.ball || [84, who === 'fenja' ? 220 : 727, 26];
  const ball = armCls === 'w-arm-s' ? `<circle class="hand-ball" cx="${bx}" cy="${by}" r="${br}" fill="#fff" stroke="#b7d6ee" stroke-width="4"/>` : '';
  return `<g transform="${p.place || ''}">
    ${sideArm(who, 'arm-back', '', -84, 0, wear.sleeve || '')}
    ${wear.leg ? bareLeg(who, wear, true, 'sp-b') : sideLeg(who, 'leg-back', 'sp-b')}
    ${wear.leg ? bareLeg(who, wear, false, 'sp-a') : sideLeg(who, 'leg', 'sp-a')}
    ${sideImage(who, 'body', SIDE_PARTS[who].body)}
    ${wear.body || ''}
    ${wear.head || ''}
    ${sideArm(who, 'arm', armCls, -95, 0, (wear.sleeve || '') + ball)}</g>`;
}

// Figur im Profil, schaut nach rechts: hinterer Arm und Bein liegen hinter dem Körper.
function sideFigure(who, { backArm, frontArm }) {
  const p = SIDE_PARTS[who];
  return `<g class="sp-bob"><g transform="${p.place || ''}">
    ${backArm}
    ${sideLeg(who, 'leg-back', 'sp-b')}
    ${sideLeg(who, 'leg', 'sp-a')}
    ${sideImage(who, 'body', p.body)}
    ${frontArm}
  </g></g>`;
}

// Hand in Hand: Timm geht vorne, Fenja dahinter. Timm liegt im Bild tiefer, deshalb wird er hochgezogen.
function sideCouple(cls = '') {
  const liftTimm = SIDE_PARTS.fenja.foot - SIDE_PARTS.timm.foot;
  return `<svg class="couple sprite-couple ${cls}" viewBox="590 -5 510 530" aria-hidden="true">
    <ellipse cx="760" cy="505" rx="62" ry="8" fill="#000" opacity=".22"/>
    <ellipse cx="955" cy="505" rx="62" ry="8" fill="#000" opacity=".22"/>
    ${sideFigure('fenja', {
      backArm: sideArm('fenja', 'arm-back', 'sp-a', -84, 26),
      frontArm: sideArm('fenja', 'arm', 'sp-a', -140, 3),
    })}
    <g transform="translate(195 ${liftTimm})">${sideFigure('timm', {
      backArm: sideArm('timm', 'arm-back', 'sp-b', -40, 3),
      frontArm: sideArm('timm', 'arm', 'sp-b', -84, 26),
    })}</g>
    <path class="clasp" d="M868 248C858 232 836 238 842 258C845 268 857 277 868 285C879 277 891 268 894 258C900 238 878 232 868 248Z" fill="#ff5f82"/>
  </svg>`;
}
