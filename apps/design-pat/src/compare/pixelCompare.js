import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

/**
 * Compare two screenshots using pixelmatch
 * Returns diff PNG and accuracy metrics
 * Respects ignoreRegions by masking them as matching before comparison
 */
export async function pixelCompare(screen, config) {
  const { outputDir, viewport } = config;
  const figmaPath = path.join(outputDir, 'figma', `${screen.id}.png`);
  const screenshotPath = path.join(outputDir, 'screenshots', `${screen.id}.png`);
  const diffPath = path.join(outputDir, 'diffs', `${screen.id}-diff.png`);

  try {
    logger.step(`Comparing pixels for ${screen.id}`);

    // Read PNG files
    const img1Data = await fs.readFile(figmaPath);
    const img2Data = await fs.readFile(screenshotPath);

    const img1 = PNG.sync.read(img1Data);
    const img2 = PNG.sync.read(img2Data);

    const { width, height } = img1;

    if (img2.width !== width || img2.height !== height) {
      logger.warn(
        `Screenshot size mismatch: Figma ${width}×${height} vs Screenshot ${img2.width}×${img2.height}`
      );
    }

    // Create diff output image
    const diff = new PNG({ width, height });

    // Apply ignore regions: copy img1 pixels to img2 in those areas
    // This makes pixelmatch see them as identical
    const ignoreRegions = screen.ignoreRegions || config.ignoreRegions || [];
    applyIgnoreRegions(img1, img2, ignoreRegions, width, height);

    // Run pixelmatch
    const threshold = screen.threshold ?? config.threshold ?? 0.1;
    const mismatchCount = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { threshold }
    );

    const totalPixels = width * height;
    const accuracy = ((totalPixels - mismatchCount) / totalPixels) * 100;

    // Write diff PNG
    await fs.writeFile(diffPath, PNG.sync.write(diff));

    logger.success(
      `Pixel comparison complete: ${accuracy.toFixed(2)}% match (${mismatchCount} mismatches)`
    );

    return {
      mismatchCount,
      totalPixels,
      accuracy,
      diffPng: diff,
    };
  } catch (error) {
    logger.error(`Failed to compare pixels for ${screen.id}: ${error.message}`);
    throw error;
  }
}

/**
 * Apply ignore regions by copying img1 pixels into img2 at those locations
 * This makes pixelmatch see those areas as identical (zero diff)
 */
function applyIgnoreRegions(img1, img2, regions, width, height) {
  if (!regions || regions.length === 0) return;

  for (const region of regions) {
    const { x, y, width: w, height: h } = region;

    // Clamp to image bounds
    const startX = Math.max(0, Math.floor(x));
    const startY = Math.max(0, Math.floor(y));
    const endX = Math.min(width, Math.ceil(x + w));
    const endY = Math.min(height, Math.ceil(y + h));

    // Copy pixels (4 bytes per pixel: RGBA)
    for (let py = startY; py < endY; py++) {
      for (let px = startX; px < endX; px++) {
        const idx = (width * py + px) * 4;
        img2.data[idx] = img1.data[idx];         // R
        img2.data[idx + 1] = img1.data[idx + 1]; // G
        img2.data[idx + 2] = img1.data[idx + 2]; // B
        img2.data[idx + 3] = img1.data[idx + 3]; // A
      }
    }
  }
}
