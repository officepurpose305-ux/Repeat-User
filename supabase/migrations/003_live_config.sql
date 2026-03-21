-- Live config table — used for real-time panel → homepage sync across devices.
-- The panel upserts to the single row (id = 'default') on every form change.
-- A standalone homepage subscribes to changes on this table via Supabase real-time.
--
-- After running this migration, also enable real-time replication for this table:
-- Supabase Dashboard → Database → Replication → Sources → supabase_realtime
-- → Add table → public.live_config

create table if not exists public.live_config (
  id text primary key default 'default',
  config jsonb not null,
  updated_at timestamptz default now()
);

alter table public.live_config enable row level security;

create policy "Allow all for live_config" on public.live_config
  for all using (true) with check (true);
