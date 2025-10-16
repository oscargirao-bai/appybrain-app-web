// Notifications.jsx - Web mock (no push notifications on web)
import { useEffect } from 'react';
import { navigate, resetRoot, setPendingNotificationNavigation } from './navigationRef.jsx';
import DataManager from './DataManager.jsx';

function normalizeSourceId(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'number') {
    return value;
  }

  const asString = String(value).trim();
  if (/^-?\d+$/.test(asString)) {
    const parsed = Number(asString);
    if (Number.isSafeInteger(parsed)) {
      return parsed;
    }
  }

  return value;
}

function buildTimestampedParams(extra = {}) {
  return { ...extra, timestamp: Date.now() };
}

// Mock functions for web (no-op)
export async function registerForPushNotificationsAsync() {
  return null;
}

export function useNotificationListener(callback) {
  // No-op on web
  useEffect(() => {
    
  }, [callback]);
}

export function useNotificationResponseListener(callback) {
  // No-op on web
  useEffect(() => {
  }, [callback]);
}

export async function schedulePushNotification(title, body, data = {}, triggerSeconds = 1) {
  return null;
}

export async function cancelAllScheduledNotificationsAsync() {
  return null;
}

export async function getAllScheduledNotificationsAsync() {
  return [];
}

export function executeNotificationNavigation(notification) {
  if (!notification) {
    console.warn('[Notifications] executeNotificationNavigation called without payload');
    return;
  }

  const data = notification?.data ?? {};
  const rawSourceType = notification?.sourceType ?? data?.sourceType ?? notification?.type ?? data?.type ?? '';
  const sourceType = String(rawSourceType).toLowerCase();
  const sourceId = normalizeSourceId(notification?.sourceId ?? data?.sourceId ?? data?.id ?? notification?.id ?? null);

  switch (sourceType) {
    case 'broadcast':
      navigate('MainTabs', {
        screen: 'Learn',
        params: buildTimestampedParams({ openNotifications: true }),
      });
      break;

    case 'badge':
    case 'badges':
      navigate('Profile', buildTimestampedParams({ openBadgeModal: sourceId }));
      break;

  case 'battle':
  case 'battles':
      // Always navigate directly to Result2 for battle notifications.
      // Result2 is responsible for fetching the battle result when needed,
      // so going through Loading is unnecessary and causes UX regression on web.
      try {
        navigate('Result2', { battleSessionId: sourceId });
      } catch (err) {
        console.error('[Notifications] Failed to navigate to Result2, falling back to Loading:', err);
        // Fallback: preserve previous behavior
        try {
          const navigationInfo = { sourceType, sourceId, data };
          setPendingNotificationNavigation(navigationInfo);
          resetRoot({ index: 0, routes: [{ name: 'Loading' }] });
        } catch (e) {
          console.error('[Notifications] Fallback also failed:', e);
        }
      }
      break;

    case 'challenge':
    case 'challenges':
      navigate('MainTabs', {
        screen: 'Challenges',
        params: buildTimestampedParams({}),
      });
      break;

    case 'news':
      navigate('Html', { newsId: sourceId });
      break;

    case 'tribe':
    case 'tribes':
      navigate('MainTabs', {
        screen: 'Tribes',
        params: buildTimestampedParams({ sourceId }),
      });
      break;

    case 'chest':
    case 'chests':
      navigate('Profile', buildTimestampedParams({ highlightChests: true }));
      break;

    case 'learn':
    case 'content':
      navigate('MainTabs', {
        screen: 'Learn',
        params: buildTimestampedParams({ sourceId }),
      });
      break;

    default:
      navigate('Profile', buildTimestampedParams({}));
      break;
  }
}

export default {
  registerForPushNotificationsAsync,
  useNotificationListener,
  useNotificationResponseListener,
  schedulePushNotification,
  cancelAllScheduledNotificationsAsync,
  getAllScheduledNotificationsAsync,
};
