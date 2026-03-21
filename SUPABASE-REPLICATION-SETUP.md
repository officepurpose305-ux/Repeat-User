# Supabase Real-Time Replication Setup

Your `live_config` table has been created. Now enable real-time replication:

## Step 1: Verify the Table

Go to: https://app.supabase.com/project/qlfttxrnnjueycffwdmy/editor

Look for the `live_config` table in the left sidebar. If you don't see it, check the SQL Editor and verify the table was created.

## Step 2: Enable Replication

Go to: https://app.supabase.com/project/qlfttxrnnjueycffwdmy/database/publications

You should see:
- **Replication** section
- **Publication: realtime**
- List of tables with toggle switches

Find `live_config` in the list and click the toggle to turn it **ON** (blue switch).

## Step 3: Verify RLS is Disabled (Important!)

1. Go to https://app.supabase.com/project/qlfttxrnnjueycffwdmy/auth/policies
2. Make sure the `live_config` table RLS policy allows `SELECT`, `INSERT`, `UPDATE`, `DELETE` for all users
3. The policy should say "Allow all" or similar

## Step 4: Test

After enabling replication:
1. Open the researcher panel: `file:///Users/fa061462/Documents/Cursor/v2/panel/index.html`
2. Change a value in the panel (e.g., move the budget slider)
3. Check the browser console (F12) for messages about "live config"
4. Open the standalone homepage: `file:///Users/fa061462/Documents/Cursor/v2/homepage/index.html`
5. It should now load data from Supabase within 1-2 seconds

## Troubleshooting

**If nothing syncs:**
- Check browser console (F12) for errors
- Verify Supabase URL and key are correct in config.js files
- Make sure `live_config` publication toggle is ON
- Try refreshing the page

**If you get permission errors:**
- Go to https://app.supabase.com/project/qlfttxrnnjueycffwdmy/auth/policies
- Click `live_config` table
- Make sure RLS is disabled OR the policy allows anonymous access
