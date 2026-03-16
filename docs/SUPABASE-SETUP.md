# Supabase setup (step-by-step)

## 1. Create an account and project

1. Go to **[supabase.com](https://supabase.com)** and sign up (GitHub or email).
2. Click **New project**.
3. Fill in:
   - **Name** — e.g. `99acres-research`
   - **Database password** — choose a strong password and **save it** (you need it for DB access later).
   - **Region** — pick one close to you.
4. Click **Create new project**. Wait 1–2 minutes until the project is ready.

---

## 2. Get your API keys and URL

1. In the left sidebar, click **Project Settings** (gear icon at the bottom).
2. Click **API** in the left menu.
3. You’ll see:
   - **Project URL** — e.g. `https://xxxxxxxxxxxx.supabase.co`  
     → This is your `SUPABASE_URL`.
   - **Project API keys**:
     - **anon public** — safe to use in browser/frontend.  
       → This is your `SUPABASE_ANON_KEY`.
     - **service_role** — full access; never expose in frontend.  
       → Only use in a backend/API (e.g. Phase 2/4).

---

## 3. Create your `.env` file

1. In the project root (same folder as `README.md`), copy the example env file:
   - **Mac/Linux:** `cp .env.example .env`
   - **Windows (PowerShell):** `Copy-Item .env.example .env`
2. Open `.env` in your editor and replace the placeholders:

```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Paste your real **Project URL** and **anon public** key from step 2.

---

## 4. Run the database migrations

You need to create the `sessions` table (and optionally `location_cache`). Two ways:

### Option A: SQL Editor (simplest)

1. In Supabase, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file **supabase/migrations/001_sessions.sql** from this repo, copy its full contents, and paste into the SQL Editor.
4. Click **Run** (or press Cmd/Ctrl + Enter). You should see “Success. No rows returned.”
5. (Optional) Repeat for **supabase/migrations/002_location_cache.sql** — copy, paste, Run.

### Option B: Supabase CLI

1. Install the CLI:  
   **Mac:** `brew install supabase/tap/supabase`  
   **Windows:** `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git` then `scoop install supabase`
2. Log in: `supabase login`
3. Link the project (use your project ref from the URL: `https://app.supabase.com/project/<project-ref>`):  
   `supabase link --project-ref YOUR_PROJECT_REF`
4. Push migrations:  
   `supabase db push`

---

## 5. Check that it worked

1. In Supabase, open **Table Editor** in the left sidebar.
2. You should see a table named **sessions** with columns: `id`, `name`, `profile`, `created_at`, `updated_at`.
3. If you ran the second migration, you should also see **location_cache**.

---

## Quick reference

| What you need        | Where in Supabase                    |
|----------------------|--------------------------------------|
| Project URL          | Project Settings → API → Project URL |
| anon key             | Project Settings → API → anon public |
| Run SQL              | SQL Editor → New query → paste → Run |
| View tables          | Table Editor                         |
| Change password / DB | Project Settings → Database          |

---

## Troubleshooting

- **“relation already exists”** — The table was created earlier. You can ignore or run `DROP TABLE IF EXISTS public.sessions CASCADE;` first (only if you’re okay losing that table).
- **RLS errors when reading/writing from app** — Make sure you’re using the **anon** key in the frontend and that the policies in `001_sessions.sql` were applied (they allow all for now).
- **Lost database password** — Project Settings → Database → Reset database password (use carefully).
