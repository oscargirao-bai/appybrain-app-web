/**
 * Converts an SVG string into a Base64-encoded Data URL.
 * This is the recommended method for displaying dynamic SVGs as it encapsulates them,
 * preventing style and ID conflicts.
 *
 * Example usage:
 * ```javascript
 * import { createSvgDataUrl } from '../utils/svgUtils';
 * 
 * const svgString = '<svg><path d="M10 10 L20 20"/></svg>';
 * const dataUrl = createSvgDataUrl(svgString, '#FF0000');
 * // Use with Image component:
 * <Image source={{ uri: dataUrl }} style={{ width: 24, height: 24 }} />
 * ```
 *
 * @param {string|null|undefined} svgString - The raw SVG string.
 * @param {string} color - The color to apply to the SVG's fill and stroke.
 * @returns {string} A Data URL string (e.g., "data:image/svg+xml;base64,...").
 */
export const createSvgDataUrl = (svgString, color) => {
  if (!svgString) {
    return '';
  }

  // Replace hardcoded fills, strokes, and currentColor with the desired color
  const processedSvg = svgString
    .replace(/fill="(?!none\b)[^"]*"/gi, `fill="${color}"`)
    .replace(/stroke="(?!none\b)[^"]*"/gi, `stroke="${color}"`)
    .replace(/currentColor/gi, color);

  // Use Buffer for server-side or environments where btoa is not defined
  if (typeof btoa === 'undefined') {
    return `data:image/svg+xml;base64,${Buffer.from(processedSvg).toString('base64')}`;
  }
  
  return `data:image/svg+xml;base64,${btoa(processedSvg)}`;
};

/**
 * Cleans and prepares an SVG string to be used with `dangerouslySetInnerHTML`.
 * It replaces fill and stroke colors with 'currentColor' so the color can be controlled
 * by the parent element's `color` CSS property.
 *
 * @param {string|null|undefined} svgString - The raw SVG string.
 * @param {Object} options - Configuration options.
 * @param {'currentColor'|'preserve'} options.colorMode - Color mode (default: 'currentColor').
 * @returns {string} A normalized SVG string.
 */
export const normalizeSvg = (svgString, options = {}) => {
  if (!svgString) return '';
  const colorMode = options.colorMode || 'currentColor';

  // Compact and prep string
  let svg = String(svgString).replace(/\n|\r/g, '').trim();

  // If not an SVG, just return as-is after color normalization
  const hasSvg = /<svg\b[^>]*>/i.test(svg);
  if (!hasSvg) {
    if (colorMode === 'currentColor') {
      return svg
        .replace(/fill="(?!none\b)[^"]*"/gi, 'fill="currentColor"')
        .replace(/stroke="(?!none\b)[^"]*"/gi, 'stroke="currentColor"');
    }
    return svg; // preserve
  }

  const openTagMatch = svg.match(/<svg\b([^>]*)>/i);
  const attrs = openTagMatch ? openTagMatch[1] : '';

  // Extract width/height/viewBox/style
  const widthMatch = attrs.match(/\bwidth="([^"]+)"/i);
  const heightMatch = attrs.match(/\bheight="([^"]+)"/i);
  const viewBoxMatch = attrs.match(/\bviewBox="([^"]+)"/i);
  const styleMatch = attrs.match(/\bstyle="([^"]*)"/i);

  const parseSize = (v) => {
    if (!v) return undefined;
    const num = parseFloat(v);
    return Number.isFinite(num) ? num : undefined;
  };
  const w = parseSize(widthMatch?.[1]);
  const h = parseSize(heightMatch?.[1]);

  // Build new attribute string: remove width/height/fill/stroke/style/viewBox, keep others
  const removeGroup = colorMode === 'currentColor' ? '(width|height|fill|stroke|style|viewBox)' : '(width|height|viewBox)';
  const cleaned = attrs
    .replace(new RegExp(`\\s${removeGroup}="[^"]*"`, 'gi'), '')
    .replace(/\s+/g, ' ')
    .trim();

  const vb = viewBoxMatch?.[1]
    ? viewBoxMatch[1]
    : (w && h ? `0 0 ${w} ${h}` : '0 0 24 24');

  // Merge style to ensure display:block (avoid baseline gap) and allow inheriting color
  const mergedStyle = (() => {
    const existing = styleMatch?.[1] || '';
    const styleObj = {};
    existing.split(';').forEach(pair => {
      const [k, v] = pair.split(':').map(s => s?.trim());
      if (k && v) styleObj[k] = v;
    });
    styleObj.display = 'block';
    // Rebuild style string
    return Object.entries(styleObj).map(([k, v]) => `${k}:${v}`).join(';');
  })();

  // Compose new opening tag
  const newOpen = `<svg ${cleaned}${cleaned ? ' ' : ''}viewBox="${vb}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="${mergedStyle}">`;
  svg = svg.replace(/<svg\b[^>]*>/i, newOpen);

  // Normalize colors depending on mode
  if (colorMode === 'currentColor') {
    svg = svg
      .replace(/fill="(?!none\b)[^"]*"/gi, 'fill="currentColor"')
      .replace(/stroke="(?!none\b)[^"]*"/gi, 'stroke="currentColor"');
    
    // For stroke-only icons: if a path/shape has stroke but no explicit fill attribute, add fill="none"
    // This prevents unwanted default black fill on stroke-only SVGs
    svg = svg.replace(/<(path|line|polyline|polygon|rect|circle|ellipse)([^>]*stroke="currentColor"[^>]*?)>/gi, (match, tag, attrs) => {
      // Check if this element already has a fill attribute
      if (/fill=/i.test(attrs)) {
        return match; // Already has fill, don't modify
      }
      // No fill attribute found, add fill="none" to make it stroke-only
      return `<${tag}${attrs} fill="none">`;
    });
  }

  return svg;
};
