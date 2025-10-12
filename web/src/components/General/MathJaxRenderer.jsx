import React, { useEffect, useRef, useState } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';

/**
 * MathJaxRenderer for Web
 * Renders HTML content with MathJax support using dangerouslySetInnerHTML
 * 
 * For production: Load MathJax script in index.html
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

  useEffect(() => {
    if (!enabled || !content) {
      setProcessedContent(content);
      return;
    }

    // Process content for MathJax
    let processed = String(content);
    
    // Convert inline math delimiters if needed
    processed = processed.replace(/\\\(/g, '\\(');
    processed = processed.replace(/\\\)/g, '\\)');
    processed = processed.replace(/\\\[/g, '\\[');
    processed = processed.replace(/\\\]/g, '\\]');

    if (inlineDisplay) {
      // Force display math to render inline
      processed = processed.replace(/\\\[/g, '\\(');
      processed = processed.replace(/\\\]/g, '\\)');
    }

    setProcessedContent(processed);

    // Trigger MathJax to process the content
    if (typeof window !== 'undefined' && window.MathJax) {
      setTimeout(() => {
        window.MathJax.typesetPromise?.([containerRef.current])
          .then(() => {
            // Notify height change if callback provided
            if (onHeightChange && containerRef.current) {
              onHeightChange(containerRef.current.scrollHeight);
            }
          })
          .catch((err) => console.error('MathJax processing error:', err));
      }, 100);
    }
  }, [content, enabled, inlineDisplay, onHeightChange]);

  const containerStyle = {
    fontSize: baseFontSize,
    textAlign,
    backgroundColor: backgroundColor || 'transparent',
    color: textColor || colors.text,
    padding,
    margin: compact ? 0 : undefined,
    overflowY: scrollEnabled ? 'auto' : 'hidden',
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
