-- Meldet neue Zettel und geänderte Wünsche an das Supabase-Programm "notify".
-- Es wird nur Tabelle, Sammlung und Kennung geschickt, keine Inhalte und keine Geheimnisse.
create extension if not exists pg_net;

create or replace function public.notify_push()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Zettel nur beim Schreiben melden, nicht wenn sie später als gelesen markiert werden.
  if new.collection = 'notes' and tg_op <> 'INSERT' then
    return new;
  end if;
  perform net.http_post(
    url := 'https://zsiwfnozxndgiyaaejxo.supabase.co/functions/v1/notify',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('table', tg_table_name, 'collection', new.collection, 'id', new.id)
  );
  return new;
end;
$$;

drop trigger if exists records_push on public.records;

create trigger records_push
  after insert or update on public.records
  for each row
  when (new.collection in ('notes', 'wishes'))
  execute function public.notify_push();
