-- Run this entire file once in Supabase: SQL Editor → New query → Paste → Run
-- Creates sessions + location_cache tables and RLS policies

-- ========== 001_sessions ==========
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  profile jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists sessions_updated_at_idx on public.sessions (updated_at desc);
alter table public.sessions enable row level security;
create policy "Allow read for anon" on public.sessions for select using (true);
create policy "Allow insert for anon" on public.sessions for insert with check (true);
create policy "Allow update for anon" on public.sessions for update using (true);
create policy "Allow delete for anon" on public.sessions for delete using (true);

-- ========== 002_location_cache ==========
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
create policy "Allow all for location_cache" on public.location_cache for all using (true) with check (true);
