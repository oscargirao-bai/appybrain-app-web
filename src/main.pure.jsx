import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.pure.jsx';
import ApiManager from './services/ApiManager.pure.js';

// Initialize API
ApiManager.init({ baseUrl: 'https://appybrain.skillade.com/' });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
