# CLAUDE.md — 99acres Homepage Evolution

This file is the canonical reference for AI assistants working in this repo.
Read it before touching any file. Update it when architecture or conventions change.

---

## What This Project Is

A **repeat-user adaptive homepage** for 99acres, paired with a **researcher panel** used to simulate and test buyer personas. The homepage renders different modules based on the buyer's journey stage (S1–S5). The panel controls what the homepage shows in real-time.

This is a **research / prototyping project**, not a production app. All files are static HTML/CSS/JS — no build step, no bundler, no framework.

---

## Repository Layout

```
/
├── v2/
│   ├── homepage/
│   │   ├── index.html          ← The buyer-facing homepage (all logic inline)
│   │   ├── homepage.css        ← Homepage-specific styles (loaded after design-system.css)
│   │   └── [config.js]         ← GITIGNORED — secrets: Supabase URL/key, OpenAI key, API base URL
│   └── panel/
│       ├── index.html          ← Researcher panel (sidebar form + phone preview iframe)
│       ├── config.example.js   ← Template for config.js — copy and fill in
│       └── [config.js]         ← GITIGNORED — same secrets as homepage config.js
│
├── apps/
│   ├── design-system/
│   │   ├── design-system.css   ← Shared CSS tokens and components (ds-btn, ds-chip, etc.)
│   │   └── design-system.html  ← Living styleguide / component preview page
│   └── homepage/               ← (legacy / unused — active code is in v2/homepage)
│
├── api/
│   └── 99acres-mock-server.js  ← Local Node.js mock API server (CORS-enabled, port 5003)
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_sessions.sql        ← sessions table + RLS policies
│   │   ├── 002_location_cache.sql  ← location_cache table + RLS
│   │   └── RUN_ME_IN_SUPABASE.sql  ← Combined single-file migration (run this one)
│   └── [.env]                  ← GITIGNORED — Supabase credentials for CLI use
│
├── docs/
│   ├── SUPABASE-SETUP.md       ← Step-by-step Supabase setup guide
│   └── RESEARCHER-PANEL-GUIDE.md ← Guide to using the researcher panel
│
├── IMPLEMENTATION-PLAN.md      ← Phased architecture plan (historical reference)
├── README.md                   ← Project overview and quick-start
└── CLAUDE.md                   ← This file
```

---

## Architecture

### How the Panel and Homepage Connect

The panel (`v2/panel/index.html`) embeds the homepage in a 360×760px phone mockup via an `<iframe id="preview-iframe" src="../homepage/index.html">`.

There are **two sync channels**:

1. **`postMessage` (primary, local)** — Panel calls `sendToIframe(profile)` which posts `{ type: 'CONFIG_UPDATE', config: payload }` to the iframe. The homepage listens for this on `window.addEventListener('message', ...)`. This is the real-time channel used by every form change.

2. **Supabase real-time (secondary, cross-device)** — Panel writes the current profile to the `live_config` table in Supabase. A standalone homepage (opened directly, not in the iframe) subscribes to real-time updates on that table. This allows a phone and laptop to stay in sync during a live research session.

### Data Flow for a Profile Change

```
Researcher types in panel form
  → sync() [debounced 400ms]
    → collect() — reads all form fields into profile{}
    → inferCityFromText() — auto-detects city from typed location
    → updateUI() — re-draws stage badge + scoring in sidebar
    → setTimeout 400ms →
        sendToIframe(profile)  →  postMessage to iframe
        writeLiveConfig()      →  Supabase upsert (for cross-device)

iframe receives CONFIG_UPDATE
  → config = Object.assign(defaultConfig(), e.data.config)
  → fetchAndRender()
      ├─ [if location unchanged] applyFilters(rawData, config) → renderPage()
      └─ [if location changed]   fetchData(config) → applyFilters() → renderPage()
```

### fetchData Priority Chain

```
fetchData(config)
  1. 99acres real API    → cfg.apiBase + /debug/entities → /debug/search-urls
                           (requires CORS on API server; see CORS section below)
  2. OpenAI pre-fetched  → cfg.openAIData (populated by "Apply" button pipeline)
  3. OpenAI live         → cfg.openAIKey + GPT-4o-mini (if key present)
  4. City-matched mock   → getMockData(config) — always available, instant
```

Filter changes (BHK, budget, RTM, timeline) **skip steps 1–4 entirely** — they reuse the already-fetched `rawData` and just call `applyFilters(rawData, config)`. Only location changes trigger a new fetch.

---

## Key Files — What's Inside Each

### `v2/homepage/index.html`

Single-file SPA. Everything is inline (no imports except CSS links). Sections:

| Section | Lines (approx) | Purpose |
|---------|----------------|---------|
| `<head>` | 1–10 | Loads Material Icons, design-system.css, homepage.css |
| `MOCK_DATA` / `CITY_ALIASES` | ~15–330 | Static mock data for Noida, Gurgaon, Bangalore |
| `getMockData()` | ~329–340 | Returns city-matched mock data by checking location strings |
| State variables | ~372–378 | `config`, `data`, `rawData`, `loading`, `_fetchId`, `_lastFetchKey` |
| `defaultConfig()` | ~379–387 | Returns blank config skeleton |
| Message listener | ~389–398 | Receives `CONFIG_UPDATE` from panel, calls `fetchAndRender()` |
| `fetchAndRender()` | ~401–422 | Fetch-key cache + race-condition guard + full pipeline |
| `applyFilters()` | ~474–507 | BHK / budget / RTM client-side filtering |
| `fetchData()` | ~509–570 | 4-step data priority chain |
| `fetchFromOpenAI()` | ~606–622 | OpenAI GPT-4o-mini call for locality + property data |
| Module functions | ~700–1450 | `modX()` functions, one per homepage section |
| `renderPage()` | ~1470–1680 | Assembles and injects all modules based on stage |
| Init (Supabase / demo) | ~1680–1740 | Supabase subscription or 800ms demo fallback |

**Stage-adaptive rendering:** Every module function receives `(stage, primary, secondary)` and returns either HTML or `null`. `renderPage()` calls all of them and joins non-null results.

### `v2/panel/index.html`

Single-file researcher tool. Layout: left sidebar (340px) + right preview pane.

Key JS functions in the panel:
- `collect()` — reads all form inputs into `profile` object
- `sync()` — called on every input change; debounced 400ms send to iframe
- `fillForm(p)` — fills all form fields from a profile object
- `inferCityFromText(text)` — keyword-based city detection (no API needed)
- `inferStage(profile)` — rule-based stage 1–5 from behavior signals
- `sendToIframe(profile)` — postMessages to iframe, appends `apiBase` + `openAIKey` from `window.*`
- `applyPreview()` — "Apply" button: runs OpenAI pipeline then sends to iframe
- `writeLiveConfig()` — upserts to Supabase `live_config` table
- `loadPersona(key)` — loads preset persona, calls `fillForm` + `sendToIframe`
- `saveSession()`, `loadSessions()`, `deleteSession()` — Supabase CRUD on `sessions` table

### `apps/design-system/design-system.css`

Shared CSS token and component library. **Always loaded first** (before homepage.css).

Key tokens: `--blue: #2563eb`, `--blue-light: #dbeafe`, `--green: #16a34a`, `--amber: #D97706`, `--border-medium: rgba(0,0,0,0.16)`, `--shadow-card`, `--text: #111827`, `--text2: #6B7280`, `--bg: #F0F0F0`, `--card: #fff`

Key components: `ds-btn`, `ds-btn-primary`, `ds-btn-secondary`, `ds-btn-tertiary`, `ds-btn-sm`, `ds-chip`, `ds-chip-active`, `ds-prop-card`, `ds-shortlist`, `ds-insight`, `ds-badge`

### `v2/homepage/homepage.css`

Homepage-specific overrides. Loaded **after** design-system.css. Contains `:root` token overrides and all layout/module-specific classes.

**Critical**: Do not re-alias `--blue` to a token that doesn't exist in design-system.css. The value must be a literal hex (`#2563eb`) or an existing token.

### `api/99acres-mock-server.js`

Local Node.js API server that mimics the 99acres internal API format. Run with `node api/99acres-mock-server.js` — serves on `http://localhost:5003`.

Endpoints:
- `GET /debug/entities?query=...` — parses a freetext location query into structured entities
- `GET /debug/search-urls?entities=...` — returns a 99acres.com search URL for given entities
- `GET /search?entities=...&limit=8` — returns mock property listings
- `GET /api/properties?city=...&locality=...&bedroom=...` — direct property fetch

**This server has CORS enabled** (`Access-Control-Allow-Origin: *`). Use it for local development instead of Anurag's server at `10.10.17.143:5003`.

---

## Configuration (`config.js`)

Both `v2/panel/` and `v2/homepage/` need a `config.js` (gitignored). Copy `v2/panel/config.example.js` to `v2/panel/config.js` and fill in:

```js
window.SUPABASE_URL      = 'https://your-project.supabase.co';
window.SUPABASE_ANON_KEY = 'your-anon-key';
window.OPENAI_API_KEY    = 'sk-...';                    // optional — enables live AI data
window.NINETY_NINE_ACRES_API_BASE = 'http://localhost:5003'; // or http://10.10.17.143:5003
```

The panel reads these `window.*` variables at runtime and injects `apiBase` + `openAIKey` into every `postMessage` it sends to the homepage iframe. The homepage itself never reads `window.*` directly — it only uses values in `config`.

---

## Supabase Tables

### `sessions` — saved researcher sessions
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto-generated |
| name | text | e.g. "Priya · S2 · Noida" |
| profile | jsonb | full researcher form state |
| created_at / updated_at | timestamptz | |

### `location_cache` — caches 99acres/OpenAI responses per location
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| location_key | text UNIQUE | e.g. "sector-75-noida" |
| payload | jsonb | full API response |
| adjacent_localities | jsonb | nearby locality list |
| expires_at | timestamptz | optional TTL |

### `live_config` — real-time panel→homepage sync (⚠️ MISSING FROM MIGRATIONS)
| Column | Type | Notes |
|--------|------|-------|
| id | text PK | always `'default'` — single-row table |
| config | jsonb | current researcher profile |
| updated_at | timestamptz | |

**This table is referenced in the panel code but not yet in any migration file.**
To create it, run in Supabase SQL Editor:

```sql
create table if not exists public.live_config (
  id text primary key default 'default',
  config jsonb not null,
  updated_at timestamptz default now()
);
alter table public.live_config enable row level security;
create policy "Allow all for live_config" on public.live_config
  for all using (true) with check (true);

-- Enable real-time replication for this table:
-- Supabase Dashboard → Database → Replication → live_config → enable
```

---

## CORS Issue with Real 99acres API

The real API at `http://10.10.17.143:5003` (Anurag's internal server) does not send `Access-Control-Allow-Origin` headers. Browser `fetch()` calls from the homepage will fail silently (caught, falls through to mock data).

**To fix on the server side** (Anurag needs to do this):
```python
from flask_cors import CORS
CORS(app)   # or: CORS(app, resources={r"/debug/*": {"origins": "*"}})
```

**To develop locally without the real API**: Use the local mock server instead:
```js
// in config.js:
window.NINETY_NINE_ACRES_API_BASE = 'http://localhost:5003';
```
Run it with: `node api/99acres-mock-server.js`

---

## Buyer Stage Model (S1–S5)

Stages are **repeat-user** stages — S1 is not "first ever visit" but "returning, still exploring."

| Stage | Name | Signals | Homepage modules shown |
|-------|------|---------|----------------------|
| 1 | Discovery | City-level search, no locality focus | Budget anchor, new launches, price trend |
| 2 | Locality awareness | 2–4 visits, specific locality, 0–1 saves | Locality suggestions, nearby localities, property cards |
| 3 | Comparison | 2 localities set, filters used, 2–4 saves | Head-to-head comparison, landmarks, comparison grid |
| 4 | Shortlist / decision | Same properties viewed repeatedly, developer contacted | Shortlist, "You've been watching" |
| 5 | Post-visit | Site visit done | Loan EMI, possession, feedback |

Stage is **inferred** from behavior signals in `inferStage(profile)` (panel). Researchers can override by clicking a stage number.

---

## Module Visibility Matrix

Each `modX()` function in the homepage returns content or `null`. Here's which stage renders which:

| Module | S1 | S2 | S3 | S4 | S5 |
|--------|----|----|----|----|-----|
| `modContextChips` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `modStaleLocationNudge` | ✓ | ✓ | ✓ | — | — |
| `modBudgetAnchor` | ✓ | — | — | — | — |
| `modNewLaunches` | ✓ | — | — | — | — |
| `modLocalitySuggestions` | — | ✓ | — | — | — |
| `modNearbyLocalities` | — | ✓ | — | — | — |
| `modPropertyCards` | — | ✓ | ✓ | ✓ | ✓ |
| `modHeadToHead` | — | — | ✓ | — | — |
| `modLandmarks` | — | — | ✓ | — | — |
| `modComparisonGrid` | — | ✓ | ✓ | — | — |
| `modBudgetNudge` | — | ✓ | ✓ | — | — |
| `modPriceTrend` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `modShortlistPreview` | — | — | — | ✓ | ✓ |
| `modToolGrid` | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Common Patterns

### Adding a new homepage module

1. Write `function modMyModule(stage, primary, secondary) { if (stage !== X) return null; return \`<div class="sec">...</div>\`; }`
2. Call it inside `renderPage()` in the appropriate position in the sections array
3. Add CSS to `homepage.css` — use existing tokens (`var(--blue)`, `var(--card)`, etc.)
4. Use `esc(str)` for any user-supplied string rendered into HTML
5. Sections use `class="sec"` (white card) or `class="sec sec-pad"` (card + padding)

### Design system classes to use in modules

```html
<button class="ds-btn ds-btn-primary">Primary action</button>
<button class="ds-btn ds-btn-secondary">Secondary</button>
<button class="ds-btn ds-btn-tertiary">Tertiary / text</button>
<div class="ds-chip ds-chip-active">Active filter</div>
<div class="ds-prop-card">...</div>
<span class="ds-shortlist"><span class="material-icons">favorite_border</span></span>
<span class="ds-badge ds-badge-rtm">Ready to move</span>
```

### CSS token quick reference (most-used)

```css
var(--blue)          /* #2563eb — primary actions, links, active state */
var(--blue-light)    /* #dbeafe — info bg, icon bg, nudge tint */
var(--green)         /* #16a34a — RTM badge, growth numbers */
var(--amber)         /* #D97706 — stale nudge, tradeoff warning */
var(--text)          /* #111827 — primary text */
var(--text2)         /* #6B7280 — secondary/label text */
var(--text3)         /* #9CA3AF — placeholder/disabled */
var(--bg)            /* #F0F0F0 — page background */
var(--card)          /* #fff   — card/surface background */
var(--border)        /* rgba(0,0,0,0.08)  — default border */
var(--border-medium) /* rgba(0,0,0,0.16)  — stronger border for cards */
var(--r)             /* 8px  — default border radius */
var(--r-sm)          /* 6px  — small radius */
```

### Material Icons

The homepage loads the Material Icons font in the `<head>`. Use icons with:
```html
<span class="material-icons">favorite_border</span>
<span class="material-icons">trending_up</span>
```
**If the font link is missing from `<head>`, ALL icons render as raw text** (e.g. "favorite_border"). Always keep this link in the homepage head:
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
```

---

## Known Issues and Applied Fixes

| Issue | Root Cause | Fix Applied | File |
|-------|-----------|-------------|------|
| Filter changes not updating homepage | `fetchAndRender()` re-ran full `fetchData()` on every postMessage, hitting API (5s timeout) even for BHK/budget changes | Added `_fetchId` race-condition guard + `_lastFetchKey` fetch-key cache — filter-only changes skip fetchData entirely | `v2/homepage/index.html` |
| Heart icon / shortlist not showing | Material Icons Google Font was missing from `<head>` | Added `<link>` for Material Icons | `v2/homepage/index.html` |
| "Properties in nearby localities" empty | `modNearbyLocalities` sliced `data.properties` which was empty when real API returned few results | Added `propPool` fallback: uses `getMockData().properties` when live data has < 5 | `v2/homepage/index.html` |
| Blue elements invisible (nav button, ds-btn-primary) | `homepage.css` had `--blue: var(--blue-btn-primary)` but that token doesn't exist in design-system.css | Changed to literal hex `--blue: #2563eb` | `v2/homepage/homepage.css` |
| `live_config` table missing | Panel writes to `live_config` but migrations don't create it | SQL documented above; needs to be run once in Supabase | `supabase/migrations/` |
| Real 99acres API not hit (CORS blocked) | API at 10.10.17.143:5003 has no CORS headers; browser blocks cross-origin fetch | Local mock server (`node api/99acres-mock-server.js`) is CORS-enabled. Real API fix: `CORS(app)` on Anurag's Flask server | — |

---

## Development Workflow

### Run locally (no server needed)

1. Open `v2/panel/index.html` directly in browser (file:// works)
2. Copy `v2/panel/config.example.js` → `v2/panel/config.js` and fill in keys
3. The panel will load the homepage in the iframe automatically

### Run with local mock API

```bash
node api/99acres-mock-server.js
# API available at http://localhost:5003
```
Set `window.NINETY_NINE_ACRES_API_BASE = 'http://localhost:5003'` in `config.js`.

### Standalone homepage (without panel)

Open `v2/homepage/index.html` directly. Without a panel connection, it waits 800ms then loads a hardcoded S2/Noida demo persona (Priya, Sector 75). This is the "standalone demo" fallback.

### Supabase real-time sync (cross-device)

1. Create `live_config` table in Supabase (SQL above)
2. Enable real-time replication for `live_config` in Supabase Dashboard → Database → Replication
3. Fill in Supabase credentials in both `v2/panel/config.js` and `v2/homepage/config.js` (if the homepage has one)
4. Open panel on one device, homepage on another — panel changes propagate via Supabase

---

## What Not to Do

- **Don't alias `--blue` to another CSS variable** in `homepage.css` unless that variable is guaranteed to exist in design-system.css. Always use a literal hex as the final value.
- **Don't re-fetch on filter changes** — the `_lastFetchKey` cache exists to prevent this. Only location changes should trigger `fetchData()`.
- **Don't commit `config.js`** — it contains live API keys and Supabase credentials.
- **Don't modify `apps/design-system/design-system.css` for homepage-specific styles** — put those in `v2/homepage/homepage.css`.
- **Don't add `apiBase` or `openAIKey` to the Supabase `live_config` payload** — these are stripped before writing to Supabase (internal/secret values, not safe to persist remotely). They're injected at send-time by the panel's `sendToIframe()`.
