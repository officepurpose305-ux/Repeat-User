# Design PAT Dashboard — Interactive UI Mockup

When you run `npm run dashboard`, here's what you'll see:

---

## 🎨 Full Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🎯 Design PAT Dashboard                    Pixel Accuracy Test Report Viewer │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  Total Screens: 1  │  Passed: 0  │  Failed: 1  │  Overall Accuracy: 94.5%  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐ ┌──────────────────────────────────────────────┐
│                          │ │                                              │
│      SCREENS             │ │        HOMEPAGE DEMO                        │
│      (Left Sidebar)      │ │   Status: ❌ FAIL (94.5% < 95%)             │
│                          │ │                                              │
├──────────────────────────┤ ├──────────────────────────────────────────────┤
│                          │ │ Accuracy: 94.5%                             │
│ ► Homepage Demo          │ │ Mismatch: 18,500 / 329,160 pixels           │
│   🔴 FAIL                │ │                                              │
│   94.5%                  │ │ ┌──── IMAGE VIEWER ────────────────────────┐│
│   6 issues               │ │ │ [Figma] [Screenshot] [Annotated] [Diff] ││
│                          │ │ │                                          ││
│  (Screen list is        │ │ │  ╔════════════════════════════════════╗ ││
│   clickable - shows     │ │ │  ║  ANNOTATED SCREENSHOT              ║ ││
│   all screens with      │ │ │  ║                                    ║ ││
│   pass/fail badges)     │ │ │  ║  T font-size mismatch    (#1)    ║ ││
│                          │ │ │  ║  ┌──────────────────────────────┐ ║ ││
│                          │ │ │  ║  │ Luxury 3 BHK in Sector 75 │ ║ ││
│                          │ │ │  ║  │ (16px, should be 18px)   │ ║ ││
│                          │ │ │  ║  └──────────────────────────────┘ ║ ││
│                          │ │ │  ║                                    ║ ││
│                          │ │ │  ║  ◉ color mismatch       (#2)    ║ ││
│                          │ │ │  ║  ┌──────────────────────────────┐ ║ ││
│                          │ │ │  ║  │ Noida • 45 Lac         (#2) │ ║ ││
│                          │ │ │  ║  │ (#999999, should #6B7280)   │ ║ ││
│                          │ │ │  ║  └──────────────────────────────┘ ║ ││
│                          │ │ │  ║                                    ║ ││
│                          │ │ │  ║  ▣ padding wrong                   ║ ││
│                          │ │ │  ║  ┌──────────────────────────────┐ ║ ││
│                          │ │ │  ║  │ View Details      (#3)     │ ║ ││
│                          │ │ │  ║  │ (14px, should 16px)        │ ║ ││
│                          │ │ │  ║  └──────────────────────────────┘ ║ ││
│                          │ │ │  ║                                    ║ ││
│                          │ │ │  ╚════════════════════════════════════╝ ││
│                          │ │ │  (Click region → highlights issue below) ││
│                          │ │ └─────────────────────────────────────────┘│
│                          │ │                                              │
│                          │ │ ISSUES (6 total)                            │
│                          │ │ Severity: [All] [High] [Medium] [Low]       │
│                          │ │                                              │
│                          │ │ ┌────────────────────────────────────────┐ │
│                          │ │ │ 🔴 HIGH  │  font-size                 │ │
│                          │ │ │ h2.property-title                      │ │
│                          │ │ │                                        │ │
│                          │ │ │ Font size is 16px but Figma shows 18px │ │
│                          │ │ │                                        │ │
│                          │ │ │ h2.property-title { font-size: 18px; } │ │
│                          │ │ │                            [Copy] ✓ Copied! │ │
│                          │ │ └────────────────────────────────────────┘ │
│                          │ │                                              │
│                          │ │ ┌────────────────────────────────────────┐ │
│                          │ │ │ 🔴 HIGH  │  color                     │ │
│                          │ │ │ p.property-location                    │ │
│                          │ │ │                                        │ │
│                          │ │ │ Color is #999999 but Figma #6B7280    │ │
│                          │ │ │                                        │ │
│                          │ │ │ p.property-location { color: #6B7280; }│ │
│                          │ │ │                            [Copy]     │ │
│                          │ │ └────────────────────────────────────────┘ │
│                          │ │                                              │
│                          │ │ ┌────────────────────────────────────────┐ │
│                          │ │ │ 🟠 MEDIUM │  font-size               │ │
│                          │ │ │ button.primary                         │ │
│                          │ │ │                                        │ │
│                          │ │ │ Font size is 14px but Figma shows 16px │ │
│                          │ │ │                                        │ │
│                          │ │ │ button.primary { font-size: 16px; }    │ │
│                          │ │ │                            [Copy]     │ │
│                          │ │ └────────────────────────────────────────┘ │
│                          │ │                                              │
│                          │ │ ┌────────────────────────────────────────┐ │
│                          │ │ │ 🔵 LOW   │  padding-top               │ │
│                          │ │ │ button.primary                         │ │
│                          │ │ │                                        │ │
│                          │ │ │ Padding-top is 12px but Figma 16px    │ │
│                          │ │ │                                        │ │
│                          │ │ │ button.primary { padding-top: 16px; }  │ │
│                          │ │ │                            [Copy]     │ │
│                          │ │ └────────────────────────────────────────┘ │
│                          │ │                                              │
│                          │ │ ┌────────────────────────────────────────┐ │
│                          │ │ │ 🔵 LOW   │  padding-bottom            │ │
│                          │ │ │ button.primary                         │ │
│                          │ │ │                                        │ │
│                          │ │ │ Padding-bottom is 12px but Figma 16px │ │
│                          │ │ │                                        │ │
│                          │ │ │ button.primary { padding-bottom: 16px; }│ │
│                          │ │ │                            [Copy]     │ │
│                          │ │ └────────────────────────────────────────┘ │
│                          │ │                                              │
│                          │ │ ┌────────────────────────────────────────┐ │
│                          │ │ │ 🔵 LOW   │  gap                       │ │
│                          │ │ │ .gap-indicator                         │ │
│                          │ │ │                                        │ │
│                          │ │ │ Gap is 8px but Figma shows 12px        │ │
│                          │ │ │                                        │ │
│                          │ │ │ .gap-indicator { gap: 12px; }          │ │
│                          │ │ │                            [Copy]     │ │
│                          │ │ └────────────────────────────────────────┘ │
│                          │ │                                              │
└──────────────────────────┴──────────────────────────────────────────────┘
```

---

## 🎯 Interactive Features

### 1. **Severity Filtering**
```
Current view: [All Issues] [High] [Medium] [Low]
             ↓
Click "High" → Shows only 2 issues (🔴 color, 🔴 font-size)
Click "Low"  → Shows only 3 issues (🔵 gap, padding-top, padding-bottom)
Click "All"  → Shows all 6 issues (default)
```

### 2. **Image Tab Switching**
```
[Figma] [Screenshot] [Annotated] [Diff]
  ↓       (click)
Shows the clean Figma design frame

[Figma] [Screenshot] [Annotated] [Diff]
          ↓ (click)
Shows the app screenshot with issues

[Figma] [Screenshot] [Annotated] [Diff]
                       ↓ (click) — CURRENT
Shows annotated screenshot with colored boxes & arrows

[Figma] [Screenshot] [Annotated] [Diff]
                                    ↓ (click)
Shows diff image with red highlighted mismatches
```

### 3. **Click Image to Highlight Issue**
```
User clicks on the red #1 region in "Annotated" tab
  ↓
JavaScript captures click coordinates
  ↓
Calculates which bounding box was hit
  ↓
Scrolls issues list to that issue
  ↓
Highlights the matching issue in blue border
  ↓
Shows: "#1 font-size | h2.property-title | Font size is 16px..."
```

### 4. **Copy CSS Fix**
```
User sees: h2.property-title { font-size: 18px; }  [Copy]
                                                       ↓ (click)
                                    [Copy] → [✓ Copied!] (2 second timeout)
                                                       ↓ (wait 2s)
                                              [Copy] (reverts)

Developer can now paste into their CSS file:
h2.property-title { font-size: 18px; }
```

---

## 📱 Responsive Design

### Desktop (1200px+)
```
┌────────────────────────────────────────────────────┐
│ [Screens 320px] │ [Images 600px] [Issues 400px]    │
└────────────────────────────────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌──────────────────────────┐
│ [Screens 320px]          │
├──────────────────────────┤
│ [Images 700px]           │
├──────────────────────────┤
│ [Issues 700px]           │
└──────────────────────────┘
```

### Mobile (< 768px)
```
Sidebar collapses, stacks vertically
```

---

## 🎨 Color Scheme

```
Header:      #2563eb (Blue gradient)
Severity:    🔴 #ef4444 (Red = HIGH)
             🟠 #f59e0b (Amber = MEDIUM)
             🔵 #3b82f6 (Blue = LOW)
Passed:      🟢 #16a34a (Green)
Failed:      🔴 #ef4444 (Red)
Background:  #f0f0f0 (Light gray)
Cards:       #ffffff (White)
Text:        #111827 (Dark gray)
Secondary:   #6B7280 (Medium gray)
```

---

## ⚙️ How Data Flows

```
1. Browser loads: http://localhost:5173
   ↓
2. Vite serves index.html
   ↓
3. React App loads, imports useReports hook
   ↓
4. Fetches /reports/summary.json (from output/ folder)
   ↓
5. Displays summary bar (1 screen, 0 passed, 94.5% accuracy)
   ↓
6. Displays screen list (Homepage Demo, 🔴 FAIL, 94.5%)
   ↓
7. Auto-select first screen
   ↓
8. Fetch /reports/homepage.json (lazy load)
   ↓
9. Populate ScreenDetail with:
   - Image tabs (Figma/Screenshot/Annotated/Diff)
   - Issues list (6 issues, sortable by severity)
   - Click handlers (image click → scroll issues)
   ↓
10. User interaction:
    - Click image region
    - Filter by severity
    - Copy CSS fixes
    - View different image tabs
```

---

## 📊 Data Example in Dashboard

```javascript
// When dashboard loads, it displays:

summary = {
  timestamp: "2026-03-19T11:51:15.908Z",
  totalScreens: 1,
  passed: 0,
  failed: 1,
  overallAccuracy: 94.5,
  screens: [
    { id: "homepage", name: "Homepage Demo", accuracy: 94.5, passed: false, issueCount: 6 }
  ]
}

report = {
  screenId: "homepage",
  screenName: "Homepage Demo",
  accuracy: 94.5,
  mismatchPixels: 18500,
  totalPixels: 329160,
  passed: false,
  files: {
    figma: "figma/homepage.png",
    screenshot: "screenshots/homepage.png",
    diff: "diffs/homepage-diff.png",
    annotated: "annotated/homepage-annotated.png"
  },
  allIssues: [ 6 issue objects with type, severity, cssFix ]
}
```

---

## 🖱️ User Journey

```
START: Visit http://localhost:5173
  ↓
[See Summary] Total: 1 | Passed: 0 | Failed: 1 | Accuracy: 94.5%
  ↓
[See Screens List] "Homepage Demo" 🔴 FAIL 94.5% 6 issues
  ↓
[Click Screen] Homepage Demo details load
  ↓
[See Image Tabs] Figma | Screenshot | Annotated (selected) | Diff
  ↓
[View Annotated] See colored boxes with #1, #2, #3 badges and arrows
  ↓
[Click Region #1] → Issue list scrolls to "font-size" issue, highlights in blue
  ↓
[Read Issue] "Font size is 16px but Figma shows 18px"
  ↓
[Copy CSS] Click [Copy] → shows "✓ Copied!" → paste in your CSS file
  ↓
[Filter by Severity] Click "High" → shows only 2 red issues
  ↓
[View Diff Tab] Click [Diff] tab → shows red mismatch visualization
  ↓
[Done!] User has all info needed to fix the design
```

---

**Everything is fully styled, responsive, and interactive!**
No backend needed — all data loaded from static JSON files.
