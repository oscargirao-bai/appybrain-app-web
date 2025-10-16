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
  // Debug: log incoming props to inspect what is being rendered (temporary)
  try {
    console.log('MathJaxRenderer props:', { content, enabled, inlineDisplay, compact, as, baseFontSize, textColor, padding });
  } catch (e) {
    // avoid throwing during render
  }
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
    const needsCollapse = /[a-zA-Z()[\]{}]/;
    const collapseEscapes = (segment) => {
      let result = '';
      let index = 0;
      const length = segment.length;
      while (index < length) {
        const current = segment[index];
        if (
          current === '\\' &&
          segment[index + 1] === '\\' &&
          needsCollapse.test(segment[index + 2] || '')
        ) {
          result += '\\';
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

    setProcessedContent(processed);

    if (typeof window === 'undefined') {
      return;
    }

    const element = containerRef.current;
    if (!window.MathJax || !element) {
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
          setIsTypesetting(false);
          if (onHeightChange && containerRef.current) {
            onHeightChange(containerRef.current.scrollHeight);
          }
        })
        .catch((err) => {
          if (canceled) return;
          console.error('MathJax processing error:', err);
          setIsTypesetting(false);
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
