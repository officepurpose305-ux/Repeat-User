# 99acres Homepage Evolution

Repeat-user adaptive homepage + researcher panel. See [99acres-homepage-evolution.md](99acres-homepage-evolution.md) and [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md).

## Phase 0 — Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com) (or use existing).
2. In **Project Settings → API**: copy **Project URL** and **anon public** key.
3. Create `.env` from `.env.example` and set:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### 2. Run migrations

In Supabase **SQL Editor**, run in order:

1. [supabase/migrations/001_sessions.sql](supabase/migrations/001_sessions.sql) — sessions table + RLS
2. [supabase/migrations/002_location_cache.sql](supabase/migrations/002_location_cache.sql) — optional; needed in Phase 2

Or with Supabase CLI: `supabase db push` (from project root).

### 3. Repo structure

- `apps/panel` — researcher dashboard (Phase 1)
- `apps/homepage` — buyer homepage (design system + Phase 3)
- `supabase/migrations` — SQL migrations

Next: **Design system** (extract from screenshots), then **Phase 1** (panel).
