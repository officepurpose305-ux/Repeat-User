-- Phase 2 will use this; run when you add orchestration
-- Optional: run after 001_sessions.sql

create table if not exists public.location_cache (
  id uuid primary key default gen_random_uuid(),
  location_key text unique not null,
  payload jsonb not null,
  adjacent_localities jsonb,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists location_cache_key_idx on public.location_cache (location_key);
create index if not exists location_cache_expires_idx on public.location_cache (expires_at);

alter table public.location_cache enable row level security;

create policy "Allow all for location_cache"
  on public.location_cache for all
  using (true)
  with check (true);
