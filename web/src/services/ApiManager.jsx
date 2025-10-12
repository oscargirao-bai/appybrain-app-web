// Web localStorage wrapper (replaces AsyncStorage)
const AsyncStorage = {
	async getItem(key) {
		return localStorage.getItem(key);
	},
	async setItem(key, value) {
		localStorage.setItem(key, value);
	},
	async removeItem(key) {
		localStorage.removeItem(key);
	},
	async multiGet(keys) {
		return keys.map(key => [key, localStorage.getItem(key)]);
	},
	async multiSet(pairs) {
		pairs.forEach(([key, value]) => localStorage.setItem(key, value));
	},
	async multiRemove(keys) {
		keys.forEach(key => localStorage.removeItem(key));
	}
};

// Import DataManager at the top to avoid dynamic imports
// Note: This creates a circular dependency, but it's safe because we only use
// DataManager.setUserConfig() which doesn't depend on ApiManager
let DataManager = null;
const getDataManager = () => {
    if (!DataManager) {
        DataManager = require('./DataManager').default;
    }
    return DataManager;
};

// Token storage keys
const TOKENS = {
    access: 'appybrain_access_token',
    refresh: 'appybrain_refresh_token',
    expiresAt: 'appybrain_expires_at'
};

// Secure storage helpers (use localStorage for web)
const secureSet = async (key, value) => {
    await AsyncStorage.setItem(key, value);
};

const secureGet = async (key) => {
    return AsyncStorage.getItem(key);
};

const secureDelete = async (key) => {
    await AsyncStorage.removeItem(key);
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
    async saveSession(accessToken, refreshToken, expiresIn) {
        try {
            // Validate required parameters
            if (!accessToken || !refreshToken) {
                throw new Error('accessToken and refreshToken are required for saveSession');
            }

            const expiresAt = Date.now() + (expiresIn * 1000);

            // Update memory
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.expiresAt = expiresAt;

            // Save access token and expiration to AsyncStorage
            await AsyncStorage.multiSet([
                [TOKENS.access, accessToken],
                [TOKENS.expiresAt, expiresAt.toString()]
            ]);

            // Save refresh token to secure storage
            await secureSet(TOKENS.refresh, refreshToken);
        } catch (error) {
            console.error('Failed to save session:', error);
            throw error;
        }
    }

    // Clear session from storage and memory
    async clearSession() {
        try {
            // Clear memory
            this.accessToken = null;
            this.refreshToken = null;
            this.expiresAt = null;

            // Clear storage
            await AsyncStorage.multiRemove([
                TOKENS.access,
                TOKENS.expiresAt
            ]);

            // Clear refresh token from secure storage
            await secureDelete(TOKENS.refresh);
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    }

    // Update tokens from response headers (token rotation)
    async updateRotatedTokens(headers) {
        try {
            const newAccessToken = headers.get('X-Access-Token');
            const newRefreshToken = headers.get('X-Refresh-Token');
            const newExpiresIn = headers.get('X-Expires-In');

            // Only update if new tokens are provided
            if (newAccessToken) {
                this.accessToken = newAccessToken;
                await AsyncStorage.setItem(TOKENS.access, newAccessToken);
            }

            if (newRefreshToken) {
                this.refreshToken = newRefreshToken;
                await secureSet(TOKENS.refresh, newRefreshToken);
            }

            if (newExpiresIn) {
                const expiresAt = Date.now() + (Number(newExpiresIn) * 1000);
                this.expiresAt = expiresAt;
                await AsyncStorage.setItem(TOKENS.expiresAt, expiresAt.toString());
            }

            return {
                newAccessToken,
                newRefreshToken,
                newExpiresIn
            };
        } catch (error) {
            console.error('Failed to update rotated tokens:', error);
        }
    }

    // Add request to sequential queue
    enqueue(requestFunction) {
        this.requestQueue = this.requestQueue
            .then(requestFunction)
            .catch(requestFunction);
        return this.requestQueue;
    }

    // Login method
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                const error = new Error(data.message || 'Login failed');
                error.status = response.status;
                throw error;
            }

            // Validate required response fields
            if (!data.accessToken || !data.refreshToken) {
                throw new Error('Invalid login response: missing accessToken or refreshToken');
            }

            // Provide default value for expiresIn if not provided
            const expiresIn = data.expiresIn || 3600; // Default to 1 hour if not provided

            // Save tokens to secure storage
            await this.saveSession(
                data.accessToken,
                data.refreshToken,
                expiresIn
            );

            // After successful login, get full user data from logon_user
            try {
                const userResponse = await this.makeAuthenticatedJSONRequest('api/auth/logon_user');
                if (userResponse && userResponse.success && userResponse.user) {
                    // Merge the user data into the response
                    data.user = userResponse.user;
                }
            } catch (error) {
                console.warn('Failed to fetch user data after login:', error);
                // Continue with login even if this fails
            }

            return data;
        } catch (error) {
            console.log('Email: ', email);
            console.log('Password: ', password);
            console.error('Login error:', error);
            throw error;
        }
    }

    // Forgot password method
    async forgotPassword(email) {
        try {
            const response = await fetch(`${this.baseUrl}api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            // Return the full response data including success and message
            return {
                success: data.success || false,
                message: data.message || 'No message provided',
                status: response.status,
                ...data
            };
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    }

    // Password change method
    async changePassword(currentPassword, newPassword, confirmPassword) {
        try {
            const response = await this.makeAuthenticatedJSONRequest('api/auth/change_password', {
                method: 'POST',
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword
                })
            });

            // Return the response data
            return {
                success: response?.success || false,
                message: response?.message || 'No message provided',
                ...response
            };
        } catch (error) {
            console.error('Password change error:', error);
            throw error;
        }
    }

    // Logout method
    async logout() {
        try {
            // Try to call logout endpoint if we have a token
            if (this.accessToken) {
                try {
                    await this.makeAuthenticatedRequest('api/auth/logout', {
                        method: 'POST'
                    });
                } catch (error) {
                    // Ignore logout API errors, still clear local session
                    console.warn('Logout API call failed:', error);
                }
            }
        } finally {
            // Always clear local session
            await this.clearSession();
        }
    }

    // Make authenticated request with automatic token rotation
    async makeAuthenticatedRequest(path, options = {}) {
        return this.enqueue(async () => {
            // Ensure we're initialized
            await this.init();

            if (!this.accessToken) {
                await this.clearSession();
                const error = new Error('No access token available');
                error.status = 401;
                throw error;
            }

            try {
                const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;

                const response = await fetch(url, {
                    method: 'POST', // Default to POST as specified
                    ...options,
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json',
                        ...(options.headers || {})
                    }
                });

                // Update tokens if rotation headers are present
                await this.updateRotatedTokens(response.headers);

                // Handle 401 - unauthorized
                if (response.status === 401) {
                    await this.clearSession();
                    const error = new Error('Unauthorized - session expired');
                    error.status = 401;
                    throw error;
                }

                if (!response.ok) {
                    const error = new Error(`Request failed: ${response.status}`);
                    error.status = response.status;
                    throw error;
                }

                return response;
            } catch (error) {
                // If it's a 401 error, clear session
                if (error.status === 401) {
                    await this.clearSession();
                }
                throw error;
            }
        });
    }

    // Convenience method for JSON responses
    async makeAuthenticatedJSONRequest(path, options = {}) {
        const response = await this.makeAuthenticatedRequest(path, options);
        return response.json();
    }

    // Check if user is authenticated
    async isAuthenticated() {
        await this.init();
        return !!(this.accessToken && this.refreshToken);
    }

    // Validate session with server
    async validateSession() {
        try {
            await this.init();

            // Check if we have tokens
            if (!this.accessToken || !this.refreshToken) {
                return false;
            }

            // Call the logon_user endpoint to validate session
            const response = await this.makeAuthenticatedJSONRequest('api/auth/logon_user');

            // If we get here without an error, session is valid
            // Store user config if available
            if (response && response.success && response.user) {
                // Get DataManager instance (lazy loaded to avoid circular dependency issues)
                const dm = getDataManager();
                dm.setUserConfig({
                    randomPosition: response.user.randomPosition,
                    fullAccess: response.user.fullAccess
                });
            }

            return true;
        } catch (error) {
            console.log('Session validation failed:', error.message);

            // Check if it's an authentication error (401 or 400)
            if (error.message.includes('Unauthorized') || error.message.includes('400')) {
                // Clear invalid tokens
                await this.clearSession();
                return false;
            }

            // For other errors (network, etc.), assume session might still be valid
            // but don't proceed with auto-login
            return false;
        }
    }

    // Get current token (for debugging)
    async getCurrentToken() {
        await this.init();
        return this.accessToken;
    }

    // Get logon_user data (includes organization info)
    async getLogonUserData() {
        try {
            const response = await this.makeAuthenticatedJSONRequest('api/auth/logon_user');
            return response;
        } catch (error) {
            console.error('Failed to get logon_user data:', error);
            throw error;
        }
    }

    // Load all necessary app data from multiple endpoints
    async loadAppData() {
        try {
            // Make request to user info endpoint only
            const userInfo = await this.makeAuthenticatedJSONRequest('api/app/gamification_user_badges').catch(err => {
                console.warn('Failed to load user info:', err);
                return null;
            });

            // Make request to disciplines endpoint
            const disciplines = await this.makeAuthenticatedJSONRequest('api/app/learn_content_list').catch(err => {
                console.warn('Failed to load disciplines:', err);
                return null;
            });

            // Make request to user stars endpoint
            const userStars = await this.makeAuthenticatedJSONRequest('api/app/gamification_user_stars').catch(err => {
                console.warn('Failed to load user stars:', err);
                return null;
            });

            // Make request to tribes list endpoint
            const tribes = await this.makeAuthenticatedJSONRequest('api/app/tribes_list').catch(err => {
                console.warn('Failed to load tribes:', err);
                return null;
            });

            // Make request to user chests endpoint
            const userChests = await this.makeAuthenticatedJSONRequest('api/app/gamification_user_chests').catch(err => {
                console.warn('Failed to load user chests:', err);
                return null;
            });

            // Make request to notifications endpoint
            const notifications = await this.makeAuthenticatedJSONRequest('api/app/user_notifications').catch(err => {
                console.warn('Failed to load notifications:', err);
                return null;
            });

            // Make request to news endpoint
            const news = await this.makeAuthenticatedJSONRequest('api/app/information_news').catch(err => {
                console.warn('Failed to load news:', err);
                return null;
            });

            // Make request to rankings endpoint
            const rankings = await this.makeAuthenticatedJSONRequest('api/app/ranking').catch(err => {
                console.warn('Failed to load rankings:', err);
                return null;
            });

            // Make request to challenges endpoint
            const challenges = await this.makeAuthenticatedJSONRequest('api/app/challenges_list').catch(err => {
                console.warn('Failed to load challenges:', err);
                return null;
            });

            // Return consolidated data object
            return {
                userInfo,
                disciplines,
                userStars,
                tribes,
                userChests,
                notifications,
                news,
                rankings,
                challenges,
                loadedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Failed to load app data:', error);

            // If it's an auth error, let it bubble up
            if (error.status === 401) {
                throw error;
            }

            throw new Error('Failed to load application data');
        }
    }

    // Get tribe members for a specific tribe
    async getTribeMembers(tribeId) {
        try {
            const payload = { tribeId: tribeId };
            const response = await this.makeAuthenticatedJSONRequest('api/organization/tribe_members', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            return response;
        } catch (error) {
            console.error('Failed to fetch tribe members:', error);
            throw error;
        }
    }

    // Join a tribe
    async joinTribe(tribeId) {
        try {
            const payload = { tribeId: tribeId };
            const response = await this.makeAuthenticatedJSONRequest('api/app/tribes_join', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            return response;
        } catch (error) {
            console.error('Failed to join tribe:', error);
            throw error;
        }
    }

    // Leave a tribe
    async leaveTribe() {
        try {
            const response = await this.makeAuthenticatedJSONRequest('api/app/tribes_leave', {
                method: 'POST'
            });

            return response;
        } catch (error) {
            console.error('Failed to leave tribe:', error);
            throw error;
        }
    }

    // Get news/announcements
    async getNews() {
        try {
            const response = await this.makeAuthenticatedJSONRequest('api/app/information_news');

            // Return the news array from the response
            return response?.news || [];
        } catch (error) {
            console.error('Failed to load news:', error);
            throw error;
        }
    }

    // Get user notifications
    async getNotifications() {
        try {
            const response = await this.makeAuthenticatedJSONRequest('api/app/user_notifications');

            // Return the notifications array from the response
            return response?.notifications || [];
        } catch (error) {
            console.error('Failed to load notifications:', error);
            throw error;
        }
    }

    // Mark notification as read
    async markNotificationAsRead(notificationId) {
        try {
            const payload = { notificationId: notificationId };
            const response = await this.makeAuthenticatedJSONRequest('api/app/user_notification_read', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            return response;
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            throw error;
        }
    }

    // Get rankings data (global, school, class)
    async getRankings(type = 'points') {
        try {
            const response = await this.makeAuthenticatedJSONRequest('api/app/ranking', {
                method: 'POST',
                body: JSON.stringify({ type })
            });

            // Return the full response including ranking array and metadata
            return response || { success: false, ranking: [] };
        } catch (error) {
            console.error('Failed to load rankings:', error);
            throw error;
        }
    }

    // Get user badges and profile info for a specific user
    async getUserBadges(userId) {
        try {
            const payload = { userId: userId };
            const response = await this.makeAuthenticatedJSONRequest('api/app/gamification_user_badges', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            return response;
        } catch (error) {
            console.error('Failed to load user badges:', error);
            throw error;
        }
    }

    // Get cosmetics list for shop and profile customization
    async getCosmetics() {
        try {
            const response = await this.makeAuthenticatedJSONRequest('api/app/cosmetics_list');

            // Return the items array from the response
            return response?.items || [];
        } catch (error) {
            console.error('Failed to load cosmetics:', error);
            throw error;
        }
    }

    // Get quiz questions for a specific content and difficulty OR challenge OR battle
    async getQuizQuestions(quizType, idParam, difficulty) {
        try {
            let payload;
            
            if (quizType === 'challenge') {
                // For challenge quizzes, use challengeId
                payload = {
                    quizType: 'challenge',
                    challengeId: idParam
                };
            } else if (quizType === 'battle') {
                // For battle quizzes, use simple battle payload
                payload = {
                    quizType: 'battle'
                };
            } else {
                // For learn quizzes, use contentId and difficulty
                payload = {
                    quizType: quizType,
                    contentId: idParam,
                    difficulty: difficulty
                };
            }

            const response = await this.makeAuthenticatedJSONRequest('api/app/quiz_questions', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            return response;
        } catch (error) {
            console.error('Failed to load quiz questions:', error);
            throw error;
        }
    }

    // Submit answer result for a quiz question
    async submitAnswerResult(sessionId, quizId, correct, timeMs, heroUsedId = null) {
        try {
            const payload = {
                sessionId: sessionId,
                quizId: quizId,
                correct: correct,
                timeMs: timeMs,
                heroUsedId: heroUsedId
            };

            const response = await this.makeAuthenticatedJSONRequest('api/app/answer_result', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            return response;
        } catch (error) {
            console.error('Failed to submit answer result:', error);
            throw error;
        }
    }

    // Purchase a cosmetic item
    async purchaseCosmetic(cosmeticId) {
        try {
            const response = await this.makeAuthenticatedJSONRequest('api/app/cosmetics_buy', {
                method: 'POST',
                body: JSON.stringify({ cosmeticId })
            });

            return response;
        } catch (error) {
            console.error('Failed to purchase cosmetic:', error);
            throw error;
        }
    }

    // Update user nickname
    async updateNickname(nickname) {
        try {
            const payload = {
                nickname: nickname
            };

            const response = await this.makeAuthenticatedJSONRequest('api/app/nickname_update', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            return response;
        } catch (error) {
            console.error('Failed to update nickname:', error);
            throw error;
        }
    }

    // Get individual news content by ID
    async getLearnContentFull(contentId) {
        try {
            const response = await this.makeAuthenticatedJSONRequest('api/app/learn_content_full', {
                method: 'POST',
                body: JSON.stringify({ id: contentId })
            });

            // Return the content data
            return response;
        } catch (error) {
            console.error('Failed to load learn content:', error);
            throw error;
        }
    }

    // Get challenges list
    async getChallenges() {
        try {
            const response = await this.makeAuthenticatedJSONRequest('api/app/challenges_list');

            // Return the challenges array from the response
            return response?.challenges || [];
        } catch (error) {
            console.error('Failed to load challenges:', error);
            throw error;
        }
    }

    // Start a challenge
    async startChallenge(challengeId) {
        try {
            const response = await this.makeAuthenticatedJSONRequest('api/app/challenges_start', {
                method: 'POST',
                body: JSON.stringify({ challengeId })
            });

            return response;
        } catch (error) {
            console.error('Failed to start challenge:', error);
            throw error;
        }
    }

    async getNewsContent(newsId) {
        try {
            const response = await this.makeAuthenticatedJSONRequest('api/app/information_news', {
                method: 'POST',
                body: JSON.stringify({ id: newsId })
            });

            // Return the news array from the response
            return response?.news || [];
        } catch (error) {
            console.error('Failed to load news content:', error);
            throw error;
        }
    }

    // Submit challenge answer
    async submitChallengeAnswer(challengeId, questionId, answerId) {
        try {
            const payload = {
                challengeId: challengeId,
                questionId: questionId,
                answerId: answerId
            };
            const response = await this.makeAuthenticatedJSONRequest('api/app/challenge_answer', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            return response;
        } catch (error) {
            console.error('Failed to submit challenge answer:', error);
            throw error;
        }
    }

    // Complete a challenge
    async completeChallenge(challengeId) {
        try {
            const payload = { challengeId: challengeId };
            const response = await this.makeAuthenticatedJSONRequest('api/app/challenge_complete', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            return response;
        } catch (error) {
            console.error('Failed to complete challenge:', error);
            throw error;
        }
    }

    // Use/equip a cosmetic item
    async cosmeticsUse(cosmeticId) {
        try {
            const response = await this.makeAuthenticatedJSONRequest('api/app/cosmetics_use', {
                method: 'POST',
                body: JSON.stringify({ cosmeticId })
            });

            return response;
        } catch (error) {
            console.error('Failed to use cosmetic:', error);
            throw error;
        }
    }

    // Open a chest and get rewards
    async openChest(chestId) {
        try {
            const response = await this.makeAuthenticatedJSONRequest('api/app/open_chest', {
                method: 'POST',
                body: JSON.stringify({ chestId })
            });

            return response;
        } catch (error) {
            console.error('Failed to open chest:', error);
            throw error;
        }
    }

        // Quit quiz - submit remaining questions
    async quitQuiz(sessionId, remainingQuizIds) {
        try {
            const payload = {
                sessionId: sessionId,
                quizIds: remainingQuizIds
            };

            const response = await this.makeAuthenticatedJSONRequest('api/app/quiz_quit', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            return response;
        } catch (error) {
            console.error('Failed to quit quiz:', error);
            throw error;
        }
    }

    // Get battle list/history
    async getBattleList() {
        try {
            const response = await this.makeAuthenticatedJSONRequest('api/app/battle_list', {
                method: 'POST'
            });

            return response;
        } catch (error) {
            console.error('Failed to get battle list:', error);
            throw error;
        }
    }

    // Get battle result details for a specific battle session
    async getBattleResult(battleSessionId) {
        try {
            const response = await this.makeAuthenticatedJSONRequest('api/app/battle_result', {
                method: 'POST',
                body: JSON.stringify({ battleSessionId })
            });

            return response;
        } catch (error) {
            console.error('Failed to get battle result:', error);
            throw error;
        }
    }

    // Report a quiz question error
    async reportQuizError(quizId) {
        try {
            const response = await this.makeAuthenticatedRequest('api/app/error_report', {
                method: 'POST',
                body: JSON.stringify({ quizId })
            });
            
            // Return success object without trying to parse
            return response;
        } catch (error) {
            console.error('Failed to report quiz error:', error);
            throw error;
        }
    }

    // Legacy method for backward compatibility - now uses makeAuthenticatedJSONRequest
    async makeRequest(url, options = {}) {
        console.warn('makeRequest is deprecated, use makeAuthenticatedJSONRequest instead');
        return this.makeAuthenticatedJSONRequest(url, options);
    }
}

// Create singleton instance
const apiManager = new ApiManager();

module.exports = apiManager;