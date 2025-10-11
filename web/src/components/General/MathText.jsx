import React, { useRef, useState, useMemo, useCallback } from 'react';

import { WebView } from 'react-native-webview';
import { useThemeColors } from '../../services/Theme';

// Detect if string contains LaTeX delimiters $...$ or $$...$$
function containsMath(str) {
  if (!str) return false;
  return /(\$\$[^$]+\$\$|\$[^$]+\$)/.test(str);
}

export default function MathText({ text, fontSize = 14, color, lineHeight = 20 }) {
  const colors = useThemeColors();
  const [height, setHeight] = useState(0);
  const [loading, setLoading] = useState(false);
  const wantsMath = containsMath(text);
  const finalColor = color || colors.text;

  const html = useMemo(() => {
    if (!wantsMath) return '';
    const safe = (text || '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/\n/g,'<br/>');
    return `<!DOCTYPE html><html><head><meta charset='utf-8'/>
      <style>
        html,body { margin:0; padding:0; background:transparent; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen; color:${finalColor}; font-size:${fontSize}px; line-height:${lineHeight}px; }
        mjx-container { overflow-x:auto; }
      </style>
      <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" async></script>
      <script>
        window.addEventListener('load', () => {
          const notify = () => {
            const h = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
            window.ReactNativeWebView.postMessage(JSON.stringify({ h }));
          };
          if (window.MathJax) {
            window.MathJax.typesetPromise().then(() => setTimeout(notify, 30));
          } else {
            setTimeout(notify, 300);
          }
        };
      </script>
      </head><body>${safe}</body></html>`;
  }, [wantsMath, text, finalColor, fontSize, lineHeight]);

  const onMessage = useCallback(e => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.h) {
        setHeight(data.h);
        setLoading(false);
      }
    } catch {}
  }, []);

  if (!wantsMath) {
    return <span style={{ color: finalColor, fontSize, lineHeight }}>{text || 'Sem descrição'}</span>;
  }

  return (
    <div style={{ width:'100%', minHeight: height || 40 }}>
      {loading && <div size="small" color={colors.muted} style={{ position:'absolute', top:4, right:4 }} />}
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={onMessage}
        style={{ backgroundColor:'transparent', height: height || 1 }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        scrollEnabled={false}
        javaScriptEnabled
        automaticallyAdjustContentInsets={false}
        textZoom={100}
      />
    </div>
  );
}
