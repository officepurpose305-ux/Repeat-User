#!/usr/bin/env node

import express from 'express';
import multer from 'multer';
import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PAT_API_PORT || 5174;

// Middleware
app.use(express.json());

// Configure file upload
const uploadDir = path.join(__dirname, '../../uploads');
fs.mkdir(uploadDir, { recursive: true });

// Multer for app files (.apk, .ipa)
const uploadApp = multer({
  dest: uploadDir,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.android.package-archive' || file.originalname.endsWith('.apk')) {
      cb(null, true);
    } else if (file.originalname.endsWith('.ipa')) {
      cb(null, true);
    } else {
      cb(new Error('Only .apk and .ipa files allowed'));
    }
  },
});

// Multer for screenshots (PNG, JPG) - minimal config
const uploadScreenshots = multer({
  dest: uploadDir,
});

/**
 * POST /api/run-pat
 * Run Design PAT comparison (single screen)
 */
app.post('/api/run-pat', async (req, res) => {
  try {
    const { figmaToken, figmaFileId, platform = 'web', input } = req.body;

    if (!figmaToken || !figmaFileId) {
      return res.status(400).json({ error: 'Missing figmaToken or figmaFileId' });
    }

    if (!input && platform !== 'web') {
      return res.status(400).json({ error: `Missing input (${platform} file path or URL)` });
    }

    // Build pat.js arguments
    const args = [
      'bin/pat.js',
      '--platform', platform,
    ];

    if (input) {
      args.push('--input', input);
    }

    // Set environment variables for Figma credentials
    const env = {
      ...process.env,
      PAT_FIGMA_TOKEN: figmaToken,
      PAT_FIGMA_FILE_ID: figmaFileId,
    };

    // Run pat.js as subprocess
    console.log(`[PAT API] Running pat.js with platform=${platform}`);
    const result = spawnSync('node', args, {
      cwd: path.join(__dirname, '../..'),
      env,
      stdio: 'inherit',
      timeout: 300000,
    });

    if (result.error) {
      return res.status(500).json({ error: result.error.message });
    }

    if (result.status !== 0) {
      return res.status(500).json({ error: `pat.js exited with code ${result.status}` });
    }

    res.json({
      success: true,
      message: 'Comparison completed',
      platform,
      outputDir: 'output',
    });
  } catch (err) {
    console.error('[PAT API Error]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/run-pat-multi
 * Run Design PAT comparison (multiple screens)
 */
app.post('/api/run-pat-multi', uploadScreenshots.array('files[]', 10), async (req, res) => {
  const fs = await import('fs/promises');

  try {
    const { figmaToken, figmaFileId, screensJson } = req.body;

    if (!figmaToken || !figmaFileId) {
      return res.status(400).json({ error: 'Missing figmaToken or figmaFileId' });
    }

    let screens = [];
    try {
      screens = JSON.parse(screensJson);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid screensJson' });
    }

    if (!Array.isArray(screens) || screens.length === 0) {
      return res.status(400).json({ error: 'No screens provided' });
    }

    console.log(`[PAT API] Running ${screens.length} screen(s)`);

    // Map uploaded files to screens
    const screenMap = {};
    const uploadedFiles = req.files || [];
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((file, idx) => {
        screenMap[idx] = {
          file: file.path,
          name: file.originalname,
        };
      });
    }

    // Build screens array for config
    const configScreens = screens.map((screen, idx) => {
      const screenConfig = {
        id: screen.id,
        name: screen.name,
        platform: screen.platform,
        figmaNodeId: screen.figmaNodeId || 'Frame 1', // Default node ID
      };

      if (screen.platform === 'web') {
        screenConfig.url = screen.input;
      } else if (screenMap[idx]) {
        screenConfig.input = screenMap[idx].file;
      } else if (screen.platform !== 'web') {
        throw new Error(`Missing file for screen ${screen.name}`);
      }

      return screenConfig;
    });

    // Create temporary config file
    const tempConfigPath = path.join(uploadDir, `pat-config-${Date.now()}.json`);
    const config = {
      figma: {
        token: figmaToken,
        fileId: figmaFileId,
      },
      screens: configScreens,
      outputDir: path.join(__dirname, '../../output'),
      viewport: { width: 390, height: 844 },
      threshold: 95,
      ciThreshold: 95,
      minRegionArea: 25,
      minPixelCount: 3,
    };

    await fs.writeFile(tempConfigPath, JSON.stringify(config, null, 2));
    console.log(`[PAT API] Created config: ${tempConfigPath}`);

    // Run pat.js with the config
    const args = ['bin/pat.js', '--config', tempConfigPath];

    console.log(`[PAT API] Executing: node ${args.join(' ')}`);
    const result = spawnSync('node', args, {
      cwd: path.join(__dirname, '../..'),
      stdio: 'inherit',
      timeout: 600000, // 10 minute timeout
    });

    // Cleanup temp config
    try {
      await fs.unlink(tempConfigPath);
    } catch (err) {
      console.warn(`[PAT API] Failed to cleanup config: ${err.message}`);
    }

    if (result.error) {
      return res.status(500).json({ error: result.error.message });
    }

    if (result.status !== 0) {
      return res.status(500).json({ error: `pat.js exited with code ${result.status}` });
    }

    res.json({
      success: true,
      message: `Comparison completed for ${screens.length} screen(s)`,
      screensCount: screens.length,
      outputDir: 'output',
    });
  } catch (err) {
    console.error('[PAT API Error]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/upload-app
 * Upload .apk or .ipa file
 */
app.post('/api/upload-app', uploadApp.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileType = req.file.originalname.endsWith('.apk') ? 'apk' : 'ipa';
    const filePath = req.file.path;

    res.json({
      success: true,
      fileType,
      path: filePath,
      name: req.file.originalname,
      size: req.file.size,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/run-comparison
 * Run comparison: Figma file link + screenshots
 */
app.post('/api/run-comparison', uploadScreenshots.array('screenshots[]', 20), async (req, res) => {
  const fs = await import('fs/promises');

  try {
    // Get text fields from query parameters
    const { figmaLink, figmaFileId, screenshotsJson, figmaToken } = req.query;

    if (!figmaFileId) {
      return res.status(400).json({ error: 'Invalid Figma link' });
    }

    let screenshots = [];
    try {
      screenshots = JSON.parse(screenshotsJson);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid screenshots data' });
    }

    if (!Array.isArray(screenshots) || screenshots.length === 0) {
      return res.status(400).json({ error: 'No screenshots provided' });
    }

    console.log(`[PAT API] Comparison: Figma file ${figmaFileId} + ${screenshots.length} screenshot(s)`);

    // Copy and resize uploaded screenshots to output directory
    const uploadedScreenshots = {};
    const screenshotFiles = req.files || [];
    const outputDir = path.join(__dirname, '../../output');
    const outputScreenshotDir = path.join(outputDir, 'screenshots');
    const Sharp = (await import('sharp')).default;
    const viewport = { width: 390, height: 844 }; // Standard mobile viewport

    // Ensure screenshots directory exists
    await fs.mkdir(outputScreenshotDir, { recursive: true });

    if (screenshotFiles.length > 0) {
      for (let idx = 0; idx < screenshotFiles.length; idx++) {
        const file = screenshotFiles[idx];
        const screenId = screenshots[idx]?.id || `screenshot-${idx}`;
        const destPath = path.join(outputScreenshotDir, `${screenId}.png`);

        try {
          // Resize screenshot to match viewport dimensions
          await Sharp(file.path)
            .resize(viewport.width, viewport.height, {
              fit: 'cover', // Crop to fit
              position: 'top', // Keep top portion
            })
            .png()
            .toFile(destPath);

          uploadedScreenshots[idx] = destPath;
          console.log(`[PAT API] Resized and saved screenshot to ${destPath} (${viewport.width}×${viewport.height})`);
        } catch (err) {
          console.error(`[PAT API] Failed to resize screenshot: ${err.message}`);
          // Fallback: just copy the file
          await fs.copyFile(file.path, destPath);
          uploadedScreenshots[idx] = destPath;
          console.log(`[PAT API] Copied original screenshot to ${destPath}`);
        }
      }
    }

    // Create config for pat.js
    const tempConfigPath = path.join(uploadDir, `pat-config-${Date.now()}.json`);
    const screens = screenshots.map((screenshot, idx) => {
      const screenConfig = {
        id: screenshot.id || `screenshot-${idx}`,
        name: screenshot.name,
        figmaNodeId: '1:2', // Default node ID - will need to be matched by name in public file
        platform: 'web',
        skipFigmaFetch: true, // Skip fetching Figma frame for public files
      };

      // Use uploaded file path if available, otherwise use demo URL
      if (uploadedScreenshots[idx]) {
        screenConfig.input = uploadedScreenshots[idx]; // Direct file path
      } else {
        screenConfig.url = 'http://localhost:3000/v2/homepage/index.html'; // Fallback to demo
      }

      return screenConfig;
    });

    const config = {
      figma: {
        token: figmaToken || 'demo', // Use provided token or demo token for public file
        fileId: figmaFileId,
      },
      screens,
      outputDir: path.join(__dirname, '../../output'),
      viewport: { width: 390, height: 844 },
      threshold: 95,
      ciThreshold: 95,
      minRegionArea: 25,
      minPixelCount: 3,
      isPublic: !figmaToken, // Flag for public Figma file (if no token provided)
    };

    await fs.writeFile(tempConfigPath, JSON.stringify(config, null, 2));
    console.log(`[PAT API] Created config: ${tempConfigPath}`);

    // Run pat.js
    const args = ['bin/pat.js', '--config', tempConfigPath];

    console.log(`[PAT API] Executing: node ${args.join(' ')}`);
    const result = spawnSync('node', args, {
      cwd: path.join(__dirname, '../..'),
      stdio: 'inherit',
      timeout: 600000,
    });

    // Cleanup
    try {
      await fs.unlink(tempConfigPath);
    } catch (err) {
      console.warn(`[PAT API] Cleanup error: ${err.message}`);
    }

    if (result.error) {
      return res.status(500).json({ error: result.error.message });
    }

    if (result.status !== 0) {
      return res.status(500).json({ error: `Comparison failed (exit code ${result.status})` });
    }

    res.json({
      success: true,
      message: `Compared ${screenshots.length} screenshot(s) against Figma file`,
      screenshotsCount: screenshots.length,
      outputDir: 'output',
    });
  } catch (err) {
    console.error('[PAT API Error]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/status
 * Health check
 */
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'Design PAT API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Error handling
 */
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✓ Design PAT API running on http://localhost:${PORT}`);
  console.log(`  POST /api/run-pat - Run comparison`);
  console.log(`  POST /api/upload-app - Upload .apk/.ipa`);
  console.log(`  GET  /api/status - Health check\n`);
});
