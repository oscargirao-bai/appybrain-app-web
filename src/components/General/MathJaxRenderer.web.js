import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useThemeColors } from '../../services/Theme';

// Web implementation: inject MathJax v3 once, then typeset content inside a div.

const ensureMathJax = () => {
  if (window.MathJax) return Promise.resolve();
  if (document.getElementById('mathjax-script')) return new Promise((res) => {
    const check = () => {
      if (window.MathJax) res(); else setTimeout(check, 30);
    };
    check();
  });

  window.MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true,
      processEnvironments: true,
    },
    svg: { fontCache: 'global' },
    options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'] },
  };

  const s = document.createElement('script');
  s.id = 'mathjax-script';
  s.async = true;
  s.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
  document.head.appendChild(s);

  return new Promise((resolve) => {
    const check = () => {
      if (window.MathJax && window.MathJax.typesetPromise) resolve(); else setTimeout(check, 50);
    };
    check();
  });
};

export default function MathJaxRenderer({
  content = '',
  className = '',
  inlineDisplay = false,
  compact = false,
  enabled = false,
  as = 'div',
  baseFontSize = 18,
  style,
  onHeightChange,
  scrollEnabled = false,
  textAlign = 'left',
  backgroundColor,
  textColor,
  padding = 0,
}) {
  const colors = useThemeColors();
  const containerRef = useRef(null);
  const resizeObsRef = useRef(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const node = containerRef.current;
    if (!node) return;

    // Apply base styles
    node.style.opacity = '0';
    node.style.transition = 'opacity 0.15s ease-out';
    node.style.textAlign = textAlign;
    node.style.padding = `${padding}px`;
    node.style.background = backgroundColor || 'transparent';
    node.style.color = textColor || colors.text;
    node.style.fontSize = `${baseFontSize}px`;
    node.style.lineHeight = '1.5';
    node.style.fontFamily = "Work Sans, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, sans-serif";

    // Set content
    node.innerHTML = content || '';

    // Observe height
    if (resizeObsRef.current) resizeObsRef.current.disconnect();
    resizeObsRef.current = new ResizeObserver(() => {
      try {
        const h = Math.ceil(node.scrollHeight || node.clientHeight || 0);
        if (typeof onHeightChange === 'function') onHeightChange(Math.max(20, h));
      } catch (e) {
        console.error('MathJaxRenderer.web height observer error:', e);
      }
    });
    resizeObsRef.current.observe(node);

    // Typeset if enabled
    (async () => {
      try {
        if (enabled) await ensureMathJax();
        if (cancelled) return;

        if (enabled && window.MathJax && window.MathJax.typesetPromise) {
          await window.MathJax.typesetPromise([node]);
        }
        if (inlineDisplay) {
          node.querySelectorAll('mjx-container[display="true"]').forEach((n) => {
            n.style.display = 'inline-block';
            n.style.textAlign = 'left';
            if (compact) n.style.margin = '0 .35em';
          });
        }
        if (compact) {
          node.querySelectorAll('mjx-container').forEach((n) => {
            n.style.marginTop = '0';
            n.style.marginBottom = '0';
          });
        }
        node.style.opacity = '1';
        setIsRendered(true);

        // Initial height callback
        const h = Math.ceil(node.scrollHeight || node.clientHeight || 0);
        if (typeof onHeightChange === 'function') onHeightChange(Math.max(20, h));
      } catch (e) {
        console.error('MathJaxRenderer.web typeset error:', e);
        node.style.opacity = '1';
        setIsRendered(true);
      }
    })();

    return () => {
      cancelled = true;
      if (resizeObsRef.current) resizeObsRef.current.disconnect();
    };
  }, [content, enabled, inlineDisplay, compact, baseFontSize, textAlign, padding, backgroundColor, textColor, colors.text, onHeightChange]);

  return (
    <View style={style}>
      <div
        ref={containerRef}
        className={className}
        style={{
          width: '100%',
          backgroundColor: backgroundColor || 'transparent',
          overflow: scrollEnabled ? 'auto' : 'hidden',
        }}
        role="article"
        aria-live={isRendered ? 'off' : 'polite'}
      />
    </View>
  );
}
