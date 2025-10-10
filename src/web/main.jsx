import React from 'react';
import { AppRegistry } from 'react-native';
import { createRoot } from 'react-dom/client';
import App from '../../App.web.jsx';

// Global error instrumentation to capture any silent failures in production
window.addEventListener('error', (e) => {
	// eslint-disable-next-line no-console
	console.error('[boot] window.error:', e?.error || e?.message || e);
});
window.addEventListener('unhandledrejection', (e) => {
	// eslint-disable-next-line no-console
	console.error('[boot] unhandledrejection:', e?.reason || e);
});

// Boot marker
console.log('[boot] starting web app');

// Register the main component for React Native Web
AppRegistry.registerComponent('AppyBrain', () => App);

const rootTag = document.getElementById('root');
const Root = () => <App />;

try {
	// React 18 root API
	const root = createRoot(rootTag);
	root.render(<Root />);
	console.log('[boot] render invoked');
} catch (err) {
	console.error('[boot] render failed:', err);
}
