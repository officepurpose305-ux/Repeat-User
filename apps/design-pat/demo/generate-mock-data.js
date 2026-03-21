#!/usr/bin/env node

/**
 * Generate mock test data for Design PAT demo
 * Creates dummy Figma frames, screenshots, diffs, and reports
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, 'output');

async function createFigmaDesign() {
  console.log('📐 Creating Figma design frame...');

  // Create a clean design: button with correct specs
  const svg = `
    <svg width="390" height="844" xmlns="http://www.w3.org/2000/svg">
      <rect width="390" height="844" fill="#F0F0F0"/>

      <!-- Header -->
      <rect x="0" y="0" width="390" height="80" fill="#2563eb"/>
      <text x="20" y="45" font-family="Arial" font-size="28" font-weight="bold" fill="white">
        99acres
      </text>

      <!-- Card 1: Property Listing -->
      <rect x="16" y="100" width="358" height="200" fill="white" rx="8" stroke="#E5E7EB" stroke-width="1"/>
      <rect x="26" y="110" width="338" height="80" fill="#DBEAFE" rx="4"/>

      <!-- Property Title (correct: 18px, bold, left-aligned) -->
      <text x="26" y="210" font-family="Arial" font-size="18" font-weight="700" fill="#111827">
        Luxury 3 BHK in Sector 75
      </text>

      <!-- Property Location (correct: 14px, gray, with gap) -->
      <text x="26" y="235" font-family="Arial" font-size="14" font-weight="400" fill="#6B7280">
        Noida • 45 Lac
      </text>

      <!-- Button (correct: 16px font, 16px padding) -->
      <rect x="26" y="250" width="338" height="48" fill="#2563eb" rx="8"/>
      <text x="195" y="280" font-family="Arial" font-size="16" font-weight="600" fill="white" text-anchor="middle">
        View Details
      </text>

      <!-- Spacing indicator -->
      <line x1="16" y1="320" x2="374" y2="320" stroke="#999" stroke-width="0.5" stroke-dasharray="2,2"/>
      <text x="16" y="340" font-family="Arial" font-size="10" fill="#999">
        Gap: 12px between cards
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(outputDir, 'figma', 'homepage.png'));

  console.log('✓ Figma design created');
}

async function createScreenshot() {
  console.log('📸 Creating app screenshot (with issues)...');

  // Create a screenshot with INTENTIONAL MISMATCHES
  const svg = `
    <svg width="390" height="844" xmlns="http://www.w3.org/2000/svg">
      <rect width="390" height="844" fill="#F0F0F0"/>

      <!-- Header (same as design) -->
      <rect x="0" y="0" width="390" height="80" fill="#2563eb"/>
      <text x="20" y="45" font-family="Arial" font-size="28" font-weight="bold" fill="white">
        99acres
      </text>

      <!-- Card 1: Property Listing (with issues) -->
      <rect x="16" y="100" width="358" height="200" fill="white" rx="8" stroke="#E5E7EB" stroke-width="1"/>
      <rect x="26" y="110" width="338" height="80" fill="#DBEAFE" rx="4"/>

      <!-- ISSUE 1: Font size wrong (16px instead of 18px) -->
      <text x="26" y="208" font-family="Arial" font-size="16" font-weight="700" fill="#111827">
        Luxury 3 BHK in Sector 75
      </text>

      <!-- ISSUE 2: Color wrong (using different gray instead of design gray) -->
      <text x="26" y="233" font-family="Arial" font-size="14" font-weight="400" fill="#999999">
        Noida • 45 Lac
      </text>

      <!-- ISSUE 3: Button font size and padding wrong (14px font, 12px padding) -->
      <rect x="30" y="252" width="330" height="44" fill="#2563eb" rx="8"/>
      <text x="195" y="279" font-family="Arial" font-size="14" font-weight="600" fill="white" text-anchor="middle">
        View Details
      </text>

      <!-- ISSUE 4: Spacing wrong (8px gap instead of 12px) -->
      <line x1="16" y1="316" x2="374" y2="316" stroke="#999" stroke-width="0.5" stroke-dasharray="2,2"/>
      <text x="16" y="336" font-family="Arial" font-size="10" fill="#999">
        Gap: 8px (WRONG!)
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(outputDir, 'screenshots', 'homepage.png'));

  console.log('✓ Screenshot created with intentional mismatches');
}

async function createDiffImage() {
  console.log('🔴 Creating diff visualization...');

  // Create a visual diff showing where the mismatches are
  const svg = `
    <svg width="390" height="844" xmlns="http://www.w3.org/2000/svg">
      <rect width="390" height="844" fill="white"/>

      <!-- Mismatch regions highlighted in red -->

      <!-- Mismatch 1: Font size -->
      <rect x="26" y="205" width="280" height="20" fill="#FF0000" opacity="0.6"/>
      <text x="16" y="235" font-family="Arial" font-size="12" fill="#333">
        Font size mismatch (18px vs 16px)
      </text>

      <!-- Mismatch 2: Color -->
      <rect x="26" y="225" width="120" height="15" fill="#FF0000" opacity="0.6"/>
      <text x="16" y="265" font-family="Arial" font-size="12" fill="#333">
        Color mismatch (#6B7280 vs #999999)
      </text>

      <!-- Mismatch 3: Button padding -->
      <rect x="26" y="248" width="338" height="52" fill="#FF0000" opacity="0.5"/>
      <text x="16" y="315" font-family="Arial" font-size="12" fill="#333">
        Button: font (16px vs 14px) + padding (16px vs 12px)
      </text>

      <!-- Mismatch 4: Gap spacing -->
      <line x1="16" y1="316" x2="374" y2="316" stroke="#FF0000" stroke-width="3"/>
      <text x="16" y="345" font-family="Arial" font-size="12" fill="#333">
        Spacing: 12px gap (design) vs 8px gap (app)
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(outputDir, 'diffs', 'homepage-diff.png'));

  console.log('✓ Diff image created');
}

async function createAnnotatedImage() {
  console.log('🎨 Creating annotated screenshot...');

  // Show the screenshot with annotations overlaid
  const svg = `
    <svg width="390" height="844" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#ef4444"/>
        </marker>
      </defs>

      <rect width="390" height="844" fill="#F0F0F0"/>

      <!-- Header -->
      <rect x="0" y="0" width="390" height="80" fill="#2563eb"/>
      <text x="20" y="45" font-family="Arial" font-size="28" font-weight="bold" fill="white">
        99acres
      </text>

      <!-- Card with issues -->
      <rect x="16" y="100" width="358" height="200" fill="white" rx="8" stroke="#E5E7EB" stroke-width="1"/>

      <!-- ANNOTATION 1: Font size issue -->
      <rect x="26" y="200" width="280" height="25" fill="#ef4444" fill-opacity="0.15" rx="2"/>
      <rect x="26" y="200" width="280" height="25" fill="none" stroke="#ef4444" stroke-width="2.5" rx="2"/>
      <circle cx="36" cy="210" r="9" fill="#ef4444"/>
      <text x="36" y="215" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="white">#1</text>

      <!-- Label 1 -->
      <rect x="80" y="175" width="140" height="22" fill="#ef4444" rx="11"/>
      <text x="92" y="189" font-family="Arial" font-size="12" font-weight="600" fill="white">T font-size mismatch</text>

      <!-- Arrow 1 -->
      <line x1="150" y1="197" x2="150" y2="200" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#arrow-red)"/>

      <!-- ANNOTATION 2: Color issue -->
      <rect x="26" y="224" width="120" height="14" fill="#ef4444" fill-opacity="0.15" rx="2"/>
      <rect x="26" y="224" width="120" height="14" fill="none" stroke="#ef4444" stroke-width="2.5" rx="2"/>
      <circle cx="36" cy="231" r="9" fill="#ef4444"/>
      <text x="36" y="236" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="white">#2</text>

      <!-- Label 2 -->
      <rect x="80" y="215" width="140" height="22" fill="#ef4444" rx="11"/>
      <text x="92" y="229" font-family="Arial" font-size="12" font-weight="600" fill="white">◉ color mismatch</text>

      <!-- ANNOTATION 3: Button padding/font -->
      <rect x="26" y="248" width="338" height="52" fill="#f59e0b" fill-opacity="0.15" rx="2"/>
      <rect x="26" y="248" width="338" height="52" fill="none" stroke="#f59e0b" stroke-width="2.5" rx="2"/>
      <circle cx="36" cy="274" r="9" fill="#f59e0b"/>
      <text x="36" y="279" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="white">#3</text>

      <!-- Label 3 -->
      <rect x="250" y="310" width="130" height="22" fill="#f59e0b" rx="11"/>
      <text x="262" y="324" font-family="Arial" font-size="12" font-weight="600" fill="white">▣ padding wrong</text>

      <!-- Arrow 3 -->
      <line x1="315" y1="332" x2="315" y2="300" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#arrow-red)"/>

      <text x="16" y="820" font-family="Arial" font-size="11" fill="#999">
        3 issues detected • Click on dashboard to see details
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(outputDir, 'annotated', 'homepage-annotated.png'));

  console.log('✓ Annotated image created');
}

async function createReports() {
  console.log('📋 Creating JSON reports...');

  // Per-screen report
  const screenReport = {
    screenId: 'homepage',
    screenName: 'Homepage Demo',
    timestamp: new Date().toISOString(),
    accuracy: 94.5,
    mismatchPixels: 18500,
    totalPixels: 329160,
    passed: false,
    ciThreshold: 95,
    files: {
      figma: 'figma/homepage.png',
      screenshot: 'screenshots/homepage.png',
      diff: 'diffs/homepage-diff.png',
      annotated: 'annotated/homepage-annotated.png',
    },
    regions: [
      {
        id: 0,
        bounds: { x: 26, y: 205, width: 280, height: 20 },
        pixelCount: 5600,
        elements: [
          {
            selector: 'h2.property-title',
            tagName: 'h2',
            textContent: 'Luxury 3 BHK in Sector 75',
            rect: { x: 26, y: 205, width: 280, height: 24 },
            computedStyles: {
              fontSize: '16px',
              fontWeight: '700',
              color: '#111827',
              gap: '0px',
              display: 'block',
            },
          },
        ],
        issues: [
          {
            type: 'font-size',
            severity: 'high',
            element: 'h2.property-title',
            description: 'Font size is 16px but Figma shows 18px',
            cssFix: 'h2.property-title { font-size: 18px; }',
          },
        ],
      },
      {
        id: 1,
        bounds: { x: 26, y: 224, width: 120, height: 14 },
        pixelCount: 1680,
        elements: [
          {
            selector: 'p.property-location',
            tagName: 'p',
            textContent: 'Noida • 45 Lac',
            rect: { x: 26, y: 224, width: 180, height: 18 },
            computedStyles: {
              fontSize: '14px',
              fontWeight: '400',
              color: '#999999',
            },
          },
        ],
        issues: [
          {
            type: 'color',
            severity: 'high',
            element: 'p.property-location',
            description: 'Text color is #999999 but Figma shows #6B7280',
            cssFix: 'p.property-location { color: #6B7280; }',
          },
        ],
      },
      {
        id: 2,
        bounds: { x: 26, y: 248, width: 338, height: 52 },
        pixelCount: 17576,
        elements: [
          {
            selector: 'button.primary',
            tagName: 'button',
            textContent: 'View Details',
            rect: { x: 30, y: 252, width: 330, height: 44 },
            computedStyles: {
              fontSize: '14px',
              fontWeight: '600',
              color: '#ffffff',
              paddingTop: '12px',
              paddingBottom: '12px',
              paddingLeft: '16px',
              paddingRight: '16px',
            },
          },
        ],
        issues: [
          {
            type: 'font-size',
            severity: 'medium',
            element: 'button.primary',
            description: 'Font size is 14px but Figma shows 16px',
            cssFix: 'button.primary { font-size: 16px; }',
          },
          {
            type: 'padding-top',
            severity: 'low',
            element: 'button.primary',
            description: 'Padding-top is 12px but Figma shows 16px',
            cssFix: 'button.primary { padding-top: 16px; }',
          },
          {
            type: 'padding-bottom',
            severity: 'low',
            element: 'button.primary',
            description: 'Padding-bottom is 12px but Figma shows 16px',
            cssFix: 'button.primary { padding-bottom: 16px; }',
          },
        ],
      },
      {
        id: 3,
        bounds: { x: 16, y: 312, width: 358, height: 12 },
        pixelCount: 4296,
        elements: [
          {
            selector: '.gap-indicator',
            tagName: 'div',
            textContent: 'Gap: 8px',
            rect: { x: 16, y: 312, width: 358, height: 16 },
            computedStyles: {
              display: 'flex',
              gap: '8px',
            },
          },
        ],
        issues: [
          {
            type: 'gap',
            severity: 'low',
            element: '.gap-indicator',
            description: 'Gap is 8px but Figma shows 12px',
            cssFix: '.gap-indicator { gap: 12px; }',
          },
        ],
      },
    ],
    allIssues: [
      {
        type: 'font-size',
        severity: 'high',
        element: 'h2.property-title',
        description: 'Font size is 16px but Figma shows 18px',
        cssFix: 'h2.property-title { font-size: 18px; }',
      },
      {
        type: 'color',
        severity: 'high',
        element: 'p.property-location',
        description: 'Text color is #999999 but Figma shows #6B7280',
        cssFix: 'p.property-location { color: #6B7280; }',
      },
      {
        type: 'font-size',
        severity: 'medium',
        element: 'button.primary',
        description: 'Font size is 14px but Figma shows 16px',
        cssFix: 'button.primary { font-size: 16px; }',
      },
      {
        type: 'padding-top',
        severity: 'low',
        element: 'button.primary',
        description: 'Padding-top is 12px but Figma shows 16px',
        cssFix: 'button.primary { padding-top: 16px; }',
      },
      {
        type: 'padding-bottom',
        severity: 'low',
        element: 'button.primary',
        description: 'Padding-bottom is 12px but Figma shows 16px',
        cssFix: 'button.primary { padding-bottom: 16px; }',
      },
      {
        type: 'gap',
        severity: 'low',
        element: '.gap-indicator',
        description: 'Gap is 8px but Figma shows 12px',
        cssFix: '.gap-indicator { gap: 12px; }',
      },
    ],
  };

  await fs.writeFile(
    path.join(outputDir, 'reports', 'homepage.json'),
    JSON.stringify(screenReport, null, 2)
  );

  // Summary report
  const summary = {
    timestamp: new Date().toISOString(),
    totalScreens: 1,
    passed: 0,
    failed: 1,
    overallAccuracy: 94.5,
    screens: [
      {
        id: 'homepage',
        name: 'Homepage Demo',
        accuracy: 94.5,
        passed: false,
        issueCount: 6,
      },
    ],
  };

  await fs.writeFile(
    path.join(outputDir, 'reports', 'summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log('✓ JSON reports created');
}

async function main() {
  console.log('\n🎯 Design PAT — Demo Data Generator\n');

  try {
    await createFigmaDesign();
    await createScreenshot();
    await createDiffImage();
    await createAnnotatedImage();
    await createReports();

    console.log('\n✅ Mock data created successfully!\n');
    console.log('📁 Files generated:');
    console.log('  output/figma/homepage.png');
    console.log('  output/screenshots/homepage.png');
    console.log('  output/diffs/homepage-diff.png');
    console.log('  output/annotated/homepage-annotated.png');
    console.log('  output/reports/homepage.json');
    console.log('  output/reports/summary.json');
    console.log('\n🚀 Next steps:');
    console.log('  1. open demo/output/annotated/homepage-annotated.png');
    console.log('  2. cat demo/output/reports/homepage.json');
    console.log('  3. npm run dashboard (to view in interactive UI)\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
