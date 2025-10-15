import * as React from 'react';

export const navigationRef = React.createRef();

// Store pending notification navigation for cold start
let pendingNotificationNavigation = null;

export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}

export function resetRoot(state) {
  const nav = navigationRef.current;
  if (!nav) return;
  // Prefer resetRoot if available (some routers expose this)
  if (typeof nav.resetRoot === 'function') {
    return nav.resetRoot(state);
  }
  // Fallback to reset (AppRouter implements reset)
  if (typeof nav.reset === 'function') {
    return nav.reset(state);
  }
  // As a final fallback, try to replace/navigate to the first route
  if (state && state.routes && state.routes.length > 0) {
    const first = state.routes[0];
    if (typeof nav.replace === 'function') {
      return nav.replace(first.name, first.params || {});
    }
    if (typeof nav.navigate === 'function') {
      return nav.navigate(first.name, first.params || {});
    }
  }
}

export function setPendingNotificationNavigation(routeInfo) {
  pendingNotificationNavigation = routeInfo;
  try {
    if (typeof window !== 'undefined') {
      window.__pendingNotificationNavigation = routeInfo;
    }
  } catch (e) {
    // ignore
  }
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

export default {
  navigate,
  resetRoot,
  navigationRef,
  setPendingNotificationNavigation,
  getPendingNotificationNavigation,
  clearPendingNotificationNavigation,
  isAppReady
};