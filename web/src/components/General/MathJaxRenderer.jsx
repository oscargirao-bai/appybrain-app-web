import React, { useEffect, useRef, useState } from 'react';

import { WebView } from 'react-native-webview';
import { useThemeColors } from '../../services/Theme';

/**
 * MathJaxRenderer for React Native
 * Renders HTML content with proper MathJax support in a WebView
 * 
 * Props:
 *  - content: string (required) - HTML content with LaTeX math
 *  - className?: string - additional CSS classes
 *  - inlineDisplay?: boolean - force display math to appear inline
 *  - compact?: boolean - remove top/bottom margins around formulas
 *  - enabled?: boolean - when false, skip MathJax processing (default false)
 *  - as?: 'div' | 'span' - HTML tag to render as
 *  - baseFontSize?: number - base font size (default 18)
 *  - style?: object - React Native style object
 *  - onHeightChange?: function - callback when height changes
 *  - scrollEnabled?: boolean - allow scrolling in WebView
 *  - textAlign?: 'left' | 'center' | 'right' - text alignment (default 'left')
 *  - backgroundColor?: string - background color override (default 'transparent')
 *  - textColor?: string - text color override (default from theme)
 *  - padding?: number - content padding in pixels (default 0)
 */
const MathJaxRenderer = ({ 
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
  padding = 0
}) => {
  const colors = useThemeColors();
  const webRef = useRef(null);
  const [height, setHeight] = useState(40);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset loaded state when content changes
  useEffect(() => {
    if (enabled) {
      setIsLoaded(false);
      // Shorter timeout for compact inline displays, longer for full content
      const timeoutDuration = (compact && inlineDisplay) ? 1200 : 1500;
      const fallbackTimer = setTimeout(() => {
        if (!isLoaded) {
          // console.debug(`[MathJax] Fallback timeout (${timeoutDuration}ms) - showing content`); // Disabled to reduce log noise
          setIsLoaded(true);
        }
      }, timeoutDuration);
      
      return () => clearTimeout(fallbackTimer);
    } else {
      setIsLoaded(true);
    }
  }, [content, enabled, isLoaded, compact, inlineDisplay]);

  const buildHtmlTemplate = (bodyContent, options = {}) => {
    const {
      fontSize = baseFontSize,
      textColor = colors.text,
      backgroundColor = 'transparent',
      inlineDisplay: inline = false,
      compact: isCompact = false,
      enabled: mathEnabled = false,
      textAlign: alignment = 'left',
      padding: contentPadding = 0
    } = options;

    // If MathJax is disabled, return content as-is
    const processedContent = mathEnabled ? bodyContent : bodyContent;

    const mathJaxConfig = mathEnabled ? `
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
          displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
          processEscapes: true,
          processEnvironments: true
        },
        options: {
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
          // Add custom ignore class to protect editable areas
          ignoreHtmlClass: 'tex2jax_ignore|mathjax-ignore',
          processHtmlClass: 'tex2jax_process|mathjax-process'
        },
        svg: {
          fontCache: 'global'
        },
        startup: {
          typeset: true, // enable automatic typeset globally; we'll opt-out via mathjax-ignore where needed
          ready: () => {
            try {
              window.MathJax.startup.defaultReady();
            } catch (e) {
              console.error('MathJax startup defaultReady error:', e);
            }
            console.debug('[MathJax] ready (manual typeset only).');
            // Process the content after MathJax is ready
            if (window.MathJax.typesetPromise) {
              processContent();
            }
          }
        }
      };
    ` : '';

    const mathJaxScript = mathEnabled ? `
      <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
    ` : '';

    const processingScript = mathEnabled ? `
      function normalizeMath(raw) {
        // Normalize: many API strings may arrive with double escaped TeX commands (e.g. \\\\frac) which MathJax won't parse.
        // We reduce double backslashes preceding a letter inside math delimiters to a single one.
        return raw.replace(/\\$\\$([\\s\\S]*?)\\$\\$/g, (_, inner) => {
          const fixed = inner.replace(/\\\\(?=[a-zA-Z])/g, '\\\\'); // collapse double backslashes before letters
          return \`$$\${fixed}$$\`;
        };
      }

      function showContentAndPostHeight() {
        const container = document.getElementById('mathContent');
        if (container) {
          container.classList.add('mathjax-ready');
        }
        postHeight();
        // Signal that rendering is complete
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({rendered: true}));
      }

      function processContent() {
        const container = document.getElementById('mathContent');
        if (!container) return;

        const normalized = normalizeMath(container.innerHTML);
        if (normalized !== container.innerHTML) {
          container.innerHTML = normalized;
          console.debug('[MathJax] normalized content:', normalized);
        } else {
          console.debug('[MathJax] content set (no normalization):', container.innerHTML);
        }

        if (window.MathJax && window.MathJax.typesetPromise) {
          const queueTypeset = (target, attempt = 1) => {
            try {
              // We avoid typesetClear here because multiple sibling renders in quick succession
              // were occasionally leaving raw TeX (race clearing). Instead we just re-typeset.
              window.MathJax.startup.promise = (window.MathJax.startup.promise || Promise.resolve())
                .then(() => window.MathJax.typesetPromise([target]))
                .then(() => {
                  if (!target.isConnected) return; // aborted
                  // Post processing
                  ${inline ? `
                  target.querySelectorAll('mjx-container[display="true"]').forEach((node) => {
                    node.style.display = 'inline-block';
                    node.style.textAlign = 'left';
                    ${isCompact ? `node.style.margin = '0 .35em';` : ''}
                  };
                  // unwrap single-math paragraphs
                  target.querySelectorAll('p').forEach(p => {
                    const kids = Array.from(p.childNodes).filter(n => n.tagName === 'MJX-CONTAINER');
                    if (kids.length === 1 && p.textContent === kids[0].textContent) {
                      p.replaceWith(kids[0]);
                    }
                  };
                  ` : ''}
                  ${isCompact ? `
                  target.querySelectorAll('mjx-container').forEach((n) => {
                    const h = n;
                    h.style.marginTop = '0';
                    h.style.marginBottom = '0';
                  };
                  ` : ''}

                  // Fallback: if no math got processed (still contains $$), retry a few more times
                  const rawTeXLeft = /\\$\\$[\\s\\S]*\\$\\$/g.test(target.innerHTML);
                  const hasMJX = target.querySelector('mjx-container');
                  if ((!hasMJX || rawTeXLeft) && attempt < 4) {
                    console.debug('[MathJax] fallback retry attempt', attempt + 1, 'content:', target.innerHTML);
                    setTimeout(() => queueTypeset(target, attempt + 1), 60 * attempt);
                  } else {
                    showContentAndPostHeight();
                  }
                })
                .catch((err) => {
                  console.error('MathJax queue typeset error (attempt ' + attempt + '):', err);
                  if (attempt < 3) setTimeout(() => queueTypeset(target, attempt + 1), 80 * attempt);
                  else showContentAndPostHeight();
                };
            } catch (e) {
              console.error('MathJax queue exception:', e);
              if (attempt < 3) setTimeout(() => queueTypeset(target, attempt + 1), 80 * attempt);
              else showContentAndPostHeight();
            }
          };
          queueTypeset(container);
        } else {
          showContentAndPostHeight();
        }
      }
    ` : `
      function showContentAndPostHeight() {
        const container = document.getElementById('mathContent');
        if (container) {
          container.classList.add('mathjax-ready');
        }
        postHeight();
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({rendered: true}));
      }

      function processContent() {
        showContentAndPostHeight();
      }
    `;

    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          :root { color-scheme: light dark; }
          html, body { margin: 0; padding: ${contentPadding}px; background: ${backgroundColor}; }
          body { 
            color: ${textColor}; 
            font-family: 'Work Sans', -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, sans-serif; 
            font-size: ${fontSize}px;
            line-height: 1.5;
          }
          .mathjax-content { 
            padding: 0; 
            opacity: 0;
            text-align: ${alignment};
            transition: opacity 0.15s ease-out;
          }
          .mathjax-ready { 
            opacity: 1 !important;
          }
          .mjx-inline-display mjx-container[display="true"] {
            display: inline-block !important;
            ${alignment === 'center' ? 'text-align: center !important;' : 'text-align: left !important;'}
          }
          .mjx-compact mjx-container {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          img { max-width: 100%; height: auto; }
          pre, code { white-space: pre-wrap; word-break: break-word; }
          * { 
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            user-select: none;
          }
        </style>
        ${mathJaxConfig ? `<script>${mathJaxConfig}</script>` : ''}
        ${mathJaxScript}
        <script>
          window.onerror = function(msg, url, line, col, error) { 
            console.error('WebView error:', msg, url, line, col, error);
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage('{"height":40}'); 
          };
          
          function postHeight() {
            const h = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({height: h}));
          }

          ${processingScript}
        </script>
      </head>
      <body>
        <${as} class="mathjax-content ${inline ? 'mjx-inline-display' : ''} ${isCompact ? 'mjx-compact' : ''} ${className}" id="mathContent">
          ${processedContent}
        </${as}>
        <script>
          // Check if content contains math expressions
          function hasMathContent() {
            const content = document.getElementById('mathContent');
            if (!content) return false;
            const text = content.innerHTML;
            // More comprehensive math detection
            return /\$|\\\(|\\\[|\\\\frac|\\\\sqrt|\\\\sum|\\\\int|\\\\begin|\\\\end|\\\\alpha|\\\\beta|\\\\gamma|\\\\pi|\\\\theta|_\{|_[0-9]|\^\{|\^[0-9]/.test(text);
          }

          document.addEventListener('DOMContentLoaded', function(){ 
            ${mathEnabled ? `
            // Late-bind readiness: if MathJax loaded after this component mounted, flip the flag now
            if (window.MathJax && window.MathJax.typesetPromise) {
              console.debug('[MathJax] script loaded and typesetPromise available.');
              processContent();
            } else if (!window.MathJax) { 
              // MathJax not ready yet, will be handled by startup.ready
            }
            ` : 'processContent();'}
          };
          
          window.addEventListener('load', function(){ 
            setTimeout(postHeight, 100); 
          };
        </script>
      </body>
    </html>`;
  };

  const htmlContent = buildHtmlTemplate(content, {
    fontSize: baseFontSize,
    textColor: textColor || colors.text,
    backgroundColor: backgroundColor || 'transparent',
    inlineDisplay,
    compact,
    enabled,
    textAlign,
    padding
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (typeof data.height === 'number') {
        const newHeight = Math.max(20, Math.ceil(data.height));
        setHeight(newHeight);
        if (onHeightChange) {
          onHeightChange(newHeight);
        }
      }
      if (data.rendered === true) {
        setIsLoaded(true);
      }
    } catch (error) {
      console.error('MathJaxRenderer message parse error:', error);
    }
  };

  return (
    <div style={style}>
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        onLoad={() => {
          // console.debug('[MathJax] WebView loaded'); // Disabled to reduce log noise
        }}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlaybook={false}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        bounces={false}
        overScrollMode="never"
        scalesPageToFit={false}
        scrollEnabled={scrollEnabled}
        style={scrollEnabled 
          ? { width: '100%', height: '100%', backgroundColor: backgroundColor || 'transparent' } 
          : { width: '100%', height, backgroundColor: backgroundColor || 'transparent' }
        }
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('MathJaxRenderer WebView error:', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('MathJaxRenderer WebView HTTP error:', nativeEvent);
        }}
      />
    </div>
  );
};

export default MathJaxRenderer;