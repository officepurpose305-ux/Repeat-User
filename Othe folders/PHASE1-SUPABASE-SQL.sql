-- Phase 1: Supabase Caching — Run this in Supabase Dashboard → SQL Editor

-- Create location_cache table
create table if not exists public.location_cache (
  id uuid primary key default gen_random_uuid(),
  location_key text unique not null,
  payload jsonb not null,
  expires_at timestamptz not null,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.location_cache enable row level security;

-- Allow all reads/writes (public research data — no auth needed)
create policy "Allow all access to location_cache" on public.location_cache
  for all using (true) with check (true);

-- Create indexes for faster lookups
create index if not exists idx_location_key on public.location_cache(location_key);
create index if not exists idx_expires_at on public.location_cache(expires_at);

-- Confirm table created
select 'location_cache table ready for Phase 1' as status;
