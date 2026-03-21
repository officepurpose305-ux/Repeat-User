/**
 * Color normalization and comparison utilities
 * Handles conversions between rgb() strings, hex codes, and Figma color format
 */

/**
 * Convert CSS rgb() or rgba() string to hex
 * Input: "rgb(37, 99, 235)" or "rgba(37, 99, 235, 0.8)"
 * Output: "#2563eb"
 */
export function rgbStringToHex(rgbStr) {
  if (!rgbStr) return rgbStr;

  const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgbStr; // not an rgb string, return as-is

  const [, r, g, b] = match;
  return '#' + [parseInt(r), parseInt(g), parseInt(b)]
    .map(n => n.toString(16).padStart(2, '0'))
    .join('')
    .toLowerCase();
}

/**
 * Convert Figma color format to hex
 * Input: { r: 0.145, g: 0.388, b: 0.922, a: 1 } (0–1 floats)
 * Output: "#2563eb"
 */
export function figmaColorToHex({ r = 0, g = 0, b = 0 }) {
  return '#' + [r, g, b]
    .map(v => Math.round(v * 255).toString(16).padStart(2, '0'))
    .join('')
    .toLowerCase();
}

/**
 * Euclidean distance in RGB space
 * Used for fuzzy color matching
 */
export function colorDistance(hex1, hex2) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);

  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/**
 * Check if two colors match within tolerance
 * Default tolerance: 5 (out of 255 per channel)
 */
export function colorsMatch(hex1, hex2, tolerance = 5) {
  if (!hex1 || !hex2) return false;
  return colorDistance(hex1, hex2) <= tolerance;
}

/**
 * Parse hex color to [r, g, b] array
 */
function hexToRgb(hex) {
  if (!hex || hex.length < 7) return [0, 0, 0];

  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Normalize computed style pixel values (e.g. "14px" → 14)
 */
export function parsePx(str) {
  if (!str) return 0;
  return parseFloat(str.toString());
}

/**
 * Escape HTML special characters for safe rendering
 */
export function esc(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
