import React from 'react';
import { AppRegistry } from 'react-native';
import { createRoot } from 'react-dom/client';
import App from '../../App.web.jsx';

// Register the main component for React Native Web
AppRegistry.registerComponent('AppyBrain', () => App);

const rootTag = document.getElementById('root');
const Root = () => <App />;

// React 18 root API
const root = createRoot(rootTag);
root.render(<Root />);
