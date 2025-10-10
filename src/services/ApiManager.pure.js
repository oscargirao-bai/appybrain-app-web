import AsyncStorage from '@react-native-async-storage/async-storage';

// Token storage keys
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
        this.initialized = false;
        this.requestQueue = Promise.resolve();
    }

    async init(config = {}) {
        if (config.baseUrl) {
            this.baseUrl = config.baseUrl;
        }

        if (this.initialized) return;

        try {
            await this.loadSession();
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize ApiManager:', error);
            this.initialized = true;
        }
    }

    async loadSession() {
        try {
            const accessToken = await AsyncStorage.getItem(TOKENS.access);
            const refreshToken = await AsyncStorage.getItem(TOKENS.refresh);
            const expiresAt = await AsyncStorage.getItem(TOKENS.expiresAt);

            if (accessToken) this.accessToken = accessToken;
            if (refreshToken) this.refreshToken = refreshToken;
            if (expiresAt) this.expiresAt = parseInt(expiresAt, 10);

            console.log('[ApiManager] Session loaded');
        } catch (error) {
            console.error('[ApiManager] Failed to load session:', error);
        }
    }

    async saveSession(accessToken, refreshToken, expiresAt) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresAt = expiresAt;

        try {
            await Promise.all([
                AsyncStorage.setItem(TOKENS.access, accessToken),
                AsyncStorage.setItem(TOKENS.refresh, refreshToken),
                AsyncStorage.setItem(TOKENS.expiresAt, expiresAt.toString())
            ]);
        } catch (error) {
            console.error('[ApiManager] Failed to save session:', error);
        }
    }

    async clearSession() {
        this.accessToken = null;
        this.refreshToken = null;
        this.expiresAt = null;

        try {
            await Promise.all([
                AsyncStorage.removeItem(TOKENS.access),
                AsyncStorage.removeItem(TOKENS.refresh),
                AsyncStorage.removeItem(TOKENS.expiresAt)
            ]);
        } catch (error) {
            console.error('[ApiManager] Failed to clear session:', error);
        }
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.accessToken && !options.skipAuth) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include' // Important for CORS with cookies
            });

            if (response.status === 401 && this.refreshToken && !options.skipAuth) {
                // Try to refresh token
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    // Retry original request
                    headers['Authorization'] = `Bearer ${this.accessToken}`;
                    const retryResponse = await fetch(url, {
                        ...options,
                        headers,
                        credentials: 'include'
                    });
                    return this.handleResponse(retryResponse);
                }
            }

            return this.handleResponse(response);
        } catch (error) {
            // Network or CORS error
            console.error('[ApiManager] Request failed:', error);
            console.error('[ApiManager] URL:', url);
            console.error('[ApiManager] Headers:', headers);
            
            const corsError = new Error('Erro de rede ou CORS. Verifique a consola para detalhes.');
            corsError.status = 0;
            corsError.originalError = error;
            throw corsError;
        }
    }

    async handleResponse(response) {
        const text = await response.text();
        let data;

        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = { raw: text };
        }

        if (!response.ok) {
            const error = new Error(data.message || `HTTP ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    }

    async refreshAccessToken() {
        try {
            const data = await this.request('auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken: this.refreshToken }),
                skipAuth: true
            });

            if (data.accessToken && data.expiresAt) {
                await this.saveSession(
                    data.accessToken,
                    this.refreshToken,
                    data.expiresAt
                );
                return true;
            }

            return false;
        } catch (error) {
            console.error('[ApiManager] Token refresh failed:', error);
            await this.clearSession();
            return false;
        }
    }

    async post(endpoint, body) {
        return this.requestQueue = this.requestQueue.then(() =>
            this.request(endpoint, {
                method: 'POST',
                body: JSON.stringify(body)
            })
        );
    }

    async get(endpoint) {
        return this.requestQueue = this.requestQueue.then(() =>
            this.request(endpoint, { method: 'GET' })
        );
    }

    async login(email, password) {
        const data = await this.post('auth/login', { email, password });

        if (data.accessToken && data.refreshToken && data.expiresAt) {
            await this.saveSession(data.accessToken, data.refreshToken, data.expiresAt);
        }

        return data;
    }

    async logout() {
        try {
            await this.post('auth/logout', {});
        } catch (error) {
            console.error('[ApiManager] Logout failed:', error);
        } finally {
            await this.clearSession();
        }
    }

    async validateSession() {
        try {
            // Check if we have tokens
            if (!this.accessToken || !this.refreshToken) {
                return false;
            }

            // Call the logon_user endpoint to validate session
            const response = await this.get('api/auth/logon_user');

            // If we get here without an error, session is valid
            if (response && response.success) {
                return response;
            }

            return false;
        } catch (error) {
            console.log('[ApiManager] Session validation failed:', error.message);

            // Check if it's an authentication error (401 or 400)
            if (error.message.includes('Unauthorized') || error.message.includes('400')) {
                // Clear invalid tokens
                await this.clearSession();
                return false;
            }

            // For other errors (network, etc.), assume session is invalid
            return false;
        }
    }

    isAuthenticated() {
        return !!this.accessToken && (!this.expiresAt || Date.now() < this.expiresAt);
    }
}

export default new ApiManager();
