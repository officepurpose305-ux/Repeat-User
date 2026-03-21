# Data Logic Implementation Plan — Making Recommendations Intelligent

## Overview

Convert from random/generic mock data to intelligent, scored recommendations.

**Current State:** Modules show random properties (no logic)
**Target State:** Modules rank properties by relevance to user & stage

**Scope:** 8 core modules + 5 scoring functions
**Time Estimate:** 3–4 hours
**Lines of Code:** ~500

---

## Phase: Scoring Functions (90 min)

### Step 1: Add All 5 Scoring Functions

Add these before module functions (after `applyFilters`, around line 557):

```javascript
// ── Core Scoring Functions ──────────────────────────────────────────────
// All functions return 0–100 score

function scoreProximity(targetLocality, candidateLocality, city) {
  // Distance penalty: 0km=100, 5km=75, 10km=50, 15km+=10
  const dist = getDistance(city, targetLocality, candidateLocality) || 999;
  if (dist <= 2) return 100;
  if (dist <= 5) return 75;
  if (dist <= 10) return 50;
  if (dist <= 15) return 25;
  return 10;
}

function scorePriceTier(budgetMin, budgetMax, localityAvgPsqft) {
  // Perfect match ±10% = 100, ±50% = 0
  const midpoint = (budgetMin + budgetMax) / 2;
  const deltaPercent = Math.abs(localityAvgPsqft / 100 - midpoint) / midpoint;
  if (deltaPercent <= 0.1) return 100;
  if (deltaPercent <= 0.2) return 85;
  if (deltaPercent <= 0.3) return 70;
  if (deltaPercent <= 0.5) return 40;
  return 0;
}

function scoreCommute(locality, workLocation) {
  // If on commute path & within tolerance: 100
  // Not on path: 20, way over tolerance: 30
  if (!workLocation) return 50;
  const isOnPath = checkCommutePathMatch(locality, workLocation);
  if (!isOnPath) return 20;
  const minutes = estimateCommuteTime(locality, workLocation);
  if (minutes <= 45) return 100;
  if (minutes <= 60) return 70;
  return 30;
}

function scoreLocality(targetLoc, candidateLoc, config) {
  // Composite: 30% proximity + 25% price + 20% commute + 15% appreciation + 10% infra
  const weights = { proximity: 0.30, price: 0.25, commute: 0.20, yoy: 0.15, infra: 0.10 };

  const scores = {
    proximity: scoreProximity(targetLoc.name, candidateLoc.name, config.location.city),
    price: scorePriceTier(config.filters.budgetMin, config.filters.budgetMax, candidateLoc.avgPsqft),
    commute: scoreCommute(candidateLoc, config.user.worksNear),
    yoy: candidateLoc.yoy > 14 ? 90 : (candidateLoc.yoy > 10 ? 70 : 50),
    infra: (candidateLoc.infrastructureScore || {}).metro || 50
  };

  let total = 0;
  for (const [key, weight] of Object.entries(weights)) {
    total += scores[key] * weight;
  }
  return Math.round(total);
}

function scoreProperty(property, config, stage) {
  // Price, BHK, RTM, newness, demand — weighted by stage
  const scores = {
    price: scorePriceTier(config.filters.budgetMin, config.filters.budgetMax, parsePriceLakhs(property.price)),
    bhk: config.filters.bhk?.some(b => property.bhk?.includes(b.charAt(0))) ? 100 : 30,
    rtm: config.filters.readyToMove === 'yes' ? (property.ready_to_move ? 100 : 0) : 50,
    newness: property.isNew ? 80 : (property.isRTMRecently ? 70 : 40),
    demand: (property.viewCount || 0) > 200 ? 85 : ((property.viewCount || 0) > 100 ? 65 : 40)
  };

  // Stage-specific weights
  const weights = {
    1: { price: 0.40, bhk: 0.20, newness: 0.30, demand: 0.10 }, // S1: Discovery
    2: { price: 0.30, bhk: 0.25, rtm: 0.25, newness: 0.20 },     // S2: Locality aware
    3: { price: 0.25, bhk: 0.25, rtm: 0.25, newness: 0.25 },     // S3: Comparison
    4: { price: 0.35, rtm: 0.40, bhk: 0.25 }                       // S4: Decision
  };

  const w = weights[stage] || weights[2];
  let total = 0;
  for (const [key, weight] of Object.entries(w)) {
    total += (scores[key] || 0) * weight;
  }
  return Math.round(total);
}

// ── Helper Functions ──────────────────────────────────────────────────────
function getDistance(city, loc1, loc2) {
  // Return distance in km (from PROXIMITY_DATA or estimate)
  // For now: return null for unknown pairs, caller handles fallback
  return null;
}

function checkCommutePathMatch(locality, workLocation) {
  // Check if locality is on a main commute route to workLocation
  // For now: return false if we don't have data
  return false;
}

function estimateCommuteTime(locality, workLocation) {
  // Estimate in minutes based on distance and typical traffic
  // For now: return 45 (neutral)
  return 45;
}
```

**Status After Step 1:**
- 5 scoring functions available
- Helper stubs in place (can be expanded with real data)
- All modules can call these functions

---

## Phase: Module Refactoring (2.5 hours)

### Step 2: Refactor `modLocalitySuggestions` (S2)

**Current (random):**
```javascript
const locs = data.localities.slice(0, 4);
```

**New (scored):**
```javascript
function modLocalitySuggestions(stage, primary, secondary) {
  if (stage !== 2 || !primary) return null;

  const targetLoc = data.localities.find(l => l.name === primary);
  if (!targetLoc) return null;

  // Score all other localities
  let suggestions = data.localities
    .filter(l => l.name !== primary)
    .map(l => ({
      ...l,
      score: scoreLocality(targetLoc, l, config)
    }))
    .sort((a,b) => b.score - a.score)
    .slice(0, 4);

  // If city has curated adjacentLocalities, prefer those
  if (data.adjacentLocalities && data.adjacentLocalities.length > 0) {
    suggestions = data.adjacentLocalities
      .map(adj => ({
        ...data.localities.find(l => l.name === adj.name),
        ...adj,
        score: 100
      }))
      .filter(s => s.name)
      .slice(0, 4);
  }

  const cards = suggestions.map(l => `<div>
    <div>${l.name}</div>
    <div>${l.bhkRange}</div>
    <div>📈 ${l.yoy}% YoY · Score: ${l.score}/100</div>
  </div>`).join('');

  return `<div class="sec sec-pad">
    <div class="ds-section-heading">Nearby Localities</div>
    <div class="hscroll">${cards}</div>
  </div>`;
}
```

**What Changed:**
- Scores all localities by relevance
- Sorts by score (highest first)
- Shows score (for debugging, remove later)
- Prioritizes curated adjacentLocalities if available

### Step 3: Refactor `modPropertyCards` (All Stages)

**Current (random):**
```javascript
const props = data.properties.slice(0, 8);
```

**New (scored):**
```javascript
function modPropertyCards(stage, primary, secondary) {
  if (![2, 3, 4, 5].includes(stage)) return null;

  // Stage-specific filtering
  let candidateProperties = data.properties;

  switch (stage) {
    case 2: // S2: Locality aware
      candidateProperties = data.properties.filter(p =>
        p.location.includes(primary) ||
        (data.adjacentLocalities || []).some(adj => p.location.includes(adj.name))
      );
      break;
    case 3: // S3: Comparison
      candidateProperties = data.properties.filter(p =>
        p.location.includes(primary) || p.location.includes(secondary)
      );
      break;
    case 4: // S4: Shortlist
      candidateProperties = data.properties.filter(p =>
        config.behavior?.visitedProperties?.includes(p.name)
      );
      break;
    case 5: // S5: Post-visit
      const visited = data.properties.find(p =>
        config.behavior?.visitedProperties?.[0] === p.name
      );
      candidateProperties = visited ? data.properties.filter(p =>
        p.dev === visited.dev || p.location.includes(visited.location)
      ) : [];
      break;
  }

  // Score each property
  const scored = candidateProperties
    .map(p => ({
      ...p,
      score: scoreProperty(p, config, stage)
    }))
    .sort((a,b) => b.score - a.score)
    .slice(0, 8);

  const cards = scored.map(p => propCard(p, { showBadge: p.score > 70 })).join('');

  return `<div class="sec sec-pad">
    <div class="ds-section-heading">Properties in ${primary}</div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">
      ${cards}
    </div>
  </div>`;
}
```

**What Changed:**
- Filters properties by stage logic first
- Scores remaining properties
- Sorts by score
- Badges properties scoring >70

### Step 4: Refactor `modNearbyLocalities` (S2–S3)

**Apply same pattern:**
1. Filter by proximity (within 5–10km)
2. Score by relevance
3. Sort by score
4. Display top 6

### Step 5: Refactor `modHeadToHead` (S3)

**Don't score this one — just show metrics:**
- Price difference
- YoY difference
- Metro distance
- Property count
- Winner highlighted

---

## Phase: Add Missing Metadata (30 min)

### Step 6: Enhance MOCK_DATA

Add to each locality object:
```javascript
{
  name: 'Sector 137',
  // ... existing fields ...

  // NEW:
  priceTier: 'premium',        // 'budget' | 'mid-segment' | 'premium'
  isNew: false,                 // Properties in last 90 days
  viewCount: 1250,              // Estimated popularity
  infrastructureScore: { metro: 85, hospital: 75, school: 80 }
}
```

Add for properties:
```javascript
{
  name: 'ATS Pristine',
  // ... existing fields ...

  // NEW:
  isNew: false,
  isRTMRecently: false,
  viewCount: 245,
  propertyType: 'premium'
}
```

---

## Phase: Testing (30 min)

### Step 7: Test Refactored Modules

Create `test-data-logic.js`:
```javascript
// Test that modules return scored data
// Test that scores are 0-100
// Test that results are sorted by score desc
// Test stage-specific filtering
// Test with Priya (S2) and Vikram (S1)
```

---

## Execution Timeline

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Add 5 scoring functions | 30 min | Ready to code |
| 2 | Refactor modLocalitySuggestions | 20 min | Follow template |
| 3 | Refactor modPropertyCards | 30 min | Follow template |
| 4 | Refactor modNearbyLocalities | 20 min | Follow template |
| 5 | Refactor modHeadToHead | 20 min | Follow template |
| 6 | Add metadata to MOCK_DATA | 30 min | Straightforward |
| 7 | Create & run tests | 30 min | Simple checks |
| **Total** | | **180 min (3 hours)** | |

---

## Module Priority (if short on time)

**High Impact (do these):**
1. Scoring functions
2. modLocalitySuggestions (S2 — Priya's main need)
3. modPropertyCards (all stages)

**Medium Impact (nice to have):**
4. modNearbyLocalities
5. modHeadToHead

**Low Impact (can skip initially):**
6. Other modules (28 total, but most don't need scoring)

---

## Rollback Plan

If something breaks:
1. All changes are additions + modifications
2. No deletions of working code
3. Can revert to Phase 2 state anytime
4. Original random logic still available as fallback

---

## Success Criteria

- [ ] Scoring functions created and tested
- [ ] Core modules refactored (Locality Suggestions, Property Cards)
- [ ] Properties/localities sorted by relevance (not random)
- [ ] Priya (S2) sees coherent suggestions
- [ ] Vikram (S1) sees relevant budget tiers
- [ ] All 7 persona tests still pass
- [ ] No breaking changes

---

**Status:** Ready to implement
**Next Action:** Start Step 1 (Add scoring functions)
