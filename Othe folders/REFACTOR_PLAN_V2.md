# Refactor Plan V2: Design-System-Only Implementation

## Backup Location
- `DRAFT_HOMEPAGE_CSS_FULL_V1.css` — original homepage.css with custom classes
- `DRAFT_HOMEPAGE_HTML_V1.html` — original homepage/index.html with custom modules

## Goal
Rebuild the UI using ONLY classes from `apps/design-system/design-system.css`. No custom classes.

## Available Design System Components

### Buttons
- `ds-btn` + `ds-btn-primary | secondary | tertiary | quaternary | black | black-outline | black-ghost`
- Sizes: `ds-btn-lg | md | sm | xs`
- States: `disabled`, `ds-btn-loading`

### Chips
- `ds-chip` + `ds-chip-md | sm | xs`
- `.ds-chip.active` for selected state
- `ds-chip-group` container
- `ds-chip-tabs` for navigation tabs

### Cards
- `ds-prop-card` — full property card
- `.ds-prop-card.horizontal` — carousel variant
- Sub-elements: `ds-prop-card-img`, `ds-prop-card-body`, `ds-prop-card-price`, etc.

### Tags & Badges
- `ds-image-tag` — overlay badges on images
- `ds-prop-card-tag` — text tags in card body
- `ds-image-tags` container

### Headings
- `ds-page-heading`
- `ds-section-heading`
- `ds-subsection-heading`
- `ds-heading-sub` for subtitles

### Other Components
- `ds-segment` + `ds-segment-btn` — segmented control
- `ds-insight` (with `.sm`, `.xs` modifiers) — purple AI card
- `ds-shortlist` — heart icon button
- `ds-bottom-nav` — footer navigation

## Sections to Rebuild

### 1. Top Nav
**Current draft approach:** Custom 2-row layout with `.nav-post-btn`, `.nav-bell`, etc.

**New approach:** Use `ds-btn` for Post Property button, Material Icons for bell

**Question:** Should nav be 1 row or 2 rows? Check design-system.html for navbar examples.

### 2. Location Jump Cards ("Buy in X")
**Current draft approach:** Custom `.loc-jump-card` + `.loc-jump-row`

**New approach:** Use `ds-chip` or simple styled divs with only design-system tokens

**Question:** Use `ds-chip-tabs` pattern or custom layout?

### 3. "Continue Where You Left Off"
**Current draft approach:** Uses `ds-prop-card.horizontal` (✓ correct) + custom badges

**Status:** Already uses design-system! May only need minor tweaks.

### 4. "Fresh Listings" Grid
**Current draft approach:** Custom `.fresh-grid` + `.fresh-card` + `.fresh-feature-tag`

**New approach:** Use `ds-prop-card` (no custom horizontal modifier) in a grid

**Question:** For feature tags at bottom of card, use `ds-prop-card-tag` or inline styled div?

## Execution Steps

1. **Review design-system.css** — Understand exact class names and what's available
2. **Plan each section** — Decide which design-system component fits each UI section
3. **Rewrite homepage.css** — Remove all custom classes, keep only token overrides
4. **Rewrite modules in index.html** — Use only design-system class combinations
5. **Test in panel** — Load Priya (S2) persona and verify UI

## Notes
- CSS file should be minimal — mostly just `.sec`, `.hscroll` overrides and old patterns that predate design-system
- HTML modules should build strings using only `ds-*` class names
- No new custom classes allowed
- Token values (--blue, --text, etc.) can be used from design-system

---

**Created:** 2026-03-18
**Status:** Ready for planning phase
