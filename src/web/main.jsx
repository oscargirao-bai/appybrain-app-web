import React from 'react';
import { AppRegistry } from 'react-native';
import { createRoot } from 'react-dom/client';
import App from '../../App.web.minimal.jsx'; // Using minimal version
import ErrorBoundary from './ErrorBoundary.jsx';

// Visual debug logging
function debugLog(msg, color = '#0f0') {
	console.log('[boot]', msg);
	try {
		const div = document.createElement('div');
		div.style.cssText = `position:fixed;top:${document.querySelectorAll('.debug-log').length * 22}px;left:0;background:${color};color:#fff;padding:4px 8px;z-index:999999;font:12px monospace;pointer-events:none;`;
		div.className = 'debug-log';
		div.textContent = msg;
		document.body.appendChild(div);
	} catch (_) {}
}

debugLog('main.jsx loaded', '#00f');

// Global error instrumentation to capture any silent failures in production
window.addEventListener('error', (e) => {
	// eslint-disable-next-line no-console
	debugLog('ERROR: ' + (e?.error?.message || e?.message || 'unknown'), '#f00');
	console.error('[boot] window.error:', e?.error || e?.message || e);
});
window.addEventListener('unhandledrejection', (e) => {
	// eslint-disable-next-line no-console
	debugLog('REJECT: ' + (e?.reason || 'unknown'), '#f00');
	console.error('[boot] unhandledrejection:', e?.reason || e);
});

// Boot marker - SHOW IMMEDIATELY
const buildId = (typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'dev');
debugLog('BUILD=' + buildId, '#0ff');
console.log('[boot] 🚀 WEB APP STARTING - BUILD_ID:', buildId);
console.log('[boot] 🔍 Expecting: v48cc73f-TIMESTAMP format');

// Register the main component for React Native Web
AppRegistry.registerComponent('AppyBrain', () => App);

const rootTag = document.getElementById('root');
debugLog('root found: ' + !!rootTag, rootTag ? '#0f0' : '#f00');

const Root = () => (
	<ErrorBoundary>
		<App />
	</ErrorBoundary>
);

try {
	// React 18 root API
	debugLog('creating root...', '#ff0');
	const root = createRoot(rootTag);
	debugLog('root created, rendering...', '#ff0');
	root.render(<Root />);
	debugLog('render complete', '#0f0');
	console.log('[boot] render invoked');
} catch (err) {
	debugLog('render FAILED: ' + err.message, '#f00');
	console.error('[boot] render failed:', err);
}
