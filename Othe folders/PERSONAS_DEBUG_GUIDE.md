# Personas System Debug Guide

## Step 1: Verify Supabase Table Exists

In Supabase Dashboard, go to **SQL Editor** and run:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'personas';
```

**Expected result:** One row with `personas`

If no result → table doesn't exist, run the creation SQL below.

---

## Step 2: Create/Recreate Personas Table

If the table doesn't exist OR if you're still having issues, run this complete migration in the **SQL Editor**:

```sql
-- Drop if exists (careful: this deletes all personas!)
DROP TABLE IF EXISTS public.personas CASCADE;

-- Create table
CREATE TABLE public.personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  profile JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

-- Create permissive policy (allow all operations)
CREATE POLICY "Allow all for personas" ON public.personas
  FOR ALL USING (true) WITH CHECK (true);

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'personas';
```

**Expected output:**
- Table created
- RLS enabled: `rowsecurity = true`
- Policy created

---

## Step 3: Enable Real-time (Optional but helpful for debugging)

In Supabase Dashboard:
1. Go to **Database** → **Replication**
2. Find `personas` table
3. Toggle **ON** to enable real-time

---

## Step 4: Test the Panel

1. **Hard refresh panel** (Cmd+Shift+R or Ctrl+Shift+R)
2. **Look at top-right** of panel for DB status indicator:
   - 🟢 Green dot = "DB connected"
   - 🔴 Red dot = "DB error"
3. **Click "Saved Personas"** to expand
4. **Click "🔧 Debug / Force Reload"** button
5. **Check the status message** that appears above the persona list

---

## Step 5: Expected Behavior Flow

### First Time (Table Empty)
```
Expand Personas
  → Shows: "No personas saved yet. Click expand to seed defaults."
  → Click Debug button
  → Status shows: "Rows in DB: 0"
  → System attempts to seed...
  → Status shows: "After reload: 6 personas"
  → List shows 6 personas (Priya, Rahul, Meera, Vikram, Stage 4, Stage 5)
```

### After Seeded
```
Expand Personas
  → Shows: 6 personas immediately
  → Click any persona
  → Form fills with that persona's data
  → Can click "Save current as Persona" to add more
```

---

## Step 6: Check Console

If issues persist, open **browser console** (F12) and look for:

- `"loadPersonas: loaded X personas"` ✓ Success
- `"loadPersonas error:"` ✗ Query failed - check error message
- `"seedPersonas: inserted successfully"` ✓ Seeding worked
- `"seedPersonas insert error:"` ✗ Insert failed - check error code and details

---

## Common Issues & Fixes

### Issue: "No personas saved yet" even after Debug button
**Likely cause:** Table exists but is empty AND seeding failed silently
**Fix:** Check console for `seedPersonas insert error:` message. Check error code:
- `23503` = Foreign key constraint (shouldn't happen for personas table)
- `23505` = Unique violation (shouldn't happen)
- `42501` = RLS policy denies write access

**Solution:** If RLS error, re-run the SQL from Step 2 exactly as shown.

### Issue: "Database not connected" message
**Likely cause:** `window.SUPABASE_URL` or `window.SUPABASE_ANON_KEY` not set in config.js
**Fix:** Verify config.js is copied from config.example.js and has both values filled in

### Issue: Debug button shows "⚠️ Database not connected"
**Cause:** `initSupabase()` failed or Supabase JS client didn't load
**Fix:**
1. Check that Supabase JS CDN link is in panel `<head>` (it should be)
2. Verify no JavaScript errors in console
3. Try hard-refresh panel again

---

## Step 7: Manual Test (Advanced)

If all else fails, test manually in browser console:

```javascript
// Check Supabase is loaded
console.log(window.supabase ? 'Supabase loaded' : 'NOT LOADED');

// Check credentials
console.log('URL:', window.SUPABASE_URL);
console.log('Key:', window.SUPABASE_ANON_KEY?.substring(0, 20) + '...');

// Test query directly
const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
const { data, error } = await sb.from('personas').select('*');
console.log('Query result:', { count: data?.length, error: error?.message });
```

---

## Expected Final State

✅ Panel loads
✅ DB status shows green dot + "DB connected"
✅ Click "Saved Personas" to expand
✅ See 6 seed personas OR "No personas saved yet"
✅ Click Debug button → shows row count and reload status
✅ Click a persona → form fills
✅ Click "Save current as Persona" → new persona added

If you reach this point, personas system is working! 🎉
