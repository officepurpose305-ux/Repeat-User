# Design System Integration Plan — v2/homepage + v2/panel

## Phase Analysis: Current State → Design System Ready

### Current Architecture

**v2/homepage/index.html (1,740 lines)**
- ✅ Already links design-system.css (line 8)
- ✅ Uses some ds-* classes in topnav (ds-btn, ds-search, ds-search-action-btn)
- ❌ 11 module functions have CUSTOM inline styles
- ❌ ~200+ hardcoded color hex values scattered across modules
- ❌ No consistent button/card/chip patterns

**v2/panel/index.html (~600 lines)**
- ❌ No design-system.css link
- ❌ Custom form styling
- ❌ Custom button styling
- ❌ No component reuse

---

## Audit Results: What Needs Changing

### Component Mapping

| Current Pattern | Module/Lines | Should Use | Status |
|---|---|---|---|
| **Custom card HTML** | `propCard()` line ~2238 | `ds-prop-card` | ❌ Not using |
| **Custom button styles** | Various (~20 instances) | `ds-btn` + variants | ⚠️ Partial |
| **Custom chip/filter UI** | `modConsiderationSet` | `ds-chip` / `ds-segment` | ❌ Not using |
| **Custom search box** | `topnav-row2` line ~23 | `ds-search` | ✅ Using |
| **Custom badge UI** | Properties RTM badge | `ds-image-tag` | ❌ Not using |
| **Custom insight boxes** | `modBudgetNudge`, etc | `ds-insight` | ❌ Not using |
| **Custom table layout** | `modHeadToHead` | Need semantic `<table>` | ❌ Not using |
| **Custom shortlist button** | `propCard()` shortlist | `ds-shortlist` | ❌ Not using |
| **Custom segment control** | Property type filter | `ds-segment` | ❌ Not using |
| **Color tokens** | All modules | CSS variables | ⚠️ Some hardcoded |

---

## Files Affected

### `v2/homepage/index.html` — 11 Modules to Refactor

1. **propCard()** (~60 lines)
   - Use `ds-prop-card` + `ds-prop-card-*` components
   - Use `ds-shortlist` component
   - Use `ds-image-tag` for RERA/badges
   - Keep logic, replace HTML only

2. **modPropertiesPrimary()** (~40 lines)
   - Card grid → use `ds-prop-card` in grid
   - Heading structure → keep semantic

3. **modPropertiesInSecondary()** (~35 lines)
   - Same as above

4. **modNearbyLocalities()** (~50 lines)
   - Custom card grid → keep structure, use better spacing tokens
   - Custom button styling → `ds-btn`

5. **modLocalitySuggestions()** (~45 lines)
   - Custom suggestion cards → could use `ds-chip` or simple cards
   - Interactive elements → add proper buttons

6. **modPriceTrend()** (~40 lines)
   - Custom chart row → keep structure
   - Button → `ds-btn`
   - Use `ds-insight` for context

7. **modHeadToHead()** (~35 lines)
   - Custom table → convert to semantic `<table>` with captions
   - Button → `ds-btn`

8. **modLandmarks()** (~40 lines)
   - Custom grid → improve spacing, add `ds-image-tag` for distance badges

9. **modComparisonGrid()** (~40 lines)
   - Custom grid → same pattern as nearby/landmarks

10. **modBudgetNudge()** (~30 lines)
    - Custom warning box → use `ds-insight`
    - Button → `ds-btn`

11. **modConsiderationSet()** (~45 lines)
    - Custom radiogroup → use `ds-segment` or `ds-chip-group`
    - Keep role attributes intact

### `v2/panel/index.html` — Sidebar Form Refactor

1. **Header/Logo** — Can stay as-is
2. **Form fields** (~15 sections)
   - Search box → use `ds-search`
   - Buttons → use `ds-btn` variants
   - Toggles → use `ds-toggle`
   - Checkboxes → use `ds-checkbox`
   - Stage selector → use `ds-segment`

3. **Preview pane** — Keep as-is (iframe)

---

## Design System Components Available

### Buttons
```html
<!-- Primary (blue filled) -->
<button class="ds-btn ds-btn-primary ds-btn-md">Label</button>

<!-- Secondary (gray outline) -->
<button class="ds-btn ds-btn-secondary ds-btn-md">Label</button>

<!-- Tertiary (text only) -->
<button class="ds-btn ds-btn-tertiary ds-btn-md">Label</button>

<!-- Black solid -->
<button class="ds-btn ds-btn-black ds-btn-md">Label</button>

<!-- Sizes: ds-btn-lg, ds-btn-md, ds-btn-sm, ds-btn-xs -->
```

### Property Card
```html
<div class="ds-prop-card">
  <div class="ds-prop-card-img">
    <!-- Image/emoji -->
    <div class="ds-prop-card-badges">
      <div class="ds-image-tag">RERA</div>
    </div>
    <div class="ds-prop-card-shortlist">
      <div class="ds-shortlist"><span class="material-icons">favorite_border</span></div>
    </div>
    <div class="ds-prop-card-possession">Possession text</div>
  </div>
  <div class="ds-prop-card-body">
    <div class="ds-prop-card-name">Property name</div>
    <div class="ds-prop-card-subtitle">Details</div>
    <div class="ds-prop-card-price">₹1.25 Cr</div>
    <div class="ds-prop-card-tags">
      <div class="ds-prop-card-tag">Tag</div>
    </div>
  </div>
  <div class="ds-prop-card-actions">
    <button>Action</button>
  </div>
</div>
```

### Chips & Segments
```html
<!-- Segment control (mutually exclusive) -->
<div class="ds-segment">
  <button class="ds-segment-btn active">Option 1</button>
  <button class="ds-segment-btn">Option 2</button>
</div>

<!-- Chip group (multi-select) -->
<div class="ds-chip-group">
  <button class="ds-chip ds-chip-md">Filter 1</button>
  <button class="ds-chip ds-chip-md active">Filter 2</button>
</div>
```

### Insight Box
```html
<div class="ds-insight">
  <div class="ds-insight-head">
    <div class="ds-insight-title-row">
      <span class="ds-insight-icon material-icons">auto_awesome</span>
      <span class="ds-insight-title">Title</span>
    </div>
  </div>
  <div class="ds-insight-sub">Subtext</div>
</div>
```

### Search Box
```html
<div class="ds-search">
  <span class="ds-search-icon"><span class="material-icons">search</span></span>
  <input type="text" placeholder="...">
  <div class="ds-search-actions">
    <button class="ds-search-action-btn"><span class="material-icons">mic</span></button>
  </div>
</div>
```

### Selection Controls
```html
<!-- Checkbox -->
<div class="ds-checkbox checked"></div>

<!-- Radio -->
<div class="ds-radio checked"></div>

<!-- Toggle -->
<div class="ds-toggle on"></div>
```

### Image Tag (for badges)
```html
<div class="ds-image-tag">
  <span class="material-icons" style="font-size:13px;">verified</span> RERA
</div>
```

---

## Refactoring Strategy (By Scope)

### Phase 1: Prep (1–2 hours)
- [ ] Link design-system.css in v2/panel/index.html
- [ ] Document all color token mappings (current hex → CSS variable)
- [ ] Create refactoring checklist per module

### Phase 2: Critical Components (3–4 hours)
- [ ] Refactor `propCard()` → use `ds-prop-card` (affects all modules)
- [ ] Refactor buttons → use `ds-btn` variants
- [ ] Refactor badges/tags → use `ds-image-tag`
- [ ] Test property display across all modules

### Phase 3: Module UI Updates (4–6 hours)
- [ ] modPropertiesPrimary()
- [ ] modPropertiesInSecondary()
- [ ] modNearbyLocalities()
- [ ] modLocalitySuggestions()
- [ ] modPriceTrend()
- [ ] modHeadToHead()
- [ ] modLandmarks()
- [ ] modComparisonGrid()
- [ ] modBudgetNudge()
- [ ] modConsiderationSet()

### Phase 4: Panel Refactoring (2–3 hours)
- [ ] Link design-system.css
- [ ] Replace form inputs with ds-* components
- [ ] Replace buttons with ds-btn
- [ ] Test form interactions

### Phase 5: Testing & Validation (2–3 hours)
- [ ] Verify all interactions work (filtering, stage change, persona load)
- [ ] Check responsive design
- [ ] Validate keyboard navigation
- [ ] Test with screen readers

---

## Benefits After Refactoring

| Metric | Before | After |
|--------|--------|-------|
| **Lines of CSS** | 400+ (custom styles) | ~50 (overrides only) |
| **Color references** | 200+ scattered hex | Centralized tokens |
| **Button variants** | 20+ custom | 4 classes (`ds-btn-primary`, etc) |
| **Property cards** | Custom HTML per use | 1 reusable `ds-prop-card` |
| **Maintenance** | Update in 15 places | Update once |
| **Accessibility** | Manual (partial) | Built-in patterns |
| **Consistency** | Manual | Automatic |

---

## Example: Before & After

### Before: propCard()
```javascript
function propCard(p) {
  return `<div style="background:white;border:1px solid #eee;border-radius:12px;padding:16px;margin-bottom:12px;">
    <div style="display:flex;gap:8px;margin-bottom:12px;">
      <div style="font-size:32px;">🏠</div>
      <div style="flex:1;">
        <div style="font-weight:700;font-size:14px;color:#111;">${esc(p.name)}</div>
        <div style="font-size:12px;color:#666;margin-top:4px;">${esc(p.location)}</div>
        <div style="font-weight:700;font-size:16px;margin-top:8px;color:#2563eb;">${p.price}</div>
      </div>
      <button style="background:transparent;border:none;cursor:pointer;opacity:0.6;">
        <span class="material-icons">favorite_border</span>
      </button>
    </div>
  </div>`;
}
```

### After: propCard()
```javascript
function propCard(p) {
  return `<div class="ds-prop-card">
    <div class="ds-prop-card-img">
      <span style="font-size:48px;">🏠</span>
      <div class="ds-prop-card-shortlist">
        <div class="ds-shortlist">
          <span class="material-icons" aria-hidden="true">favorite_border</span>
        </div>
      </div>
    </div>
    <div class="ds-prop-card-body">
      <div class="ds-prop-card-name">${esc(p.name)}</div>
      <div class="ds-prop-card-subtitle">${esc(p.location)}</div>
      <div class="ds-prop-card-price">${p.price}</div>
    </div>
  </div>`;
}
```

**Result:**
- 50% fewer lines
- Consistent with design system
- All styling in one place (design-system.css)
- Automatic spacing, colors, responsive behavior

---

## Execution Order

1. **Design-system.css links** (both files) — takes 1 minute
2. **propCard() refactor** — core pattern, affects all modules
3. **Button refactors** — quick wins across modules
4. **Module-by-module UI updates** — largest effort
5. **Panel refactoring** — isolated from homepage
6. **Testing & validation** — cross-browser, accessibility

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Breaking module logic | High | Keep logic untouched, only replace HTML/CSS |
| Responsive layout change | Medium | Use same CSS classes → should inherit breakpoints |
| Color mismatches | Low | Use existing design-system tokens |
| Lost accessibility | Low | Design system already has a11y patterns |

---

## Success Criteria

✅ All 11 modules render identically (UI-only change)
✅ All interactions work (filtering, stage change, etc.)
✅ All accessibility features present (aria-labels, keyboard nav, focus rings)
✅ Responsive design maintained across breakpoints
✅ Zero breaking changes to logic or state management
✅ Code review: simpler, more maintainable, less custom CSS

---

## Estimated Timeline

- **Phase 1 (Prep):** 1–2 hours
- **Phase 2 (Critical):** 3–4 hours
- **Phase 3 (Modules):** 4–6 hours
- **Phase 4 (Panel):** 2–3 hours
- **Phase 5 (Testing):** 2–3 hours

**Total: 12–18 hours (can be parallelized)**

Or in sessions:
- **Session 1:** Phase 1 + Phase 2 (critical components)
- **Session 2:** Phase 3 (modules 1–6)
- **Session 3:** Phase 3 (modules 7–11) + Phase 4 (panel)
- **Session 4:** Phase 5 (testing + validation)

