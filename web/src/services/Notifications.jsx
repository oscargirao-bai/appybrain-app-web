// Notifications.jsx - Web mock (no push notifications on web)
import { useEffect } from 'react';
import { navigate, resetRoot, setPendingNotificationNavigation } from './navigationRef.jsx';

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
  console.log('[Notifications] Web does not support push notifications');
  return null;
}

export function useNotificationListener(callback) {
  // No-op on web
  useEffect(() => {
    console.log('[Notifications] useNotificationListener - no-op on web');
  }, [callback]);
}

export function useNotificationResponseListener(callback) {
  // No-op on web
  useEffect(() => {
    console.log('[Notifications] useNotificationResponseListener - no-op on web');
  }, [callback]);
}

export async function schedulePushNotification(title, body, data = {}, triggerSeconds = 1) {
  console.log('[Notifications] schedulePushNotification - no-op on web', { title, body, data });
  return null;
}

export async function cancelAllScheduledNotificationsAsync() {
  console.log('[Notifications] cancelAllScheduledNotificationsAsync - no-op on web');
}

export async function getAllScheduledNotificationsAsync() {
  console.log('[Web] getAllScheduledNotificationsAsync no-op');
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
      // Replicate mobile flow: store pending navigation and go to Loading so data is refreshed
      try {
        const navigationInfo = { sourceType, sourceId, data };
        setPendingNotificationNavigation(navigationInfo);
        // Reset navigation to Loading (Loading will refresh data and execute pending navigation)
        resetRoot({ index: 0, routes: [{ name: 'Loading' }] });
      } catch (err) {
        console.error('[Notifications] Failed to route battle notification via Loading:', err);
        // Fallback to direct navigation
        navigate('MainTabs', {
          screen: 'Battle',
          params: buildTimestampedParams({ openBattleResult: sourceId }),
        });
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
