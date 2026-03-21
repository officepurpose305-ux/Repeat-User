#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../src/utils/logger.js';
import { fetchFigmaFrame } from '../src/figma/fetchFrames.js';
import { extractFigmaStyles } from '../src/figma/extractStyles.js';
import { captureScreenshot } from '../src/capture/screenshot.js';
import { captureAndroidApp } from '../src/capture/capture-android.js';
import { captureiOSApp } from '../src/capture/capture-ios.js';
import { pixelCompare } from '../src/compare/pixelCompare.js';
import { detectRegions } from '../src/compare/regionDetect.js';
import { mapRegionToElements } from '../src/dom/domMapper.js';
import { compareStyles, normalizeDomStyles } from '../src/styles/styleCompare.js';
import { annotateScreenshot } from '../src/annotate/annotate.js';
import { generateReport, generateSummary } from '../src/report/generateReport.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  await fs.readFile(path.join(__dirname, '../package.json'), 'utf8')
);

const program = new Command()
  .name('pat')
  .description('Design PAT — Pixel Accuracy Test tool')
  .version(packageJson.version)
  .option('-c, --config <path>', 'Config file (default: pat.config.json)')
  .option('-s, --screen <id>', 'Run only this screen ID')
  .option('-p, --platform <type>', 'Platform: web | android | ios (default: web)')
  .option('-i, --input <path-or-url>', 'App input: URL for web, .apk/.ipa path for mobile')
  .option('--ci', 'CI mode — exit 1 if any screen below ciThreshold')
  .option('--no-styles', 'Skip style extraction (pixel diff only)')
  .option('-v, --verbose', 'Verbose logging')
  .parse();

const opts = program.opts();

/**
 * Capture screenshot based on platform
 */
async function captureScreenshotByPlatform(screen, config, platform, input) {
  const captureOptions = {
    outputPath: path.join(config.outputDir, 'screenshots', `${screen.id}.png`),
    viewport: config.viewport || { width: 390, height: 844 },
    waitTime: screen.waitMs || config.waitMs || 2000,
    logger,
  };

  // For web platform, we need to return browser and page handles
  if (platform === 'web' || !platform) {
    return await captureScreenshot(screen, config);
  }

  // For Android and iOS, we only get the screenshot path
  // We'll need to modify the main loop to handle this
  if (platform === 'android') {
    if (!input) {
      throw new Error('--input (APK path) required for android platform');
    }
    const screenshotPath = await captureAndroidApp(input, captureOptions);
    return { screenshotPath, outputPath: screenshotPath };
  }

  if (platform === 'ios') {
    if (!input) {
      throw new Error('--input (IPA path) required for ios platform');
    }
    const screenshotPath = await captureiOSApp(input, captureOptions);
    return { screenshotPath, outputPath: screenshotPath };
  }

  throw new Error(`Unknown platform: ${platform}`);
}

/**
 * Main PAT orchestrator
 */
async function main() {
  try {
    logger.title('\n🎯 Design PAT — Pixel Accuracy Test\n');

    // Load config
    const configPath = opts.config || 'pat.config.json';
    let config;

    try {
      const configData = await fs.readFile(configPath, 'utf8');
      config = JSON.parse(configData);
    } catch (err) {
      logger.error(`Failed to load config from ${configPath}`);
      logger.dim(`Create pat.config.json by copying pat.config.example.json`);
      process.exit(1);
    }

    // Override figma token from env if provided (for CI)
    if (process.env.PAT_FIGMA_TOKEN) {
      config.figma.token = process.env.PAT_FIGMA_TOKEN;
    }

    if (!config.figma?.token || !config.figma?.fileId) {
      logger.error('Missing figma.token or figma.fileId in config');
      process.exit(1);
    }

    // Ensure output directories exist
    await fs.mkdir(path.join(config.outputDir, 'figma'), { recursive: true });
    await fs.mkdir(path.join(config.outputDir, 'screenshots'), { recursive: true });
    await fs.mkdir(path.join(config.outputDir, 'diffs'), { recursive: true });
    await fs.mkdir(path.join(config.outputDir, 'annotated'), { recursive: true });
    await fs.mkdir(path.join(config.outputDir, 'reports'), { recursive: true });

    // Filter screens
    let screens = config.screens || [];
    if (opts.screen) {
      screens = screens.filter((s) => s.id === opts.screen);
      if (screens.length === 0) {
        logger.error(`Screen ID "${opts.screen}" not found in config`);
        process.exit(1);
      }
    }

    if (screens.length === 0) {
      logger.error('No screens configured');
      process.exit(1);
    }

    logger.step(`Running ${screens.length} screen(s)...\n`);

    const allReports = [];
    let ciFailures = [];

    // Process each screen
    for (const screen of screens) {
      logger.title(`\n📱 ${screen.name}`);

      try {
        // Step 1: Fetch Figma frame
        // Skip if no token and public file mode (just use placeholder)
        const hasToken = config.figma?.token && config.figma.token !== 'demo';

        if (hasToken || !config.isPublic) {
          await fetchFigmaFrame(screen, config);
        } else {
          logger.step(`Using placeholder Figma frame (no token provided)`);
          // For public files without token, create a placeholder Figma frame
          const Sharp = (await import('sharp')).default;
          await fs.mkdir(path.join(config.outputDir, 'figma'), { recursive: true });
          const figmaPath = path.join(config.outputDir, 'figma', `${screen.id}.png`);
          const viewport = config.viewport || { width: 390, height: 844 };
          await Sharp({
            create: {
              width: viewport.width,
              height: viewport.height,
              channels: 3,
              background: { r: 240, g: 240, b: 240 },
            },
          })
            .png()
            .toFile(figmaPath);
          logger.success(`Created placeholder Figma frame: ${figmaPath}`);
        }

        // Step 2: Capture screenshot (based on platform)
        const platform = opts.platform || screen.platform || config.platform || 'web';
        const input = opts.input || screen.input || config.input;
        const expectedScreenshotPath = path.join(config.outputDir, 'screenshots', `${screen.id}.png`);

        // Check if screenshot already exists (uploaded or pre-provided)
        let browser, page, finalScreenshotPath;
        let screenshotExists = false;
        try {
          await fs.access(expectedScreenshotPath);
          screenshotExists = true;
          finalScreenshotPath = expectedScreenshotPath;
          logger.success(`Using existing screenshot: ${screen.id}`);
        } catch (err) {
          // Screenshot doesn't exist, capture it
          const captureResult = await captureScreenshotByPlatform(screen, config, platform, input);
          ({ browser, page, screenshotPath: finalScreenshotPath } = captureResult);
          finalScreenshotPath = finalScreenshotPath || path.join(config.outputDir, 'screenshots', `${screen.id}.png`);
        }

        try {
          // Step 3: Pixel compare
          const compareResult = await pixelCompare(screen, config);

          // Step 4: Detect diff regions (with noise filtering)
          const noiseOptions = {
            minRegionArea: screen.minRegionArea ?? config.minRegionArea ?? 25,
            minPixelCount: screen.minPixelCount ?? config.minPixelCount ?? 3,
            log: (msg) => logger.dim(`  [noise] ${msg}`),
          };
          const regions = detectRegions(compareResult.diffPng, noiseOptions);

          if (regions.length > 0) {
            logger.step(`Detected ${regions.length} diff region(s)`);

            // Step 5: Map regions to DOM elements
            for (let i = 0; i < regions.length; i++) {
              const region = regions[i];
              const elements = await mapRegionToElements(page, region);
              region.elements = elements;
              region.issues = [];

              // Step 6 & 7: Extract Figma styles and compare (if not --no-styles)
              if (opts.styles !== false && elements.length > 0) {
                for (const element of elements) {
                  const figmaStyles = await extractFigmaStyles(
                    screen.figmaNodeId,
                    config
                  );

                  if (figmaStyles) {
                    const issues = compareStyles(
                      normalizeDomStyles(element.computedStyles),
                      figmaStyles,
                      element
                    );
                    region.issues.push(...issues);
                  }
                }
              }
            }

            // Step 8: Annotate screenshot
            await annotateScreenshot(finalScreenshotPath, regions, path.join(config.outputDir, 'annotated', `${screen.id}-annotated.png`));
          } else {
            logger.success('No diff regions detected');
            // Still create empty annotated screenshot
            await annotateScreenshot(finalScreenshotPath, [], path.join(config.outputDir, 'annotated', `${screen.id}-annotated.png`));
          }

          // Step 9: Generate report
          const report = await generateReport(screen, { ...compareResult, regions }, config);

          allReports.push(report);

          // Check CI threshold
          if (
            opts.ci &&
            report.accuracy <
              (screen.ciThreshold ?? config.ciThreshold ?? 95)
          ) {
            ciFailures.push({
              id: screen.id,
              accuracy: report.accuracy,
              threshold: screen.ciThreshold ?? config.ciThreshold ?? 95,
            });
          }
        } finally {
          // Always close browser (if it exists - mobile platforms don't return it)
          if (browser) {
            await browser.close();
          }
        }
      } catch (error) {
        logger.error(`Failed to process screen ${screen.id}: ${error.message}`);
        if (opts.verbose) {
          console.error(error);
        }
      }
    }

    // Generate summary
    if (allReports.length > 0) {
      const summary = await generateSummary(allReports, config);
      logger.title('\n📊 Summary\n');
      logger.info(`Total screens: ${summary.totalScreens}`);
      logger.info(`Passed: ${summary.passed}`);
      logger.warn(`Failed: ${summary.failed}`);
      logger.info(`Overall accuracy: ${summary.overallAccuracy}%`);
    }

    // CI exit logic
    if (opts.ci && ciFailures.length > 0) {
      logger.title('\n❌ CI Failures\n');
      for (const failure of ciFailures) {
        logger.error(
          `${failure.id}: ${failure.accuracy.toFixed(2)}% (threshold: ${failure.threshold}%)`
        );
      }
      logger.error(
        `\n${ciFailures.length} screen(s) below CI threshold. Build failed.`
      );
      process.exit(1);
    }

    if (ciFailures.length === 0 && allReports.length > 0) {
      logger.success('\n✅ All screens passed!\n');
      process.exit(0);
    }
  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    if (opts.verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}

main();
