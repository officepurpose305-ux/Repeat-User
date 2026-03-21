# Design PAT — Pixel Accuracy Test Tool

A Node.js CLI tool that compares Figma design frames against live web page screenshots, detects pixel-level differences, maps them to DOM elements, compares CSS styles, and generates annotated reports.

## Features

- 🎨 **Figma Integration** — Auto-fetch design frames via Figma API
- 📱 **Playwright Screenshots** — Capture live page screenshots with viewport config
- 🔍 **Pixel Comparison** — pixelmatch-based diff detection + accuracy %
- 🎯 **Region Clustering** — Group diff pixels into meaningful regions (Union-Find)
- 🏗️ **DOM Mapping** — Identify elements in diff regions via `elementFromPoint`
- 🎨 **Style Comparison** — Compare DOM styles vs Figma design specs
- 📝 **Annotated Reports** — Screenshots with bounding boxes + fix suggestions
- 🚀 **CI Integration** — Exit with error if accuracy below threshold
- ⚙️ **Config-Driven** — Per-screen thresholds, ignore regions, post-message payloads

## Installation

```bash
cd apps/design-pat

# Install dependencies
npm install

# Install Playwright Chromium browser
npx playwright install chromium

# Copy and configure
cp pat.config.example.json pat.config.json
```

Then edit `pat.config.json` with:
- `figma.token` — Personal access token from Figma account settings
- `figma.fileId` — Alphanumeric ID from your Figma file URL
- Screen URLs and Figma node IDs

## Configuration

### Global Settings

```json
{
  "figma": {
    "token": "figd_YOUR_TOKEN",
    "fileId": "YOUR_FILE_ID"
  },
  "outputDir": "./output",
  "threshold": 0.1,
  "ciThreshold": 95,
  "viewport": { "width": 390, "height": 844 },
  "ignoreRegions": []
}
```

### Per-Screen Settings

```json
{
  "screens": [
    {
      "id": "homepage-s2",
      "name": "Homepage — Stage 2",
      "url": "http://localhost:3000/v2/homepage/index.html",
      "figmaNodeId": "1234:5678",
      "threshold": 0.08,
      "ciThreshold": 97,
      "ignoreRegions": [
        { "x": 0, "y": 0, "width": 390, "height": 60 }
      ],
      "waitForSelector": "#content",
      "waitMs": 800,
      "postMessagePayload": {
        "type": "CONFIG_UPDATE",
        "config": { "stage": 2 }
      }
    }
  ]
}
```

**Field Descriptions:**

| Field | Purpose |
|-------|---------|
| `id` | Unique screen identifier |
| `url` | Web page URL to screenshot |
| `figmaNodeId` | Figma frame node ID (visible in URL as `node-id=`) |
| `threshold` | pixelmatch pixel-distance threshold (0–1, lower = stricter) |
| `ciThreshold` | Minimum accuracy % for CI to pass |
| `ignoreRegions` | Regions excluded from pixel comparison (dynamic content) |
| `waitForSelector` | CSS selector to wait for before screenshotting |
| `waitMs` | Extra delay after selector resolves |
| `postMessagePayload` | Window.postMessage injection (e.g., persona config) |

## Usage

### Run All Screens

```bash
npm run pat
```

### Run Single Screen

```bash
node bin/pat.js --screen homepage-s2
```

### CI Mode

Exit with code 1 if any screen below threshold:

```bash
npm run pat:ci
# or
node bin/pat.js --ci
```

### Additional Options

```bash
node bin/pat.js --help

Options:
  -c, --config <path>  Config file path (default: pat.config.json)
  -s, --screen <id>    Run only this screen ID
  --ci                 Exit 1 if any screen below ciThreshold
  --no-styles          Skip style extraction (pixel diff only, faster)
  -v, --verbose        Verbose logging
  -h, --help           Display help
```

## Output

After a run, find generated files in `output/`:

```
output/
├── figma/                 ← Figma frames (resized to viewport)
├── screenshots/           ← Playwright screenshots
├── diffs/                 ← pixelmatch diff PNGs (red = mismatches)
├── annotated/             ← screenshots with bounding boxes + labels
└── reports/
    ├── {screen-id}.json   ← per-screen details
    └── summary.json       ← overall summary
```

### Report Schema

**Per-Screen Report** (`reports/{screen-id}.json`):

```json
{
  "screenId": "homepage-s2",
  "screenName": "Homepage — Stage 2",
  "timestamp": "2026-03-19T10:30:00.000Z",
  "accuracy": 97.34,
  "mismatchPixels": 2204,
  "totalPixels": 329160,
  "passed": true,
  "ciThreshold": 97,
  "files": {
    "figma": "output/figma/homepage-s2.png",
    "screenshot": "output/screenshots/homepage-s2.png",
    "diff": "output/diffs/homepage-s2-diff.png",
    "annotated": "output/annotated/homepage-s2-annotated.png"
  },
  "regions": [
    {
      "id": 0,
      "bounds": { "x": 16, "y": 120, "width": 120, "height": 28 },
      "pixelCount": 412,
      "elements": [
        {
          "selector": "h2.mod-title",
          "tagName": "h2",
          "textContent": "Properties in Sector 75",
          "computedStyles": { ... }
        }
      ],
      "issues": [
        {
          "type": "font-size",
          "severity": "high",
          "element": "h2.mod-title",
          "description": "Font size is 16px but Figma shows 18px",
          "cssFix": "h2.mod-title { font-size: 18px; }"
        }
      ]
    }
  ],
  "allIssues": [...]
}
```

**Summary Report** (`reports/summary.json`):

```json
{
  "timestamp": "2026-03-19T10:30:00.000Z",
  "totalScreens": 3,
  "passed": 2,
  "failed": 1,
  "overallAccuracy": 96.8,
  "screens": [
    { "id": "homepage-s2", "accuracy": 97.34, "passed": true, "issueCount": 1 },
    { "id": "homepage-s3", "accuracy": 93.1, "passed": false, "issueCount": 4 }
  ]
}
```

## CI Integration

### GitHub Actions Example

```yaml
# .github/workflows/design-pat.yml
name: Design PAT
on: [push, pull_request]

jobs:
  pat:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: cd apps/design-pat && npm ci

      - name: Install Playwright
        run: cd apps/design-pat && npx playwright install chromium --with-deps

      - name: Run Design PAT
        run: cd apps/design-pat && node bin/pat.js --ci
        env:
          PAT_FIGMA_TOKEN: ${{ secrets.FIGMA_TOKEN }}

      - name: Upload PAT artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: design-pat-report
          path: apps/design-pat/output/
```

### Environment Variables

- `PAT_FIGMA_TOKEN` — Overrides `config.figma.token` (for CI secrets)

## Architecture

### Pipeline Flow

For each screen:

1. **Fetch Figma Frame** — Download from Figma API, resize to viewport
2. **Capture Screenshot** — Playwright browser automation
3. **Pixel Comparison** — pixelmatch diff + ignore regions
4. **Region Clustering** — Union-Find on 16×16 cell grid → bounding boxes
5. **DOM Mapping** — `elementFromPoint` at 5 sample points per region
6. **Style Extraction** — Figma API `/nodes` endpoint + getComputedStyle
7. **Style Comparison** — Font, color, spacing mismatches → fix suggestions
8. **Screenshot Annotation** — SVG compositing with sharp
9. **Report Generation** — Per-screen JSON + summary

### Key Design Decisions

- **ESM-only** — All files use `import/export`; no CommonJS compatibility
- **Union-Find clustering** — O(n) on cells (not pixels); runs <5ms per screen
- **5-sample-point DOM mapping** — Single `page.evaluate` for efficiency
- **SVG annotation** — No Canvas or font metrics library needed
- **Per-screen overrides** — `threshold`, `ciThreshold`, `ignoreRegions` can be customized per screen
- **postMessage support** — Compatible with 99acres homepage config system

## Troubleshooting

### "No image URL returned for node"

Check the Figma node ID. Should be from the `node-id=` URL parameter, formatted as `1234:5678`.

### "Unauthorized" on Figma API

Verify `figma.token` is a personal access token (not your API token). Generate at https://www.figma.com/developers/api#access-tokens

### CORS errors on real API

The real 99acres API at `10.10.17.143:5003` doesn't have CORS headers. Use the local mock server instead:
```bash
node api/99acres-mock-server.js
```

### Screenshots are blank

Check `waitForSelector` and `waitMs`. Some pages need extra time to render. Try increasing `waitMs` or providing a more specific selector.

### Style comparison issues not showing

Only extracted if Figma API has style data for the node. Try `--no-styles` flag to debug pixel-diff only.

## Development

### Code Structure

```
src/
├── figma/          ← Figma API integration
├── capture/        ← Playwright screenshots
├── compare/        ← Pixel diff + region clustering
├── dom/            ← elementFromPoint mapping
├── styles/         ← Style comparison
├── annotate/       ← Screenshot annotation
├── report/         ← JSON report generation
└── utils/          ← Color conversion, logging
```

### Adding New Features

- **New comparison metric?** → `src/styles/styleCompare.js`
- **Different annotation style?** → `src/annotate/annotate.js`
- **Ignore logic changes?** → `src/compare/pixelCompare.js` (applyIgnoreRegions)
- **New Figma data?** → `src/figma/extractStyles.js`

## License

MIT
