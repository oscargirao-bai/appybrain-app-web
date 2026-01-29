import React, { useEffect, useRef, useState } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';

/**
 * MathJaxRenderer for Web
 * Renders HTML content with MathJax support using dangerouslySetInnerHTML
 * 
 * MathJax script must be loaded globally in index.html
 */
const MathJaxRenderer = ({ 
  content = '', 
  className = '', 
  inlineDisplay = false, 
  compact = false, 
  enabled = false, 
  as = 'div', 
  baseFontSize = 18, 
  style = {}, 
  onHeightChange, 
  scrollEnabled = true, 
  textAlign = 'left', 
  backgroundColor, 
  textColor, 
  padding = 0,
}) => {
  // (diagnostic logs removed)
  const colors = useThemeColors();
  const containerRef = useRef(null);
  const [processedContent, setProcessedContent] = useState('');
  const [isTypesetting, setIsTypesetting] = useState(false);

  useEffect(() => {
    if (!enabled || !content) {
      setProcessedContent(content || '');
      setIsTypesetting(false);
      return;
    }

    let processed = String(content);

    const decodeEntities = (segment) => segment
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    const commandPattern = /^(frac|sqrt|sum|int|begin|end|left|right|cdot|times|leq|geq|neq|approx|pm|mp|sin|cos|tan|log|ln|pi|theta|alpha|beta|gamma|delta|epsilon|lambda|mu|sigma|omega|phi|psi|rho|tau|vec|overline|underline|hat|bar|tilde|text|mathrm|mathbf|mathbb|mathcal)/;
    const collapseEscapes = (segment) => {
      let result = '';
      let index = 0;
      const length = segment.length;
      while (index < length) {
        const current = segment[index];
        if (current === '\\' && segment[index + 1] === '\\') {
          const rest = segment.slice(index + 2);
          const match = rest.match(/^([a-zA-Z]+)/);
          if (match && commandPattern.test(match[1])) {
            result += '\\';
            index += 2;
            continue;
          }
          // Preserve line breaks like \\y=... inside environments (cases, align, etc.)
          result += '\\\\';
          index += 2;
          continue;
        }
        result += current;
        index += 1;
      }
      return result;
    };
    const normalizeWithinDelimiters = (raw, pattern, wrap) => raw.replace(pattern, (_, inner) => wrap(collapseEscapes(inner)));

    processed = decodeEntities(processed);
    processed = normalizeWithinDelimiters(processed, /\$\$([\s\S]*?)\$\$/g, (inner) => `$$${inner}$$`);
    processed = normalizeWithinDelimiters(processed, /\\\(([\s\S]*?)\\\)/g, (inner) => `\\(${inner}\\)`);
    processed = normalizeWithinDelimiters(processed, /\\\[([\s\S]*?)\\\]/g, (inner) => `\\[${inner}\\]`);
    processed = collapseEscapes(processed);

    if (inlineDisplay) {
      processed = processed.replace(/\\\[/g, '\\(');
      processed = processed.replace(/\\\]/g, '\\)');
    }

    // Log to verify we have math content
    const hasMath = /(\$|\\\(|\\\[|\\begin\{)/.test(processed);
    if (hasMath) {
      console.log('MathJaxRenderer: Detected math notation in content');
    }

    setProcessedContent(processed);

    if (typeof window === 'undefined') {
      return;
    }

    const element = containerRef.current;
    // typeset start (diagnostics removed)
    if (!element) {
      return;
    }
    if (!window.MathJax) {
      // If MathJax isn't loaded yet log and bail out
      try { console.warn('MathJaxRenderer: window.MathJax not available at typeset time'); } catch (e) {}
      return;
    }

    let canceled = false;
    let rafId;

    setIsTypesetting(true);

    const runTypeset = async () => {
      if (canceled || !window.MathJax || !element) {
        setIsTypesetting(false);
        return;
      }
      // Wait a short while for the element to have layout (visible sizes) before typesetting.
      const waitForVisible = (el, timeout = 500) => new Promise((resolve) => {
        const start = Date.now();
        const check = () => {
          try {
            const style = window.getComputedStyle(el);
            const visible = el.offsetWidth > 0 && el.offsetHeight > 0 && style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity || '1') > 0;
            if (visible) {
              console.log('MathJaxRenderer: Element became visible, proceeding with typeset');
              return resolve(true);
            }
          } catch (e) {
            // ignore
          }
          if (Date.now() - start > timeout) {
            console.warn('MathJaxRenderer: Element did not become visible within timeout');
            return resolve(false);
          }
          setTimeout(check, 50);
        };
        check();
      });

  const becameVisible = await waitForVisible(element, 1200);

      try {
        // Clear previous typeset state first and wait for it to complete
        if (typeof window.MathJax.typesetClear === 'function') {
          await window.MathJax.typesetClear([element]);
        } else if (typeof window.MathJax.texReset === 'function') {
          window.MathJax.texReset();
        }
      } catch (clearError) {
        console.warn('MathJax clear error:', clearError);
      }

      if (canceled) return;

      const promise = window.MathJax.typesetPromise ? window.MathJax.typesetPromise([element]) : null;
      if (!promise) {
        setIsTypesetting(false);
        return;
      }

      promise
        .then(() => {
          if (canceled) return;
          console.log('MathJax typeset completed successfully');
          setIsTypesetting(false);
          if (onHeightChange && containerRef.current) {
            onHeightChange(containerRef.current.scrollHeight);
          }
        })
        .catch((err) => {
          if (canceled) return;
          console.error('MathJax processing error:', err);
          setIsTypesetting(false);
          
          // Retry once after a short delay
          setTimeout(() => {
            if (canceled || !window.MathJax || !element) return;
            console.log('MathJax: Retrying typeset after error');
            window.MathJax.typesetPromise([element])
              .then(() => console.log('MathJax retry successful'))
              .catch((retryErr) => console.error('MathJax retry failed:', retryErr));
          }, 500);
        });
    };

    rafId = requestAnimationFrame(runTypeset);

    return () => {
      canceled = true;
      if (typeof cancelAnimationFrame === 'function' && rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [content, enabled, inlineDisplay, onHeightChange]);

  const containerStyle = {
    fontSize: baseFontSize,
    fontFamily: 'Work Sans, sans-serif',
    textAlign,
    backgroundColor: backgroundColor || 'transparent',
    color: textColor || colors.text,
    padding,
    margin: compact ? 0 : undefined,
    overflowY: scrollEnabled ? 'auto' : 'hidden',
    overflowX: 'hidden',
    lineHeight: 1.5,
    opacity: isTypesetting ? 0.7 : 1,
    transition: 'opacity 0.2s',
    ...style,
  };

  const Tag = as;

  return (
    <Tag
      ref={containerRef}
      className={className}
      style={containerStyle}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

export default MathJaxRenderer;
