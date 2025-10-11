// Pure web ApiManager. Endpoints must match the original project EXACTLY.

const TOKENS = {
  access: 'appybrain_access_token',
  refresh: 'appybrain_refresh_token',
  expiresAt: 'appybrain_expires_at'
};

class ApiManager {
  constructor() {
    this.baseUrl = '';
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
    this.queue = Promise.resolve();
    this.initialized = false;
  }

  async init({ baseUrl }) {
    this.baseUrl = baseUrl;
    if (this.initialized) return;
    await this.loadSession();
    this.initialized = true;
  }

  async loadSession() {
    this.accessToken = localStorage.getItem(TOKENS.access);
    this.refreshToken = localStorage.getItem(TOKENS.refresh);
    const raw = localStorage.getItem(TOKENS.expiresAt);
    this.expiresAt = raw ? parseInt(raw, 10) : null;
  }

  async saveSession(accessToken, refreshToken, expiresAt) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;
    localStorage.setItem(TOKENS.access, accessToken);
    localStorage.setItem(TOKENS.refresh, refreshToken);
    localStorage.setItem(TOKENS.expiresAt, String(expiresAt));
  }

  async clearSession() {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
    localStorage.removeItem(TOKENS.access);
    localStorage.removeItem(TOKENS.refresh);
    localStorage.removeItem(TOKENS.expiresAt);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (this.accessToken && !options.skipAuth) headers['Authorization'] = `Bearer ${this.accessToken}`;

    const doFetch = async () => {
      const res = await fetch(url, { ...options, headers, credentials: 'include' });
      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
      if (!res.ok || data?.success === false) {
        const err = new Error(data?.message || `HTTP ${res.status}`);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    };

    try {
      return await doFetch();
    } catch (e) {
      if (e.status === 401 && this.refreshToken && !options.skipAuth) {
        const refreshed = await this.refresh();
        if (refreshed) return await doFetch();
      }
      throw e;
    }
  }

  get(endpoint) { return this.queue = this.queue.then(() => this.request(endpoint, { method: 'GET' })); }
  post(endpoint, body) { return this.queue = this.queue.then(() => this.request(endpoint, { method: 'POST', body: JSON.stringify(body) })); }

  async refresh() {
    try {
      const data = await this.post('auth/refresh', { refreshToken: this.refreshToken, });
      const expiresAt = typeof data.expiresAt === 'number' ? data.expiresAt : Date.now() + (data.expiresIn || 3600) * 1000;
      await this.saveSession(data.accessToken, this.refreshToken, expiresAt);
      return true;
    } catch (e) {
      await this.clearSession();
      return false;
    }
  }

  async login(email, password) {
    const data = await this.post('auth/login', { email, password });
    const expiresAt = typeof data.expiresAt === 'number' ? data.expiresAt : Date.now() + (data.expiresIn || 3600) * 1000;
    if (data.accessToken && data.refreshToken) await this.saveSession(data.accessToken, data.refreshToken, expiresAt);
    return data;
  }

  async validateSession() {
    if (!this.accessToken || !this.refreshToken) return false;
    try {
      return await this.get('auth/logon_user');
    } catch (e) {
      if (e.status === 401) await this.clearSession();
      return false;
    }
  }

  async loadOrganizationData() {
    const res = await this.get('auth/logon_user');
    return res?.organization || null;
  }

  async loadAppData() {
    const userInfo = await this.get('app/gamification_user_badges').catch(() => null);
    const disciplines = await this.get('app/learn_content_list').catch(() => null);
    const userStars = await this.get('app/gamification_user_stars').catch(() => null);
    const tribes = await this.get('app/tribes_list').catch(() => null);
    const userChests = await this.get('app/gamification_user_chests').catch(() => null);
    const notifications = await this.get('app/user_notifications').catch(() => null);
    const news = await this.get('app/information_news').catch(() => null);
    const rankings = await this.get('app/ranking').catch(() => null);
    const challenges = await this.get('app/challenges_list').catch(() => null);
    return { userInfo, disciplines, userStars, tribes, userChests, notifications, news, rankings, challenges };
  }
}

export default new ApiManager();
