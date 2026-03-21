# Design PAT — Quick Start Guide

## 🚀 30 Seconds Setup

```bash
cd apps/design-pat

# 1. Install & setup
npm install
npx playwright install chromium

# 2. Configure
cp pat.config.example.json pat.config.json

# Edit pat.config.json:
# - Add your Figma token (from https://www.figma.com/developers/api#access-tokens)
# - Add your Figma file ID (from the file URL)
# - Add your screen URLs and Figma node IDs
```

## ▶️ Run It

```bash
npm run pat                    # Run all screens
node bin/pat.js --screen s2   # Run single screen
node bin/pat.js --ci          # CI mode (exit 1 on failure)
```

## 📊 View Results

Open generated files in `output/`:

- **`annotated/`** — Screenshots with diff regions highlighted + labels
- **`reports/summary.json`** — Overall pass/fail, accuracy % per screen
- **`reports/{id}.json`** — Detailed issues, suggested CSS fixes per region

## 🔧 Common Config Patterns

### Basic Single Screen

```json
{
  "figma": {
    "token": "figd_YOUR_TOKEN",
    "fileId": "ABC123XYZ"
  },
  "outputDir": "./output",
  "ciThreshold": 95,
  "viewport": { "width": 390, "height": 844 },
  "screens": [
    {
      "id": "homepage",
      "name": "Homepage",
      "url": "http://localhost:3000/",
      "figmaNodeId": "1234:5678"
    }
  ]
}
```

### Multiple Screens with Overrides

```json
{
  "figma": { ... },
  "ciThreshold": 95,
  "screens": [
    {
      "id": "s1",
      "url": "...",
      "figmaNodeId": "...",
      "ciThreshold": 97  // Override: stricter
    },
    {
      "id": "s2",
      "url": "...",
      "figmaNodeId": "...",
      "ignoreRegions": [   // Ignore animated header
        { "x": 0, "y": 0, "width": 390, "height": 60 }
      ]
    }
  ]
}
```

### With Dynamic Config (99acres pattern)

```json
{
  "screens": [
    {
      "id": "homepage-s2",
      "url": "http://localhost:3000/v2/homepage/index.html",
      "figmaNodeId": "...",
      "waitForSelector": "#content",
      "waitMs": 800,
      "postMessagePayload": {
        "type": "CONFIG_UPDATE",
        "config": {
          "stage": 2,
          "primaryLocality": "Sector 75, Noida",
          "budget": 7500000
        }
      }
    }
  ]
}
```

## 🎯 Workflow

1. **Baseline** — Run PAT for the first time to establish baseline accuracy
2. **Design Changes** — Update Figma design
3. **Update Code** — Implement CSS changes
4. **Verify** — Run `npm run pat` → check annotated screenshots + reports
5. **Fix** — Follow CSS fix suggestions in JSON report
6. **Repeat** — Run again until accuracy threshold met
7. **CI** — Use `npm run pat:ci` in GitHub Actions to gate PRs

## 📋 Report Files

After running, you'll have:

```
output/
├── figma/
│   └── {screen-id}.png              ← Design frame from Figma
├── screenshots/
│   └── {screen-id}.png              ← Live app screenshot
├── diffs/
│   └── {screen-id}-diff.png          ← Red areas show mismatches
├── annotated/
│   └── {screen-id}-annotated.png     ← Screenshot + colored boxes + labels
└── reports/
    ├── {screen-id}.json              ← Issues, CSS fixes, element selectors
    └── summary.json                  ← Pass/fail, accuracy per screen
```

**Open `output/annotated/{screen-id}-annotated.png` in any image viewer** to see visually where differences are.

**Read `output/reports/{screen-id}.json`** to see:
- Element selectors (`h2.title`, `button.primary`, etc.)
- Computed DOM styles
- Figma design specs
- Exact CSS fix suggestions

## ⚙️ Debugging

### See what's happening

```bash
node bin/pat.js --verbose
```

### Skip Figma style extraction (faster)

```bash
node bin/pat.js --no-styles
```

### Test specific screen

```bash
node bin/pat.js --screen homepage-s2
```

### Check output at each step

- `output/figma/{id}.png` — Did Figma fetch work?
- `output/screenshots/{id}.png` — Is page rendering correctly?
- `output/diffs/{id}-diff.png` — Where are the pixel differences?
- `output/annotated/{id}-annotated.png` — Are regions detected correctly?
- `output/reports/{id}.json` — What elements and issues were found?

## 🔑 Getting Your Figma Token

1. Go to https://www.figma.com/developers/api#access-tokens
2. Click "Create a new personal access token"
3. Copy the token (starts with `figd_`)
4. Paste into `pat.config.json` under `figma.token`

## 🔍 Finding Figma Node IDs

1. Open your Figma file
2. Select the frame/component you want to test
3. Look at the URL — you'll see `node-id=1234-5678`
4. Copy the node ID (use `:` instead of `-` in config: `1234:5678`)

Or right-click → Copy link → paste and extract the node-id parameter.

## 🤝 Integrating with 99acres Homepage

The tool natively supports the 99acres panel's `postMessage` architecture:

```json
{
  "postMessagePayload": {
    "type": "CONFIG_UPDATE",
    "config": {
      "stage": 2,
      "primaryLocality": "Sector 75, Noida",
      "budget": 7500000
    }
  }
}
```

This lets you test different persona states directly without the panel UI.

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| "No image URL returned" | Check Figma node ID format (should be `1234:5678`) |
| "Unauthorized" | Verify token is a **personal access token**, not API token |
| Blank screenshots | Increase `waitMs` or provide specific `waitForSelector` |
| CORS errors on real API | Use local mock server instead (`node api/99acres-mock-server.js`) |
| Diff regions look wrong | Check `threshold` (lower = stricter), tweak `cellSize` in code |

## 📚 Next Steps

- Read [README.md](README.md) for complete documentation
- Check [/plan](../../.claude/plans/) for architecture details
- Look at `src/` directory structure for where to add features
