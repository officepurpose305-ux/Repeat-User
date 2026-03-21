import { chromium } from 'playwright';
import path from 'path';
import { logger } from '../utils/logger.js';

/**
 * Capture a full-page screenshot of the specified URL using Playwright
 * Supports postMessage injection for dynamic config (e.g., 99acres homepage personas)
 * Returns browser and page handles so DOM mapping can run while page is still live
 */
export async function captureScreenshot(screen, config) {
  const { viewport, outputDir } = config;
  const outputPath = path.join(outputDir, 'screenshots', `${screen.id}.png`);

  let browser;
  try {
    logger.step(`Capturing screenshot for ${screen.id}`);

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Set viewport to match design (mobile)
    await page.setViewportSize(viewport);

    // Navigate to URL
    await page.goto(screen.url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Inject postMessage if provided (for 99acres config updates)
    if (screen.postMessagePayload) {
      await page.evaluate((payload) => {
        window.postMessage(payload, '*');
      }, screen.postMessagePayload);

      // Wait for re-render after config update
      await page.waitForTimeout(screen.waitMs ?? 800);
    }

    // Wait for specific selector if provided
    if (screen.waitForSelector) {
      await page.waitForSelector(screen.waitForSelector, { timeout: 10000 });
    }

    // Additional wait for stability
    await page.waitForTimeout(300);

    // Capture screenshot (clipped to viewport)
    await page.screenshot({
      path: outputPath,
      clip: {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      },
    });

    logger.success(`Saved screenshot → ${outputPath}`);

    // Return page + browser for DOM mapping
    // Caller is responsible for closing browser after DOM operations complete
    return { browser, page, outputPath };
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    logger.error(`Failed to capture screenshot for ${screen.id}: ${error.message}`);
    throw error;
  }
}
