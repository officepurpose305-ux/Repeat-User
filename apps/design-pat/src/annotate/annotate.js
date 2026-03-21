import sharp from 'sharp';
import path from 'path';
import { logger } from '../utils/logger.js';
import { esc } from '../utils/color.js';

/**
 * Annotate a screenshot with bounding boxes, arrows, overlays, and readable labels
 * Uses SVG compositing via sharp for efficient rendering
 *
 * Features:
 * - Semi-transparent colored overlay on each diff region
 * - Numbered badge (#N) in the top-left corner of each region
 * - Colorful bounding box border
 * - Arrow connector from label to region
 * - Readable label with issue type icons
 * - Smart edge clamping to keep labels visible
 */
export async function annotateScreenshot(screenshotPath, regions, outputPath) {
  try {
    if (regions.length === 0) {
      // No regions, just copy the original screenshot
      const image = sharp(screenshotPath);
      await image.toFile(outputPath);
      logger.success(`Saved annotated screenshot (no changes) → ${outputPath}`);
      return;
    }

    logger.step(`Annotating screenshot with ${regions.length} region(s)`);

    // Get image dimensions for SVG
    const metadata = await sharp(screenshotPath).metadata();
    const { width, height } = metadata;

    // Build SVG with definitions, overlays, boxes, badges, labels, and arrows
    const defs = buildMarkerDefinitions();
    const svgElements = [];

    // Generate annotations for each region
    for (let i = 0; i < regions.length; i++) {
      const region = regions[i];
      const { x, y, width: w, height: h, issues = [] } = region;

      // Determine color based on issue severity
      let color = '#3b82f6'; // blue (default, pixel-only)
      let colorName = 'blue';
      if (issues.length > 0) {
        const hasHigh = issues.some((iss) => iss.severity === 'high');
        const hasMedium = issues.some((iss) => iss.severity === 'medium');
        if (hasHigh) {
          color = '#ef4444';
          colorName = 'red';
        } else if (hasMedium) {
          color = '#f59e0b';
          colorName = 'amber';
        }
      }

      // 1. Semi-transparent overlay rectangle
      svgElements.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}"
        fill="${color}" fill-opacity="0.15" rx="2"/>`);

      // 2. Bounding box border
      svgElements.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}"
        fill="none" stroke="${color}" stroke-width="2.5" rx="2"/>`);

      // 3. Issue number badge in top-left corner of region
      svgElements.push(`<circle cx="${x + 10}" cy="${y + 10}" r="9"
        fill="${color}"/>`);
      svgElements.push(`<text x="${x + 10}" y="${y + 15}"
        text-anchor="middle" font-family="system-ui, sans-serif"
        font-size="9" font-weight="700" fill="white">#${i + 1}</text>`);

      // Generate label text with issue type icons
      const label = generateLabel(issues, i);
      const labelWidth = Math.max(label.length * 7 + 24, 80);
      const labelHeight = 22;
      const labelRadius = 11;

      // Position label with smart clamping
      const labelPositioning = calculateLabelPosition(
        x,
        y,
        w,
        h,
        labelWidth,
        width,
        height
      );
      const { labelX, labelY, arrowStartY } = labelPositioning;

      // 4. Label pill (background)
      svgElements.push(
        `<rect x="${labelX}" y="${labelY}" width="${labelWidth}" height="${labelHeight}"
        fill="${color}" rx="${labelRadius}" ry="${labelRadius}"/>`
      );

      // 5. Label text
      svgElements.push(`<text x="${labelX + 12}" y="${labelY + 14}"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="12" font-weight="600" fill="white"
        text-anchor="start">${esc(label)}</text>`);

      // 6. Arrow connector line (if far enough away)
      const arrowStartX = labelX + labelWidth / 2;
      const arrowEndX = x + w / 2;
      const arrowEndY = labelY > y ? y : y + h;

      const distance = Math.hypot(arrowStartX - arrowEndX, arrowStartY - arrowEndY);

      if (distance > 10) {
        svgElements.push(`<line x1="${arrowStartX}" y1="${arrowStartY}"
          x2="${arrowEndX}" y2="${arrowEndY}"
          stroke="${color}" stroke-width="1.5" stroke-dasharray="4,2"
          marker-end="url(#arrow-${colorName})"/>`);
      }
    }

    // Assemble final SVG
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      ${defs}
      ${svgElements.join('\n')}
    </svg>`;

    // Composite SVG onto screenshot
    await sharp(screenshotPath)
      .composite([
        {
          input: Buffer.from(svg),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toFile(outputPath);

    logger.success(`Saved annotated screenshot → ${outputPath}`);
  } catch (error) {
    logger.error(`Failed to annotate screenshot: ${error.message}`);
    throw error;
  }
}

/**
 * Build SVG marker definitions for arrowheads (one per color)
 */
function buildMarkerDefinitions() {
  return `<defs>
    <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill="#ef4444"/>
    </marker>
    <marker id="arrow-amber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill="#f59e0b"/>
    </marker>
    <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill="#3b82f6"/>
    </marker>
  </defs>`;
}

/**
 * Generate label text with issue type icons
 */
function generateLabel(issues, regionIndex) {
  if (issues.length === 0) {
    return `⬛ Diff ${regionIndex + 1}`;
  }

  // Collect unique issue types (max 2)
  const typeSet = new Set(issues.map((iss) => iss.type));
  const types = Array.from(typeSet).slice(0, 2);

  // Add icons based on type
  const labelParts = types.map((type) => {
    const icon = getIconForIssueType(type);
    return icon + type.replace(/-/g, ' ');
  });

  return labelParts.join(' • ');
}

/**
 * Get unicode icon for issue type
 */
function getIconForIssueType(type) {
  const iconMap = {
    'font-size': 'T ',
    'font-weight': 'T ',
    color: '◉ ',
    'background-color': '◉ ',
    'gap': '↔ ',
    'align-items': '⇕ ',
    'justify-content': '⇔ ',
    'text-align': '⇔ ',
    'padding-top': '▣ ',
    'padding-right': '▣ ',
    'padding-bottom': '▣ ',
    'padding-left': '▣ ',
    'margin-top': '◻ ',
    'margin-right': '◻ ',
    'margin-bottom': '◻ ',
    'margin-left': '◻ ',
    'border-radius': '◎ ',
    'line-height': '⬍ ',
  };

  return iconMap[type] || '⬛ ';
}

/**
 * Calculate label position with smart clamping to keep it visible
 * Returns { labelX, labelY, arrowStartY }
 */
function calculateLabelPosition(
  regionX,
  regionY,
  regionW,
  regionH,
  labelWidth,
  imgWidth,
  imgHeight
) {
  const labelHeight = 22;
  const padding = 4;

  // Decide if label should be above or below region
  const aboveSpace = regionY - (labelHeight + 6);
  const belowSpace = imgHeight - (regionY + regionH + 6);
  const placeAbove = aboveSpace > 0 || belowSpace < 0;

  // Calculate initial label Y position
  let labelY = placeAbove ? regionY - labelHeight - 6 : regionY + regionH + 6;

  // Clamp label X to stay within bounds
  const minLabelX = padding;
  const maxLabelX = imgWidth - labelWidth - padding;
  let labelX = regionX + (regionW - labelWidth) / 2; // center by default
  labelX = Math.max(minLabelX, Math.min(labelX, maxLabelX));

  // Clamp label Y to stay within bounds (if needed)
  labelY = Math.max(padding, Math.min(labelY, imgHeight - labelHeight - padding));

  // Arrow start position (bottom or top center of label)
  const arrowStartY = placeAbove ? labelY + labelHeight : labelY;

  return { labelX, labelY, arrowStartY };
}
