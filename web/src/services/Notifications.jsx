// Notifications.jsx - Web mock (no push notifications on web)
import { useEffect } from 'react';
import { navigate } from './navigationRef.jsx';

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
  console.log('[Notifications] executeNotificationNavigation called with:', notification);
  
  if (!notification) {
    console.warn('[Notifications] executeNotificationNavigation called without payload');
    return;
  }

  const data = notification?.data ?? {};
  const rawSourceType = notification?.sourceType ?? data?.sourceType ?? notification?.type ?? data?.type ?? '';
  const sourceType = String(rawSourceType).toLowerCase();
  const sourceId = normalizeSourceId(notification?.sourceId ?? data?.sourceId ?? data?.id ?? notification?.id ?? null);
  
  console.log('[Notifications] Parsed - sourceType:', sourceType, 'sourceId:', sourceId);

  // Store navigation info for after Loading screen refreshes data (like mobile)
  const navigationInfo = { sourceType, sourceId, data };
  
  // Store in sessionStorage to survive Loading screen
  try {
    sessionStorage.setItem('pendingNotificationNavigation', JSON.stringify(navigationInfo));
    console.log('[Notifications] Stored pending navigation, going to Loading screen');
  } catch (err) {
    console.error('[Notifications] Failed to store pending navigation:', err);
  }
  
  // Navigate to Loading screen to refresh data first (exactly like mobile)
  navigate('Loading');
}

export default {
  registerForPushNotificationsAsync,
  useNotificationListener,
  useNotificationResponseListener,
  schedulePushNotification,
  cancelAllScheduledNotificationsAsync,
  getAllScheduledNotificationsAsync,
};
