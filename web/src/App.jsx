import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from './services/Theme';
import { TranslationProvider } from './services/Translate';
import { SearchProvider } from './services/SearchContext';
import ApiManager from './services/ApiManager';
import AppRouter from './AppRouter';

export default function App() {
  useEffect(() => {
    // Initialize ApiManager on app startup
    ApiManager.init({
      baseUrl: 'https://appybrain.skillade.com/'
    });
  }, []);

  return (
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
  );
}
