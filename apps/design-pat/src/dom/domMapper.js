/**
 * Map bounding box regions to live DOM elements
 * Uses elementFromPoint to find elements at multiple sample points within each region
 */

export async function mapRegionToElements(page, region) {
  const { x, y, width, height } = region;

  // Sample 5 points: center + 4 corners (inset by 2px to avoid edge artifacts)
  const samplePoints = [
    { x: x + width / 2, y: y + height / 2 }, // center
    { x: x + 2, y: y + 2 }, // top-left
    { x: x + width - 2, y: y + 2 }, // top-right
    { x: x + 2, y: y + height - 2 }, // bottom-left
    { x: x + width - 2, y: y + height - 2 }, // bottom-right
  ];

  try {
    const elements = await page.evaluate((points) => {
      // Run all lookups in a single evaluate call for efficiency
      return points.map(({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        if (!el) return null;

        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        return {
          tagName: el.tagName.toLowerCase(),
          className: el.className || '',
          id: el.id || '',
          textContent: (el.textContent || '')
            .trim()
            .slice(0, 100)
            .replace(/\s+/g, ' '),
          selector: buildSelector(el),
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
          computedStyles: {
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            color: style.color,
            backgroundColor: style.backgroundColor,
            paddingTop: style.paddingTop,
            paddingRight: style.paddingRight,
            paddingBottom: style.paddingBottom,
            paddingLeft: style.paddingLeft,
            marginTop: style.marginTop,
            marginRight: style.marginRight,
            marginBottom: style.marginBottom,
            marginLeft: style.marginLeft,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
            borderRadius: style.borderRadius,
            fontFamily: style.fontFamily,
            textAlign: style.textAlign,
            // Flexbox and spacing (for smart detection)
            gap: style.gap,
            columnGap: style.columnGap,
            rowGap: style.rowGap,
            display: style.display,
            flexDirection: style.flexDirection,
            justifyContent: style.justifyContent,
            alignItems: style.alignItems,
            position: style.position,
          },
          // Parent and sibling rects for alignment detection
          parentRect: (() => {
            const pr = el.parentElement?.getBoundingClientRect();
            return pr
              ? {
                  x: pr.x,
                  y: pr.y,
                  width: pr.width,
                  height: pr.height,
                }
              : null;
          })(),
        };
      }).filter(Boolean);

      // Helper to build a simple CSS selector for an element
      function buildSelector(el) {
        if (el.id) return `#${el.id}`;

        const parts = [el.tagName.toLowerCase()];

        if (el.className) {
          const classes = el.className
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .join('.');
          if (classes) {
            parts.push(`.${classes}`);
          }
        }

        return parts.join('');
      }
    }, samplePoints);

    // Deduplicate by selector — multiple points may hit the same element
    const seen = new Set();
    const unique = elements.filter((el) => {
      if (seen.has(el.selector)) return false;
      seen.add(el.selector);
      return true;
    });

    return unique;
  } catch (error) {
    console.error(`Failed to map region to DOM elements: ${error.message}`);
    return [];
  }
}
