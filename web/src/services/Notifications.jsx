// Notifications.jsx - Web mock (no push notifications on web)
import { useEffect } from 'react';

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
  console.log('[Web] executeNotificationNavigation no-op', notification);
  // Web version doesn't support notification-driven navigation
}

export default {
  registerForPushNotificationsAsync,
  useNotificationListener,
  useNotificationResponseListener,
  schedulePushNotification,
  cancelAllScheduledNotificationsAsync,
  getAllScheduledNotificationsAsync,
};
