import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useThemeColors } from './Theme';

// Lightweight web implementation: render processed HTML directly into the DOM
// and report height changes via ResizeObserver. No WebView is used on web.

export default function HtmlRender({ html, baseFontSize = 18, textColor, linkColor, onHeightChange, style, scrollEnabled = false }) {
  const colors = useThemeColors();
  const contentRef = useRef(null);
  const resizeObsRef = useRef(null);

  const resolvedText = textColor || colors.text;
  const resolvedLink = linkColor || colors.primary;

  const processedHtml = useMemo(() => processSimpleMath(html || ''), [html]);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    node.innerHTML = processedHtml;

    // Apply base styles
    node.style.color = resolvedText;
    node.style.fontSize = `${baseFontSize}px`;
    node.style.lineHeight = '1.5';
    node.style.fontFamily = "-apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, sans-serif";

    // Set link color via inline stylesheet for anchors
    const styleId = 'html-render-web-style';
    let styleEl = node.querySelector(`#${styleId}`);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      node.prepend(styleEl);
    }
    styleEl.textContent = `a { color: ${resolvedLink}; } img { max-width: 100%; height: auto; } pre, code { white-space: pre-wrap; word-break: break-word; }`;

    // Observe height changes
    if (resizeObsRef.current) resizeObsRef.current.disconnect();
    resizeObsRef.current = new ResizeObserver(() => {
      try {
        const h = Math.ceil(node.scrollHeight || node.clientHeight || 0);
        if (typeof onHeightChange === 'function') onHeightChange(Math.max(20, h));
      } catch (e) {
        console.error('HtmlRender.web height observer error:', e);
      }
    });
    resizeObsRef.current.observe(node);

    // Initial callback
    const initialH = Math.ceil(node.scrollHeight || node.clientHeight || 0);
    if (typeof onHeightChange === 'function') onHeightChange(Math.max(20, initialH));

    return () => {
      if (resizeObsRef.current) resizeObsRef.current.disconnect();
    };
  }, [processedHtml, resolvedText, resolvedLink, baseFontSize, onHeightChange]);

  return (
    <View style={style}>
      <div
        ref={contentRef}
        style={{
          width: '100%',
          backgroundColor: 'transparent',
          overflow: scrollEnabled ? 'auto' : 'hidden',
        }}
      />
    </View>
  );
}

// Keep a small inline TeX -> HTML beautifier like native HtmlRender
function processSimpleMath(bodyHtml) {
  let processedHtml = bodyHtml || '';

  // \frac{a}{b}
  processedHtml = processedHtml.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g,
    '<span style="display:inline-block;text-align:center;font-style:italic;font-family:serif;vertical-align:middle;font-size:.9em;"><span style="display:block;border-bottom:1px solid;padding:0 3px;font-size:.85em;">$1</span><span style="display:block;padding:0 3px;font-size:.85em;">$2</span></span>');

  // Inline math: \(x\) and $x$
  processedHtml = processedHtml.replace(/\\\(([^)\\]+)\\\)/g, '<em style="font-style:italic;font-family:serif;">$1</em>');
  processedHtml = processedHtml.replace(/\$([^$]+)\$/g, '<em style="font-style:italic;font-family:serif;">$1</em>');

  // Block math: \[x\] and $$x$$
  processedHtml = processedHtml.replace(/\\\[([^\]]+)\\\]/g, '<div style="text-align:center;font-style:italic;font-family:serif;margin:10px 0;">$1</div>');
  processedHtml = processedHtml.replace(/\$\$([^$]+)\$\$/g, '<div style="text-align:center;font-style:italic;font-family:serif;margin:10px 0;">$1</div>');

  return processedHtml;
}
