import { rgbStringToHex, colorsMatch, parsePx } from '../utils/color.js';

/**
 * Compare DOM computed styles against Figma design styles
 * Returns array of detected style mismatches with fix suggestions
 */
export function compareStyles(domStyles, figmaStyles, elementInfo) {
  if (!domStyles || !figmaStyles) {
    return [];
  }

  const issues = [];

  // Font size comparison
  if (figmaStyles.fontSize) {
    const domFontSize = parsePx(domStyles.fontSize);
    const figFontSize = figmaStyles.fontSize;
    const diff = Math.abs(domFontSize - figFontSize);

    if (diff >= 1) {
      issues.push({
        type: 'font-size',
        severity: diff > 2 ? 'high' : 'medium',
        element: elementInfo.selector,
        description: `Font size is ${domFontSize}px but Figma shows ${figFontSize}px`,
        cssFix: `${elementInfo.selector} { font-size: ${figFontSize}px; }`,
      });
    }
  }

  // Font weight comparison
  if (figmaStyles.fontWeight) {
    const domWeight = parseInt(domStyles.fontWeight) || 400;
    const figWeight = figmaStyles.fontWeight;

    if (domWeight !== figWeight) {
      issues.push({
        type: 'font-weight',
        severity: 'medium',
        element: elementInfo.selector,
        description: `Font weight is ${domWeight} but Figma shows ${figWeight}`,
        cssFix: `${elementInfo.selector} { font-weight: ${figWeight}; }`,
      });
    }
  }

  // Line height comparison
  if (figmaStyles.lineHeight) {
    const domLineHeight = parsePx(domStyles.lineHeight);
    const figLineHeight = figmaStyles.lineHeight;

    if (Math.abs(domLineHeight - figLineHeight) >= 1) {
      issues.push({
        type: 'line-height',
        severity: 'low',
        element: elementInfo.selector,
        description: `Line height is ${domLineHeight}px but Figma shows ${figLineHeight}px`,
        cssFix: `${elementInfo.selector} { line-height: ${figLineHeight}px; }`,
      });
    }
  }

  // Color comparison (text color)
  if (figmaStyles.color) {
    const domColor = rgbStringToHex(domStyles.color);
    const figColor = figmaStyles.color;

    if (domColor && figColor && !colorsMatch(domColor, figColor)) {
      issues.push({
        type: 'color',
        severity: 'high',
        element: elementInfo.selector,
        description: `Text color is ${domColor} but Figma shows ${figColor}`,
        cssFix: `${elementInfo.selector} { color: ${figColor}; }`,
      });
    }
  }

  // Background color comparison
  if (figmaStyles.background) {
    const domBg = rgbStringToHex(domStyles.backgroundColor);
    const figBg = figmaStyles.background;

    if (domBg && figBg && !colorsMatch(domBg, figBg)) {
      issues.push({
        type: 'background-color',
        severity: 'high',
        element: elementInfo.selector,
        description: `Background color is ${domBg} but Figma shows ${figBg}`,
        cssFix: `${elementInfo.selector} { background-color: ${figBg}; }`,
      });
    }
  }

  // Padding comparisons
  const paddingSides = ['Top', 'Right', 'Bottom', 'Left'];
  for (const side of paddingSides) {
    const side_lower = side.toLowerCase();
    const figKey = `padding${side_lower.charAt(0).toUpperCase()}${side_lower.slice(1)}`;

    if (figmaStyles[figKey] !== undefined) {
      const domPad = parsePx(domStyles[`padding${side}`]);
      const figPad = figmaStyles[figKey];
      const diff = Math.abs(domPad - figPad);

      if (diff >= 2) {
        issues.push({
          type: `padding-${side_lower}`,
          severity: diff > 4 ? 'medium' : 'low',
          element: elementInfo.selector,
          description: `Padding-${side_lower} is ${domPad}px but Figma shows ${figPad}px`,
          cssFix: `${elementInfo.selector} { padding-${side_lower}: ${figPad}px; }`,
        });
      }
    }
  }

  // Margin comparisons
  const marginSides = ['Top', 'Right', 'Bottom', 'Left'];
  for (const side of marginSides) {
    const side_lower = side.toLowerCase();
    const figKey = `margin${side_lower.charAt(0).toUpperCase()}${side_lower.slice(1)}`;

    if (figmaStyles[figKey] !== undefined) {
      const domMar = parsePx(domStyles[`margin${side}`]);
      const figMar = figmaStyles[figKey];
      const diff = Math.abs(domMar - figMar);

      if (diff >= 2) {
        issues.push({
          type: `margin-${side_lower}`,
          severity: 'low',
          element: elementInfo.selector,
          description: `Margin-${side_lower} is ${domMar}px but Figma shows ${figMar}px`,
          cssFix: `${elementInfo.selector} { margin-${side_lower}: ${figMar}px; }`,
        });
      }
    }
  }

  // Border radius comparison
  if (figmaStyles.borderRadius !== undefined) {
    const domRadius = parsePx(domStyles.borderRadius);
    const figRadius = figmaStyles.borderRadius;

    if (Math.abs(domRadius - figRadius) >= 1) {
      issues.push({
        type: 'border-radius',
        severity: 'low',
        element: elementInfo.selector,
        description: `Border radius is ${domRadius}px but Figma shows ${figRadius}px`,
        cssFix: `${elementInfo.selector} { border-radius: ${figRadius}px; }`,
      });
    }
  }

  // ===== SMART DETECTION CHECKS =====

  // Gap/spacing check (flexbox gap between children)
  if (figmaStyles.itemSpacing !== undefined && figmaStyles.itemSpacing !== null) {
    const domGap = parsePx(domStyles.gap || domStyles.columnGap || domStyles.rowGap || '0');
    const diff = Math.abs(domGap - figmaStyles.itemSpacing);

    if (diff >= 2) {
      issues.push({
        type: 'gap',
        severity: diff > 4 ? 'medium' : 'low',
        element: elementInfo.selector,
        description: `Gap is ${domGap}px but Figma shows ${figmaStyles.itemSpacing}px`,
        cssFix: `${elementInfo.selector} { gap: ${figmaStyles.itemSpacing}px; }`,
      });
    }
  }

  // Alignment check (flexbox alignItems)
  const alignMap = {
    MIN: 'flex-start',
    CENTER: 'center',
    MAX: 'flex-end',
    SPACE_BETWEEN: 'space-between',
  };

  if (figmaStyles.counterAxisAlignItems) {
    const figAlign = alignMap[figmaStyles.counterAxisAlignItems];
    if (figAlign && domStyles.alignItems !== figAlign) {
      issues.push({
        type: 'align-items',
        severity: 'medium',
        element: elementInfo.selector,
        description: `Align items is ${domStyles.alignItems || 'default'} but Figma shows ${figAlign}`,
        cssFix: `${elementInfo.selector} { align-items: ${figAlign}; }`,
      });
    }
  }

  // Justify content check (flexbox justifyContent)
  if (figmaStyles.primaryAxisAlignItems) {
    const figJustify = alignMap[figmaStyles.primaryAxisAlignItems];
    if (figJustify && domStyles.justifyContent !== figJustify) {
      issues.push({
        type: 'justify-content',
        severity: 'medium',
        element: elementInfo.selector,
        description: `Justify content is ${domStyles.justifyContent || 'default'} but Figma shows ${figJustify}`,
        cssFix: `${elementInfo.selector} { justify-content: ${figJustify}; }`,
      });
    }
  }

  // Text alignment check
  const textAlignMap = { LEFT: 'left', CENTER: 'center', RIGHT: 'right', JUSTIFIED: 'justify' };

  if (figmaStyles.textAlignHorizontal) {
    const figTextAlign = textAlignMap[figmaStyles.textAlignHorizontal];
    if (figTextAlign && domStyles.textAlign !== figTextAlign) {
      issues.push({
        type: 'text-align',
        severity: 'low',
        element: elementInfo.selector,
        description: `Text alignment is ${domStyles.textAlign || 'default'} but Figma shows ${figTextAlign}`,
        cssFix: `${elementInfo.selector} { text-align: ${figTextAlign}; }`,
      });
    }
  }

  return issues;
}

/**
 * Flatten and normalize DOM styles from element
 * Handles null values and unit conversions
 */
export function normalizeDomStyles(computedStyles) {
  return {
    fontSize: computedStyles.fontSize,
    fontWeight: computedStyles.fontWeight,
    lineHeight: computedStyles.lineHeight,
    letterSpacing: computedStyles.letterSpacing,
    color: computedStyles.color,
    backgroundColor: computedStyles.backgroundColor,
    paddingTop: computedStyles.paddingTop,
    paddingRight: computedStyles.paddingRight,
    paddingBottom: computedStyles.paddingBottom,
    paddingLeft: computedStyles.paddingLeft,
    marginTop: computedStyles.marginTop,
    marginRight: computedStyles.marginRight,
    marginBottom: computedStyles.marginBottom,
    marginLeft: computedStyles.marginLeft,
    borderRadius: computedStyles.borderRadius,
    fontFamily: computedStyles.fontFamily,
    textAlign: computedStyles.textAlign,
    // Flexbox and spacing
    gap: computedStyles.gap,
    columnGap: computedStyles.columnGap,
    rowGap: computedStyles.rowGap,
    display: computedStyles.display,
    flexDirection: computedStyles.flexDirection,
    justifyContent: computedStyles.justifyContent,
    alignItems: computedStyles.alignItems,
    position: computedStyles.position,
  };
}
