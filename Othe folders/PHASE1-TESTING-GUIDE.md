# Phase 1 Testing Guide — Supabase Caching

## Setup Checklist

- [ ] Read updated `v2/homepage/index.html` (should have cache helpers + modified fetchData)
- [ ] Run SQL from `PHASE1-SUPABASE-SQL.sql` in Supabase Dashboard → SQL Editor
- [ ] Verify Supabase credentials in `v2/panel/config.js` are filled in
- [ ] Confirm API server is running (`node api/99acres-mock-server.js` on port 5003)

---

## Test Scenario 1: API Succeeds → Cache Write

**Goal:** Verify successful API response gets cached

**Steps:**

1. **Open Chrome DevTools** → Console tab
2. **Open panel:** `v2/panel/index.html`
3. **Fill panel form:**
   - Location: `Sector 150, Noida`
   - Budget: `₹95L – ₹1.2Cr`
   - Stage: S2 (Locality Awareness)
4. **Submit & watch console:**

   ```
   [fetchData] === STARTING MULTI-SOURCE FALLBACK ===
   [fetchData] Called with: { apiBase: "http://localhost:5003", primary: "Sector 150, Noida", locationKey: "noida/sector-150-noida" }

   [fetchData] 1. Attempting 99acres API...
   [99acres] Calling entities: http://localhost:5003/debug/entities?...
   [99acres] Entities response: { city: "noida", locality: "Sector 150" }
   [99acres] Calling search-urls
   [99acres] Page content length: 1250
   [99acres] parseApiListings returned 6 properties
   [99acres] SUCCESS: returning 6 properties

   [cache] Writing to Supabase: noida/sector-150-noida
   [cache] ✓ Cached successfully  ← SUCCESS!

   [fetchData] ✓ Using real-api data
   ```

5. **Check Supabase Dashboard:**
   - Go to `location_cache` table
   - Should see 1 row with `location_key: noida/sector-150-noida`
   - Payload should contain 6 properties

**Expected Result:** ✅ Properties visible, cache written

---

## Test Scenario 2: Reload → Cache Hit (Fresh)

**Goal:** Verify cached data is returned on reload

**Steps:**

1. **Without closing panel, reload page** (same location still in form)
2. **Watch console:**

   ```
   [fetchData] === STARTING MULTI-SOURCE FALLBACK ===
   [fetchData] 1. Attempting 99acres API...
   [99acres] Calling entities...
   [99acres] Page content length: 1250
   [99acres] parseApiListings returned 6 properties
   [99acres] SUCCESS: returning 6 properties

   [cache] Writing to Supabase: noida/sector-150-noida
   [cache] ✓ Cached successfully  ← UPDATED (fresh TTL)
   ```

3. **Reload again, BUT disable API server** (so next request fails):
   - Stop `node api/99acres-mock-server.js`
   - Reload page
4. **Watch console:**

   ```
   [fetchData] === STARTING MULTI-SOURCE FALLBACK ===
   [fetchData] 1. Attempting 99acres API...
   [99acres] Calling entities: http://localhost:5003/debug/entities?...
   [99acres] Error: fetch failed (or timeout)

   [fetchData] 2. Checking Supabase cache...
   [cache] Reading from Supabase: noida/sector-150-noida
   [cache] ✓ Found FRESH data  ← CACHE HIT!

   [fetchData] ✓ Using cache-fresh data (cached 2 min ago)
   ```

5. **Verify properties still show** (same 6 properties as before, from cache)

**Expected Result:** ✅ Properties visible, served from cache (no API call)

---

## Test Scenario 3: New Location → Cache Miss → Mock Fallback

**Goal:** Verify new location (not cached) falls through to mock

**Steps:**

1. **API still stopped**
2. **Change location in panel to:** `Gurgaon` (not yet cached)
3. **Submit & watch console:**

   ```
   [fetchData] === STARTING MULTI-SOURCE FALLBACK ===
   [fetchData] 1. Attempting 99acres API...
   [99acres] Calling entities: http://localhost:5003/debug/entities?...
   [99acres] Error: fetch failed

   [fetchData] 2. Checking Supabase cache...
   [cache] Reading from Supabase: gurgaon/gurgaon
   [cache] Cache miss  ← NO CACHE FOR THIS LOCATION YET

   [fetchData] 3. Checking OpenAI pre-fetched data...
   (none)

   [fetchData] 4. Attempting direct OpenAI call...
   [OpenAI] Error: no API key

   [fetchData] 5. Falling back to mock data
   [fetchData] ✓ Using mock data: 8 properties  ← FALLBACK TO MOCK
   ```

4. **Verify properties show** (but now from MOCK_DATA, not real)

**Expected Result:** ✅ Properties visible (from mock), no cache available yet

---

## Test Scenario 4: Restart API → Next Request Caches New Data

**Goal:** Verify API reconnection re-populates cache

**Steps:**

1. **Restart API server:** `node api/99acres-mock-server.js`
2. **Change location back to** `Sector 150, Noida`
3. **Submit & watch console:**

   ```
   [fetchData] === STARTING MULTI-SOURCE FALLBACK ===
   [fetchData] 1. Attempting 99acres API...
   [99acres] Calling entities: http://localhost:5003/debug/entities?...
   [99acres] SUCCESS: returning 6 properties

   [cache] Writing to Supabase: noida/sector-150-noida
   [cache] ✓ Cached successfully  ← CACHE UPDATED WITH FRESH DATA

   [fetchData] ✓ Using real-api data
   ```

4. **Check Supabase — `updated_at` timestamp should be recent**

**Expected Result:** ✅ Properties visible, cache updated

---

## Test Scenario 5: Stale Cache (>7 days)

**Goal:** Verify stale cache is still served but marked as stale

**Steps:**

1. **Manually update Supabase** (for testing purposes):
   - Go to `location_cache` table
   - Find `noida/sector-150-noida` row
   - Change `expires_at` to `2 days ago` (in the past)
   - Click Update

2. **Stop API server**
3. **Submit search for Sector 150 again**
4. **Watch console:**

   ```
   [fetchData] 2. Checking Supabase cache...
   [cache] Reading from Supabase: noida/sector-150-noida
   [cache] ✓ Found STALE data  ← MARKED AS STALE

   [fetchData] ✓ Using cache-stale data (cached 180 min ago)
   ```

5. **Verify properties still show** (but with "stale" notice in production)

**Expected Result:** ✅ Properties visible from stale cache, properly marked

---

## Console Log Reference

### Successful Path (API → Cache → Success)
```
[fetchData] === STARTING MULTI-SOURCE FALLBACK ===
[fetchData] 1. Attempting 99acres API...
[99acres] SUCCESS: returning X properties
[cache] Writing to Supabase: ...
[cache] ✓ Cached successfully
[fetchData] ✓ Using real-api data
```

### Cache Hit (No API Call)
```
[fetchData] === STARTING MULTI-SOURCE FALLBACK ===
[fetchData] 1. Attempting 99acres API...
[99acres] Error: fetch failed
[fetchData] 2. Checking Supabase cache...
[cache] ✓ Found FRESH data
[fetchData] ✓ Using cache-fresh data
```

### Cache Miss → Mock
```
[fetchData] === STARTING MULTI-SOURCE FALLBACK ===
[fetchData] 1. Attempting 99acres API...
[99acres] Error: fetch failed
[fetchData] 2. Checking Supabase cache...
[cache] Cache miss
[fetchData] 3. Checking OpenAI...
[fetchData] 4. Attempting direct OpenAI...
[OpenAI] Error: no API key
[fetchData] 5. Falling back to mock data
[fetchData] ✓ Using mock data
```

---

## What Gets Cached

**Cached in Supabase:**
```javascript
{
  location_key: "noida/sector-150-noida",
  payload: {
    properties: [
      { name: "...", price: "...", ... },
      { name: "...", price: "...", ... },
      // ... 6 properties from API
    ],
    localities: [],
    adjacentLocalities: [],
    landmarks: {}
  },
  expires_at: "2026-03-25T14:32:00Z",  // 7 days from now
  updated_at: "2026-03-18T14:32:00Z"
}
```

**Not cached** (always use mock):
- Localities (API doesn't return them)
- Adjacent localities (API doesn't return them)
- Landmarks (API doesn't return them)

---

## Troubleshooting

### Problem: "Supabase not configured"
**Solution:** Check `v2/panel/config.js` has `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY`

### Problem: Cache not writing
**Solution:**
1. Check Supabase RLS policy allows inserts
2. Run SQL: `select * from public.location_cache;` — should return rows
3. Check browser console for `[cache] Failed to write:` error

### Problem: Cache always returns `STALE`
**Solution:** Supabase system clock might be ahead. Check `expires_at` timestamp in dashboard.

### Problem: Still using mock even with API available
**Solution:**
1. Check API is actually running (`curl http://localhost:5003/debug/entities`)
2. Check config.js has `window.NINETY_NINE_ACRES_API_BASE = 'http://localhost:5003'`
3. Check browser console for actual error

---

## Success Indicators

- [ ] Console shows `[cache] ✓ Cached successfully` after first search
- [ ] Supabase `location_cache` table has 1+ rows
- [ ] Reloading shows `[cache] ✓ Found FRESH data` when API is down
- [ ] Stale cache still serves data (with STALE label)
- [ ] New locations fall back to mock smoothly

**Phase 1 Complete:** All 5 test scenarios pass ✓

---

**Created:** 2026-03-18
**Next:** Phase 2 — Intelligent Mock Data
