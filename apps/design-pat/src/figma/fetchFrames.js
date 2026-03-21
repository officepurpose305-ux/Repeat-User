import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger.js';

/**
 * Fetch a Figma frame as PNG using the two-step image export flow
 * Step 1: Get signed S3 URL via Figma API
 * Step 2: Download image from S3
 * Step 3: Resize to viewport dimensions
 */
export async function fetchFigmaFrame(screen, config) {
  const { figma, outputDir, viewport } = config;
  const outputPath = path.join(outputDir, 'figma', `${screen.id}.png`);

  try {
    logger.step(`Fetching Figma frame for ${screen.id}`);

    if (!screen.figmaNodeId) {
      throw new Error('Missing figmaNodeId in screen config. Provide a frame node ID from Figma.');
    }

    // Normalize node ID: Figma URLs use "1234-5678" but API expects "1234:5678"
    const nodeId = screen.figmaNodeId.replace(/-/g, ':');
    logger.dim(`  Node ID: ${nodeId}`);

    // Step 1: Get image render URL from Figma API
    const rendersRes = await axios.get(
      `https://api.figma.com/v1/images/${figma.fileId}`,
      {
        params: {
          ids: nodeId,
          format: 'png',
          scale: 2, // fetch at 2x for better fidelity
        },
        headers: {
          'X-Figma-Token': figma.token,
        },
        timeout: 10000,
      }
    );

    const imageUrl = rendersRes.data.images?.[nodeId];
    if (!imageUrl) {
      const available = Object.keys(rendersRes.data.images || {});
      throw new Error(
        `No image for node "${screen.figmaNodeId}" (${nodeId}).\n` +
        `Available nodes: ${available.length > 0 ? available.join(', ') : 'none found'}\n` +
        `Check: 1) File ID is correct, 2) Node ID is correct, 3) File is accessible`
      );
    }

    // Step 2: Download image from signed S3 URL (NO auth header on S3 URLs!)
    const imgRes = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
    });

    const imgBuffer = Buffer.from(imgRes.data);

    // Step 3: Resize to viewport dimensions using sharp
    const resized = await sharp(imgBuffer)
      .resize(viewport.width, viewport.height, {
        fit: 'cover', // cover the viewport, maintaining aspect ratio
        position: 'center',
      })
      .png()
      .toBuffer();

    await fs.writeFile(outputPath, resized);
    logger.success(`Saved Figma frame → ${outputPath}`);

    return outputPath;
  } catch (error) {
    let errorMsg = error.message;

    // Provide helpful debugging for common errors
    if (error.response?.status === 404) {
      errorMsg = `File not found (404). Check your File ID is correct: ${figma.fileId}`;
    } else if (error.response?.status === 403) {
      errorMsg = `Access denied (403). Check your API token is valid and has access to this file.`;
    } else if (error.response?.status === 401) {
      errorMsg = `Unauthorized (401). Your Figma API token is invalid or expired.`;
    } else if (error.message.includes('No image for node')) {
      errorMsg = error.message; // Already has helpful info
    }

    logger.error(`Failed to fetch Figma frame for ${screen.id}:`);
    logger.error(`  File ID: ${figma.fileId}`);
    logger.error(`  Node ID: ${screen.figmaNodeId}`);
    logger.error(`  Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }
}
