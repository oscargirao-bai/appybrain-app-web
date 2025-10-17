import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from './services/Theme.jsx';
import { TranslationProvider } from './services/Translate.jsx';
import { SearchProvider } from './services/SearchContext.jsx';
import ApiManager from './services/ApiManager.jsx';
import AppRouter from './AppRouter.jsx';
import StoreRedirect from './components/General/StoreRedirect.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

export default function App() {
  useEffect(() => {
    // Initialize ApiManager on app startup
    ApiManager.init({
      baseUrl: 'https://appybrain.skillade.com/api/'
    });
  }, []);

  // Detect mobile/tablet by userAgent
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent || '';
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
    setIsMobileOrTablet(!!isMobile);
  }, []);

  return (
    <ErrorBoundary>
      {isMobileOrTablet ? (
        // Full width store redirect for mobile/tablet
        <div style={{ minHeight: '100vh' }}>
          <ThemeProvider defaultTheme="dark">
            <TranslationProvider>
              <SearchProvider>
                <StoreRedirect />
              </SearchProvider>
            </TranslationProvider>
          </ThemeProvider>
        </div>
      ) : (
        <div style={{
          width: '550px',
          minWidth: '375px',
          maxWidth: '550px',
          margin: '0 auto',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Work Sans, sans-serif'
        }}>
          <ThemeProvider defaultTheme="dark">
            <TranslationProvider>
              <SearchProvider>
                {/* Clickable logo linking to appybrain site */}
                <div style={{padding: '12px 16px', textAlign: 'center'}}>
                  <a href="https://www.appybrain.pt" target="_blank" rel="noopener noreferrer">
                    <img src="/assets/logo.png" alt="AppyBrain" style={{height: 48, width: 'auto'}} />
                  </a>
                </div>
                <div style={{flex: 1, overflow: 'auto'}}>
                  <AppRouter />
                </div>
              </SearchProvider>
            </TranslationProvider>
          </ThemeProvider>
        </div>
      )}
    </ErrorBoundary>
  );
}
