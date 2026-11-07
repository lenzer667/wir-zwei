// Die App für Bruno und Janina: derselbe Code wie "Wir zwei", aber eigene Namen, Figuren und Daten.
const APP = {
  title: 'Bruno & Janina',
  key: 'bj',                 // eigener Speicher im Handy, getrennt von Timm und Fenja
  authKey: 'bj-auth',        // eigene Anmeldung, auch wenn beide Apps im selben Browser laufen
  table: 'records_bj',       // eigene Tabelle in Supabase
  root: '../',
  couple: {
    people: ['Bruno', 'Janina'], // erst er (grün), dann sie (rot)
    start: [2026, 1, 1],         // PLATZHALTER: echtes Datum fehlt noch
  },
  admin: 'Timm',             // Wünsche für die App erledigt Timm in seiner eigenen App
  autumnPicture: false,
  cats: false,               // die laufenden Katzen gehören zu Timm und Fenja
  bucketSeeds: {
    autumn: [
      'Kürbis schnitzen', 'Horrorfilmabend', 'Herbstspaziergang mit Fotos', 'Kekse backen',
      'Kuschelabend mit Tee und heißer Schokolade', 'Blätter sammeln', 'Zusammen auf den Rummel',
      'Halloween-Kostüme aussuchen',
    ],
    spring: [
      'Das erste Picknick des Jahres', 'Fahrradtour ins Blaue', 'Kirschblüten anschauen',
      'Blumen oder Kräuter pflanzen', 'Ostereier färben', 'Zum Sonnenaufgang rausgehen',
      'Über den Flohmarkt schlendern',
    ],
  },
  // Figuren aus Brunos und Janinas Bild. Die Teile liegen in den Koordinaten ihres Bildes,
  // "place" rückt sie an dieselbe Stelle, an der sonst Timm und Fenja stehen.
  sprites: {
    dir: '../assets/figuren-bj/',
    fenja: 'janina',
    timm: 'bruno',
    wear: false, // Winter- und Strandkleidung gibt es bisher nur für Timm und Fenja
    front: {
      fenja: {
        place: 'translate(-180 -6) scale(2.61)',
        armsBehind: true,
        body: [100, 5, 265, 258], 'arm-l': [62, 152, 98, 50], 'arm-r': [294, 152, 98, 50],
        'leg-l': [170, 248, 56, 147], 'leg-r': [225, 248, 62, 147],
        pivots: { 'arm-l': [158, 177], 'arm-r': [296, 177] },
      },
      timm: {
        place: 'translate(509 -1049) scale(2.635)',
        body: [140, 396, 180, 248], 'arm-l': [68, 535, 116, 68], 'arm-r': [277, 535, 116, 68],
        'leg-l': [155, 642, 76, 143], 'leg-r': [230, 642, 80, 143],
        pivots: { 'arm-l': [180, 566], 'arm-r': [281, 566] },
      },
    },
    side: {
      fenja: {
        place: 'translate(-15 -5) scale(1.32)', foot: 503,
        body: [474, 8, 180, 252], leg: [548, 250, 88, 138], hip: [584, 255],
        arm: [62, 152, 106, 50], armPivot: [166, 177], shoulder: [588, 170],
        ball: [58, 177, 20], sleeve: '',
      },
      timm: {
        place: 'translate(-2 -6) scale(1.3)', foot: 1012,
        body: [498, 396, 180, 250], leg: [545, 642, 100, 143], hip: [582, 648],
        arm: [68, 535, 116, 68], armPivot: [180, 566], shoulder: [580, 560],
        ball: [62, 568, 22], sleeve: '',
      },
    },
  },
};
