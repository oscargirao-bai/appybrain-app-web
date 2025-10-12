import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from './services/Theme.jsx';
import { TranslationProvider } from './services/Translate.jsx';
import { SearchProvider } from './services/SearchContext.jsx';
import ApiManager from './services/ApiManager.jsx';
import AppRouter from './AppRouter.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

export default function App() {
  useEffect(() => {
    // Initialize ApiManager on app startup
    ApiManager.init({
      baseUrl: 'https://appybrain.skillade.com/'
    });
  }, []);

  return (
    <ErrorBoundary>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        margin: '0 auto',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <ThemeProvider defaultTheme="dark">
          <TranslationProvider>
            <SearchProvider>
              <AppRouter />
            </SearchProvider>
          </TranslationProvider>
        </ThemeProvider>
      </div>
    </ErrorBoundary>
  );
}
