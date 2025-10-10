import React, { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppState } from 'react-native';
import AppRouter from './src/AppRouter.web';
import { ThemeProvider } from './src/services/Theme';
import { TranslationProvider } from './src/services/Translate';
import { SearchProvider } from './src/services/SearchContext';
import ApiManager from './src/services/ApiManager';
import { navigationRef, getPendingNotificationNavigation } from './src/services/navigationRef';

export default function AppWeb() {
  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef(null);

  useEffect(() => {
    ApiManager.init({ baseUrl: 'https://appybrain.skillade.com/' });

    const handleAppStateChange = (nextAppState) => {
      if (appState.current?.match(/inactive|background/) && nextAppState === 'active') {
        if (backgroundTime.current) {
          const timeInBackground = Date.now() - backgroundTime.current;
          const oneMinute = 90 * 1000;
          const hasPendingNotification = getPendingNotificationNavigation();
          if (timeInBackground >= oneMinute && !hasPendingNotification) {
            setTimeout(() => {
              if (navigationRef.current) {
                navigationRef.current.reset({ index: 0, routes: [{ name: 'Loading' }] });
              }
            }, 100);
          }
          backgroundTime.current = null;
        }
      } else if (nextAppState?.match(/inactive|background/)) {
        backgroundTime.current = Date.now();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider defaultTheme="dark">
        <TranslationProvider>
          <SearchProvider>
            <AppRouter />
          </SearchProvider>
        </TranslationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
