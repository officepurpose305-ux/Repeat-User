import axios from 'axios';
import { figmaColorToHex } from '../utils/color.js';
import { logger } from '../utils/logger.js';

/**
 * Extract style properties from Figma node using /files/{fileId}/nodes endpoint
 * Normalizes Figma's nested structure into a flat style object
 */
export async function extractFigmaStyles(nodeId, config) {
  const { figma } = config;

  try {
    // Normalize node ID for API call
    const normalizedId = nodeId.replace(/-/g, ':');

    const res = await axios.get(
      `https://api.figma.com/v1/files/${figma.fileId}/nodes`,
      {
        params: { ids: normalizedId },
        headers: {
          'X-Figma-Token': figma.token,
        },
        timeout: 10000,
      }
    );

    const node = res.data.nodes?.[normalizedId]?.document;
    if (!node) {
      return null;
    }

    return flattenNodeStyles(node);
  } catch (error) {
    logger.warn(
      `Failed to extract Figma styles for node ${nodeId}: ${error.message}`
    );
    return null;
  }
}

/**
 * Flatten deeply nested Figma node object into a simple style object
 * Extracts typography, colors, spacing, dimensions
 */
function flattenNodeStyles(node) {
  const styles = {
    fontSize: node.style?.fontSize,
    fontWeight: node.style?.fontWeight,
    lineHeight: node.style?.lineHeightPx,
    letterSpacing: node.style?.letterSpacing,
    color: null,
    background: null,
    paddingTop: node.paddingTop,
    paddingRight: node.paddingRight,
    paddingBottom: node.paddingBottom,
    paddingLeft: node.paddingLeft,
    marginTop: node.marginTop,
    marginRight: node.marginRight,
    marginBottom: node.marginBottom,
    marginLeft: node.marginLeft,
    width: node.absoluteBoundingBox?.width,
    height: node.absoluteBoundingBox?.height,
    borderRadius: node.cornerRadius,
    // Flexbox and spacing (for smart detection)
    itemSpacing: node.itemSpacing,
    layoutMode: node.layoutMode,
    primaryAxisAlignItems: node.primaryAxisAlignItems,
    counterAxisAlignItems: node.counterAxisAlignItems,
    textAlignHorizontal: node.style?.textAlignHorizontal,
  };

  // Extract primary fill color (first solid fill)
  if (node.fills && Array.isArray(node.fills)) {
    const solidFill = node.fills.find(
      (f) => f.type === 'SOLID' && f.visible !== false
    );
    if (solidFill?.color) {
      styles.color = figmaColorToHex({
        r: solidFill.color.r,
        g: solidFill.color.g,
        b: solidFill.color.b,
      });
    }
  }

  // Extract background color
  if (node.backgrounds && Array.isArray(node.backgrounds)) {
    const solidBg = node.backgrounds.find(
      (bg) => bg.type === 'SOLID' && bg.visible !== false
    );
    if (solidBg?.color) {
      styles.background = figmaColorToHex({
        r: solidBg.color.r,
        g: solidBg.color.g,
        b: solidBg.color.b,
      });
    }
  }

  // Remove null/undefined values
  return Object.fromEntries(Object.entries(styles).filter(([, v]) => v != null));
}

/**
 * Try to find a child node in Figma frame that matches a region's bounding box
 * Returns the closest matching node
 */
export function findClosestNodeInRegion(frameNode, regionBounds) {
  if (!frameNode.children) return null;

  const candidates = [];

  function traverse(node) {
    if (!node.absoluteBoundingBox) return;

    const bbox = node.absoluteBoundingBox;
    const overlap = calculateOverlap(bbox, regionBounds);

    if (overlap > 0) {
      candidates.push({ node, overlap });
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  frameNode.children.forEach(traverse);

  if (candidates.length === 0) return null;

  // Return node with largest overlap area
  candidates.sort((a, b) => b.overlap - a.overlap);
  return candidates[0].node;
}

/**
 * Calculate overlap area between two bounding boxes
 */
function calculateOverlap(box1, box2) {
  const x_overlap = Math.max(0, Math.min(box1.x + box1.width, box2.x + box2.width) - Math.max(box1.x, box2.x));
  const y_overlap = Math.max(0, Math.min(box1.y + box1.height, box2.y + box2.height) - Math.max(box1.y, box2.y));
  return x_overlap * y_overlap;
}
