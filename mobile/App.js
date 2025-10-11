import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppState, View } from 'react-native';
import { useFonts, WorkSans_400Regular, WorkSans_500Medium, WorkSans_600SemiBold, WorkSans_700Bold } from '@expo-google-fonts/work-sans';
import AppRouter from './src/AppRouter';
import DevConsoleOverlay from './src/utils/console';
import { ThemeProvider } from './src/services/Theme';
import { TranslationProvider } from './src/services/Translate';
import { SearchProvider } from './src/services/SearchContext';
import ApiManager from './src/services/ApiManager';
import { navigationRef, getPendingNotificationNavigation } from './src/services/navigationRef';
import { PushNotificationsRegistrar, PushNotificationsLogger } from './src/services/Notifications';

export default function App() {
  // Load Work Sans fonts
  const [fontsLoaded] = useFonts({
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
  });

  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef(null);

  useEffect(() => {
    // Initialize ApiManager on app startup
    ApiManager.init({
      baseUrl: 'https://appybrain.skillade.com/' // Replace with your actual API URL
    });

    // App state change handler
    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        if (backgroundTime.current) {
          const timeInBackground = Date.now() - backgroundTime.current;
          const oneMinute = 90 * 1000; // 1.5 minute in milliseconds
          
          if (timeInBackground >= oneMinute) {
            // Check if there's a pending notification navigation
            // If so, skip auto-redirect (notification handler will handle it)
            const hasPendingNotification = getPendingNotificationNavigation();
            
            if (!hasPendingNotification) {
              // No notification, so we handle the data refresh ourselves
              console.log('App was in background for', Math.round(timeInBackground / 1000), 'seconds. Redirecting to loading screen.');
              
              // Use setTimeout to ensure navigation happens after the app is fully active
              setTimeout(() => {
                if (navigationRef.current) {
                  // Reset the navigation stack and go to loading screen
                  navigationRef.current.reset({
                    index: 0,
                    routes: [{ name: 'Loading' }],
                  });
                }
              }, 100);
            } else {
              console.log('App was in background but notification handler is managing navigation.');
            }
          }
          backgroundTime.current = null;
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App is going to background
        backgroundTime.current = Date.now();
      }

      appState.current = nextAppState;
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup subscription on unmount
    return () => {
      subscription?.remove();
    };
  }, []);

  // Show nothing while fonts are loading (after all hooks)
  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider defaultTheme="dark">
        <TranslationProvider>
          <SearchProvider>
            <StatusBar style="light" />
            <AppRouter />
            <PushNotificationsRegistrar />
            <PushNotificationsLogger />
            {/*<DevConsoleOverlay />*/}
          </SearchProvider>
        </TranslationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
