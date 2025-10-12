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
        width: '50%',
        minWidth: '375px',
        maxWidth: '600px',
        margin: '0 auto',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
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
