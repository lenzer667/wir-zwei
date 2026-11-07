-- Eigene Tabelle für die App von Bruno und Janina, im selben Supabase-Projekt.
-- Danach gilt: Timm und Fenja sehen nur "records", Bruno und Janina nur "records_bj".
-- Einzige Ausnahme: Timm darf die Wünsche in "records_bj" lesen und ihren Stand ändern.
-- Kann gefahrlos mehrmals ausgeführt werden.

-- 1) Neue Tabelle mit demselben Aufbau wie die von Timm und Fenja
create table if not exists public.records_bj (like public.records including all);
alter table public.records_bj enable row level security;
grant select, insert, update, delete on public.records_bj to authenticated;

-- 2) Bisherige Regeln für "records" ersetzen: nur noch Timm und Fenja
do $$
declare p record;
begin
  for p in select policyname, tablename from pg_policies where schemaname = 'public' and tablename in ('records', 'records_bj') loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

create policy "nur Timm und Fenja" on public.records
  for all to authenticated
  using ((auth.jwt() ->> 'email') in ('timm@wir-zwei.test', 'fenja@wir-zwei.test'))
  with check ((auth.jwt() ->> 'email') in ('timm@wir-zwei.test', 'fenja@wir-zwei.test'));

-- 3) Regeln für "records_bj"
create policy "nur Bruno und Janina" on public.records_bj
  for all to authenticated
  using ((auth.jwt() ->> 'email') in ('bruno@wir-zwei.test', 'janina@wir-zwei.test'))
  with check ((auth.jwt() ->> 'email') in ('bruno@wir-zwei.test', 'janina@wir-zwei.test'));

create policy "Timm liest ihre Wuensche" on public.records_bj
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'timm@wir-zwei.test' and collection = 'wishes');

create policy "Timm setzt den Stand ihrer Wuensche" on public.records_bj
  for update to authenticated
  using ((auth.jwt() ->> 'email') = 'timm@wir-zwei.test' and collection = 'wishes')
  with check ((auth.jwt() ->> 'email') = 'timm@wir-zwei.test' and collection = 'wishes');

-- 4) Live-Aktualisierung auch für die neue Tabelle
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'records_bj') then
    alter publication supabase_realtime add table public.records_bj;
  end if;
end $$;

-- 5) Benachrichtigungen: Der Auslöser schickt jetzt auch den Tabellennamen mit.
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

drop trigger if exists records_bj_push on public.records_bj;
create trigger records_bj_push
  after insert or update on public.records_bj
  for each row
  when (new.collection in ('notes', 'wishes'))
  execute function public.notify_push();

-- 6) Kontrolle: welche Regeln jetzt gelten und ob die beiden Konten da sind
select 'Regel' as art, tablename || ': ' || policyname as was from pg_policies
  where schemaname = 'public' and tablename in ('records', 'records_bj')
union all
select 'Konto', email || case when email_confirmed_at is null then ' (NICHT bestätigt)' else '' end from auth.users
order by 1, 2;
