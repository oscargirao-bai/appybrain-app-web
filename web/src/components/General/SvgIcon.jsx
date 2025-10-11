import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { normalizeSvg } from '../../utils/svgUtils';

// SvgIcon supports three common input shapes for svg assets:
// 1) Raw SVG XML string (xml containing <svg ...>...)
// 2) A React component (import Teatro from '../assets/teatro.svg') compiled by the svg transformer
// 3) A module with a default export that is a React component
// It renders with the given `size` and will replace `currentColor` in the XML with the provided color.
export default function SvgIcon({ svgString, size = 24, color = '#000' }) {
  if (!svgString) return null;

  // Case A: imported as React component/function (e.g. using react-native-svg-transformer)
  const Component =
    typeof svgString === 'function' ? svgString :
    (svgString && typeof svgString === 'object' && typeof svgString.default === 'function' ? svgString.default : null);

  if (Component) {
    // Some SVG components accept width/height/fill props. Pass them through.
    return (
      <View style={{ width: size, height: size }}>
        {React.createElement(Component, { width: size, height: size, fill: color })}
      </View>
    );
  }

  // Case B: raw SVG XML string
  if (typeof svgString === 'string') {
    // Some APIs return escaped HTML (&lt;svg ...&gt;). Decode common entities first.
    const decodeHtmlEntities = (s) =>
      s.replace(/&lt;/g, '<')
       .replace(/&gt;/g, '>')
       .replace(/&amp;/g, '&')
       .replace(/&quot;/g, '"')
       .replace(/&#39;/g, "'");

    let xml = decodeHtmlEntities(svgString);
    
    // If the API returned only inner markup (e.g. '<path .../>') without an <svg> wrapper,
    // wrap it so SvgXml can render it properly. Use a conservative default viewBox (24x24)
    // rather than the pixel `size`, which avoids coordinate distortion when original SVG
    // uses a different internal coordinate system.
    if (!xml.includes('<svg')) {
      xml = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${xml}</svg>`;
    }
    // Ensure xmlns is present on the root svg (some fragments may be wrapped already but miss xmlns)
    if (xml.includes('<svg') && !/xmlns=/.test(xml)) {
      xml = xml.replace(/<svg(\s|>)/, '<svg xmlns="http://www.w3.org/2000/svg"$1');
    }
    
    // Preprocess the SVG XML to handle common problematic patterns FIRST:
    //  - extract <style> content and inline class-based rules into element attributes
    //  - namespace all ids to avoid collisions when multiple SVGs are rendered
    //  - rewrite references to those ids (url(#...), href="#id", xlink:href="#id")
    const preprocessSvg = (raw) => {
      let out = raw;

      // 1) Extract <style> content and inline class-based rules into element attributes.
      // react-native-svg does not support CSS class selectors, so we convert them.
      const styleMatch = out.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      if (styleMatch) {
        const css = styleMatch[1];
        // parse simple CSS rules: selectors { declarations }
        const classMap = new Map();
        const ruleRe = /([^{}]+)\{([^}]+)\}/g;
        let ruleMatch;
        while ((ruleMatch = ruleRe.exec(css)) !== null) {
          const selectorText = ruleMatch[1].trim();
          const declText = ruleMatch[2].trim();
          // process comma-separated selectors
          selectorText.split(',').forEach(sel => {
            const s = sel.trim();
            const clsMatch = s.match(/\.([A-Za-z0-9_\-]+)/);
            if (clsMatch) {
              const clsName = clsMatch[1];
              // accumulate declarations
              const prev = classMap.get(clsName) || '';
              classMap.set(clsName, (prev ? prev + ';' : '') + declText);
            }
          });
        }

        if (classMap.size > 0) {
          // replace elements with class="..." by adding inline attributes from classMap
          out = out.replace(/<([a-zA-Z0-9:_-]+)([^>]*)class="([^"]+)"([^>]*?)(\s*\/?)>/g, (m, tag, beforeAttrs, classList, afterAttrs, selfClose) => {
            const classes = classList.split(/\s+/).filter(Boolean);
            const existing = (beforeAttrs + ' ' + afterAttrs) || '';
            const attrsParts = [];

            classes.forEach(cn => {
              const decls = classMap.get(cn);
              if (!decls) return;
              decls.split(';').forEach(d => {
                const dd = d.trim();
                if (!dd) return;
                const parts = dd.split(':');
                if (parts.length < 2) return;
                let prop = parts[0].trim();
                let val = parts.slice(1).join(':').trim();
                
                // Convert CSS properties to SVG attributes
                if (prop === 'fill' || prop === 'stroke' || prop === 'opacity' || 
                    prop === 'fill-opacity' || prop === 'stroke-opacity') {
                  // skip if attribute already present
                  const attrRe = new RegExp(prop.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\s*=');
                  if (attrRe.test(existing)) return;
                  // preserve values
                  val = val.replace(/"/g, '&quot;');
                  attrsParts.push(`${prop}="${val}"`);
                } else if (prop === 'stroke-width') {
                  const attrRe = /stroke-width\s*=/;
                  if (attrRe.test(existing)) return;
                  val = val.replace(/"/g, '&quot;');
                  attrsParts.push(`stroke-width="${val}"`);
                } else if (prop === 'stroke-linecap') {
                  const attrRe = /stroke-linecap\s*=/;
                  if (attrRe.test(existing)) return;
                  val = val.replace(/"/g, '&quot;');
                  attrsParts.push(`stroke-linecap="${val}"`);
                } else if (prop === 'stroke-linejoin') {
                  const attrRe = /stroke-linejoin\s*=/;
                  if (attrRe.test(existing)) return;
                  val = val.replace(/"/g, '&quot;');
                  attrsParts.push(`stroke-linejoin="${val}"`);
                } else if (prop === 'stroke-miterlimit') {
                  const attrRe = /stroke-miterlimit\s*=/;
                  if (attrRe.test(existing)) return;
                  val = val.replace(/"/g, '&quot;');
                  attrsParts.push(`stroke-miterlimit="${val}"`);
                } else if (prop === 'stroke-dasharray') {
                  const attrRe = /stroke-dasharray\s*=/;
                  if (attrRe.test(existing)) return;
                  val = val.replace(/"/g, '&quot;');
                  attrsParts.push(`stroke-dasharray="${val}"`);
                } else if (prop === 'stroke-dashoffset') {
                  const attrRe = /stroke-dashoffset\s*=/;
                  if (attrRe.test(existing)) return;
                  val = val.replace(/"/g, '&quot;');
                  attrsParts.push(`stroke-dashoffset="${val}"`);
                } else if (prop === 'clip-path') {
                  const attrRe = /clip-path\s*=/;
                  if (attrRe.test(existing)) return;
                  val = val.replace(/"/g, '&quot;');
                  attrsParts.push(`clip-path="${val}"`);
                }
              });
            });

            // reconstruct tag without class but with new attributes
            const newAttrs = attrsParts.length ? ' ' + attrsParts.join(' ') : '';
            const allAttrs = (beforeAttrs + afterAttrs + newAttrs).trim();
            const closing = selfClose ? '/>' : '>';
            return `<${tag}${allAttrs ? ' ' + allAttrs : ''}${closing}`;
          });
        }

        // Remove the original <style> block entirely (we inlined rules)
        // BUT keep <defs> and other structural elements
        out = out.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      }

      // 2) Namespace ids to avoid collisions when multiple SVGs are injected into same document.
      // Build map of oldId -> newId
      const idMap = new Map();
      const suffix = '_' + Math.random().toString(36).slice(2, 8);
      out = out.replace(/id="([^"]+)"/g, (m, id) => {
        // avoid namespacing common xmlns attributes accidentally
        const newId = `${id}${suffix}`;
        idMap.set(id, newId);
        return `id="${newId}"`;
      });

      if (idMap.size > 0) {
        // Replace url(#id) references
        out = out.replace(/url\(#([^\)]+)\)/g, (m, id) => {
          const nid = idMap.get(id) || id;
          return `url(#${nid})`;
        });
        // Replace href="#id" and xlink:href="#id"
        out = out.replace(/(href|xlink:href)="#([^"]+)"/g, (m, attr, id) => {
          const nid = idMap.get(id) || id;
          return `${attr}="#${nid}"`;
        });
        // Replace references like "#id" inside other attributes (e.g., begin, end) conservatively
        out = out.replace(/"#([^"]+)"/g, (m, id) => {
          const nid = idMap.get(id) || id;
          return `"#${nid}"`;
        });
      }

      return out;
    };

    // First, preprocess to inline CSS classes and namespace IDs
    xml = preprocessSvg(xml);
    
    // Detect if SVG is monochromatic (uses single non-white color)
    const detectColors = (s) => {
      const colors = new Set();
      // Match colors in fill/stroke attributes
      const attrColorRe = /(?:fill|stroke)="([^"']+)"/gi;
      let m;
      while ((m = attrColorRe.exec(s)) !== null) {
        const v = m[1].trim().toLowerCase();
        if (v && v !== 'none' && v !== 'transparent' && v !== 'currentcolor' && 
            !v.match(/#fff(fff)?$/i) && v !== 'white' && v !== 'rgb(255,255,255)') {
          colors.add(v);
        }
      }
      return colors;
    };
    
    const detectedColors = detectColors(xml);
    const isMonochrome = detectedColors.size <= 1;
    
    // Check if SVG has stroke/fill on root element that should be inherited
    const svgRootMatch = xml.match(/<svg[^>]*>/i);
    const rootHasStroke = svgRootMatch && /stroke="(?!none)[^"]*"/i.test(svgRootMatch[0]);
    const rootHasFill = svgRootMatch && /fill="(?!none)[^"]*"/i.test(svgRootMatch[0]);
    
    // Use normalizeSvg to handle viewBox and dimensions
    // For monochrome SVGs, use currentColor mode; for multi-color, preserve colors
    xml = normalizeSvg(xml, { colorMode: isMonochrome ? 'currentColor' : 'preserve' });
    
    // Replace currentColor with the actual color prop
    if (xml.includes('currentColor')) {
      xml = xml.replace(/currentColor/g, color);
    }
    
    // For stroke-only icons: ensure elements with stroke but no fill get fill="none"
    // Also handle case where stroke is inherited from parent SVG element
    xml = xml.replace(/<(path|line|polyline|polygon|rect|circle|ellipse)([^>]*?)(\/?)>/gi, (match, tag, attrs, selfClose) => {
      // Check if element has stroke attribute (with actual color, not "none")
      const hasStroke = /stroke="(?!none)[^"]*"/i.test(attrs);
      // Check if element already has a fill attribute
      const hasFill = /fill=/i.test(attrs);
      
      // If path doesn't have stroke but parent SVG had stroke, or if it has stroke but no fill
      if ((rootHasStroke && !hasStroke && !hasFill) || (hasStroke && !hasFill)) {
        // Add stroke and fill="none" for stroke-only rendering
        const needsStroke = !hasStroke && rootHasStroke;
        const additions = [];
        if (needsStroke) additions.push(`stroke="${color}"`);
        if (!hasFill) additions.push('fill="none"');
        
        // Properly handle self-closing tags
        const addedAttrs = additions.length > 0 ? ` ${additions.join(' ')}` : '';
        return `<${tag}${attrs}${addedAttrs}${selfClose}>`;
      }
      return match;
    });
    
    // Cleanup accidental double slashes before closing brackets introduced by string ops
    xml = xml.replace(/\/\/>/g, '/>').replace(/\s+>/g, '>').replace(/>\s+</g, '><');
    
    // SvgXml will render the XML directly. Allow the svg to control viewBox; set width/height via props.
    try {
      return (
        <View style={{ width: size, height: size }}>
          <SvgXml xml={xml} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
        </View>
      );
    } catch (e) {
      console.warn('SvgIcon: failed to render SVG XML', e);
      return null;
    }
  }

  // Unknown shape
  return null;
}