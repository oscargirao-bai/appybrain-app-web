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
}

export function getPendingNotificationNavigation() {
  return pendingNotificationNavigation;
}

export function clearPendingNotificationNavigation() {
  pendingNotificationNavigation = null;
}

export function isAppReady() {
  return navigationRef.current?.getCurrentRoute()?.name !== 'Loading';
}

export default { navigate, resetRoot, navigationRef, setPendingNotificationNavigation, getPendingNotificationNavigation, clearPendingNotificationNavigation, isAppReady });