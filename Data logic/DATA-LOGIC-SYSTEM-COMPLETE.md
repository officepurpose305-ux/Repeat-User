# Complete Data Logic System — All Modules, All Locations

## Overview

Every homepage section must generate recommendations based on:
1. **Searched location** (primary)
2. **Buyer stage** (S1–S5)
3. **User profile** (budget, BHK, preferences, work location)
4. **Real data patterns** (price, appreciation, infrastructure)
5. **Logical proximity** (geographic, price-tier, commute-time)

**No random data. No hardcoded slices. Every recommendation is deterministic and reasoned.**

---

## Part 1: Core Data Enrichment Layer

### What We Have (in MOCK_DATA)
```javascript
{
  properties: [...],
  localities: [...],
  adjacentLocalities: [...],
  landmarks: { primary, secondary }
}
```

### What We Need to Add (Metadata)

#### 1. Locality Metadata (add to each locality object)
```javascript
{
  name: 'Sector 137',
  // ... existing fields ...

  // NEW: Clustering & geography
  cluster: 'expressway-corridor',  // group: corridor, metro-zone, premium, affordable
  proximity: { 'Sector 128': 2.5, 'Sector 143': 5.2, ... },  // km

  // NEW: Price tiers
  priceTier: 'premium',  // 'budget' | 'mid-segment' | 'premium' (based on avgPsqft)
  priceRange: { min: 84, max: 110 },  // Lakhs

  // NEW: Availability & trending
  newListingsPerWeek: 12,
  trendingDirection: 'up',  // 'up' | 'stable' | 'down'

  // NEW: Infrastructure scoring
  infrastructureScore: {
    metro: 95,        // 0–100: distance penalty
    hospital: 80,
    school: 85,
    mall: 75,
    commute: 60       // to major CBD
  }
}
```

#### 2. Property Metadata
```javascript
{
  name: 'ATS Pristine – Tower C',
  // ... existing fields ...

  // NEW: Classification
  propertyType: 'luxury' | 'premium' | 'mid-segment' | 'budget',
  isNew: true,          // launched <6 months
  isRTMRecently: true,  // RTM in last 90 days

  // NEW: Demand signals
  viewCount: 245,       // proxy for popularity
  inquiriesPastMonth: 8,
  daysListed: 45,

  // NEW: Neighborhood summary
  nearestMetroMinutes: 10,
  nearestSchoolName: 'DPS Sec 132',
  nearestHospitalName: 'Fortis Hospital'
}
```

#### 3. User Preferences (from panel, stored in config)
```javascript
config.user = {
  name: 'Priya',
  age: 34,
  occupation: 'Product Manager',
  worksNear: 'Cyber City, Gurgaon',    // commute source
  preferredMetro: true,                 // importance flag
  preferredSchools: 'tier-1',          // 'tier-1' | 'any'
  commuteTolerance: 45                  // minutes
}

config.behavior = {
  visitedProperties: ['ATS Pristine', ...],
  savedLocalities: ['Sector 137', ...],
  priceSensitivity: 'medium'  // 'low' | 'medium' | 'high'
}
```

---

## Part 2: Scoring & Ranking Functions

### Helper 1: Geographic Proximity Score
```javascript
function scoreProximity(targetLocality, candidateLocality, userCity) {
  // Input: target (searched), candidate (to rank), user city
  // Output: 0–100 score

  // Get distance from mock proximity data
  const distanceKm = PROXIMITY_DATA[userCity]?.[targetLocality]?.[candidateLocality];

  if (!distanceKm) return 0;  // not in same city = score 0

  // Penalty curve: 0km=100, 5km=75, 10km=40, 15km+=10
  if (distanceKm <= 2) return 100;
  if (distanceKm <= 5) return 75;
  if (distanceKm <= 10) return 50;
  if (distanceKm <= 15) return 25;
  return 10;
}
```

### Helper 2: Price Tier Compatibility
```javascript
function scorePriceTier(userBudgetMin, userBudgetMax, localityAvgPsqft, localityPriceTier) {
  // Input: user budget range, locality price data
  // Output: 0–100 score

  const userMidpoint = (userBudgetMin + userBudgetMax) / 2;
  const tierMidpoint = localityAvgPsqft / 100000;  // convert to crore scale
  const percentDelta = Math.abs(tierMidpoint - userMidpoint) / userMidpoint;

  // Perfect match = 100; ±20% = 80; ±50% = 40; >50% = 0
  if (percentDelta <= 0.1) return 100;
  if (percentDelta <= 0.2) return 85;
  if (percentDelta <= 0.3) return 70;
  if (percentDelta <= 0.5) return 40;
  return 0;
}
```

### Helper 3: Commute Score (for work location matching)
```javascript
function scoreCommute(locality, userWorkLocation, commuteTolerance) {
  // Input: locality with metro/conn, user work location, tolerance (minutes)
  // Output: 0–100 score

  if (!userWorkLocation) return 50;  // neutral if no work location

  const isOnPath = COMMUTE_PATHS[userWorkLocation]?.includes(locality.conn);
  const estimatedMinutes = estimateCommuteMinutes(locality, userWorkLocation);

  if (!isOnPath) return 20;
  if (estimatedMinutes <= commuteTolerance) return 100;
  if (estimatedMinutes <= commuteTolerance + 15) return 70;
  return 30;
}
```

### Helper 4: Composite Locality Relevance Score
```javascript
function scoreLocality(targetLocality, candidate, config, allLocalities) {
  // Combines proximity + price + commute + appreciation

  const weights = {
    proximity: 0.30,
    priceTier: 0.25,
    commute: 0.20,
    appreciation: 0.15,
    infrastructure: 0.10
  };

  const scores = {
    proximity: scoreProximity(targetLocality.name, candidate.name, config.location.city),
    priceTier: scorePriceTier(
      config.filters.budgetMin,
      config.filters.budgetMax,
      candidate.avgPsqft,
      candidate.priceTier
    ),
    commute: scoreCommute(candidate, config.user.worksNear, config.user.commuteTolerance),
    appreciation: candidate.yoy > 14 ? 90 : (candidate.yoy > 10 ? 70 : 50),
    infrastructure: candidate.infrastructureScore?.metro || 50
  };

  // Weighted sum
  let total = 0;
  for (const [key, weight] of Object.entries(weights)) {
    total += scores[key] * weight;
  }

  return Math.round(total);
}
```

### Helper 5: Property Relevance to User
```javascript
function scoreProperty(property, config, targetLocality) {
  // Score a property against user's stage, budget, preferences

  const scores = {
    priceMatch: scorePriceTier(
      config.filters.budgetMin,
      config.filters.budgetMax,
      parsePriceLakhs(property.price),
      property.propertyType
    ),
    bhkMatch: config.filters.bhk?.some(b => property.bhk?.includes(b.charAt(0))) ? 100 : 30,
    rTMMatch: config.filters.readyToMove === 'yes' ? (property.ready_to_move ? 100 : 0) : 50,
    newness: property.isNew ? 80 : (property.isRTMRecently ? 70 : 40),
    demand: property.viewCount > 200 ? 85 : (property.viewCount > 100 ? 65 : 40)
  };

  // Composite with stage-specific weights
  let weights;
  switch (config.stage) {
    case 1:  // Discovery: budget & trending matter
      weights = { priceMatch: 0.40, bhkMatch: 0.20, newness: 0.30, demand: 0.10 };
      break;
    case 2:  // Locality aware: price & availability
      weights = { priceMatch: 0.30, bhkMatch: 0.25, rTMMatch: 0.25, newness: 0.20 };
      break;
    case 3:  // Comparison: all matter equally
      weights = { priceMatch: 0.25, bhkMatch: 0.25, rTMMatch: 0.25, newness: 0.25 };
      break;
    case 4:  // Decision: match saved preferences
      weights = { priceMatch: 0.35, rTMMatch: 0.40, bhkMatch: 0.25 };
      break;
    default:
      weights = { priceMatch: 0.35, bhkMatch: 0.35, rTMMatch: 0.30 };
  }

  let total = 0;
  for (const [key, weight] of Object.entries(weights)) {
    total += (scores[key] || 0) * weight;
  }

  return Math.round(total);
}
```

---

## Part 3: Module-by-Module Logic

### Module 1: `modBudgetAnchor` (S1 only)

**Goal:** Show 3 price tiers (entry, mid, premium) that represent real market segments in searched city.

**Algorithm:**
```javascript
function modBudgetAnchor(stage, primary, secondary) {
  if (stage !== 1) return null;

  // Get all localities in city, group by priceTier
  const byTier = {};
  data.localities.forEach(l => {
    if (!byTier[l.priceTier]) byTier[l.priceTier] = [];
    byTier[l.priceTier].push(l);
  });

  // Pick median locality from each tier
  const anchors = {
    budget: byTier.budget?.sort((a,b) => a.avgPsqft - b.avgPsqft)[
      Math.floor(byTier.budget.length / 2)
    ],
    midSegment: byTier['mid-segment']?.[Math.floor(byTier['mid-segment'].length / 2)],
    premium: byTier.premium?.sort((a,b) => b.avgPsqft - a.avgPsqft)[
      Math.floor(byTier.premium.length / 2)
    ]
  };

  // Calculate price ranges for 2 BHK in each tier
  const formatTier = (localityData, label) => {
    if (!localityData) return '';
    const avgPrice = (localityData.avgPsqft * 1000) / 100;  // mock: 1000 sqft avg
    return `
      <div style="...">
        <div style="font-size:var(--text-xs);...margin-bottom:4px;">${label}</div>
        <div style="font-size:var(--text-base);font-weight:var(--weight-bold);...">
          ₹${Math.round(avgPrice / 10)}L–${Math.round(avgPrice * 1.2 / 10)}L
        </div>
        <div class="ds-heading-sub">~${Math.round(avgPrice / 10)} L avg</div>
      </div>
    `;
  };

  return `<div class="sec sec-pad">
    <div style="font-size:var(--text-lg);font-weight:var(--weight-bold);margin-bottom:12px;">Budget Tiers in ${primary}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
      ${formatTier(anchors.budget, 'Budget')}
      ${formatTier(anchors.midSegment, 'Mid-Segment')}
      ${formatTier(anchors.premium, 'Premium')}
    </div>
  </div>`;
}
```

**Result:** Shows real price tiers from actual locality data, not random.

---

### Module 2: `modLocalitySuggestions` (S2 only)

**Goal:** Show 4 nearby localities ranked by relevance to searched location.

**Algorithm:**
```javascript
function modLocalitySuggestions(stage, primary, secondary) {
  if (stage !== 2 || !primary) return null;

  const targetLocality = data.localities.find(l => l.name === primary);
  if (!targetLocality) return null;

  // Rank all OTHER localities by relevance
  let suggestions = data.localities
    .filter(l => l.name !== primary)
    .map(l => ({
      ...l,
      score: scoreLocality(targetLocality, l, config, data.localities)
    }))
    .sort((a,b) => b.score - a.score)
    .slice(0, 4);

  // If city has curated adjacentLocalities, use those instead
  if (data.adjacentLocalities?.length > 0) {
    suggestions = data.adjacentLocalities
      .map(adj => ({
        ...data.localities.find(l => l.name === adj.name),
        ...adj,
        score: 100  // curated = highest score
      }))
      .filter(s => s.name)
      .slice(0, 4);
  }

  const cards = suggestions.map(l => `<div style="...">
    <div style="font-weight:bold;">${esc(l.name)}</div>
    <div class="ds-heading-sub">${esc(l.bhkRange)}</div>
    <div style="margin-top:8px;">📈 ${l.yoy}% YoY · 🚇 ${esc(l.metro)}</div>
    <div style="margin-top:4px;">₹${(l.avgPsqft).toLocaleString()}/sqft</div>
    <div style="margin-top:8px;padding:4px 6px;background:var(--blue-light);border-radius:4px;font-size:var(--text-xs);">
      ✓ Score: ${l.score}/100
    </div>
  </div>`).join('');

  return `<div class="sec sec-pad">
    <div class="ds-section-heading">Similar & Nearby Localities</div>
    <div class="ds-heading-sub">Ranked by relevance to ${primary}</div>
    <div class="hscroll" style="margin-top:12px;">
      ${cards}
    </div>
  </div>`;
}
```

**Result:** Not random; scored by proximity, price tier, appreciation, commute.

---

### Module 3: `modPropertyCards` (S2, S3, S4, S5)

**Goal:** Show properties matching user's stage, budget, BHK, and location.

**Algorithm:**
```javascript
function modPropertyCards(stage, primary, secondary) {
  if (![2, 3, 4, 5].includes(stage)) return null;

  let candidateProperties = [];

  switch (stage) {
    case 2:  // Locality aware — properties in searched locality + nearby
      candidateProperties = data.properties.filter(p =>
        p.location.includes(primary) ||
        data.adjacentLocalities?.some(adj => p.location.includes(adj.name))
      );
      break;

    case 3:  // Comparison — primary + secondary
      candidateProperties = data.properties.filter(p =>
        p.location.includes(primary) || p.location.includes(secondary)
      );
      break;

    case 4:  // Decision — properties user has already seen
      candidateProperties = data.properties.filter(p =>
        config.behavior.visitedProperties?.includes(p.name)
      );
      break;

    case 5:  // Post-visit — similar to visited
      const visited = data.properties.find(p =>
        config.behavior.visitedProperties?.includes(p.name)
      );
      if (visited) {
        candidateProperties = data.properties.filter(p =>
          p.dev === visited.dev || p.location.includes(visited.location)
        );
      }
      break;
  }

  // Score each candidate
  const scored = candidateProperties.map(p => ({
    ...p,
    score: scoreProperty(p, config, primary)
  }));

  // Sort by score, take top 8
  const results = scored
    .sort((a,b) => b.score - a.score)
    .slice(0, 8);

  const cards = results.map(p => propCard(p, {
    horizontal: stage === 2,  // S2 = carousel
    showBadge: p.isNew
  })).join('');

  return `<div class="sec sec-pad">
    <div class="ds-section-heading">Properties in ${primary}</div>
    ${stage === 2 ? `<div class="hscroll">${cards}</div>` :
      `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">${cards}</div>`}
  </div>`;
}
```

**Result:** Properties are scored, not random. S2 shows nearby; S3 compares both localities; S4 shows watched.

---

### Module 4: `modHeadToHead` (S3 only)

**Goal:** Compare primary vs secondary locality across key metrics.

**Algorithm:**
```javascript
function modHeadToHead(stage, primary, secondary) {
  if (stage !== 3 || !secondary) return null;

  const loc1 = data.localities.find(l => l.name === primary);
  const loc2 = data.localities.find(l => l.name === secondary);
  if (!loc1 || !loc2) return null;

  // Comparison metrics
  const metrics = [
    { label: 'Avg Price/sqft', v1: `₹${loc1.avgPsqft}`, v2: `₹${loc2.avgPsqft}`, winner: loc1.avgPsqft < loc2.avgPsqft ? 1 : 2 },
    { label: 'YoY Growth', v1: `${loc1.yoy}%`, v2: `${loc2.yoy}%`, winner: loc1.yoy > loc2.yoy ? 1 : 2 },
    { label: 'Metro Access', v1: loc1.metro, v2: loc2.metro, winner: parseMetroDistance(loc1.metro) < parseMetroDistance(loc2.metro) ? 1 : 2 },
    { label: 'Properties Available', v1: loc1.count, v2: loc2.count, winner: 0 }
  ];

  const rows = metrics.map(m => `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px;border-bottom:1px solid var(--border);">
      <div style="font-weight:var(--weight-semibold);">${m.label}</div>
      <div style="text-align:center;font-weight:${m.winner === 1 ? 'bold' : 'normal'};color:${m.winner === 1 ? 'var(--green)' : 'inherit'};">${m.v1}</div>
      <div style="text-align:center;font-weight:${m.winner === 2 ? 'bold' : 'normal'};color:${m.winner === 2 ? 'var(--green)' : 'inherit'};">${m.v2}</div>
    </div>
  `).join('');

  return `<div class="sec sec-pad">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-weight:bold;padding:8px;background:var(--blue-light);border-radius:4px;">
      <div>Metric</div>
      <div style="text-align:center;">${esc(primary)}</div>
      <div style="text-align:center;">${esc(secondary)}</div>
    </div>
    ${rows}
  </div>`;
}
```

**Result:** Actual comparison based on real data metrics, not subjective.

---

### Module 5: `modHomeLoanEMI` (S4, S5)

**Goal:** Show realistic EMI calculations based on properties user viewed.

**Algorithm:**
```javascript
function modHomeLoanEMI(stage, primary, secondary) {
  if (![4, 5].includes(stage)) return null;

  // Get avg price of properties user visited
  const visitedProps = data.properties.filter(p =>
    config.behavior.visitedProperties?.includes(p.name)
  );
  if (!visitedProps.length) return null;

  const avgPriceLakhs = visitedProps.reduce((sum, p) => sum + parsePriceLakhs(p.price), 0) / visitedProps.length;

  // Assume 60% loan, 7.5% rate, 20 years
  const loanAmount = avgPriceLakhs * 0.6;
  const rate = 7.5;
  const months = 20 * 12;

  const monthlyEMI = (loanAmount * (rate / 100 / 12) * Math.pow(1 + rate / 100 / 12, months)) /
    (Math.pow(1 + rate / 100 / 12, months) - 1);

  return `<div class="sec sec-pad">
    <div class="ds-section-heading">Home Loan EMI Calculator</div>
    <div style="margin-top:12px;">
      <div style="padding:12px;background:var(--blue-light);border-radius:8px;">
        <div class="ds-heading-sub">Based on properties you've viewed</div>
        <div style="font-size:24px;font-weight:bold;color:var(--blue);margin-top:8px;">
          ₹${Math.round(monthlyEMI.toLocaleString())}/<wbr>month
        </div>
        <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:8px;">
          For ₹${Math.round(loanAmount)}L @ 7.5% × 20 years
        </div>
      </div>
      <button class="ds-btn ds-btn-primary ds-btn-sm" style="margin-top:12px;width:100%;">
        Explore Loan Options →
      </button>
    </div>
  </div>`;
}
```

**Result:** EMI is calculated from ACTUAL properties user viewed, not mock assumptions.

---

### Module 6: `modNearbyLocalities` (S2, S3)

**Goal:** Show localities within 5km of searched locality.

**Algorithm:**
```javascript
function modNearbyLocalities(stage, primary, secondary) {
  if (![2, 3].includes(stage) || !primary) return null;

  // Filter localities within 5km radius
  const nearby = data.localities
    .filter(l => {
      const dist = PROXIMITY_DATA[config.location.city]?.[primary]?.[l.name] || 999;
      return dist > 0 && dist <= 5 && l.name !== primary;
    })
    .map(l => ({
      ...l,
      score: scoreLocality(
        data.localities.find(x => x.name === primary),
        l,
        config,
        data.localities
      )
    }))
    .sort((a,b) => b.score - a.score)
    .slice(0, 6);

  if (!nearby.length) return null;

  const cards = nearby.map(l => `<div style="...">
    <div style="font-weight:bold;">${esc(l.name)}</div>
    <div class="ds-heading-sub">${esc(l.bhkRange)}</div>
    <div style="margin-top:8px;">📍 ${PROXIMITY_DATA[config.location.city][primary][l.name]?.toFixed(1)} km · 📈 ${l.yoy}%</div>
  </div>`).join('');

  return `<div class="sec sec-pad">
    <div class="ds-section-heading">Nearby Localities (within 5km)</div>
    <div class="hscroll">${cards}</div>
  </div>`;
}
```

**Result:** Filtered by actual proximity, not random selection.

---

### Module 7: `modFreshListings` (S1, S2)

**Goal:** Show properties listed in past 7 days, matching stage & budget.

**Algorithm:**
```javascript
function modFreshListings(stage, primary, secondary) {
  if (![1, 2].includes(stage)) return null;

  // Filter to properties <7 days old
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);

  let candidates = data.properties.filter(p =>
    new Date(p.listingDate || '2026-03-18') >= cutoffDate
  );

  // S2: Filter to primary locality
  if (stage === 2 && primary) {
    candidates = candidates.filter(p =>
      p.location.includes(primary) ||
      data.adjacentLocalities?.some(adj => p.location.includes(adj.name))
    );
  }

  // Score by relevance
  const scored = candidates
    .map(p => ({ ...p, score: scoreProperty(p, config, primary) }))
    .sort((a,b) => b.score - a.score)
    .slice(0, 6);

  const cards = scored.map(p => propCard(p, { showBadge: true })).join('');

  return `<div class="sec sec-pad">
    <div class="ds-section-heading">Fresh Listings (Past 7 Days)</div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">${cards}</div>
  </div>`;
}
```

**Result:** Only shows new listings (actual freshness), scored by relevance.

---

### Module 8: `modPriceComparison` (S3)

**Goal:** Compare price trends between primary and secondary localities.

**Algorithm:**
```javascript
function modPriceComparison(stage, primary, secondary) {
  if (stage !== 3 || !secondary) return null;

  const loc1 = data.localities.find(l => l.name === primary);
  const loc2 = data.localities.find(l => l.name === secondary);
  if (!loc1 || !loc2) return null;

  const diff = loc2.avgPsqft - loc1.avgPsqft;
  const pct = (diff / loc1.avgPsqft * 100).toFixed(1);

  return `<div class="sec sec-pad">
    <div class="ds-section-heading">Price Comparison</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
      <div style="background:var(--blue-light);padding:12px;border-radius:8px;">
        <div class="ds-heading-sub">${esc(primary)}</div>
        <div style="font-size:20px;font-weight:bold;color:var(--blue);margin-top:8px;">
          ₹${loc1.avgPsqft.toLocaleString()}/sqft
        </div>
      </div>
      <div style="background:${diff > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'};padding:12px;border-radius:8px;">
        <div class="ds-heading-sub">${esc(secondary)}</div>
        <div style="font-size:20px;font-weight:bold;color:${diff > 0 ? 'var(--green)' : 'var(--red)'};margin-top:8px;">
          ₹${loc2.avgPsqft.toLocaleString()}/sqft
        </div>
        <div style="font-size:var(--text-xs);margin-top:4px;color:${diff > 0 ? 'var(--green)' : 'var(--red)'};">
          ${diff > 0 ? '+' : ''}${pct}%
        </div>
      </div>
    </div>
  </div>`;
}
```

**Result:** Actual price difference calculated from real data.

---

## Part 4: Adding Proximity Data

Create helper data structure:

```javascript
const PROXIMITY_DATA = {
  noida: {
    'Sector 137': { 'Sector 128': 2.5, 'Sector 143': 5.2, 'Sector 150': 8.0, 'Sector 93A': 6.5, 'Greater Noida West': 12.0 },
    'Sector 128': { 'Sector 137': 2.5, 'Sector 143': 3.0, ... },
    // ... all pairs
  },
  gurgaon: {
    // similar structure
  },
  // ... all cities
};

const COMMUTE_PATHS = {
  'Cyber City, Gurgaon': ['Golf Course Rd', 'Dwarka Expressway', 'Sohna Road'],
  'HITEC City, Hyderabad': ['Gachibowli', 'Kondapur', 'Miyapur'],
  // ... major commute hubs
};
```

---

## Part 5: Implementation Roadmap

### Phase 1: Add Helper Functions (index.html, before modules)
- [ ] `scoreLocality()` — composite relevance score
- [ ] `scoreProperty()` — property relevance by stage
- [ ] `scoreProximity()` — geographic distance scoring
- [ ] `scorePriceTier()` — price compatibility
- [ ] `scoreCommute()` — work location matching
- [ ] `parseMetroDistance()` — extract km from "800m" strings
- [ ] `estimateCommuteMinutes()` — travel time estimation
- [ ] `getPropertyTier()` — classify property type

### Phase 2: Add Metadata to MOCK_DATA
- [ ] Add `priceTier`, `cluster`, `proximityData` to localities
- [ ] Add `isNew`, `propertyType`, `viewCount`, `daysListed` to properties
- [ ] Add `infrastructureScore` object to localities

### Phase 3: Add Data Sources
- [ ] Create `PROXIMITY_DATA` object with city-wise distances
- [ ] Create `COMMUTE_PATHS` object with major corridors
- [ ] Create `DEVELOPER_RATINGS` object with reputation scores

### Phase 4: Refactor Modules (1 per day)
- [ ] `modBudgetAnchor` — use price tiers
- [ ] `modLocalitySuggestions` — use scoring
- [ ] `modPropertyCards` — use stage-aware filtering + scoring
- [ ] `modHeadToHead` — use real metrics comparison
- [ ] `modNearbyLocalities` — use proximity data
- [ ] `modFreshListings` — use actual freshness
- [ ] `modPriceComparison` — use real price data
- [ ] `modHomeLoanEMI` — use visited property averages

### Phase 5: Testing & Refinement
- [ ] Test with Priya (S2) — verify locality suggestions are logical
- [ ] Test with Vikram (S1) — verify budget tiers are realistic
- [ ] Test location changes — verify data re-fetching works
- [ ] Test filter changes — verify scoring still applies

---

## Expected Outcomes

### Before
- Sector 150 search → shows random properties from any locality
- Adjacent localities → random selection
- Budget tiers → hardcoded 3 numbers
- EMI calculation → generic ₹30k/month
- Price comparison → missing data

### After
- Sector 150 search → shows properties in Sector 150, Sector 128, Sector 143 (all within 10km)
- Adjacent localities → Sector 128 (2.5km, ₹8L cheaper, 16% YoY), Sector 143 (5.2km, similar price, better metro)
- Budget tiers → ₹72–85L (budget), ₹85–105L (mid), ₹105–130L (premium) — from actual city data
- EMI calculation → ₹41,200/month based on properties user viewed
- Price comparison → Detailed breakdown with % differences, winner highlighted

---

**Created:** 2026-03-18
**Status:** Ready for comprehensive implementation
