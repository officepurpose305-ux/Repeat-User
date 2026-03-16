-- Phase 0: Core tables for researcher sessions
-- Run this in Supabase SQL Editor or via: supabase db push

-- sessions: one row per saved researcher session
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  profile jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists sessions_updated_at_idx on public.sessions (updated_at desc);

-- RLS: allow all for now (tighten in Phase 4 with auth)
alter table public.sessions enable row level security;

create policy "Allow read for anon"
  on public.sessions for select
  using (true);

create policy "Allow insert for anon"
  on public.sessions for insert
  with check (true);

create policy "Allow update for anon"
  on public.sessions for update
  using (true);

create policy "Allow delete for anon"
  on public.sessions for delete
  using (true);
