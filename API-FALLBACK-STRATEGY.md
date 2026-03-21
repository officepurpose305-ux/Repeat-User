# API Fallback Strategy — When 99acres API Is Unavailable

## Current Problem

**Data Priority Chain (status quo):**
```
1. 99acres real API         → fails (CORS, timeout, server down) ✗
   ↓
2. OpenAI pre-computed      → may not exist for searched location ✗
   ↓
3. OpenAI live fetch        → slow (5–10s), requires API key ✗
   ↓
4. Mock data                → instant but generic/random ✓ always works
```

**Issue:** When API fails, we fall back to generic mock data that doesn't match the searched location's actual patterns.

---

## 5 Alternatives to Pure Mock Data Fallback

### Alternative 1: Supabase Caching (Recommended)

**How it works:**
```
API Request Flow:
  ↓
  Try 99acres API
    ↓ SUCCESS → Cache result in Supabase `location_cache` table + return
    ↓ FAIL (timeout/CORS) → Check Supabase cache
                            ↓ HIT (fresh) → return cached
                            ↓ HIT (stale) → return cached + mark "possibly outdated"
                            ↓ MISS → fall back to mock
```

**Implementation:**
```javascript
async function fetchData(cfg) {
  const locationKey = generateLocationKey(cfg.location);  // e.g. "sector-75-noida"

  // 1. Try real API
  try {
    const freshData = await fetchFromAPI(cfg);
    // Cache successful result
    await supabase.from('location_cache').upsert({
      location_key: locationKey,
      payload: freshData,
      expires_at: new Date(Date.now() + 7*24*60*60*1000)  // 7 day TTL
    });
    return freshData;
  } catch (apiError) {
    console.log('[fetchData] API failed:', apiError.message);
  }

  // 2. Try Supabase cache
  try {
    const cached = await supabase
      .from('location_cache')
      .select('*')
      .eq('location_key', locationKey)
      .single();

    if (cached.data) {
      const isStale = new Date(cached.data.expires_at) < new Date();
      console.log('[fetchData] Using', isStale ? 'STALE' : 'FRESH', 'cache');
      return cached.data.payload;  // return cached even if stale
    }
  } catch (cacheError) {
    console.log('[fetchData] Cache miss:', cacheError.message);
  }

  // 3. Fall back to mock
  console.log('[fetchData] Falling back to mock data');
  return getMockData(cfg);
}
```

**Pros:**
- ✅ Data is real (from previous successful fetch)
- ✅ Works offline (if user visited same location before)
- ✅ No code changes to algorithms (they still work)
- ✅ Simple to implement (just 1 table)
- ✅ Gradual degradation (fresh → stale → mock)

**Cons:**
- ❌ Only works if location was searched before
- ❌ First-time searches for new locations still get mock data

---

### Alternative 2: Hybrid Mock + Real (Overlay Pattern)

**How it works:**
```
When API fails:
  Use mock data as BASE structure
  Overlay real data WHERE available
  Keep mock data for EVERYTHING ELSE
```

**Example:**
```javascript
async function fetchDataWithFallback(cfg) {
  const mockData = getMockData(cfg);

  try {
    const realData = await fetchFromAPI(cfg);

    // Merge: real properties + real localities, but keep mock for adjacent/landmarks
    return {
      properties: realData.properties || mockData.properties,     // real if available
      localities: realData.localities || mockData.localities,     // real if available
      adjacentLocalities: mockData.adjacentLocalities,            // ALWAYS mock (curated)
      landmarks: mockData.landmarks                               // ALWAYS mock (curated)
    };
  } catch (error) {
    // API failed — return pure mock
    return mockData;
  }
}
```

**Pros:**
- ✅ Preserves curated data (adjacentLocalities, landmarks)
- ✅ Works for partial API responses (if properties load but localities don't)
- ✅ Mixing real + mock is transparent

**Cons:**
- ❌ Data is inconsistent (real properties + mock localities)
- ❌ Algorithms might behave oddly (scoring based on mismatched data)
- ❌ Confusing UX (real price but mock nearby localities)

---

### Alternative 3: Intelligent Mock Data Generation

**How it works:**
```
Instead of hardcoded random mock data, generate it based on data patterns
and the searched location's characteristics.
```

**Example:**
```javascript
function generateIntelligentMockData(city, searchedLocality) {
  // Base data from city template
  const cityTemplate = MOCK_DATA[city];
  if (!cityTemplate) return MOCK_DATA.noida;  // fallback

  const searchedLoc = cityTemplate.localities?.find(l => l.name === searchedLocality);

  // If searched locality exists in mock, use it + nearby
  if (searchedLoc) {
    const nearbyLocalities = cityTemplate.localities
      .filter(l => l.priceTier === searchedLoc.priceTier ||
                   Math.abs(l.avgPsqft - searchedLoc.avgPsqft) < 2000)
      .slice(0, 6);

    const nearbyProperties = cityTemplate.properties
      .filter(p => p.location.includes(searchedLoc.name) ||
                   nearbyLocalities.some(nl => p.location.includes(nl.name)))
      .slice(0, 8);

    return {
      properties: nearbyProperties,
      localities: nearbyLocalities,
      adjacentLocalities: cityTemplate.adjacentLocalities || [],
      landmarks: cityTemplate.landmarks
    };
  }

  // If searched locality NOT in mock, extrapolate based on city average
  const cityAvgPrice = cityTemplate.localities?.reduce((sum, l) => sum + l.avgPsqft, 0) /
                       (cityTemplate.localities?.length || 1);
  const avgYoY = cityTemplate.localities?.reduce((sum, l) => sum + l.yoy, 0) /
                 (cityTemplate.localities?.length || 1);

  return {
    properties: cityTemplate.properties.slice(0, 8),  // generic city sample
    localities: cityTemplate.localities.slice(0, 6),
    adjacentLocalities: [],
    landmarks: cityTemplate.landmarks
  };
}
```

**Pros:**
- ✅ Mock data is smarter (not completely random)
- ✅ Respects city-level patterns
- ✅ Handles new localities intelligently

**Cons:**
- ❌ Still not real data
- ❌ Extrapolation might be wrong
- ❌ Doesn't help with completely unknown locations

---

### Alternative 4: Graceful Degradation (Show What We Know)

**How it works:**
```
If API fails, don't show anything fake.
Instead, disable modules that need real data.
Show only modules that work with mock data.
```

**Example:**
```javascript
function renderPage() {
  const modules = [
    modContextChips(config.stage, config.location.primary),
    config.dataSource === 'mock' ? null : modLocalitySuggestions(...),  // ← hide if mock
    config.dataSource === 'mock' ? modLocalitiesMockWarning(...) : null, // ← show placeholder
    modPropertyCards(...),  // can work with mock
    modBudgetAnchor(...),   // can work with mock
    // ... rest
  ];

  const html = modules.filter(Boolean).join('');
  document.getElementById('page').innerHTML = html;
}

function modLocalitiesMockWarning(stage, primary) {
  if (stage !== 2) return null;
  return `
    <div class="sec sec-pad" style="background:var(--amber);...">
      <span class="material-icons" style="color:var(--orange);">warning</span>
      <strong>Unable to fetch real data for nearby localities.</strong>
      <p>Showing popular localities in ${primary} instead.
         <a href="javascript:location.reload()">Retry</a></p>
      <div class="hscroll">
        ${mockLocalities}
      </div>
    </div>
  `;
}
```

**Pros:**
- ✅ Honest about data source
- ✅ No fake/misleading data
- ✅ User knows to retry or try again later

**Cons:**
- ❌ Empty homepage is poor UX
- ❌ Doesn't show alternatives
- ❌ User experience degrades significantly

---

### Alternative 5: Multi-Source Fallback Chain (Best of All)

**How it works:**
```
Intelligent cascade with multiple fallbacks, choosing best available source.
```

**Implementation:**
```javascript
async function fetchData(cfg) {
  const locationKey = generateLocationKey(cfg.location);

  console.log('[fetchData] Trying sources in order...');

  // 1. TRY: 99acres real API
  try {
    console.log('[fetchData] 1. Trying 99acres API...');
    const freshData = await fetchFrom99acresAPI(cfg);

    // Cache it
    await cacheInSupabase(locationKey, freshData, 7*24*60*60);

    config.dataSource = 'real-api';
    return freshData;
  } catch (err) {
    console.warn('[fetchData] 1. API failed:', err.message);
  }

  // 2. TRY: OpenAI (if key available)
  if (cfg.openAIKey) {
    try {
      console.log('[fetchData] 2. Trying OpenAI...');
      const aiData = await fetchFromOpenAI(cfg);
      config.dataSource = 'openai';
      return aiData;
    } catch (err) {
      console.warn('[fetchData] 2. OpenAI failed:', err.message);
    }
  }

  // 3. TRY: Supabase cache (even if stale)
  try {
    console.log('[fetchData] 3. Checking Supabase cache...');
    const cached = await getFromSupabaseCache(locationKey);

    if (cached) {
      const isStale = new Date(cached.expires_at) < new Date();
      config.dataSource = isStale ? 'cache-stale' : 'cache-fresh';
      console.log('[fetchData] 3. Using', config.dataSource, 'data');
      return cached.payload;
    }
  } catch (err) {
    console.warn('[fetchData] 3. Cache failed:', err.message);
  }

  // 4. TRY: Intelligent mock (smarter than hardcoded)
  console.log('[fetchData] 4. Using intelligent mock...');
  config.dataSource = 'mock-intelligent';
  return generateIntelligentMockData(cfg.location.city, cfg.location.primary);

  // 5. FALLBACK: Generic mock (as last resort)
  console.log('[fetchData] 5. FALLBACK: Using generic mock');
  config.dataSource = 'mock-generic';
  return getMockData(cfg);
}
```

**In UI, show data source:**
```javascript
function renderDataSourceBadge() {
  const badge = {
    'real-api': { label: '✓ Live Data', bg: 'var(--green)', fg: 'white' },
    'openai': { label: '🤖 AI Data', bg: 'var(--blue)', fg: 'white' },
    'cache-fresh': { label: '⏱ Cached (Fresh)', bg: 'var(--blue-light)', fg: 'var(--blue)' },
    'cache-stale': { label: '⏱ Cached (Stale)', bg: 'var(--amber)', fg: 'var(--orange)' },
    'mock-intelligent': { label: '📊 Mock (Smart)', bg: 'var(--gray)', fg: 'var(--text)' },
    'mock-generic': { label: '⚠️ Demo Data', bg: 'var(--red)', fg: 'white' }
  };

  const info = badge[config.dataSource] || badge['mock-generic'];
  return `<div style="background:${info.bg};color:${info.fg};padding:4px 8px;border-radius:4px;font-size:11px;">
    ${info.label}
  </div>`;
}
```

**Pros:**
- ✅ Always shows something useful (never blank)
- ✅ Tries best source first, falls back gracefully
- ✅ Transparent about data quality
- ✅ Scoring algorithms work with any data source
- ✅ User knows what they're seeing

**Cons:**
- ❌ More code complexity
- ❌ Need to maintain multiple data sources

---

## Comparison Table

| Alternative | Real Data | Instant | First-Time | Works Offline | User UX | Implementation |
|---|---|---|---|---|---|---|
| **1. Supabase Cache** | ✅ (cached) | ✅ | ❌ | ✅ | Good | Easy |
| **2. Hybrid Mock+Real** | ⚠️ (mixed) | ✅ | ✅ | ✅ | Okay | Medium |
| **3. Smart Mock** | ❌ | ✅ | ✅ | ✅ | Good | Medium |
| **4. Graceful Degrade** | ❌ | ✅ | ❌ | ✅ | Poor | Easy |
| **5. Multi-Source** | ✅ (best) | ✅ | ✅ | ✅ | Excellent | Hard |

---

## Recommendation

**Use Alternative 5 (Multi-Source Fallback) because:**

1. **Production-ready** — Works for all scenarios
2. **Transparent** — User knows data quality
3. **Scoring algorithms unchanged** — They work with any data source
4. **Graceful degradation** — Always shows something useful
5. **Future-proof** — Easy to add more sources later

**Implementation priority:**
```
Phase 1: Add Supabase caching (Alternative 1)
  → Fastest to implement
  → Huge improvement for repeat visitors

Phase 2: Add intelligent mock (Alternative 3)
  → Better UX for new locations

Phase 3: Full multi-source chain (Alternative 5)
  → Complete fallback system
```

---

## Code Structure (Multi-Source Implementation)

```javascript
// NEW: Helper to generate location key for caching
function generateLocationKey(location) {
  const primary = (location.primary || '').toLowerCase().replace(/\s+/g, '-');
  const city = (location.city || '').toLowerCase().replace(/\s+/g, '-');
  return `${city}/${primary}`;
}

// NEW: Cache write
async function cacheInSupabase(locationKey, data, ttlSeconds) {
  if (!window.SUPABASE_URL) return;  // skip if no supabase
  try {
    await supabase.from('location_cache').upsert({
      location_key: locationKey,
      payload: data,
      expires_at: new Date(Date.now() + ttlSeconds * 1000)
    });
  } catch (err) {
    console.warn('[cache] Failed to write:', err.message);
  }
}

// NEW: Cache read
async function getFromSupabaseCache(locationKey) {
  if (!window.SUPABASE_URL) return null;
  try {
    const res = await supabase
      .from('location_cache')
      .select('*')
      .eq('location_key', locationKey)
      .single();
    return res.data;
  } catch (err) {
    return null;  // cache miss
  }
}

// MODIFIED: Main fetchData with fallbacks
async function fetchData(cfg) {
  const locationKey = generateLocationKey(cfg.location);

  // [Detailed flow as shown above]
}
```

---

**Created:** 2026-03-18
**Status:** Ready for implementation
