# Data Logic Architecture — Smart Homepage Recommendations

## Problem Statement

**Current State:** Homepage shows random data. Example: Search for Sector 150 Noida shows Sectors 137, 143 as suggestions (illogical — they're random slices, not meaningful alternatives).

**Goal:** Make every section data-driven and logical:
- Locality suggestions should be geographically/price-wise similar
- Properties should match buyer stage and budget
- Landmarks should reflect user priorities
- Adjacent localities should show real alternatives (cheaper/premium)

---

## Data Model — What We Have

### Per-City Data Structure (in MOCK_DATA)

```javascript
{
  properties: [
    {
      name, dev, location, price, sqft, bhk,
      status, ready_to_move, lm // landmarks
    }
  ],
  localities: [
    {
      name, bhkRange, avgPsqft,
      yoy,        // year-over-year appreciation %
      metro,      // nearest metro + distance
      conn,       // highway/corridor connectivity
      count       // # of properties
    }
  ],
  adjacentLocalities: [
    {
      name, delta, label,    // ₹X cheaper/premium
      metro, summary
    }
  ],
  landmarks: {
    primary: { metro, hospital, school, mall },
    secondary: { metro, hospital, school, mall }
  }
}
```

### Missing Metadata (Can Be Added)

```javascript
// Locality clusters (geographic/infrastructure zones)
locality.cluster = 'expressway-corridor' | 'metro-connected' | 'premium-zone' | 'affordable-hub'

// Demographic targeting
user.workLocation = 'Cyber City' → match `metro` or `conn` to commute time

// Infrastructure scoring
locality.infrastructureScore = {
  metro: 0–100,      // distance penalty: <1km=100, >3km=30
  hospital: 0–100,   // distance from locality
  school: 0–100,
  mall: 0–100
}

// Price tiers
locality.priceTier = 'budget' | 'mid-segment' | 'premium'  // based on avgPsqft
```

---

## Algorithm 1: Smart Locality Suggestions (`modLocalitySuggestions` — S2 stage)

### Input
- `searchedLocality` — the locality the user searched (e.g., "Sector 150")
- `config.filters` — budget range (₹70–95L)
- `data.localities` — all available localities
- `data.adjacentLocalities` — curated adjacent options

### Logic
```
1. Look up searchedLocality in adjacentLocalities
   → adjacentLocalities list already curated by domain expert
   → Use THAT instead of algorithmic suggestion
   → These are carefully selected alternatives

2. If adjacentLocalities present:
   → Return top 3–4, ranked by:
     a) Price delta (prefer 20–30% alternatives)
     b) Metro connectivity improvement
     c) YoY appreciation rate
   → Filter OUT options >2 price tiers away from user budget

3. Fallback (if no adjacentLocalities):
   → Filter localities by price tier (±30% of searched locality)
   → Rank by YoY appreciation
   → Return top 4
```

### Example
```
User searches: Sector 150, budget ₹95L–1.2Cr
Sector 150 data: avgPsqft ₹9,100, yoy 15%

adjacentLocalities available:
  • Sector 128: ₹8L cheaper, yoy 16% ✓ (good alternative)
  • Sector 93A: ₹15L cheaper, yoy 12%
  • Greater Noida West: ₹22L cheaper, yoy 16% (too cheap — skip)
  • Sector 137: ₹8L premium (doesn't match "adjacentLocalities")

Show suggestions in order:
  1. Sector 128 (cheaper, same connectivity, better yoy)
  2. Sector 93A (budget-friendly, established)
  3. Sector 143 (nearby, metro-connected)
```

---

## Algorithm 2: Ranking Localities by Relevance

### Scoring Function
```javascript
function scoreLocality(loc, userPrefs) {
  let score = 0;

  // 1. Price tier match (40 points)
  const priceDelta = Math.abs(loc.avgPsqft - userPrefs.avgPsqft) / userPrefs.avgPsqft;
  score += 40 * Math.max(0, 1 - priceDelta);

  // 2. Appreciation potential (30 points)
  // Prefer >14% YoY (high) but penalize outliers
  const yoyScore = loc.yoy > 16 ? 30 : (loc.yoy > 12 ? 25 : 15);
  score += yoyScore;

  // 3. Metro connectivity (20 points)
  const metroDistance = parseMetroDistance(loc.metro);  // 800m, 1.2km, etc.
  score += 20 * Math.max(0, 1 - (metroDistance / 3));   // 0–3km range

  // 4. Commute match (10 points) — if workLocation known
  if (userPrefs.workLocation) {
    score += isOnCommutePath(loc.conn, userPrefs.workLocation) ? 10 : 0;
  }

  return score;  // 0–100
}
```

### Example
```
User: Budget ₹90L, works at Cyber City (Gurgaon)

Sector 137:
  Price match: ₹84L search, ₹92L avg → 80 of 40 pts
  YoY 12% → 25 pts
  Metro 800m → 18 pts
  Commute → not on path, 0 pts
  Total: 80 + 25 + 18 = 123 → normalized to 80/100

Sector 128:
  Price match: ₹78L avg → 85/40 pts
  YoY 16% → 30 pts
  Metro 1km → 15 pts
  Commute → 0 pts
  Total: 130 → normalized to 87/100 ✓ (ranked higher)
```

---

## Algorithm 3: Property Filtering by Stage

### S1 (Discovery) — Budget focus
- Show highest-appreciation localities (YoY > 15%)
- Ignore metro/commute (no locality fixed yet)
- Mix: budget tiers (entry, mid, premium)
- Properties: sample randomly from top 6 localities

### S2 (Locality Awareness) — Primary locality + nearby
- Show searched locality properties (top 4 by price)
- Show adjacent locality properties (top 2 each)
- Highlight metro connectivity + landmarks
- Properties: 8–10 total, varied BHK/price

### S3 (Comparison) — Compare 2 localities
- Primary: all properties in main locality
- Secondary: properties in comparison locality
- Show head-to-head metrics (price, metro, appreciation)
- Landmarks: side-by-side comparison

### S4 (Shortlist/Decision) — Watched properties
- Show properties user visited before
- Show similar properties (same dev, locality, price ±10%)
- Call-to-action: contact seller

### S5 (Post-Visit) — Post-site-visit
- EMI calculator, possession timeline
- Similar deals in other stages (upgrade/downgrade options)
- Testimonials from similar profiles

---

## Algorithm 4: Infrastructure Matching

### Use Case: User filters for "Good schools nearby"

```javascript
function findInfrastructure(searchedLocality, infraType, allLocalities) {
  const locData = allLocalities.find(l => l.name === searchedLocality);
  const schoolRef = locData.landmarks?.primary?.school;

  // Score other localities by school proximity
  const scored = allLocalities.map(loc => {
    const school = loc.landmarks?.primary?.school;
    const match = compareSchools(schoolRef, school) ? 100 : 40;
    return { name: loc.name, score: match };
  });

  return scored.sort((a,b) => b.score - a.score).slice(0, 3);
}
```

**Output Example:**
```
User searches Sector 137, needs "good schools"
Sector 137 school: DPS Sec 132 (tier-1)

Top matches:
  1. Sector 150: DPS Sec 152 nearby (tier-1) — 100 pts
  2. Sector 143: Wishtown School + CBSE option — 85 pts
  3. Greater Noida West: 2 private schools — 60 pts
```

---

## Algorithm 5: Property Recommendation by Developer

```javascript
function recommendPropertiesByDeveloper(searchedProperty, allProperties) {
  const { dev, price, bhk, location } = searchedProperty;

  const candidates = allProperties.filter(p =>
    p.dev === dev &&                          // same developer
    Math.abs(parsePriceLakhs(p.price) - parsePriceLakhs(price)) < 10  // ±10L
  );

  if (candidates.length < 3) {
    // Fall back to same locality, same BHK
    return allProperties.filter(p =>
      p.location.includes(location) &&
      p.bhk === bhk &&
      p.name !== searchedProperty.name
    ).slice(0, 3);
  }

  return candidates.slice(0, 3);
}
```

---

## Data Source Priority Chain

### Fetch Flow (Already in Code)
```
1. 99acres real API (if apiBase set) — /debug/search-urls → parseApiListings()
2. OpenAI pre-computed data (if openAIData set) — from panel "Apply" button
3. OpenAI live fetch (if openAIKey set) — GPT-4o-mini call
4. City-matched mock data (getMockData) — ALWAYS available
```

### For Locality Suggestions Specifically
```
1. Try real API: /debug/entities?text="Sector 150" → adjacentLocalities
2. Fall back to mock data adjacentLocalities (hardcoded per city)
3. If neither: generate algorithmically using scoreLocality()
```

---

## Implementation Checklist

### Phase 1: Algorithms (no DOM changes)

- [ ] Create `scoreLocality(loc, userPrefs)` function
- [ ] Create `findSimilarLocalities(searchedLocality, data, count)` → uses scoring
- [ ] Create `recommendPropertiesByDeveloper(prop, allProps)` function
- [ ] Create `findInfrastructure(locality, infraType, data)` function
- [ ] Create `getAdjacentLocalities(searchedLocality, data)` → prioritizes curated adjacentLocalities

### Phase 2: Module Refactoring

Update these module functions to use algorithms instead of random slices:

**Deterministic Modules:**
- `modLocalitySuggestions` → use `findSimilarLocalities()` + `scoreLocality()`
- `modNearbyLocalities` → use geographic proximity + metro
- `modPropertiesInSecondary` → use `recommendPropertiesByDeveloper()` as fallback
- `modHeadToHead` → use dual-locality comparison metrics
- `modNearestLandmarks` → use `findInfrastructure()`

**Needs Data Enrichment:**
- `modBudgetAnchor` → need 3-tier (entry/mid/premium) price points per city
- `modTools` → already deterministic (same 4 tools always)

### Phase 3: Real Data Integration

- [ ] Connect panel's "Apply" button to fetch real 99acres data via OpenAI
- [ ] Store fetched data in config.openAIData
- [ ] Add API error handling + fallback to mock
- [ ] Test with Priya (S2) and Vikram (S1) personas

### Phase 4: Personalization

- [ ] Extract user preferences from panel (work location, infrastructure priorities)
- [ ] Pass user prefs to scoring functions
- [ ] Cache results per (location, stage, filters) tuple
- [ ] Rerank modules by stage

---

## Example: Refactored modLocalitySuggestions

### Before (random)
```javascript
function modLocalitySuggestions(stage, primary, secondary) {
  if (stage !== 2) return null;

  const locs = (data.localities || []).slice(0, 4);  // random!
  const cards = locs.map(l => `<div>...</div>`);
  return `<div class="sec sec-pad">...${cards}...</div>`;
}
```

### After (intelligent)
```javascript
function modLocalitySuggestions(stage, primary, secondary) {
  if (stage !== 2 || !primary) return null;

  // 1. Try adjacentLocalities from data (curated, always prioritize)
  let suggestions = data.adjacentLocalities || [];

  // 2. If none, generate by scoring
  if (suggestions.length === 0) {
    const userPrefs = {
      avgPsqft: findLocality(data.localities, primary).avgPsqft,
      budgetMin: config.filters.budgetMin,
      budgetMax: config.filters.budgetMax,
      workLocation: config.user.worksNear
    };

    suggestions = data.localities
      .filter(l => l.name !== primary)
      .map(l => ({ ...l, score: scoreLocality(l, userPrefs) }))
      .sort((a,b) => b.score - a.score)
      .slice(0, 4);  // top 4 by relevance
  }

  const cards = suggestions.map(l => `<div>...</div>`);
  return `<div class="sec sec-pad">...${cards}...</div>`;
}
```

---

## Data Schema Additions (Future)

For even smarter recommendations, add to MOCK_DATA:

```javascript
// clusters.js
const LOCALITY_CLUSTERS = {
  'noida': {
    'expressway-corridor': ['Sector 137', 'Sector 128', 'Sector 143'],
    'metro-zone': ['Sector 143', 'Sector 150'],
    'affordable': ['Sector 93A', 'Greater Noida West']
  }
};

// developer-profiles.js
const DEVELOPER_RATINGS = {
  'ATS': { reputation: 8.2, delivery: 'on-time', price: 'premium' },
  'Godrej': { reputation: 9.1, delivery: 'on-time', price: 'premium' },
  'Gaursons': { reputation: 7.8, delivery: 'occasional-delay', price: 'mid-segment' }
};
```

---

## Success Metrics

After implementation:

- [ ] Homepage for Sector 150 search shows adjacent localities that make sense (not random)
- [ ] Properties are grouped by developer/price tier (not shuffled)
- [ ] Landmarks match user priorities (work location, school preferences)
- [ ] Stage-specific modules light up correctly (S1 ≠ S2 ≠ S3)
- [ ] Adjacent locality "alternatives" are priced 20–40% different (intentional, not random)

---

**Created:** 2026-03-18
**Status:** Ready for algorithm implementation
