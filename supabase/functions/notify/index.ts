// Supabase-Programm "notify": verschickt Benachrichtigungen für neue Zettel und Wünsche.
// Der Datenbank-Auslöser meldet nur, welcher Eintrag sich geändert hat. Den Inhalt liest das
// Programm selbst aus der Datenbank, damit niemand von außen falsche Texte schicken kann.
// Jede Nachricht geht höchstens einmal raus, dafür sorgt die Sammlung "pushlog".
// Es gibt zwei Apps: "records" (Timm und Fenja) und "records_bj" (Bruno und Janina).
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';

const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

webpush.setVapidDetails(
  'https://lenzer667.github.io/wir-zwei/',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);

// Timm bekommt neue Wünsche aus beiden Apps, seine Handys stehen in seiner eigenen Tabelle.
const ADMIN = 'Timm';
const ADMIN_TABLE = 'records';
const TABLES = ['records', 'records_bj'];

const reply = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });

// Merkt sich eine verschickte Nachricht. Gibt false zurück, wenn sie schon verschickt wurde.
async function firstTime(table: string, key: string): Promise<boolean> {
  const { error } = await sb.from(table).insert({ collection: 'pushlog', id: key, data: { id: key, at: Date.now() } });
  return !error;
}

Deno.serve(async (req) => {
  let input: { table?: string; collection?: string; id?: string };
  try { input = await req.json(); } catch { return reply({ skipped: 'kein JSON' }); }
  const { collection, id } = input;
  const table = input.table || 'records';
  if (!TABLES.includes(table)) return reply({ skipped: 'unbekannte Tabelle' });
  if (!id || (collection !== 'notes' && collection !== 'wishes')) return reply({ skipped: 'nicht relevant' });

  const { data: row } = await sb.from(table).select('data').eq('collection', collection).eq('id', id).maybeSingle();
  if (!row) return reply({ skipped: 'nicht gefunden' });
  const d = row.data as Record<string, any>;

  let to = '';
  let subsTable = table;
  let message = { title: '', body: '', url: './', tag: '' };

  if (collection === 'notes') {
    if (!(await firstTime(table, `notes:${id}`))) return reply({ skipped: 'schon verschickt' });
    to = d.to;
    message = { title: `${d.from} hat dir einen Zettel geschickt`, body: '', url: './#zettel', tag: 'zettel' };
  } else if (d.status === 'done') {
    if (!(await firstTime(table, `wishes:${id}:done`))) return reply({ skipped: 'schon verschickt' });
    to = d.by;
    const text = String(d.text || '');
    message = { title: 'Dein Wunsch wurde erfüllt', body: text.length > 80 ? `${text.slice(0, 80)}…` : text, url: './#wuensche', tag: `wunsch-${id}` };
  } else if (d.by !== ADMIN) {
    if (!(await firstTime(table, `wishes:${id}:new`))) return reply({ skipped: 'schon verschickt' });
    to = ADMIN;
    subsTable = ADMIN_TABLE;
    const where = table === ADMIN_TABLE ? '' : ' für ihre App';
    message = { title: `${d.by} hat einen neuen Wunsch${where}`, body: '', url: './#wuensche', tag: `wunsch-${id}` };
  } else {
    return reply({ skipped: 'nichts zu melden' });
  }

  const { data: subs } = await sb.from(subsTable).select('id, data').eq('collection', 'push').eq('data->>person', to);
  let sent = 0;
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification((s.data as any).sub, JSON.stringify(message));
      sent++;
    } catch (err: any) {
      // Abgemeldete oder ungültige Handys werden aufgeräumt.
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await sb.from(subsTable).delete().eq('collection', 'push').eq('id', s.id);
      }
    }
  }
  return reply({ to, sent });
});
