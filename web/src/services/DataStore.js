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

export function setOrganization(org) {
  store.organization = org || null;
}

export function getOrganization() {
  return store.organization;
}

export default {
  setAppData,
  getAppData,
  setOrganization,
  getOrganization,
};
