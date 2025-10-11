// Simple in-memory store for bootstrapped data
const store = {
  appData: null,
  organization: null,
};

export function setAppData(data) {
  store.appData = data || null;
}

export function getAppData() {
  return store.appData;
}

export function updateAppData(partial) {
  const current = store.appData || {};
  store.appData = { ...current, ...partial };
}

export function setOrganization(org) {
  store.organization = org || null;
}

export function getOrganization() {
  return store.organization;
}

export default {
  setAppData,
  getAppData,
  updateAppData,
  setOrganization,
  getOrganization,
};
