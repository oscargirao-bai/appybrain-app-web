import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider, useTheme, useThemeColors } from './services/Theme.jsx';
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
                {/* AppInner provides the white app background in light mode while the page/body
                    keeps the subtle contrast color set by ThemeProvider */}
                <AppInner>
                  <AppRouter />
                </AppInner>
              </SearchProvider>
            </TranslationProvider>
          </ThemeProvider>
        </div>
      )}
    </ErrorBoundary>
  );
}

function AppInner({ children }) {
  // This component must be used inside ThemeProvider
  const { resolvedTheme } = useTheme();
  const colors = useThemeColors();

  const wrapperStyle = {
    backgroundColor: resolvedTheme === 'light' ? '#FFFFFF' : (colors.background || '#000000'),
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    overflow: 'hidden'
  };

  return <div style={wrapperStyle}>{children}</div>;
}
