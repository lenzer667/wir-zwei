// Einstellungen dieser Ausgabe der App. Die App für Bruno und Janina hat eine eigene Datei
// im Ordner bruno-janina, der restliche Code ist für beide derselbe.
const APP = {
  title: 'Wir zwei',
  key: 'wirzwei',            // Vorsilbe für alles, was das Handy speichert
  table: 'records',          // Tabelle in Supabase
  root: '',                  // Weg zu den gemeinsamen Dateien
  couple: {
    people: ['Timm', 'Fenja'], // erst er (grün), dann sie (rot)
    start: [2026, 5, 20],      // Jahr, Monat, Tag
  },
  admin: 'Timm',             // darf Wünsche für die App erledigen
  // Wünsche aus der App von Bruno und Janina erscheinen bei Timm mit auf der Wunschseite.
  friendWishes: { table: 'records_bj', label: 'Bruno & Janina' },
  autumnPicture: true,       // euer Herbstbild bei der Bucket List
  // Figuren: Dateinamen und Lage der Teile, siehe figuren-seite.js
  sprites: { dir: 'assets/figuren/', fenja: 'fenja', timm: 'timm' },
};
