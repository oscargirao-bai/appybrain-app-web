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
  const colors = useThemeColors();
  const containerRef = useRef(null);
  const [processedContent, setProcessedContent] = useState('');
  const [isTypesetting, setIsTypesetting] = useState(false);

  useEffect(() => {
    if (!enabled || !content) {
      setProcessedContent(content);
      return;
    }

    // Process content for MathJax
    let processed = String(content);
    
    // Normalize double backslashes in LaTeX (API often sends \\frac instead of \frac)
    processed = processed.replace(/\\\\\\\\/g, '\\\\');
    processed = processed.replace(/\\\\\(/g, '\\(');
    processed = processed.replace(/\\\\\)/g, '\\)');
    processed = processed.replace(/\\\\\[/g, '\\[');
    processed = processed.replace(/\\\\\]/g, '\\]');

    if (inlineDisplay) {
      // Force display math to render inline
      processed = processed.replace(/\\\[/g, '\\(');
      processed = processed.replace(/\\\]/g, '\\)');
    }

    setProcessedContent(processed);

    // Trigger MathJax to process the content after DOM update
    if (typeof window !== 'undefined' && window.MathJax && containerRef.current) {
      setIsTypesetting(true);
      
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (window.MathJax.typesetPromise && containerRef.current) {
          window.MathJax.typesetPromise([containerRef.current])
            .then(() => {
              setIsTypesetting(false);
              // Notify height change if callback provided
              if (onHeightChange && containerRef.current) {
                onHeightChange(containerRef.current.scrollHeight);
              }
            })
            .catch((err) => {
              console.error('MathJax processing error:', err);
              setIsTypesetting(false);
            });
        } else {
          setIsTypesetting(false);
        }
      });
    }
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
