import * as React from 'react';

export const navigationRef = React.createRef();

// Store pending notification navigation for cold start
let pendingNotificationNavigation = null;

export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}

export function resetRoot(state) {
  navigationRef.current?.resetRoot(state);
}

export function setPendingNotificationNavigation(routeInfo) {
  pendingNotificationNavigation = routeInfo;
  try {
    sessionStorage.setItem('pendingNotificationNavigation', JSON.stringify(routeInfo));
  } catch (err) {
    console.error('[navigationRef] Failed to store pending navigation:', err);
  }
}

export function getPendingNotificationNavigation() {
  if (pendingNotificationNavigation) {
    return pendingNotificationNavigation;
  }
  try {
    const stored = sessionStorage.getItem('pendingNotificationNavigation');
    if (stored) {
      pendingNotificationNavigation = JSON.parse(stored);
      return pendingNotificationNavigation;
    }
  } catch (err) {
    console.error('[navigationRef] Failed to read pending navigation:', err);
  }
  return null;
}

export function clearPendingNotificationNavigation() {
  pendingNotificationNavigation = null;
  try {
    sessionStorage.removeItem('pendingNotificationNavigation');
  } catch (err) {
    console.error('[navigationRef] Failed to clear pending navigation:', err);
  }
}

export function isAppReady() {
  return navigationRef.current?.getCurrentRoute()?.name !== 'Loading';
}

export default {
  navigate,
  resetRoot,
  navigationRef,
  setPendingNotificationNavigation,
  getPendingNotificationNavigation,
  clearPendingNotificationNavigation,
  isAppReady
};