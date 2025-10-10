import React, { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import ApiManager from './ApiManager';
import { navigate, isAppReady, setPendingNotificationNavigation, clearPendingNotificationNavigation, navigationRef } from './navigationRef';

// Lazy load DataManager to avoid potential circular dependency issues
let DataManager = null;
const getDataManager = () => {
  if (!DataManager) {
    DataManager = require('./DataManager').default;
  }
  return DataManager;
};

// =================== PUSH NOTIFICATIONS SETUP ===================

// Foreground behavior: show alert + play sound (as no OLD)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function getProjectId() {
  const pid = Constants?.easConfig?.projectId || Constants?.expoConfig?.extra?.eas?.projectId;
  if (!pid) throw new Error('EAS projectId not found. Configure it in app.json under extra.eas.projectId.');
  return pid;
}

async function ensureAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Geral',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}

async function askPermissions() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== 'granted') throw new Error('Notification permissions denied by user.');
  }
}

async function getExpoPushToken() {
  const projectId = getProjectId();
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  if (!data) throw new Error('Failed to obtain Expo Push Token.');
  return data; // ExponentPushToken[...]
}

async function getNativePushToken() {
  try {
    const dev = await Notifications.getDevicePushTokenAsync();
    const nativeType = dev?.type ?? null;
    const raw = dev?.data ?? dev?.token ?? null;
    return { nativeType, nativeToken: raw ?? null };
  } catch {
    return { nativeType: null, nativeToken: null };
  }
}

async function registerTokenOnBackend(expoPushToken, nativeType, nativeToken) {
  const deviceInfo = {
    platform: Platform.OS,
    model: Device.modelName ?? null,
    osVersion: Device.osVersion ?? null,
    brand: Device.brand ?? null,
    appVersion: Constants?.expoConfig?.version ?? null,
    buildNumber:
      Constants?.expoConfig?.ios?.buildNumber ?? Constants?.expoConfig?.android?.versionCode ?? null,
  };

  // Use the authenticated JSON request to include Authorization + handle rotation
  const resp = await ApiManager.makeAuthenticatedJSONRequest('api/information/register_token', {
    method: 'POST',
    body: JSON.stringify({
      expoPushToken,
      nativeType,
      nativeToken,
      deviceInfo,
      isActive: 1,
    }),
  });

  if (resp && resp.success === false) {
    const msg = resp?.message || resp?.error || 'register_token failed';
    throw new Error(msg);
  }
  return resp ?? { ok: true };
}

export function PushNotificationsRegistrar() {
  const completedRef = useRef(false);
  const retryCountRef = useRef(0);
  const appStateRef = useRef(AppState.currentState);

  const attemptRegister = React.useCallback(async () => {
    if (completedRef.current) return;
    try {
      // Only for physical devices
      if (!Device.isDevice) {
        console.log('[Push] Not a physical device; skipping push registration');
        return;
      }

      // Ensure user is authenticated before registering token
      const isAuth = await ApiManager.isAuthenticated();
      if (!isAuth) {
        // Don't mark completed; will retry when user logs in and app foregrounds
        return;
      }

      console.log('[Push] Starting registration attempt...');
      await ensureAndroidChannel();
      await askPermissions();
      const expoPushToken = await getExpoPushToken();
      console.log('[Push] Expo push token acquired');
      const { nativeType, nativeToken } = await getNativePushToken();
      console.log('[Push] Native token type:', nativeType, 'present:', !!nativeToken);
      const resp = await registerTokenOnBackend(expoPushToken, nativeType, nativeToken);
      console.log('[Push] Registered successfully:', resp);
      completedRef.current = true;
    } catch (e) {
      retryCountRef.current += 1;
      console.warn(`[Push] Registration error (attempt ${retryCountRef.current}):`, e?.message || String(e));
      if (retryCountRef.current < 3) {
        setTimeout(() => {
          attemptRegister().catch(() => {});
        }, 2000 * retryCountRef.current);
      } else {
        console.warn('[Push] Max retries reached; will retry on next foreground if authenticated');
      }
    }
  }, []);

  useEffect(() => {
    attemptRegister();
  }, [attemptRegister]);

  // Retry when app returns to foreground and we haven't completed
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;
      if (prev?.match(/inactive|background/) && nextState === 'active') {
        if (!completedRef.current) {
          console.log('[Push] App foregrounded; retrying registration');
          attemptRegister();
        }
      }
    });
    return () => sub.remove();
  }, [attemptRegister]);

  return null;
}

// ================= END PUSH NOTIFICATIONS SETUP =================

// ================= PUSH NOTIFICATIONS LOGGER (DEBUG) =================
// Use this component to log notification payloads for debugging. Keep it
// separated from the registration logic above. Mount it once in App.js
// (inside NavigationContainer is fine) to inspect the JSON received.

// Export the navigation execution function for use by LoadingScreen
export function executeNotificationNavigation({ sourceType, sourceId, data }) {
  console.log('[Push][Router] Executing navigation:', sourceType, sourceId);
  
  // Note: Notification is already marked as read in routeBySource()
  // No need to mark it again here
  
  switch (sourceType) {
    case 'broadcast':
      // Open Learn tab and show notifications modal
      navigate('MainTabs', { screen: 'Learn', params: { openNotifications: true, timestamp: Date.now() } });
      break;
    case 'battles':
    case 'battle':
      // Open battle result screen
      navigate('Result2', { battleSessionId: sourceId });
      break;
    case 'challenges':
      // Open Challenges tab
      navigate('MainTabs', { screen: 'Challenges', params: { timestamp: Date.now() } });
      break;
    case 'news':
      // Open Html screen with newsId
      navigate('Html', { newsId: Number(sourceId) || sourceId });
      break;
    case 'badges':
    case 'badge':
      // Open Profile and show badge modal for the given ID
      navigate('Profile', { openBadgeModal: sourceId, timestamp: Date.now() });
      break;
    default:
      console.log('[Push][Router] Unknown sourceType, no navigation performed');
  }
}

export function PushNotificationsLogger() {
  const receivedSubRef = useRef(null);
  const responseSubRef = useRef(null);

  useEffect(() => {
    // Remove the global function exposure since we're using proper exports now
  const safeStringify = (obj) => {
      try {
        return JSON.stringify(obj, null, 2);
      } catch (e) {
        return String(obj);
      }
    }

    const onReceived = (notification) => {
      const content = notification?.request?.content ?? {};
      console.log('[Push][Received] Notification RAW:', notification);
      console.log('[Push][Received] Title:', content.title);
      console.log('[Push][Received] Body:', content.body);
      console.log('[Push][Received] Data object:', content.data);
      console.log('[Push][Received] Data JSON:', safeStringify(content.data));
    };

    function routeBySource(data) {
      if (!data || typeof data !== 'object') return;
      const sourceType = String(data.sourceType || '').toLowerCase();
      const sourceId = data.sourceId ?? data.id ?? null;
      const notificationId = data.notificationId ?? data.id ?? null;

      console.log('[Push][Router] sourceType =', sourceType, 'sourceId =', sourceId, 'notificationId =', notificationId);
      console.log('[Push][Router] Full data object:', data);

      // Mark notification as read immediately, before any navigation or data loading
      if (notificationId) {
        console.log('[Push][Router] Marking notification as read immediately:', notificationId);
        try {
          const dm = getDataManager();
          dm.markNotificationAsRead(notificationId).catch(error => {
            console.warn('[Push][Router] Failed to mark notification as read:', error);
          });
        } catch (error) {
          console.warn('[Push][Router] Failed to get DataManager:', error);
        }
      }

      // Create navigation info object
      const navigationInfo = { sourceType, sourceId, data };

      // Check if app is ready (not on loading screen)
      if (!isAppReady()) {
        console.log('[Push][Router] App not ready, storing navigation for after loading');
        setPendingNotificationNavigation(navigationInfo);
        
        // Navigate to loading screen first if not already there
        const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
        if (currentRoute !== 'Loading') {
          navigate('Loading');
        }
        return;
      }

      // App is ready - ALWAYS store pending navigation and go to Loading
      // This ensures data is refreshed before navigating to the target
      console.log('[Push][Router] App is ready, storing navigation and going to Loading for data refresh');
      setPendingNotificationNavigation(navigationInfo);
      
      // Navigate to Loading screen
      // LoadingScreen will refresh data and then execute the pending navigation
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: 'Loading' }],
      });
    }

    function executeNavigation(navigationInfo) {
      executeNotificationNavigation(navigationInfo);
    }

    const onResponse = (response) => {
      const content = response?.notification?.request?.content ?? {};
      console.log('[Push][Response] Notification RAW:', response);
      console.log('[Push][Response] Title:', content.title);
      console.log('[Push][Response] Body:', content.body);
      console.log('[Push][Response] Data object:', content.data);
      console.log('[Push][Response] Data JSON:', safeStringify(content.data));

      // Navigate based on payload when user taps the notification
      try { routeBySource(content.data); } catch (e) {
        console.warn('[Push][Router] Navigation error:', e?.message || e);
      }
    };

    // Foreground receive listener
    receivedSubRef.current = Notifications.addNotificationReceivedListener(onReceived);
    // User interaction (tap) listener
    responseSubRef.current = Notifications.addNotificationResponseReceivedListener(onResponse);

    // If the app was opened from a notification (cold start), log it too
    (async () => {
      try {
        const last = await Notifications.getLastNotificationResponseAsync();
        if (last) {
          // Delay slightly to ensure NavigationContainer is ready on cold start
          setTimeout(() => onResponse(last), 600);
        }
      } catch (e) {
        console.warn('[Push][Logger] getLastNotificationResponseAsync error:', e?.message || e);
      }
    })();

    return () => {
      if (receivedSubRef.current) {
        // Prefer the subscription's own remove() if present
        if (typeof receivedSubRef.current.remove === 'function') {
          try { receivedSubRef.current.remove(); } catch {}
        } else if (typeof Notifications.removeNotificationSubscription === 'function') {
          // Fallback for older SDKs
          try { Notifications.removeNotificationSubscription(receivedSubRef.current); } catch {}
        }
        receivedSubRef.current = null;
      }
      if (responseSubRef.current) {
        if (typeof responseSubRef.current.remove === 'function') {
          try { responseSubRef.current.remove(); } catch {}
        } else if (typeof Notifications.removeNotificationSubscription === 'function') {
          try { Notifications.removeNotificationSubscription(responseSubRef.current); } catch {}
        }
        responseSubRef.current = null;
      }
    };
  }, []);

  return null;
}

// ================= END PUSH NOTIFICATIONS LOGGER (DEBUG) =================
