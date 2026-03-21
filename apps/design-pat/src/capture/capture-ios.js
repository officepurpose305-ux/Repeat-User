import { webkit } from 'playwright';
import iOSManager from '../platform/ios-manager.js';

/**
 * Capture screenshot of iOS app
 * @param {string} ipaPath - Path to .ipa file
 * @param {object} options - Configuration
 * @returns {Promise<string>} Path to screenshot
 */
export async function captureiOSApp(ipaPath, options = {}) {
  const {
    outputPath = 'output/screenshots/homepage.png',
    viewport = { width: 390, height: 844 },
    waitTime = 3000,
    logger = console,
  } = options;

  const manager = new iOSManager();
  let browser = null;
  let context = null;

  try {
    // 1. Start simulator
    logger.log?.('📱 Starting iOS simulator...');
    const udid = await manager.startSimulator();
    logger.log?.(`✓ Simulator ready: ${udid}`);

    // 2. Install app
    logger.log?.('📦 Installing app...');
    const bundleId = await manager.installApp(ipaPath);
    logger.log?.(`✓ Installed: ${bundleId}`);

    // 3. Launch app
    logger.log?.('🚀 Launching app...');
    await manager.launchApp(bundleId);
    logger.log?.('✓ App launched');

    // 4. Connect Playwright iOS device
    logger.log?.('🔗 Connecting to device via CDP...');
    try {
      browser = await webkit.connectOverCDP('ws://localhost:9334');
      context = await browser.newContext({ viewport });
      const page = await context.newPage();

      // 5. Wait for app to settle
      logger.log?.(`⏳ Waiting ${waitTime}ms for app to load...`);
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await new Promise((r) => setTimeout(r, waitTime));

      // 6. Capture screenshot
      logger.log?.(`📸 Capturing screenshot...`);
      await page.screenshot({ path: outputPath });
      logger.log?.(`✓ Screenshot saved: ${outputPath}`);

      return outputPath;
    } catch (err) {
      // Fallback: try using xcrun simctl io
      logger.warn?.('CDP connection failed, using xcrun simctl io as fallback');
      return await captureViaSimctl(udid, outputPath, logger);
    }
  } catch (err) {
    throw new Error(`iOS capture failed: ${err.message}`);
  } finally {
    // 7. Cleanup
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    await manager.cleanup().catch(() => {});
  }
}

/**
 * Fallback: Capture using xcrun simctl io
 */
async function captureViaSimctl(udid, outputPath, logger) {
  const { execSync } = await import('child_process');
  const { mkdirSync } = await import('fs');
  const path = await import('path');

  try {
    logger.log?.('📸 Capturing screenshot via simctl...');

    // Create output directory if it doesn't exist
    const dir = path.dirname(outputPath);
    mkdirSync(dir, { recursive: true });

    execSync(`xcrun simctl io ${udid} screenshot "${outputPath}"`);

    logger.log?.(`✓ Screenshot saved: ${outputPath}`);
    return outputPath;
  } catch (err) {
    throw new Error(`Simctl screenshot failed: ${err.message}`);
  }
}
