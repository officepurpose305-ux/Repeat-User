/**
 * Detect and cluster diff regions from pixelmatch output
 * Uses Union-Find on a coarse cell grid for efficiency
 *
 * Algorithm:
 * 1. Scan diff PNG for "hot" pixels (non-zero red channel indicates mismatch)
 * 2. Map pixels to cells in a 16×16 grid
 * 3. Union-Find over cells to group adjacent hot cells
 * 4. Compute bounding box per component
 * 5. Expand boxes by padding and merge overlapping ones
 */

export function detectRegions(diffPng, options = {}) {
  const { width, height, data } = diffPng;
  const cellSize = options.cellSize ?? 16;
  const padding = options.padding ?? 8;

  // Step 1: Find all "hot" cells (cells containing mismatch pixels)
  const hotCells = new Set();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) * 4;
      // pixelmatch marks mismatches with red channel
      if (data[idx] > 0) {
        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        hotCells.add(`${cellX},${cellY}`);
      }
    }
  }

  if (hotCells.size === 0) {
    return [];
  }

  // Step 2: Union-Find to group adjacent hot cells
  const parent = new Map();

  function find(x, y) {
    const key = `${x},${y}`;
    if (!parent.has(key)) {
      parent.set(key, key);
    }
    const p = parent.get(key);
    if (p !== key) {
      parent.set(key, find(...p.split(',').map(Number)));
    }
    return parent.get(key);
  }

  function union(x1, y1, x2, y2) {
    const root1 = find(x1, y1);
    const root2 = find(x2, y2);
    if (root1 !== root2) {
      parent.set(root1, root2);
    }
  }

  // Build parent map for all hot cells
  const cellArray = Array.from(hotCells).map((k) => k.split(',').map(Number));

  for (const [x, y] of cellArray) {
    // Check 8 neighboring cells
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (hotCells.has(`${nx},${ny}`)) {
          union(x, y, nx, ny);
        }
      }
    }
  }

  // Step 3: Group cells by component
  const components = new Map();
  for (const [x, y] of cellArray) {
    const root = find(x, y);
    if (!components.has(root)) {
      components.set(root, []);
    }
    components.get(root).push([x, y]);
  }

  // Step 4: Compute bounding boxes and expand by padding
  const regions = [];
  for (const cells of components.values()) {
    let minCellX = Infinity;
    let minCellY = Infinity;
    let maxCellX = -Infinity;
    let maxCellY = -Infinity;

    for (const [cx, cy] of cells) {
      minCellX = Math.min(minCellX, cx);
      minCellY = Math.min(minCellY, cy);
      maxCellX = Math.max(maxCellX, cx);
      maxCellY = Math.max(maxCellY, cy);
    }

    // Convert cell coords back to pixel coords
    let x = minCellX * cellSize - padding;
    let y = minCellY * cellSize - padding;
    let w = (maxCellX - minCellX + 1) * cellSize + 2 * padding;
    let h = (maxCellY - minCellY + 1) * cellSize + 2 * padding;

    // Clamp to image bounds
    x = Math.max(0, x);
    y = Math.max(0, y);
    w = Math.min(width - x, w);
    h = Math.min(height - y, h);

    regions.push({
      x,
      y,
      width: w,
      height: h,
      pixelCount: cells.length * cellSize * cellSize,
    });
  }

  // Step 4.5: Filter noise (regions below minimum size/pixel count)
  const minRegionArea = options.minRegionArea ?? 25; // default 5×5 = 25px²
  const minPixelCount = options.minPixelCount ?? 3;

  const filtered = regions.filter(
    (r) =>
      r.width * r.height >= minRegionArea && r.pixelCount >= minPixelCount
  );

  const skippedCount = regions.length - filtered.length;
  if (skippedCount > 0) {
    options.log?.(`Skipped ${skippedCount} noise region(s) below size threshold`);
  }

  // Step 5: Merge overlapping regions
  return mergeOverlappingRegions(filtered);
}

/**
 * Merge regions that overlap
 */
function mergeOverlappingRegions(regions) {
  if (regions.length <= 1) return regions;

  const merged = [];
  const used = new Set();

  for (let i = 0; i < regions.length; i++) {
    if (used.has(i)) continue;

    let region = { ...regions[i] };
    used.add(i);

    // Find all regions that overlap with this one
    for (let j = i + 1; j < regions.length; j++) {
      if (used.has(j)) continue;

      if (regionsOverlap(region, regions[j])) {
        region = mergeTwo(region, regions[j]);
        used.add(j);
      }
    }

    merged.push(region);
  }

  // If we merged anything, recursively check the merged results
  if (merged.length < regions.length) {
    return mergeOverlappingRegions(merged);
  }

  return merged;
}

/**
 * Check if two regions overlap
 */
function regionsOverlap(r1, r2) {
  return !(
    r1.x + r1.width < r2.x ||
    r2.x + r2.width < r1.x ||
    r1.y + r1.height < r2.y ||
    r2.y + r2.height < r1.y
  );
}

/**
 * Merge two regions into their bounding union
 */
function mergeTwo(r1, r2) {
  const x = Math.min(r1.x, r2.x);
  const y = Math.min(r1.y, r2.y);
  const right = Math.max(r1.x + r1.width, r2.x + r2.width);
  const bottom = Math.max(r1.y + r1.height, r2.y + r2.height);

  return {
    x,
    y,
    width: right - x,
    height: bottom - y,
    pixelCount: r1.pixelCount + r2.pixelCount,
  };
}
