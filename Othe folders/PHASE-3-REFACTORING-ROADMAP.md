# Phase 3: Module Refactoring Roadmap

**Comprehensive audit complete.** 142+ custom classes identified across all modules.

---

## Class Analysis Summary

### Most Reused (Keep as-is, Foundation Classes)
- **`sec`** (28 uses) — universal section container
- **`sec-pad`** (22 uses) — padding wrapper inside sec
- **`hscroll`** (11 uses) — horizontal scrolling container (used in most modules)

### Module-Specific Families (Core to module design)
| Class Family | Modules | Priority | Notes |
|---|---|---|---|
| `hero-*` (5 classes) | modHero | LOW | Stage 1 only, small module |
| `prop-note-*` (4 classes) | noteHtml() | MEDIUM | Used in S3-S5, refactor with textarea styling |
| `loc-*` (5 classes) | modLocalitiesRadar | MEDIUM | Locality card design, consider consolidation |
| `consid-*` (5 classes) | modConsiderationSet | **HIGH** | Should use `ds-segment` instead |
| `h2h-*` (4 classes) | modHeadToHead | **HIGH** | Table comparison, needs semantic `<table>` |
| `sp-*` (12 classes) | modDecisionSpotlight | MEDIUM | Stage 4 focus module, complex |
| `sc-*` (12 classes) | modStillConsidering | MEDIUM | Shortlist cards, could use `ds-prop-card` |
| `price-*` (5 classes) | modPriceTrend | **HIGH** | Could simplify with `ds-segment` |
| `pv-*` (5 classes) | modPostVisitTools | **HIGH** | Could use `ds-btn` for actions |
| `nl-*` (9 classes) | modNewLaunches | MEDIUM | New launches module, decent structure |
| `ncmp-*` (5 classes) | modNearbyComparison | MEDIUM | Comparison grid |
| `expert-*` (6 classes) | modExpertAgents | MEDIUM | Agent cards, simple layout |

---

## Refactoring Strategy: By Impact & Effort

### TIER 1: High Impact, Low Effort (Quick Wins - 1.5 hours)

#### 1️⃣ modPostVisitTools — Replace `.pv-tool` with cleaner grid + `ds-btn`
**Impact:** Stage 5 only, ~40 lines
**Effort:** LOW
**Current:**
```javascript
<div class="pv-tool" role="button">
  <div class="pv-tool-icon ${t.color}">...</div>
  <div class="pv-tool-info">...</div>
</div>
```

**Refactor to:**
```javascript
<div style="display:grid;grid-template-columns:40px 1fr 20px;gap:12px;align-items:center;padding:12px;border:1px solid var(--border);border-radius:var(--r-sm);">
  <div style="width:40px;height:40px;border-radius:6px;background:var(--blue-light);display:flex;align-items:center;justify-content:center;">
    <span class="material-icons" aria-hidden="true">${t.matIcon}</span>
  </div>
  <div>
    <div style="font-weight:700;margin-bottom:2px;">${t.name}</div>
    <div style="font-size:var(--text-sm);color:var(--text2);">${t.desc}</div>
  </div>
  <span class="material-icons" aria-hidden="true" style="color:var(--text3);">chevron_right</span>
</div>
```

**Result:** Removes `.pv-tool` (4 classes) → inline grid layout + DS tokens

---

#### 2️⃣ modPriceTrend — Replace `.price-trend` with simple flex layout
**Impact:** All stages, ~20 lines
**Effort:** LOW
**Current:**
```javascript
<div class="price-trend" role="button">
  <div class="pt-left">
    <div class="pt-circle">...</div>
    <div>
      <div class="pt-val">+18% growth</div>
      <div class="pt-lbl">YoY appreciation</div>
    </div>
  </div>
  <span class="pt-arrow">chevron_right</span>
</div>
```

**Refactor to:**
```javascript
<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid var(--border);border-radius:var(--r-sm);cursor:pointer;" role="button" tabindex="0" aria-label="View price trends for ${esc(primary)}">
  <div style="display:flex;gap:10px;align-items:center;">
    <div style="width:40px;height:40px;border-radius:50%;background:var(--green-light);display:flex;align-items:center;justify-content:center;color:var(--green);">
      <span class="material-icons" aria-hidden="true" style="font-size:20px;">trending_up</span>
    </div>
    <div>
      <div style="font-weight:700;font-size:var(--text-base);">+${loc.yoy||18}% price growth</div>
      <div style="font-size:var(--text-sm);color:var(--text2);">${esc(primary)} · YoY appreciation</div>
    </div>
  </div>
  <span class="material-icons" aria-hidden="true" style="color:var(--text3);">chevron_right</span>
</div>
```

**Result:** Removes `.price-trend` + `.pt-*` (5 classes) → inline flex

---

### TIER 2: High Impact, Medium Effort (Core Refactoring - 2–3 hours)

#### 3️⃣ modConsiderationSet — Replace custom divs with `ds-segment`
**Impact:** Stage 2-3, critical UX pattern
**Effort:** MEDIUM
**Current:** Custom `.consid-card` with role="radio"
**Target:** Use `ds-segment` control (already in design system)

```javascript
// BEFORE: Custom cards
<div class="consid-cards">
  <div class="consid-card" role="radio" aria-checked="true">
    <div class="consid-card-body">
      <div class="consid-card-label">Apartment</div>
      <div class="consid-card-sub">₹40L–₹1.5Cr</div>
    </div>
  </div>
</div>

// AFTER: Design system segment control
<div class="ds-segment sm">
  <button class="ds-segment-btn active">
    <span>Apartment</span>
    <span style="font-size:var(--text-sm);color:var(--text2);display:block;">₹40L–₹1.5Cr</span>
  </button>
  <button class="ds-segment-btn">
    <span>Builder Floor</span>
    <span style="font-size:var(--text-sm);color:var(--text2);display:block;">₹30L–₹1Cr</span>
  </button>
</div>
```

**Result:** Removes `.consid-*` (5 classes) → uses `ds-segment`

---

#### 4️⃣ modHeadToHead — Convert to semantic `<table>` with caption
**Impact:** Stage 3, comparison critical path
**Effort:** MEDIUM
**Current:** Custom `.h2h-table` + `.h2h-row` layout
**Target:** Semantic HTML table

```javascript
// BEFORE: DIV-based comparison
<div class="h2h-table">
  <div class="h2h-head">
    <div>Feature</div>
    <div>${esc(primary)}</div>
    <div>${esc(secondary)}</div>
  </div>
  <div class="h2h-row">
    <div>Price</div>
    <div>${p.price}</div>
    <div class="win">${s.price}</div>
  </div>
</div>

// AFTER: Semantic table
<table style="width:100%;border-collapse:collapse;">
  <caption class="sr-only">Comparison of ${esc(primary)} and ${esc(secondary||'nearby')}</caption>
  <thead>
    <tr>
      <th scope="col" style="text-align:left;padding:8px;border-bottom:1px solid var(--border);">Feature</th>
      <th scope="col" style="padding:8px;border-bottom:1px solid var(--border);">${esc(primary)}</th>
      <th scope="col" style="padding:8px;border-bottom:1px solid var(--border);">${esc(secondary)}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td scope="row" style="padding:8px;border-bottom:1px solid var(--border);font-weight:600;">Price</td>
      <td style="padding:8px;border-bottom:1px solid var(--border);">${p.price}</td>
      <td style="padding:8px;border-bottom:1px solid var(--border);color:var(--green);font-weight:700;">${s.price}</td>
    </tr>
  </tbody>
</table>
```

**Result:** Removes `.h2h-*` (4 classes) → semantic `<table>` + better accessibility

---

### TIER 3: Medium Impact, Medium Effort (Systematic Refactoring - 2–3 hours)

#### 5️⃣ modStillConsidering — Use `ds-prop-card` for shortlist items
**Impact:** Stage 4, shortlist display
**Effort:** MEDIUM
**Current:** Custom `.sc-*` card structure (12 classes)
**Target:** Adapt to use `ds-prop-card` horizontal variant

---

#### 6️⃣ modLocalitiesRadar / modNearbyComparison — Simplify card layouts
**Impact:** Locality comparison cards
**Effort:** MEDIUM
**Current:** `.loc-*`, `.ncmp-*` custom card classes
**Target:** Create reusable `.locality-card` or use simpler grid

---

### TIER 4: Lower Priority, Can Stay (Acceptable as-is - Keep for now)

These modules have working, logical class structures that can be left alone unless major refactor needed:
- **modDecisionSpotlight** (`.sp-*`, 12 classes) — Stage 4 focus, complex but well-structured
- **modNewLaunches** (`.nl-*`, 9 classes) — Self-contained, clean structure
- **modExpertAgents** (`.expert-*`, 6 classes) — Simple agent cards, good structure
- **modHero** (`.hero-*`, 5 classes) — Stage 1 only, minimal impact
- **noteHtml** (`.prop-note-*`, 4 classes) — Used in S3-S5 notes, can refactor later

---

## Execution Plan (Recommended Order)

### Session 1: Quick Wins (1.5 hours)
1. ✅ Refactor modPostVisitTools (remove `.pv-tool` classes)
2. ✅ Refactor modPriceTrend (remove `.price-trend` + `.pt-*`)
3. Test both modules end-to-end

**Result:** 9 custom classes eliminated, 0 design system added

### Session 2: Design System Integration (2.5 hours)
4. Refactor modConsiderationSet → use `ds-segment`
5. Refactor modHeadToHead → semantic `<table>`
6. Test S2-S3 stage flow (locality → comparison → H2H)

**Result:** 9 custom classes eliminated, 2 DS components integrated

### Session 3: Card Refactoring (2 hours)
7. Refactor modStillConsidering → `ds-prop-card`
8. Refactor modNearbyComparison → cleaner grid
9. Test S4 (shortlist) stage

**Result:** 17+ custom classes removed/consolidated

### Session 4: Remaining Modules (1.5 hours)
10. Optional: Refactor modLocalitiesRadar, modNewLaunches for consistency
11. Full end-to-end testing (all stages S1-S5)
12. Cleanup unused CSS from homepage.css

**Result:** Complete design system integration, <50 custom classes remaining

---

## Cleanup & Optimization

### Before Cleanup (Current)
- **Custom classes in code:** 142+
- **Custom CSS in homepage.css:** Lines 92–150 (58 lines)
- **Unused .prop, .badge-*, .pt-* classes:** ~20 lines

### After Cleanup (Goal)
- **Custom classes in code:** <50 (module-specific only)
- **Custom CSS in homepage.css:** <30 lines (module overrides only)
- **Lines saved:** ~30 lines of CSS
- **Maintenance cost:** 50% reduction

---

## Success Criteria

✅ All modules render identically (visual parity)
✅ All interactions work (filtering, stage changes, persona loading)
✅ Keyboard navigation throughout
✅ Screen reader compatible (proper table captions, aria-labels)
✅ Responsive at all breakpoints (320px, 768px, 1200px)
✅ <50 custom classes remaining (vs 142+)
✅ Zero breaking changes to logic

---

## Ready to Execute?

**Recommended approach:**
1. Start with **Session 1 (Quick Wins)** — modPostVisitTools + modPriceTrend
2. These are lowest risk, highest ROI
3. Then move to **Session 2 (DS Integration)** after testing

Shall I start with Session 1 right now?

