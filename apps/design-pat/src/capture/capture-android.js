import { chromium } from 'playwright';
import AndroidManager from '../platform/android-manager.js';

/**
 * Capture screenshot of Android app
 * @param {string} apkPath - Path to .apk file
 * @param {object} options - Configuration
 * @returns {Promise<string>} Path to screenshot
 */
export async function captureAndroidApp(apkPath, options = {}) {
  const {
    outputPath = 'output/screenshots/homepage.png',
    viewport = { width: 390, height: 844 },
    waitTime = 3000,
    logger = console,
  } = options;

  const manager = new AndroidManager();
  let browser = null;
  let context = null;

  try {
    // 1. Start emulator and get device ID
    logger.log?.('📱 Starting Android emulator...');
    const deviceId = await manager.startEmulator();
    logger.log?.(`✓ Device ready: ${deviceId}`);

    // 2. Install app
    logger.log?.('📦 Installing app...');
    const packageName = await manager.installApp(apkPath);
    logger.log?.(`✓ Installed: ${packageName}`);

    // 3. Launch app
    logger.log?.('🚀 Launching app...');
    await manager.launchApp(packageName);
    logger.log?.('✓ App launched');

    // 4. Connect Playwright Android device
    logger.log?.('🔗 Connecting to device via CDP...');
    try {
      browser = await chromium.connectOverCDP('http://localhost:9333');
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
      // Fallback: try using adb screencap
      logger.warn?.('CDP connection failed, using adb screencap as fallback');
      return await captureViaAdb(deviceId, outputPath, logger);
    }
  } catch (err) {
    throw new Error(`Android capture failed: ${err.message}`);
  } finally {
    // 7. Cleanup
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    await manager.cleanup().catch(() => {});
  }
}

/**
 * Fallback: Capture using adb screencap
 */
async function captureViaAdb(deviceId, outputPath, logger) {
  const { execSync } = await import('child_process');
  const { mkdirSync } = await import('fs');
  const path = await import('path');

  try {
    logger.log?.('📸 Capturing screenshot via adb...');
    const tmpPath = '/sdcard/screenshot.png';

    execSync(`adb -s ${deviceId} shell screencap -p ${tmpPath}`);
    execSync(`adb -s ${deviceId} pull ${tmpPath} "${outputPath}"`);
    execSync(`adb -s ${deviceId} shell rm ${tmpPath}`);

    logger.log?.(`✓ Screenshot saved: ${outputPath}`);
    return outputPath;
  } catch (err) {
    throw new Error(`ADB screencap failed: ${err.message}`);
  }
}
