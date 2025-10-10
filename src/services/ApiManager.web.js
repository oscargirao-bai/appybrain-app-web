import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Lazy import to avoid circular dependency issues under Vite/ESM
let DataManager = null;
const getDataManager = async () => {
    if (!DataManager) {
        const mod = await import('./DataManager');
        DataManager = mod.default;
    }
    return DataManager;
};

// Token storage keys
const TOKENS = {
    access: 'appybrain_access_token',
    refresh: 'appybrain_refresh_token',
    expiresAt: 'appybrain_expires_at'
};

// Web-only storage helpers - use AsyncStorage only (no SecureStore on web)
const secureSet = async (key, value) => {
    return AsyncStorage.setItem(key, value);
};

const secureGet = async (key) => {
    return AsyncStorage.getItem(key);
};

const secureDelete = async (key) => {
    return AsyncStorage.removeItem(key);
};

class ApiManager {
    constructor() {
        this.baseUrl = '';
        this.accessToken = null;
        this.refreshToken = null;
        this.expiresAt = null;
        this.initialized = false;
        this.requestQueue = Promise.resolve(); // Sequential queue to avoid race conditions
    }

    // Initialize and load session from storage
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

    // Load session from storage
    async loadSession() {
        try {
            const [
                [, accessToken],
                [, expiresAtStr]
            ] = await AsyncStorage.multiGet([
                TOKENS.access,
                TOKENS.expiresAt
            ]);

            const refreshToken = await secureGet(TOKENS.refresh);

            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.expiresAt = expiresAtStr ? Number(expiresAtStr) : null;

            return {
                accessToken: this.accessToken,
                refreshToken: this.refreshToken,
                expiresAt: this.expiresAt
            };
        } catch (error) {
            console.error('Failed to load session:', error);
            return {
                accessToken: null,
                refreshToken: null,
                expiresAt: null
            };
        }
    }

    // Save session to storage
    async saveSession(accessToken, refreshToken, expiresAt) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresAt = expiresAt;

        try {
            const ops = [
                AsyncStorage.setItem(TOKENS.access, accessToken || ''),
                AsyncStorage.setItem(TOKENS.expiresAt, String(expiresAt || '')),
                secureSet(TOKENS.refresh, refreshToken || '')
            ];
            await Promise.all(ops);
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    }

    // Clear session
    async clearSession() {
        this.accessToken = null;
        this.refreshToken = null;
        this.expiresAt = null;

        try {
            await Promise.all([
                AsyncStorage.removeItem(TOKENS.access),
                AsyncStorage.removeItem(TOKENS.expiresAt),
                secureDelete(TOKENS.refresh)
            ]);
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    }

    // Check if token is expired
    isTokenExpired() {
        if (!this.expiresAt) return true;
        const now = Date.now();
        const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
        return now >= (this.expiresAt - bufferTime);
    }

    // Refresh access token
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch(`${this.baseUrl}auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken: this.refreshToken }),
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                await this.clearSession();
                throw new Error('Refresh token expired');
            }
            throw new Error(`Failed to refresh token: ${response.status}`);
        }

        const data = await response.json();
        const { accessToken, refreshToken, expiresAt } = data;

        await this.saveSession(accessToken, refreshToken, expiresAt);

        return accessToken;
    }

    // Make API request with automatic token refresh
    async request(endpoint, options = {}) {
        // Ensure sequential execution of requests
        return this.requestQueue = this.requestQueue.then(async () => {
            if (!this.initialized) {
                await this.init();
            }

            // Check if token needs refresh
            if (this.accessToken && this.isTokenExpired()) {
                try {
                    await this.refreshAccessToken();
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    // Clear session and let the request proceed (will likely get 401)
                    await this.clearSession();
                }
            }

            // Add authorization header if we have a token
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers,
            };

            if (this.accessToken) {
                headers['Authorization'] = `Bearer ${this.accessToken}`;
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers,
            });

            // If we get 401, try to refresh token once
            if (response.status === 401 && this.refreshToken) {
                try {
                    await this.refreshAccessToken();
                    // Retry the request with new token
                    headers['Authorization'] = `Bearer ${this.accessToken}`;
                    const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
                        ...options,
                        headers,
                    });
                    return retryResponse;
                } catch (error) {
                    console.error('Token refresh on 401 failed:', error);
                    await this.clearSession();
                    return response;
                }
            }

            return response;
        });
    }

    // Convenience methods
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    async post(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async put(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    async patch(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    }

    // Login
    async login(email, password) {
        const response = await this.post('auth/login', { email, password });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        const { accessToken, refreshToken, expiresAt } = data;

        await this.saveSession(accessToken, refreshToken, expiresAt);

        // Load user data after successful login
        const DM = await getDataManager();
        await DM.refreshSection('userInfo');

        return data;
    }

    // Logout
    async logout() {
        try {
            await this.post('auth/logout', {});
        } catch (error) {
            console.error('Logout request failed:', error);
        }

        await this.clearSession();

        // Clear all data
        const DM = await getDataManager();
        await DM.clearAll();
    }

    // Check if user is logged in
    isLoggedIn() {
        return !!this.accessToken && !this.isTokenExpired();
    }

    // Get current access token
    getAccessToken() {
        return this.accessToken;
    }
}

// Export singleton instance
export default new ApiManager();
