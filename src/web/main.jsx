import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../../App.web.minimal.jsx';
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

// Global error handling
window.addEventListener('error', (e) => {
	debugLog('ERROR: ' + (e?.error?.message || e?.message || 'unknown'), '#f00');
	console.error('[boot] window.error:', e?.error || e?.message || e);
});

window.addEventListener('unhandledrejection', (e) => {
	debugLog('REJECT: ' + (e?.reason || 'unknown'), '#f00');
	console.error('[boot] unhandledrejection:', e?.reason || e);
});

// Boot marker
const buildId = (typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'dev');
debugLog('BUILD=' + buildId, '#0ff');
console.log('[boot] 🚀 WEB APP STARTING - BUILD_ID:', buildId);

const rootTag = document.getElementById('root');
debugLog('root found: ' + !!rootTag, rootTag ? '#0f0' : '#f00');

const Root = () => (
	<ErrorBoundary>
		<App />
	</ErrorBoundary>
);

try {
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
