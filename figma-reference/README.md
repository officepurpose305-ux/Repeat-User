# Figma Reference System — 99acres Homepage

Complete Figma design package covering all 5 buyer stages (S1–S5) and 25+ modules.

---

## 📦 What's Included

### 1. **tokens.json** — Design Tokens
- Tokens Studio compatible format
- All colors, spacing, typography, radii, shadows
- Import into Figma via [Tokens Studio plugin](https://www.figmatokens.com/)

### 2. **reference.html** — Interactive Visual Reference
- All 5 stages rendered side-by-side
- 5 phone-width columns (360px each) showing every module
- Uses real CSS from design-system.css + homepage.css
- Zero dependencies — open in any browser

### 3. **components.json** — Component Specification
- Detailed spec for all 25+ modules
- Properties: name, stages, data structure, layout, variants, interactive elements, tokens
- Use as reference when building components manually in Figma

### 4. **Figma Plugin** (manifest.json + ui.html + code.js)
- Auto-generates all 5 stage pages with all modules
- Each page: 360×760px phone frame with vertical stack of modules
- All hardcoded mock data — no API keys needed
- Figma API auto-layout with design tokens

---

## 🚀 Quick Start

### Option A: Visual Reference (Easiest)

1. Open [`reference.html`](reference.html) in your browser
2. See all 5 stages side-by-side with every module
3. Use as a visual design guide while building in Figma manually

**Time**: 30 seconds

---

### Option B: Design Tokens in Figma

1. In Figma, install [Tokens Studio plugin](https://www.figmatokens.com/)
2. Open plugin → Settings → Sync → Load from JSON
3. Copy-paste contents of [`tokens.json`](tokens.json)
4. Apply tokens → All colors, spacing, radii will sync to Figma variables

**Time**: 2 minutes

---

### Option C: Auto-Generate All Frames (Plugin)

1. **Load the plugin in Figma:**
   - Figma Desktop → Plugins → Development → New Plugin
   - Manifest file: Point to [`manifest.json`](manifest.json)

2. **Run the plugin:**
   - Open a new Figma file
   - Plugins → Development → 99acres Homepage Generator
   - Select which stages to generate (default: all 5)
   - Click **Generate Frames**

3. **Result:** 5 new pages (one per stage), each with a 360×760px phone frame containing all modules for that stage

**Time**: 5 minutes

**Note:** Figma plugins run locally in your Figma app — no server, no authentication needed.

---

## 📋 Module Reference

### All 25+ Modules

See [`components.json`](components.json) for detailed specs on:

| Module | Stages | Purpose |
|--------|--------|---------|
| modContextChips | 2–5 | Location selector chips |
| modHero | 1 | Blue gradient hero banner |
| modBudgetAnchor | 1 | Entry/Mid/Premium price tiers |
| modLocalitiesRadar | 1–2 | Top 5 localities cards |
| modNewLaunches | 1 | Featured new launch spotlight |
| modPriceTrend | 1–5 | YoY price growth row |
| modBudgetFit | 1–3 | Insight card on budget positioning |
| modConsiderationSet | 2 | Property type radio selection |
| modLocalitySuggestions | 2–3 | Nearby locality filters + cards |
| modNearbyLocalities | 2 | Small property grid |
| modContinue | 2–3 | Continue where you left off |
| modHeadToHead | 3 | Comparison table (6 rows) |
| modNearestLandmarks | 3 | Landmark distance table |
| modNearbyComparison | 2–3 | Alternative locality cards |
| modExpertAgents | 3 | Agent cards with rating |
| modTradeoff | 3 | Insight: price vs metro |
| modDecisionSpotlight | 4 | Top property with orange border |
| modVisitPlanner | 4 | Schedule site visit cards |
| modStillConsidering | 4–5 | Shortlist with Yes/No/Details |
| modPostVisitTools | 5 | EMI, Loan, Stamp Duty, Checklist |
| modTools | 2–4 | Grid of quick tools |
| modArticles | 2–5 | Article/guide rows |
| modQuickLinks | 1–5 | 8 quick action chips |
| modDecisionVelocity | 2–3 | Weeks counter + open questions |
| modStaleLocationNudge | 2–3 | Amber nudge for stale locations |
| modPropertiesPrimary | 1–3 | Main property grid (horizontal scroll) |
| modNewInSectors | 2–3 | Fresh listings grid |

---

## 🎨 Design System Tokens Used

All modules use tokens from the design system:

### Colors
- `--blue: #2563eb` (primary)
- `--green: #16a34a` (success)
- `--purple: #6c30d4` (insight)
- `--text-primary: #111111`
- `--text-secondary: #555555`
- `--surface: #ffffff`

### Spacing
- `--space-1: 4px` → `--space-8: 32px`

### Typography
- Font sizes: 11px → 28px
- Weights: 400 → 800

See `tokens.json` for complete reference.

---

## 🔧 How to Use Each File

### For Designers Building in Figma Manually

1. **Open `reference.html` in browser**
   - Pin it on second monitor alongside Figma
   - Copy layout and spacing from reference
   - Use components.json for interactive states

2. **Use `tokens.json` as color guide**
   - Install Tokens Studio plugin
   - Apply colors to your components
   - Ensures consistency with design system

### For Developers Implementing Components

1. **Read `components.json`**
   - Find the module you need to code
   - Check: stages, data structure, interactive elements, tokens
   - Look for existing component class if available (e.g. `ds-prop-card`)

2. **Check `reference.html` for rendered output**
   - Inspect element in browser
   - See exact CSS classes being used
   - Copy-paste class names into your code

### For Design System Alignment

1. **Cross-reference `tokens.json` with design-system.css**
   - Ensure all color names are consistent
   - Validate spacing values
   - Confirm typography scales

---

## 📸 Visual Preview

All 5 stages in reference.html:

```
┌─────────────────────────────────────────────────────────────┐
│ S1: Discovery     │ S2: Locality   │ S3: Comparison │ ... │
├─────────────────────────────────────────────────────────────┤
│ Hero banner       │ Context chips  │ Context chips  │ ... │
│ Budget tiers      │ Locality cards │ Head-to-head   │ ... │
│ Localities radar  │ Consideration  │ Landmarks      │ ... │
│ New launches      │ Continue       │ Nearby comp.   │ ... │
│ Price trend       │ Price trend    │ Price trend    │ ... │
│ Budget fit        │ Tools          │ Tools          │ ... │
│ Tools             │ Articles       │ Articles       │ ... │
│ Articles          │ Quick links    │ Quick links    │ ... │
│ Quick links       │                │                │ ... │
└─────────────────────────────────────────────────────────────┘
```

Each stage shows ALL modules that appear at that stage.

---

## ⚙️ Technical Details

### Mock Data

All modules render with hardcoded mock data:

```
Primary locality: Sector 150, Noida
Secondary locality: Sector 128, Noida
Properties: 3 samples (ATS Tourmaline, Godrej Woods, Mahagun Moderne)
Budget: ₹85L
City: Noida
```

No API calls, no config.js, no external dependencies.

### Phone Frame Spec

- Width: 360px
- Height: 760px
- Safe area: 12–14px left/right padding
- Scroll within frame (overflow: auto)

### Component Classes

Modules use:
- **Design system classes**: `ds-btn`, `ds-chip`, `ds-prop-card`, `ds-insight`, etc.
- **Semantic HTML**: `<table>`, `<label>`, `<button>`
- **Inline styles**: For responsive spacing and colors
- **Material Icons**: Via Google Fonts CDN

---

## 🔄 How Files Relate

```
tokens.json
  ↓ (imported via Tokens Studio plugin)
  ↓
Figma Variables Panel
  ↓ (used in plugin code.js)
  ↓
code.js (Figma plugin)
  ↓ (generates frames using)
  ↓
design-system.css tokens
  ↓ (also used in)
  ↓
reference.html (visual reference)
  ↓ (matches specs in)
  ↓
components.json
```

---

## 🐛 Troubleshooting

### reference.html shows no styles

- Check that design-system.css and homepage.css are in correct relative paths
- Paths should be: `../apps/design-system/design-system.css`
- Open browser console (F12) and check for 404 errors

### Figma plugin won't load

- Ensure manifest.json is in same directory as code.js and ui.html
- Check Figma Console (Shift+Cmd+J) for errors
- Reload plugin (Plugins → Development → Reload)

### Colors don't match design system

- Verify tokens.json uses exact hex values from design-system.css
- Check that Tokens Studio plugin synced correctly
- Manually apply `--blue: #2563eb` if sync fails

---

## 📞 Support

For issues:

1. Check this README first
2. Inspect reference.html in browser (F12) to see actual rendered HTML
3. Review components.json for module spec
4. Cross-reference tokens.json with design-system.css

---

## ✨ Next Steps

1. **Use reference.html immediately** — best starting point
2. **Import tokens.json** — get consistent colors in Figma
3. **Build components manually** — use components.json as spec
4. **Or run plugin** — auto-generate all frames

All three approaches result in the same visual design, aligned with the 99acres design system.

---

**Created for 99acres Homepage** — All Buyer Stages (S1–S5), 25+ Modules, Design System Integration
