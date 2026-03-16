# Researcher Panel

Internal tool to configure buyer profiles and preview the homepage by stage. Sessions are stored in Supabase.

For definitions of **New / Save / Load / Duplicate**, **stages 1–5**, **behavior**, and **session recordings**, see [RESEARCHER-PANEL-GUIDE.md](../docs/RESEARCHER-PANEL-GUIDE.md).

## Setup

1. Copy `config.example.js` to `config.js`.
2. In `config.js`, set your Supabase project URL and anon key (from [Supabase](https://supabase.com) → Project Settings → API, or from your `.env`).
3. Ensure you have run the Supabase migrations (`001_sessions.sql`, `002_location_cache.sql`) so the `sessions` table exists.

## Run

- **Option A:** Open `index.html` in a browser (double-click or drag into Chrome/Safari). If you get CORS or script errors, use Option B.
- **Option B:** Serve the folder locally, e.g. from project root:
  ```bash
  npx serve apps/panel -p 3001
  ```
  Then open `http://localhost:3001`.

## Usage

- **Persona presets:** Click Priya, Rahul, Meera, Vikram, Stage 4, or Stage 5 to load a pre-set profile.
- **Form:** Edit identity, stage, location, filters, and behavior. Changes update the preview iframe.
- **New:** Start a fresh session (unsaved).
- **Save:** Save current profile to Supabase (creates or updates the active session).
- **Load:** Load the most recent saved session (or click a session in the list to load it).
- **Duplicate:** Clone the current session as a new saved session.

Preview shows the design-system showcase; later it can point to the stage-driven buyer homepage.
