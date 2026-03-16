# 99acres Homepage Evolution — Implementation Plan

Phased plan for: **Backend researcher panel** → **Session/data orchestration** → **Buyer homepage**, with sessions in **Supabase**.

---

## Architecture (target state)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RESEARCHER PANEL (Backend)                                                  │
│  • User config (identity, stage, location, filters, behavior)                │
│  • Persona shortcuts, Session save/load/duplicate/compare                    │
│  • Preview toggle → drives "current session" for buyer view                  │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  SUPABASE                                                                   │
│  • sessions (full JSON profile + snapshot)                                  │
│  • session_events (optional: granular actions for replay)                   │
│  • location_cache (optional: 99acres/OpenAI responses per location)         │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ORCHESTRATION LAYER (API / serverless)                                     │
│  • Resolve location → 99acres Search API or OpenAI for locality meta        │
│  • Merge researcher config + fetched data → "runtime payload"               │
│  • Session recording: save/load/update sessions in Supabase                 │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  BUYER HOMEPAGE (Frontend)                                                  │
│  • Fetches runtime payload by session_id (or default)                       │
│  • Renders modules by stage (visibility matrix from doc)                    │
│  • All content driven by location + config                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Foundation (Supabase + repo)

**Goal:** Supabase project, tables, and a minimal API so the rest can depend on it.

| Step | Task | Output |
|------|------|--------|
| 0.1 | Create Supabase project (or use existing). Get `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. | Env vars |
| 0.2 | Define and run migrations for core tables (see below). | `sessions` table (and optional `location_cache`) |
| 0.3 | Add Row Level Security (RLS): e.g. allow read/write for authenticated users or service role only for researcher panel. | RLS policies |
| 0.4 | Decide repo structure: monorepo (e.g. `apps/panel`, `apps/homepage`, `packages/api`) or separate repos. Create root and placeholder folders. | Folder structure |

**Suggested `sessions` table:**

```sql
-- sessions: one row per saved researcher session
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null,                    -- e.g. "Priya_Visit1"
  profile jsonb not null,                -- full JSON per doc (user, stage, location, filters, behavior)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Optional: index for listing by updated_at
create index if not exists sessions_updated_at on public.sessions (updated_at desc);
```

**Optional `location_cache` table** (for Phase 2):

```sql
-- cache 99acres/OpenAI responses per location key to avoid repeated calls
create table if not exists public.location_cache (
  id uuid primary key default gen_random_uuid(),
  location_key text unique not null,     -- e.g. "Sector 137" or "Sector 137|Sector 143"
  payload jsonb not null,                -- primaryMeta (+ secondaryMeta if comparison)
  adjacent_localities jsonb,
  expires_at timestamptz,
  created_at timestamptz default now()
);
```

**Deliverable:** Supabase ready, migrations applied, env documented. No UI yet.

---

## Phase 1: Backend researcher panel (UI + Supabase sessions)

**Goal:** Full researcher dashboard that matches Part 5 of the doc: config UI, persona shortcuts, session save/load/duplicate, and a preview that will later drive the buyer homepage. No real 99acres/OpenAI yet — use **mock location meta** in the profile.

| Step | Task | Output |
|------|------|--------|
| 1.1 | Scaffold researcher app (React + Tailwind, or Next.js if you prefer). | App runs locally |
| 1.2 | Implement **Section 1–4** controls: User identity, Buyer stage, Location (primary/secondary text + autocomplete with static list), Search context (budget, BHK, RTM), Behavior signals. | Form that produces the doc’s JSON shape |
| 1.3 | Add **Section 5**: Persona shortcuts — load preset JSON for Priya, Rahul, Meera, Vikram, Generic Stage 4/5. | One-click load presets |
| 1.4 | Wire **Section 6**: Save session → POST to API that inserts/updates `sessions` in Supabase. Load session → GET by id, fill form. List sessions (e.g. by `updated_at`). Duplicate = copy profile, new name, new id. | CRUD for sessions in Supabase |
| 1.5 | **Preview panel:** iframe or embedded view that loads the buyer homepage with a query param like `?session_id=<id>` or `?preview=1` and passes current form state (e.g. via postMessage or API). Homepage in Phase 3 will consume this; for now use a **static homepage mock** that reads the same JSON and shows stage-based modules with mock copy. | Researcher sees homepage change when config changes |
| 1.6 | **Section 7**: Reset to new user, Undo last change (single-step). | UX complete for panel |

**Data flow in Phase 1:**

- Researcher edits form → state = one big JSON (profile).
- Save → API → Supabase `sessions.profile`.
- Preview → either (a) same app passes profile into iframe, or (b) API writes a “current preview” row and homepage reads it. Prefer (a) for Phase 1 to avoid extra state.

**Deliverable:** Researcher can configure a profile, save/load/duplicate sessions in Supabase, and see a stage/location-aware homepage mock in the preview. No live 99acres/OpenAI yet.

---

## Phase 2: Orchestration layer (data resolution + session recording)

**Goal:** When the researcher sets a location (and optionally a second for comparison), the system fills `primaryMeta` (and `secondaryMeta`) with **real or realistic data** from 99acres API or OpenAI, and the buyer homepage uses this enriched payload.

| Step | Task | Output |
|------|------|--------|
| 2.1 | **API surface:** e.g. `POST /api/resolve-location` body `{ primary, secondary? }` → returns `{ primaryMeta, secondaryMeta?, adjacentLocalities }`. Internally: check `location_cache`; on miss call 99acres or OpenAI, then cache and return. | Single endpoint that “resolves” location to meta |
| 2.2 | **99acres integration:** If you have a Search API, call it for the given location (e.g. listings or locality endpoints). Map response into the doc’s `primaryMeta` shape (avgPricePerSqft, metroDistance, etc.). If API doesn’t provide some fields, leave null or fill from OpenAI. | 99acres → primaryMeta (and secondaryMeta) |
| 2.3 | **OpenAI fallback:** For localities or fields 99acres doesn’t provide, prompt OpenAI to return structured data (same JSON shape). Optional: use only when 99acres returns nothing or for “adjacent localities” suggestions. | OpenAI → missing meta or full meta |
| 2.4 | **Session recording:** Ensure every “Save session” from the panel sends the **full profile** (including any resolved `primaryMeta`/`secondaryMeta`) to the API and that the API writes it to `sessions.profile`. Optional: add `session_events` table and record discrete actions (e.g. “stage changed to 3”) for later replay or analytics. | Sessions in Supabase always have full snapshot |
| 2.5 | **Runtime payload API:** e.g. `GET /api/session/:id/payload` (or `GET /api/preview?session_id=...`) returns the profile JSON that the buyer homepage needs (with location meta already merged). Panel “Preview” and buyer “Homepage” both use this. | Homepage can fetch one payload by session id |

**Deliverable:** Location typed in the panel triggers resolution (99acres + OpenAI), result is cached and stored in the session; buyer homepage can load by `session_id` and get the full payload.

---

## Phase 3: Buyer homepage (stage + location-driven)

**Goal:** The actual buyer-facing homepage that respects the doc’s module visibility matrix and uses the runtime payload (from researcher session or default).

| Step | Task | Output |
|------|------|--------|
| 3.1 | **Entry point:** Homepage loads with optional `?session_id=...`. If present, `GET /api/session/:id/payload`; else use a default payload or empty Stage 1 config. | Single source of truth for what to render |
| 3.2 | **Stage-driven visibility:** Implement the **Module Visibility Matrix** (doc table). Each module (Search chips, Hero, Locality Intelligence, Property feed, Budget nudge, etc.) is shown/hidden/partial by stage. | Correct modules per stage |
| 3.3 | **Location-driven content:** For each visible module, pull copy and data from the payload’s `location` (primary, secondary, primaryMeta, secondaryMeta, adjacentLocalities). No hardcoded “Sector 137” — all labels and stats from payload. | One homepage, any location |
| 3.4 | **Property cards and lists:** If payload contains property IDs or listing data from 99acres, render them. Else use mock list keyed by location. Decision Spotlight = most viewed property from payload. | Property feed and spotlight real or mock |
| 3.5 | **Researcher preview flow:** In the panel, “Preview” opens the homepage with `?session_id=<current_saved_id>` or a temporary preview id that the API creates from current form state. Researcher sees exactly what the buyer would see. | End-to-end: panel → payload → homepage |

**Deliverable:** Buyer homepage is fully driven by session payload; researcher panel preview shows the same page with real or mock data.

---

## Phase 4: Compare sessions + polish

**Goal:** Compare two sessions side-by-side, and small UX/security improvements.

| Step | Task | Output |
|------|------|--------|
| 4.1 | **Compare sessions:** Split-screen view in the panel: pick Session A and Session B, load both payloads, render two homepage previews (e.g. two iframes with `?session_id=A` and `?session_id=B`). | Researchers can show progression (e.g. Visit 1 vs Visit 4) |
| 4.2 | **Module labels / highlight changed:** Toggles in the panel: “Show module labels” (overlay names on preview), “Highlight changed modules” (compare current payload to previous and highlight diffs). Optional. | Better for stakeholder demos |
| 4.3 | **Auth:** If the panel is not on a private network, add simple auth (e.g. Supabase Auth, or API key) so only researchers can save/load sessions. | Secure panel |
| 4.4 | **Env and keys:** 99acres API key and OpenAI API key in env; document in README. | Safe and documented |

---

## Summary: what to build in order

| Phase | Focus | Storage | Data source |
|-------|--------|---------|-------------|
| **0** | Supabase + tables + repo structure | `sessions` (and optional `location_cache`) | — |
| **1** | Researcher panel + session CRUD + preview mock | Read/write `sessions` | Mock location meta in JSON |
| **2** | Resolve location (99acres + OpenAI), cache, payload API | Write cache, read/write `sessions` | 99acres API + OpenAI |
| **3** | Buyer homepage by stage + location, fetch payload by session_id | Read `sessions` via API | Orchestration layer |
| **4** | Compare sessions, toggles, auth, env | — | — |

---

## Tech choices (aligned with doc)

| Layer | Suggestion | Notes |
|-------|------------|--------|
| Researcher panel | React + Tailwind (or Next.js) | Doc: React + Tailwind |
| State (panel) | Zustand or React state | Light; no server sync needed inside panel |
| API | Next.js API routes or Express | One place for resolve-location, session CRUD, payload |
| Buyer homepage | Same stack or static HTML + JS | Must accept payload and render by stage |
| DB | Supabase (Postgres) | Sessions (and optional location_cache, session_events) |
| Auth (panel) | Supabase Auth or API key | Phase 4 |

---

## Next step

Start with **Phase 0**: create the Supabase project (if needed), add the `sessions` table (and optional `location_cache`), then add a minimal API (e.g. `GET/POST /api/sessions`) that reads and writes `sessions`. Once that’s in place, Phase 1 can build the researcher form and wire Save/Load to those endpoints.

If you want, next we can (1) draft the exact Supabase migration SQL for your project, or (2) scaffold the repo structure and a single “Save session” endpoint so you can test from the UI in Phase 1.
