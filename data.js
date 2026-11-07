// Namen und Datum stehen in config.js.
const COUPLE = APP.couple;

const DISHES = [
  ['pizza', 'Pizza', '🍕'], ['burger', 'Burger', '🍔'], ['pasta', 'Pasta', '🍝'],
  ['sushi', 'Sushi', '🍣'], ['doener', 'Döner', '🥙'], ['tacos', 'Tacos', '🌮'],
  ['curry', 'Curry mit Reis', '🍛'], ['ramen', 'Ramen', '🍜'], ['pfannkuchen', 'Pfannkuchen', '🥞'],
  ['raclette', 'Raclette', '🧀'], ['lasagne', 'Lasagne', '🍽️'], ['schnitzel', 'Schnitzel mit Pommes', '🍟'],
  ['salat', 'Großer Salat', '🥗'], ['bowl', 'Bowl', '🥑'], ['falafel', 'Falafel', '🧆'],
  ['gnocchi', 'Gnocchi', '🥔'], ['flammkuchen', 'Flammkuchen', '🥓'], ['suppe', 'Kürbissuppe', '🎃'],
  ['chili', 'Chili con Carne', '🌶️'], ['wok', 'Gebratene Nudeln', '🥡'], ['kaesespaetzle', 'Käsespätzle', '🧅'],
  ['grillen', 'Was vom Grill', '🍖'], ['fruehstueck', 'Frühstück zum Abendessen', '🍳'], ['sandwich', 'Überbackene Sandwiches', '🥪'],
  ['quesadilla', 'Quesadillas', '🫓'], ['risotto', 'Risotto', '🍚'], ['fisch', 'Fischstäbchen mit Kartoffelbrei', '🐟'],
  ['dumplings', 'Dumplings', '🥟'], ['ofengemuese', 'Ofengemüse mit Feta', '🥕'], ['kaiserschmarrn', 'Kaiserschmarrn', '🍰'],
].map(([id, name, emoji]) => ({ id, name, emoji }));

const SEASONS = {
  spring: { name: 'Frühling', emoji: '🌱', months: [3, 4, 5], color: '#7bdc8f' },
  summer: { name: 'Sommer', emoji: '☀️', months: [6, 7, 8], color: '#ffc94d' },
  autumn: { name: 'Herbst', emoji: '🍂', months: [9, 10, 11], color: '#ff8a4c' },
  winter: { name: 'Winter', emoji: '❄️', months: [12, 1, 2], color: '#7cc7ff' },
};

const BUCKET_SEEDS = {
  // Eure eigene Liste vom Bild
  autumn: [
    { emoji: '🌙', text: 'Nachtwanderung' },
    { emoji: '🎃', text: 'Kürbis schnitzen' },
    { emoji: '🕸️', text: 'Gruseldeko' },
    { emoji: '🎬', text: 'Horrorfilmabend!' },
    { emoji: '🎧', text: 'Halloween-Musik hören' },
    { emoji: '🍪', text: 'Kekse und Kuchen backen zusammen' },
    { emoji: '📷', text: 'Waldspaziergang + Fotos machen' },
    { emoji: '☕', text: 'Kuscheldecke + Tee + heiße Schokolade' },
    { emoji: '🕯️', text: 'Kerzen kaufen und benutzen (aufpassen auf Katzen)' },
    { emoji: '📖', text: 'Gemeinsamer Buchlese-Abend bei Kerzenlicht und kuscheln' },
    { emoji: '🍁', text: 'Blätter sammeln und pressen' },
    { emoji: '🧶', text: 'Uns gegenseitig einen dicken, flauschigen Herbstpullover kaufen' },
    { emoji: '🍓', text: 'Marmelade selbst machen?' },
  ],
  winter: [
    'Auf den Weihnachtsmarkt gehen', 'Plätzchen backen', 'Eislaufen', 'Einen Schneemann bauen',
    'Weihnachtsfilm-Marathon', 'Unser erstes Silvester feiern', 'Raclette-Abend',
    'Geschenke-Challenge: maximal 10 Euro', 'Deckenburg bauen',
  ],
  spring: [
    'Unser erstes Jahr feiern (20. Mai)', 'Das erste Picknick des Jahres', 'Fahrradtour ins Blaue',
    'Kirschblüten anschauen', 'Blumen oder Kräuter pflanzen', 'Ostereier färben',
    'Zum Sonnenaufgang rausgehen', 'Über den Flohmarkt schlendern',
  ],
  summer: [
    'Im See baden', 'Grillabend', 'Open-Air-Kino', 'Eisdielen-Ranking aufstellen',
    'Sterne gucken', 'Spontaner Roadtrip', 'Eine Nacht zelten', 'Wasserschlacht',
  ],
};

// Eine andere Ausgabe der App kann eigene Vorschläge mitbringen.
if (APP.bucketSeeds) Object.assign(BUCKET_SEEDS, APP.bucketSeeds);
