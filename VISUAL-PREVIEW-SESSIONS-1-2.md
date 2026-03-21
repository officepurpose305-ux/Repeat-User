# Visual Preview: Sessions 1 & 2 Refactored Modules

## How to View the Live Homepage

**Option 1: Open in Browser (Recommended)**
```bash
# Open the v2/panel/index.html file in your browser
# URL: file:///Users/fa061462/Documents/Cursor/v2/panel/index.html

# Or directly open the homepage:
# URL: file:///Users/fa061462/Documents/Cursor/v2/homepage/index.html
```

**Option 2: Use VS Code Live Server**
- Right-click `v2/panel/index.html` → "Open with Live Server"

---

## Module 1: modPostVisitTools (Stage 5)

**Context:** Shows after buyer completes site visit. Tools for next step (EMI, loan guide, stamp duty, possession checklist).

### Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Tools for your next step                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [📊]  EMI Calculator                    →                     │
│         Estimate monthly outflow based on your budget & tenure  │
│                                                                 │
│  [💰]  Home Loan Guide                   →                     │
│         Compare SBI, HDFC, ICICI rates & processing fees       │
│                                                                 │
│  [⚖️]  Stamp Duty Estimator              →                     │
│         Registration + legal fees for your city                │
│                                                                 │
│  [🏠]  Possession Checklist              →                     │
│         What to verify at handover                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Design Details

- **Icons:** Colored background circles (blue, green, amber, purple)
- **Text:** Tool name (bold) + description (smaller, secondary color)
- **Spacing:** Grid layout (40px icon | flex content | 20px chevron)
- **Interaction:** Click or keyboard (Enter/Space) to open tool
- **Hover:** Box shadow appears
- **Keyboard Focus:** Blue outline (`:focus-visible`)

### Color Scheme

```
Tool Name:        var(--text-primary) - Black
Description:      var(--text-secondary) - Gray
Icon Background:
  - Calculate:    var(--blue-light) → Blue icon
  - Loan:         var(--green-light) → Green icon
  - Stamp Duty:   #fef3c7 → Orange icon
  - Possession:   #ede9fe → Purple icon
Border:           var(--border) - Light gray
```

---

## Module 2: modPriceTrend (All Stages)

**Context:** Shown at every stage. Displays YoY price appreciation for the selected locality.

### Visual Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Price Trends                                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [📈]  +18% price growth             Sector 150 · YoY       →
│         appreciation                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Design Details

- **Icon Circle:** 40px diameter, green background (`var(--green-light)`)
- **Trending Icon:** Green color (`var(--green)`)
- **Text Layout:** Flex row with icon on left, text in center
- **Growth Rate:** Bold, large text (18px)
- **Locality Info:** Smaller, secondary color
- **Chevron:** Right-aligned, tertiary color
- **Spacing:** 12px padding, 10px gap between elements
- **Interaction:** Click or keyboard to view trends
- **Hover:** Box shadow

### Color Scheme

```
Growth Rate:      var(--text-primary) - Bold black
Locality Info:    var(--text-secondary) - Gray
Icon Background:  var(--green-light) - Light green
Icon Color:       var(--green) - Dark green
Arrow:            var(--text-tertiary) - Light gray
Border:           var(--border) - Light gray
```

---

## Module 3: modConsiderationSet (Stage 2)

**Context:** Stage 2 (locality aware). Asks buyer about property type preference. Appears as interactive cards.

### Visual Layout

```
┌────────────────────────────────────────────────────────────────┐
│  What type of property are you open to?                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [✓]  Ready to Move                           [✓ CHECK]  │ │  ← Selected (blue)
│  │       Move in immediately · No waiting period            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [🔨]  Under Construction                               │ │  ← Not selected (white)
│  │       10–15% lower entry price · Longer wait           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [⭐]  New Launch                                         │ │  ← Not selected (white)
│  │       Best prices · Full unit selection                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Design Details

**Selected Card:**
- Background: `var(--blue-light)` - Light blue
- Border: `var(--blue)` - Blue
- Icon Background: `var(--blue)` - Blue, white icon
- Icon: Shows `check_circle` (filled)

**Unselected Card:**
- Background: `var(--surface)` - White
- Border: `var(--border)` - Light gray
- Icon Background: `rgba(37,99,235,0.1)` - Very light blue
- Icon: Semi-transparent blue

**Layout:**
- Grid: 40px icon | flexible text content | 20px check icon
- 12px padding, 8px margin between cards
- Radio group semantics (proper ARIA)

### Color Scheme

```
Selected:
  Background:     var(--blue-light) - Light blue (#dbeafe)
  Border:         var(--blue) - Blue (#2563eb)
  Icon Bg:        var(--blue) - Blue (#2563eb)
  Icon Color:     White
  Check Icon:     var(--blue) - Blue

Unselected:
  Background:     var(--surface) - White
  Border:         var(--border) - Light gray
  Icon Bg:        rgba(37,99,235,0.1) - Very light blue
  Icon Color:     var(--blue) - Blue
```

---

## Module 4: modHeadToHead (Stage 3)

**Context:** Stage 3 (comparison). Displays side-by-side comparison table between primary and secondary localities.

### Visual Layout

```
┌───────────────────────────────────────────────────────────────┐
│  Head to Head                                                 │
│  Sector 150 vs Sector 128                                     │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┬──────────────┬──────────────┐       │
│  │ Feature             │ Sector 150   │ Sector 128   │       │
│  ├─────────────────────┼──────────────┼──────────────┤       │
│  │ Drive to office     │ 5 mins    ✓  │ 20–25 mins   │  ← ✓ Winner
│  ├─────────────────────┼──────────────┼──────────────┤       │
│  │ Entry price/sqft    │ ₹8,100    ✓  │ ₹7,800       │  ← ✓ Winner
│  ├─────────────────────┼──────────────┼──────────────┤       │
│  │ Space for ₹85L      │ ~1,050 sf ✓  │ ~1,087 sf    │  ← ✓ Winner
│  ├─────────────────────┼──────────────┼──────────────┤       │
│  │ YoY appreciation    │ +15%          │ +16%      ✓  │  ← ✓ Winner
│  ├─────────────────────┼──────────────┼──────────────┤       │
│  │ Who buys here       │ Owner-occup   │ Investors    │       │
│  ├─────────────────────┼──────────────┼──────────────┤       │
│  │ Development stage   │ Established   │ Mixed        │       │
│  └─────────────────────┴──────────────┴──────────────┘       │
│                                                               │
│  Based on your filters: Sector 150 has more ready-to-move    │
│  options within budget. Sector 128 offers ₹15–20L savings... │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Design Details

**Table Header:**
- Background: `var(--text-primary)` - Dark gray/black
- Text: White
- Font Weight: 800 (bold)
- Text Align: "Feature" left, others center

**Table Body:**
- Padding: 9px 12px
- Border Bottom: `var(--border)` light gray
- Feature column: 30% width, secondary text color, smaller font
- Value columns: Bold, black text, center aligned

**Winner Cells:**
- Value text color: `var(--green)` - Green checkmark style

**Semantic HTML:**
- `<table>` with `border-collapse:collapse`
- `<caption class="sr-only">` for screen readers
- `<th scope="col">` on headers
- `<td scope="row">` on feature names
- Proper alignment and spacing

### Color Scheme

```
Header:
  Background:     var(--text-primary) - Dark (#111827)
  Text:           White
  Font Weight:    800

Body Rows:
  Feature Name:   var(--text-tertiary) - Light gray
  Values:         var(--text-primary) - Dark
  Winner:         var(--green) - Green (#16a34a)
  Border:         var(--border) - Light gray
```

---

## Summary: Design System Integration

### Tokens Used Consistently

✅ **Colors:**
- Primary: `var(--blue)` #2563eb
- Secondary: `var(--text-secondary)` #6B7280
- Tertiary: `var(--text-tertiary)` #9CA3AF
- Success: `var(--green)` #16a34a
- Light backgrounds: `var(--blue-light)`, `var(--green-light)`

✅ **Spacing:**
- Grid gaps: 8px, 10px, 12px
- Padding: 12px (standard)
- Border radius: `var(--r-sm)` 8px

✅ **Typography:**
- Font weights: 600, 700, 800
- Font sizes: `var(--text-sm)`, `var(--text-base)`, etc.

✅ **Accessibility:**
- All interactive elements have `aria-label`
- Keyboard support (Enter/Space)
- Proper semantic HTML (`<table>`, `role="radio"`)
- Focus visible rings (from homepage.css `:focus-visible`)
- Screen reader text (`.sr-only`)

---

## How to Test the Updated Design

### In Your Browser

1. **Open the panel:**
   ```
   file:///Users/fa061462/Documents/Cursor/v2/panel/index.html
   ```

2. **Set up a test persona:**
   - Select "Priya" preset (S2 stage)
   - Or create custom profile

3. **Test each module:**
   - **Stage 2:** Look for modConsiderationSet (property type cards)
   - **All stages:** Look for modPriceTrend (green trending box)
   - **Stage 3:** Look for modHeadToHead (comparison table)
   - **Stage 5:** Look for modPostVisitTools (4 tool cards)

4. **Verify visuals:**
   - ✅ Colors match design system (blue, green, gray)
   - ✅ Spacing is consistent (12px padding, 8px gaps)
   - ✅ Text hierarchy is clear
   - ✅ Icons display correctly
   - ✅ Hover effects work
   - ✅ Keyboard navigation works (Tab, Enter, Space)

### Expected Improvements vs. Old Design

| Aspect | Before | After |
|--------|--------|-------|
| **Custom CSS Classes** | 19 per module | 0 (inline styles) |
| **Design Tokens** | Partial use | Consistent use |
| **Semantic HTML** | Div-based | Table, roles, aria |
| **Accessibility** | Basic | Enhanced |
| **Code Maintainability** | Scattered CSS | Self-contained styles |
| **Visual Consistency** | Mixed | Unified design system |

---

## Ready for Session 3?

After viewing the updated design and confirming it looks good:

**Next Session 3 Modules:**
1. **modStillConsidering** (Stage 4, shortlist cards)
2. **modNearbyComparison** (Locality comparison grid)
3. **modLocalitiesRadar** (Locality radar cards)

Then cleanup and done! ✨

