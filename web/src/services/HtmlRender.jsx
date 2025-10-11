import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useThemeColors } from './Theme';
import { WebView } from 'react-native-webview';

/**
 * HtmlRender
 * Renders HTML (with MathJax support) inside a WebView and auto-sizes to content height.
 * Props:
 *  - html: string (required)
 *  - baseFontSize?: number (default 18)
 *  - textColor?: string (defaults to theme text)
 *  - linkColor?: string (defaults to theme primary)
 *  - onHeightChange?: (h: number) => void
 *  - style?: ViewStyle applied to wrapper View
 */
export default function HtmlRender({ html, baseFontSize = 18, textColor, linkColor, onHeightChange, style, scrollEnabled = false }) {
	const colors = useThemeColors();
	const [height, setHeight] = useState(40);
	const webRef = useRef(null);

	const resolvedText = textColor || colors.text;
	const resolvedLink = linkColor || colors.primary;

	const content = useMemo(() => buildHtmlTemplate(html || '', {
		baseFontSize,
		text: resolvedText,
		link: resolvedLink,
		background: 'transparent',
	}), [html, baseFontSize, resolvedText, resolvedLink]);

	function handleMessage(e) {
		try {
			const data = JSON.parse(e.nativeEvent.data);
			//console.log('HtmlRender received message:', data);
			if (typeof data.height === 'number') {
				const h = Math.max(20, Math.ceil(data.height));
				setHeight(h);
				onHeightChange && onHeightChange(h);
			}
			if (data.katex === 'error') {
				console.error('KaTeX error received:', data.message);
			}
		} catch {}
	}

		return (
			<div style={style}>
				<WebView
					ref={webRef}
					originWhitelist={["*"]}
					source={{ html: content }}
					onMessage={handleMessage}
					javaScriptEnabled
					domStorageEnabled
					allowsInlineMediaPlayback
					mediaPlaybackRequiresUserAction={false}
					mixedContentMode="compatibility"
					onError={(syntheticEvent) => {
						const { nativeEvent } = syntheticEvent;
						//console.log('WebView error:', nativeEvent);
					}}
					onHttpError={(syntheticEvent) => {
						const { nativeEvent } = syntheticEvent;
						//console.log('WebView HTTP error:', nativeEvent);
					}}
					bounces={false}
					overScrollMode="never"
					scalesPageToFit={false}
					scrollEnabled={scrollEnabled}
					style={scrollEnabled ? { width: '100%', height: '100%', backgroundColor: 'transparent' } : { width: '100%', height, backgroundColor: 'transparent' }}
				/>
			</div>
		);
}

function buildHtmlTemplate(bodyHtml, theme) {
	// Enhanced client-side LaTeX processing - handle more LaTeX expressions
	let processedHtml = bodyHtml;
	
	// Replace \frac{a}{b} with proper fraction display
	processedHtml = processedHtml.replace(/\\?\\\(\\frac\{([^}]+)\}\{([^}]+)\}\\?\\\)/g, 
		'<span style="display: inline-block; text-align: center; font-style: italic; font-family: serif; vertical-align: middle; font-size: 0.9em;"><span style="display: block; border-bottom: 1px solid; padding: 0 3px; font-size: 0.85em;">$1</span><span style="display: block; padding: 0 3px; font-size: 0.85em;">$2</span></span>');
	
	// Replace \frac{a}{b} without surrounding \(...\)
	processedHtml = processedHtml.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, 
		'<span style="display: inline-block; text-align: center; font-style: italic; font-family: serif; vertical-align: middle; font-size: 0.9em;"><span style="display: block; border-bottom: 1px solid; padding: 0 3px; font-size: 0.85em;">$1</span><span style="display: block; padding: 0 3px; font-size: 0.85em;">$2</span></span>');
	
	// Replace \(x\) with italicized x (simple variables)
	processedHtml = processedHtml.replace(/\\?\\\(([^)\\]+)\\\)/g, '<em style="font-style: italic; font-family: serif;">$1</em>');
	
	// Replace \[x\] with block math style
	processedHtml = processedHtml.replace(/\\?\\\[([^\]]+)\\\]/g, '<div style="text-align: center; font-style: italic; font-family: serif; margin: 10px 0;">$1</div>');
	
	// Replace $x$ with inline math style
	processedHtml = processedHtml.replace(/\$([^$]+)\$/g, '<em style="font-style: italic; font-family: serif;">$1</em>');
	
	// Replace $$x$$ with block math style
	processedHtml = processedHtml.replace(/\$\$([^$]+)\$\$/g, '<div style="text-align: center; font-style: italic; font-family: serif; margin: 10px 0;">$1</div>');
	
	return `<!DOCTYPE html>
	<html>
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
			<style>
				:root { color-scheme: light dark; }
				html, body { margin: 0; padding: 0; background: ${theme.background}; }
				body { color: ${theme.text}; font-family: -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, sans-serif; }
				.content { padding: 0; font-size: ${theme.baseFontSize || 18}px; line-height: 1.5; }
				a { color: ${theme.link}; }
				img { max-width: 100%; height: auto; }
				pre, code { white-space: pre-wrap; word-break: break-word; }
				* { 
					-webkit-user-select: none;
					-webkit-touch-callout: none;
					user-select: none;
				}
			</style>
			<script>
				window.onerror = function() { window.ReactNativeWebView && window.ReactNativeWebView.postMessage('{"height":40}'); };
				function postHeight() {
					const h = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
					window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({height: h}));
				}
			</script>
		</head>
		<body>
			<div class="content" id="mathContent">${processedHtml}</div>
			<script>
				document.addEventListener('DOMContentLoaded', function(){ 
					window.ReactNativeWebView && window.ReactNativeWebView.postMessage('{"simpleMath":"complete"}');
					setTimeout(postHeight, 30); 
				};
				
				window.addEventListener('load', function(){ 
					setTimeout(postHeight, 30); 
				});
			</script>
		</body>
	</html>`;
}

