import apiManagerInstance from './ApiManager.jsx';

class DataManagerClass {
    constructor() {
        this.data = {
            userInfo: null,
            organizationInfo: null, // Store organization data from logon_user
            disciplines: [],
            userStars: [],
            userChests: [],
            tribes: [],
            rankings: {
                points: null,
                stars: null,
                xp: null
            },
            notifications: [],
            news: [],
            challenges: [],
            cosmetics: [],
            quotes: [] // Store motivational quotes from API
        };
        this.userConfig = {
            randomPosition: 1,  // Default: shuffle answers
            fullAccess: 0       // Default: restricted access
        };
        this.loading = false;
        this.error = null;
        this.subscribers = new Set();
        this.apiManager = null;
        this.downloadingImages = new Set();
        this.imageCache = new Map(); // Fixed: was cachedImages, but code uses imageCache
    }

    // Initialize with ApiManager instance
    init(apiManager = null) {
        // Use provided ApiManager instance or default singleton
        this.apiManager = apiManager || apiManagerInstance;
        this._initSessionCache();
    }

    // Initialize session cache (clears previous cache)
    async _initSessionCache() {
        try {
            // Ensure maps are initialized
            if (!this.imageCache) this.imageCache = new Map();
            if (!this.downloadingImages) this.downloadingImages = new Set();

            // Clear any existing cache from previous sessions
            await this.clearImageCache();

            // Create fresh cache directory for this session
            const cacheDir = `${"/"}session_cache/`;
            await Promise.resolve();

            // Reset cache tracking
            this.imageCache.clear();
            this.downloadingImages.clear();

            //console.log('Session cache initialized');
        } catch (error) {
        }
    }

    // Generate cache filename from URL
    _getCacheFilename(url) {
        // Create a simple hash from URL for filename
        const hash = url.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        const extension = url.split('.').pop().split('?')[0] || 'jpg';
        return `${Math.abs(hash)}.${extension}`;
    }

    // Download and cache image
    async _downloadAndCacheImage(url) {
        if (!url || typeof url !== 'string') return url;

        // Ensure maps are initialized
        if (!this.imageCache) this.imageCache = new Map();
        if (!this.downloadingImages) this.downloadingImages = new Set();

        // Check if already cached in this session
        if (this.imageCache.has(url)) {
            return this.imageCache.get(url);
        }

        // Check if currently downloading
        if (this.downloadingImages.has(url)) {
            // Wait for ongoing download
            while (this.downloadingImages.has(url)) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return this.imageCache.get(url) || url;
        }

        try {
            this.downloadingImages.add(url);

            const filename = this._getCacheFilename(url);
            const localPath = `${"/"}session_cache/${filename}`;

            // Download image (no need to check if exists since we start fresh each session)
            // Na versão web, não há cache local de ficheiros e CORS impede verificação HEAD
            // Simplesmente retornamos a URL original e deixamos o browser carregar quando necessário
            this.imageCache.set(url, url);
            return url;
        } catch (error) {
            return url; // Return original URL as fallback
        } finally {
            this.downloadingImages.delete(url);
        }
    }

    // Process data and cache images
    async _processAndCacheImages(data) {
        if (!data) return data;

        // Deep clone to avoid mutating original data
        const processedData = JSON.parse(JSON.stringify(data));

        // Process userInfo images
        if (processedData.userInfo) {
            // Handle the userInfo structure with user and items
            if (processedData.userInfo.user) {
                const user = processedData.userInfo.user;
                if (user.avatarUrl && user.avatarUrl.startsWith('http')) {
                    user.avatarUrl = await this._downloadAndCacheImage(user.avatarUrl);
                }
                if (user.frameUrl && user.frameUrl.startsWith('http')) {
                    user.frameUrl = await this._downloadAndCacheImage(user.frameUrl);
                }
                if (user.backgroundUrl && user.backgroundUrl.startsWith('http')) {
                    user.backgroundUrl = await this._downloadAndCacheImage(user.backgroundUrl);
                }
            }

            // Process badges/items images (SVG icons are inline, no need to cache)
            if (Array.isArray(processedData.userInfo.items)) {
                await Promise.all(processedData.userInfo.items.map(async (item) => {
                    // Only cache if there are actual image URLs (not inline SVG)
                    if (item.iconUrl && item.iconUrl.startsWith('http')) {
                        item.iconUrl = await this._downloadAndCacheImage(item.iconUrl);
                    }
                    if (item.imageUrl && item.imageUrl.startsWith('http')) {
                        item.imageUrl = await this._downloadAndCacheImage(item.imageUrl);
                    }
                }));
            }
        }

        // Process shop items images
        if (Array.isArray(processedData.shop)) {
            await Promise.all(processedData.shop.map(async (item) => {
                if (item.imageUrl) {
                    item.imageUrl = await this._downloadAndCacheImage(item.imageUrl);
                }
                if (item.previewUrl) {
                    item.previewUrl = await this._downloadAndCacheImage(item.previewUrl);
                }
            }));
        }

        // Process badges images
        if (Array.isArray(processedData.badges)) {
            await Promise.all(processedData.badges.map(async (badge) => {
                if (badge.imageUrl) {
                    badge.imageUrl = await this._downloadAndCacheImage(badge.imageUrl);
                }
            }));
        }

        // Process challenges images
        if (Array.isArray(processedData.challenges)) {
            await Promise.all(processedData.challenges.map(async (challenge) => {
                if (challenge.imageUrl && challenge.imageUrl.startsWith('http')) {
                    challenge.imageUrl = await this._downloadAndCacheImage(challenge.imageUrl);
                }
            }));
        }

        // Process disciplines images (areas -> categories structure)
        if (Array.isArray(processedData.disciplines)) {
            await Promise.all(processedData.disciplines.map(async (area) => {
                // Process area icons (SVG icons are inline, no need to cache)
                // Only cache if there are actual image URLs
                if (area.iconUrl && area.iconUrl.startsWith('http')) {
                    area.iconUrl = await this._downloadAndCacheImage(area.iconUrl);
                }

                // Process categories within each area
                if (Array.isArray(area.categories)) {
                    await Promise.all(area.categories.map(async (category) => {
                        // Process category icons (SVG icons are inline, no need to cache)
                        if (category.iconUrl && category.iconUrl.startsWith('http')) {
                            category.iconUrl = await this._downloadAndCacheImage(category.iconUrl);
                        }

                        // Process contents within each category if they have images
                        if (Array.isArray(category.contents)) {
                            await Promise.all(category.contents.map(async (content) => {
                                if (content.imageUrl && content.imageUrl.startsWith('http')) {
                                    content.imageUrl = await this._downloadAndCacheImage(content.imageUrl);
                                }
                                if (content.thumbnailUrl && content.thumbnailUrl.startsWith('http')) {
                                    content.thumbnailUrl = await this._downloadAndCacheImage(content.thumbnailUrl);
                                }
                            }));
                        }
                    }));
                }
            }));
        }

        return processedData;
    }

    // Subscribe to data changes
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    // Notify all subscribers of data changes
    _notifySubscribers() {
        //console.log('DataManager: _notifySubscribers called, subscribers count:', this.subscribers.size); // Debug log
        this.subscribers.forEach(callback => {
            try {
                callback(this.data, this.loading, this.error);
            } catch (err) {
            }
        });
    }

    // Get current data
    getData() {
        return {
            data: this.data,
            loading: this.loading,
            error: this.error
        };
    }

    // Load all app data from API
    async loadAppData() {
        if (!this.apiManager) {
            throw new Error('DataManager not initialized with ApiManager');
        }

        this.loading = true;
        this.error = null;
        this._notifySubscribers();

        try {
            const appData = await this.apiManager.loadAppData();

            // Process and cache images
            const processedData = await this._processAndCacheImages(appData);

            // Extract news and notifications from the main API response
            //console.log('DataManager: Processing news and notifications from main API response...');
            const newsData = appData.news?.news || [];
            const notificationsData = appData.notifications?.notifications || [];
            
            // Preload all ranking types during app initialization
            //console.log('DataManager: Preloading all ranking types...');
            const rankingsData = {
                points: null,
                stars: null,
                xp: null
            };
            
            try {
                // Load all ranking types sequentially (no parallel API calls)
                const pointsRankings = await this.apiManager.getRankings('points').catch(error => {
                    return null;
                });
                rankingsData.points = pointsRankings;

                const starsRankings = await this.apiManager.getRankings('stars').catch(error => {
                    return null;
                });
                rankingsData.stars = starsRankings;

                const xpRankings = await this.apiManager.getRankings('xp').catch(error => {
                    return null;
                });
                rankingsData.xp = xpRankings;

                //console.log('DataManager: Successfully preloaded all ranking types sequentially');
            } catch (error) {
            }

            // Load cosmetics separately (not in main API response yet)
            //console.log('DataManager: Loading cosmetics...');
            const cosmeticsData = await this.apiManager.getCosmetics().catch(error => {
                return [];
            });

            // Load challenges separately
            //console.log('DataManager: Loading challenges...');
            const challengesApiData = await this.apiManager.getChallenges().catch(error => {
                return [];
            });

            // Load quotes separately
            //console.log('DataManager: Loading quotes...');
            const quotesApiData = await this.apiManager.makeAuthenticatedJSONRequest('gamification/quotes').catch(error => {
                return { items: [] };
            });

            // Process and cache cosmetic images
            //console.log('DataManager: Processing and caching cosmetic images...');
            const processedCosmetics = await this._processAndCacheImages({ cosmetics: cosmeticsData });

            // Process and cache challenge images
            //console.log('DataManager: Processing and caching challenge images...');
            const processedChallenges = await this._processAndCacheImages({ challenges: challengesApiData });

            // Store initial IDs for future diff detection
            this.previousNewsIds = new Set(newsData.map(item => item.id));
            this.previousNotificationIds = new Set(notificationsData.map(item => item.id));

            // Update internal data store
            // Merge fresh notifications data with any local read status updates
            const currentNotifications = this.data.notifications || [];
            const localReadStatuses = new Map();
            
            // Build a map of locally marked-as-read notifications
            currentNotifications.forEach(notification => {
                if (notification.readAt && notification.id) {
                    localReadStatuses.set(notification.id, notification.readAt);
                }
            });
            
            // Merge fresh API data with preserved local read statuses
            const mergedNotifications = notificationsData.map(notification => {
                const localReadAt = localReadStatuses.get(notification.id);
                if (localReadAt && !notification.readAt) {
                    // Preserve local read status if API hasn't caught up yet
                    return { ...notification, readAt: localReadAt };
                }
                return notification;
            });

            this.data = {
                userInfo: processedData.userInfo,
                badges: processedData.userInfo?.items || [], // Store badges separately for easy access
                disciplines: processedData.disciplines?.areas || [],
                userStars: processedData.userStars,
                userChests: processedData.userChests,
                tribes: processedData.tribes?.tribes || [],
                news: newsData,
                notifications: mergedNotifications,
                cosmetics: processedCosmetics.cosmetics || cosmeticsData,
                rankings: rankingsData,
                challenges: processedChallenges.challenges || challengesApiData,
                quotes: quotesApiData?.items || [], // Store quotes from API
                lastUpdated: processedData.loadedAt
            };

            this.loading = false;
            this._notifySubscribers();

            return this.data;
        } catch (error) {
            this.loading = false;
            this.error = error.message || 'Failed to load app data';
            this._notifySubscribers();
            throw error;
        }
    }

    // Refresh specific data section
    async refreshSection(section) {
        //console.log('DataManager: refreshSection called for:', section); // Debug log
        if (!this.apiManager) {
            throw new Error('DataManager not initialized with ApiManager');
        }

        // Map sections to API endpoints
        const endpoints = {
            userInfo: 'app/gamification_user_badges',
            disciplines: 'app/learn_content_list',
            userStars: 'app/gamification_user_stars',
            notifications: 'app/user_notifications',
            tribes: 'app/tribes_list',
            shop: 'app/cosmetics_list',
            chests: 'app/gamification_user_chests',
            challenges: 'app/challenges_list',
            battles: 'app/battle_list'
        };

        if (!endpoints[section]) {
            throw new Error(`Unknown section: ${section}`);
        }

        try {
            let data;
            
            // Handle special cases for different endpoint types
            if (section === 'battles') {
                // Battles endpoint uses POST request
                data = await this.apiManager.getBattleList();
            } else {
                // Regular GET request
                data = await this.apiManager.makeAuthenticatedJSONRequest(endpoints[section]);
            }

            // Process and cache images for this section
            const processedData = await this._processAndCacheImages({ [section]: data });

            // Handle special cases for data mapping
            if (section === 'disciplines') {
                this.data[section] = processedData[section]?.areas || processedData[section] || [];
            } else if (section === 'chests') {
                // Map chests data to userChests since that's what the components use
                this.data.userChests = processedData[section];
            } else if (section === 'userInfo') {
                // Update userInfo and also update badges from userInfo.items
                this.data[section] = processedData[section];
                this.data.badges = processedData[section]?.items || [];
                //console.log('DataManager: Updated userInfo and badges:', this.data.badges?.length || 0, 'badges');
            } else if (section === 'challenges') {
                // Store challenges data, extracting from API response if needed
                this.data[section] = data?.challenges || data || [];
            } else if (section === 'battles') {
                // Store battles data from API response
                this.data[section] = data?.battles || [];
                //console.log('DataManager: Updated battles:', this.data.battles?.length || 0, 'battles');
            } else {
                this.data[section] = processedData[section];
            }

            this.data.lastUpdated = new Date().toISOString();
            //console.log('DataManager: About to notify subscribers after refreshing', section); // Debug log
            this._notifySubscribers();
            //console.log('DataManager: Finished notifying subscribers after refreshing', section); // Debug log
            return this.data[section];
        } catch (error) {
            throw error;
        }
    }

    // Clear all data and cache
    clearData() {
        this.data = {
            userInfo: null,
            disciplines: [],
            notifications: [],
            tribes: [],
            shop: [],
            chests: [],
            badges: [],
            battles: [],
            lastUpdated: null
        };
        this.loading = false;
        this.error = null;
        this.imageCache.clear();
        this._notifySubscribers();
    }

    // Clear image cache (clears session cache)
    async clearImageCache() {
        try {
            // Ensure maps are initialized
            if (!this.imageCache) this.imageCache = new Map();
            if (!this.downloadingImages) this.downloadingImages = new Set();

            // Clear both old persistent cache and session cache directories
            const oldCacheDir = `${"/"}image_cache/`;
            const sessionCacheDir = `${"/"}session_cache/`;

            // Remove old cache directory if it exists
            const oldDirInfo = await Promise.resolve({ exists: false });
            if (oldDirInfo.exists) {
                await Promise.resolve();
            }

            // Remove session cache directory if it exists
            const sessionDirInfo = await Promise.resolve({ exists: false });
            if (sessionDirInfo.exists) {
                await Promise.resolve();
            }

            this.imageCache.clear();
            this.downloadingImages.clear();
        } catch (error) {
        }
    }

    // Start new session (call this from loading screen)
    async startNewSession() {
        //console.log('Starting new session - clearing cache');
        await this._initSessionCache();
    }

    // Get cached image path for URL
    getCachedImagePath(url) {
        return this.imageCache.get(url) || url;
    }

    // Get specific data section
    getUserInfo() {
        return this.data.userInfo;
    }

    // Get user data specifically
    getUser() {
        return this.data.userInfo?.user || null;
    }

    // Set user configuration from login response
    setUserConfig(userConfigData) {
        if (userConfigData && typeof userConfigData === 'object') {
            this.userConfig.randomPosition = userConfigData.randomPosition || 1;
            this.userConfig.fullAccess = userConfigData.fullAccess || 0;
            //console.log('DataManager: User config set:', this.userConfig);
        }
    }

    // Get user configuration
    getUserConfig() {
        return this.userConfig;
    }

    // Check if answers should be randomized in quizzes
    shouldRandomizeAnswers() {
        return this.userConfig.randomPosition === 1;
    }

    // Check if user has full access (battles and challenges)
    hasFullAccess() {
        return this.userConfig.fullAccess === 1;
    }

    // Get user badges/achievements
    getUserBadges() {
        return this.data.userInfo?.items || [];
    }

    // Get specific badge by ID or code
    getBadgeById(id) {
        return this.getUserBadges().find(badge => badge.id === id);
    }

    getBadgeByCode(code) {
        return this.getUserBadges().find(badge => badge.code === code);
    }

    // Load and cache organization data from logon_user
    async loadOrganizationData() {
        if (!this.apiManager) {
            throw new Error('DataManager not initialized with ApiManager');
        }

        try {
            const logonData = await this.apiManager.getLogonUserData();
            
            if (logonData && logonData.success && logonData.user) {
                const user = logonData.user;
                
                // Store organization info from user object
                this.data.organizationInfo = {
                    name: user.organizationName || '',
                    logoUrl: user.organizationUrl || '',
                    id: user.organizationId || null,
                };

                // Cache the organization logo if URL exists
                if (this.data.organizationInfo.logoUrl) {
                    try {
                        const cachedUrl = await this._downloadAndCacheImage(this.data.organizationInfo.logoUrl);
                        this.data.organizationInfo.logoUrl = cachedUrl;
                    } catch (error) {
                        // Keep the original URL if caching fails
                    }
                }

                this._notifySubscribers();
            }

            return this.data.organizationInfo;
        } catch (error) {
            throw error;
        }
    }

    // Get organization data
    getOrganizationInfo() {
        return this.data.organizationInfo;
    }

    // Get organization logo URL (cached if available)
    getOrganizationLogoUrl() {
        return this.data.organizationInfo?.logoUrl || null;
    }

    // Get badges by level/status
    getCompletedBadges() {
        return this.getUserBadges().filter(badge => badge.currentLevel > 0);
    }

    getInProgressBadges() {
        return this.getUserBadges().filter(badge =>
            badge.currentLevel === 0 && badge.currentCounter > 0
        );
    }

    getAvailableBadges() {
        return this.getUserBadges().filter(badge =>
            badge.currentLevel === 0 && badge.currentCounter === 0
        );
    }

    // Get user stats
    getUserStats() {
        const user = this.getUser();
        if (!user) return null;

        return {
            points: user.points || 0,
            stars: user.stars || 0,
            coins: user.coins || 0,
            level: user.levelId || 1,
            team: user.teamName || '',
            organization: user.organizationName || '',
            groups: user.groups || [],
            tribes: user.tribes || []
        };
    }

    // Get user profile display info
    getUserProfile() {
        const user = this.getUser();
        if (!user) return null;

        return {
            id: user.id,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            nickname: user.nickname || '',
            email: user.email || '',
            initials: user.initials || '',
            avatarUrl: user.avatarUrl || '',
            frameUrl: user.frameUrl || '',
            backgroundUrl: user.backgroundUrl || '',
            role: user.role || 'student',
            status: user.status || 'active',
            lastLogin: user.lastLogin || null,
            createdAt: user.createdAt || null
        };
    }

    // Get all quotes
    getQuotes() {
        return this.data.quotes || [];
    }

    // Get a random quote based on percentage score
    // percentage: 0-100 representing the quiz score
    getRandomQuoteByPercentage(percentage) {
        const quotes = this.getQuotes();
        
        if (!quotes || quotes.length === 0) {
            // Fallback quotes if API quotes are not available
            const fallbackQuotes = [
                { quote: "Fantástico, o teu esforço resultou! 🌈", minimumPercentage: 80, maximumPercentage: 100 },
                { quote: "Excelente trabalho, continua assim! ✨", minimumPercentage: 60, maximumPercentage: 79 },
                { quote: "Continua a treinar, acredita em ti! 💪", minimumPercentage: 0, maximumPercentage: 59 }
            ];
            
            const matchingQuotes = fallbackQuotes.filter(q => 
                percentage >= q.minimumPercentage && percentage <= q.maximumPercentage
            );
            
            if (matchingQuotes.length === 0) return fallbackQuotes[0].quote;
            
            const randomIndex = Math.floor(Math.random() * matchingQuotes.length);
            return matchingQuotes[randomIndex].quote;
        }
        
        // Filter quotes that match the percentage range
        const matchingQuotes = quotes.filter(q => 
            percentage >= q.minimumPercentage && percentage <= q.maximumPercentage
        );
        
        // If no matching quotes found, return a default message
        if (matchingQuotes.length === 0) {
            return "Continue a aprender! 📚";
        }
        
        // Select a random quote from the matching ones
        const randomIndex = Math.floor(Math.random() * matchingQuotes.length);
        return matchingQuotes[randomIndex].quote;
    }

    getDisciplines() {
        return this.data.disciplines;
    }

    // Get user stars data
    getUserStars() {
        return this.data.userStars;
    }

    // Get user chests data
    getUserChests() {
        return this.data.userChests;
    }

    // Get rankings data for a specific type
    getRankings(type = 'points') {
        return this.data.rankings[type];
    }

    // Refresh rankings data for a specific type
    async refreshRankings(type = 'points') {
        if (!this.apiManager) {
            throw new Error('DataManager not initialized with ApiManager');
        }

        try {
            const rankingsData = await this.apiManager.getRankings(type);
            this.data.rankings[type] = rankingsData;
            this._notifySubscribers();
            return rankingsData;
        } catch (error) {
            throw error;
        }
    }

    // Check for ranking updates and only refresh changed ones
    async checkAndUpdateRankings() {
        if (!this.apiManager) {
            throw new Error('DataManager not initialized with ApiManager');
        }

        const rankingTypes = ['points', 'stars', 'xp'];
        const updatePromises = [];
        let hasUpdates = false;

        try {
            // Check each ranking type for updates
            for (const type of rankingTypes) {
                const currentRanking = this.data.rankings[type];
                
                // Always check for updates if we don't have data for this type yet
                if (!currentRanking) {
                    updatePromises.push(this._updateRankingType(type));
                    hasUpdates = true;
                    continue;
                }

                // Get fresh data to compare
                const freshRanking = await this.apiManager.getRankings(type);
                
                // Compare timestamps, ranking count, or top user positions to detect changes
                const hasChanged = this._hasRankingChanged(currentRanking, freshRanking);
                
                if (hasChanged) {
                    //console.log(`DataManager: Detected changes in ${type} rankings, updating...`);
                    this.data.rankings[type] = freshRanking;
                    hasUpdates = true;
                }
            }

            if (hasUpdates) {
                this._notifySubscribers();
                //console.log('DataManager: Rankings updated successfully');
            } else {
                //console.log('DataManager: No ranking changes detected');
            }

            return hasUpdates;
        } catch (error) {
            throw error;
        }
    }

    // Helper method to update a specific ranking type
    async _updateRankingType(type) {
        try {
            const rankingsData = await this.apiManager.getRankings(type);
            this.data.rankings[type] = rankingsData;
            return rankingsData;
        } catch (error) {
            return null;
        }
    }

    // Helper method to detect if ranking has changed
    _hasRankingChanged(oldRanking, newRanking) {
        // Basic change detection strategies
        
        // 1. Different number of users
        const oldUsers = oldRanking?.ranking || [];
        const newUsers = newRanking?.ranking || [];
        
        if (oldUsers.length !== newUsers.length) {
            return true;
        }

        // 2. Check top 5 users' positions and scores
        const topOld = oldUsers.slice(0, 5);
        const topNew = newUsers.slice(0, 5);
        
        for (let i = 0; i < Math.min(topOld.length, topNew.length); i++) {
            const oldUser = topOld[i];
            const newUser = topNew[i];
            
            if (oldUser.userId !== newUser.userId || 
                oldUser.points !== newUser.points || 
                oldUser.position !== newUser.position) {
                return true;
            }
        }

        // 3. Check current user's position and score
        const oldCurrentUser = oldUsers.find(u => u.me === 1);
        const newCurrentUser = newUsers.find(u => u.me === 1);
        
        if (oldCurrentUser && newCurrentUser) {
            if (oldCurrentUser.position !== newCurrentUser.position ||
                oldCurrentUser.points !== newCurrentUser.points) {
                return true;
            }
        }

        return false;
    }

    // Get total stars for user
    getTotalStars() {
        return this.data.userStars?.totals || { earnedStars: 0, maxStars: 0 };
    }

    // Get stars for specific area/discipline
    getAreaStars(areaId) {
        return this.data.userStars?.byArea?.find(area => area.areaId === areaId) || { earnedStars: 0, maxStars: 0 };
    }

    // Get stars for specific category
    getCategoryStars(categoryId) {
        return this.data.userStars?.byCategory?.find(category => category.categoryId === categoryId) || { earnedStars: 0, maxStars: 0 };
    }

    // Get stars for specific content
    getContentStars(contentId) {
        return this.data.userStars?.byContent?.find(content => content.contentId === contentId) || {
            stars: { easy: 0, hard: 0, genius: 0 },
            totalStars: 0,
            maxStars: 0
        };
    }

    // Get all tribes
    getTribes() {
        return this.data.tribes || [];
    }

    // Get user's current tribe (myTribe = 1)
    getUserTribe() {
        return this.data.tribes?.find(tribe => tribe.myTribe === 1) || null;
    }

    // Get available tribes (myTribe = 0)
    getAvailableTribes() {
        return this.data.tribes?.filter(tribe => tribe.myTribe === 0) || [];
    }

    // Get tribe by ID
    getTribeById(tribeId) {
        return this.data.tribes?.find(tribe => tribe.id === tribeId) || null;
    }

    // Get all challenges
    getChallenges() {
        return this.data.challenges || [];
    }

    // Get challenge by ID
    getChallengeById(challengeId) {
        return this.data.challenges?.find(challenge => challenge.id === challengeId) || null;
    }

    // Check if user is in a tribe
    isInTribe() {
        return this.getUserTribe() !== null;
    }

    // Update user's tribe membership (when joining/leaving)
    updateUserTribeMembership(tribeId, isJoined) {
        if (!this.data.tribes) return;

        // Update all tribes: set myTribe to 1 for joined tribe, 0 for others
        this.data.tribes = this.data.tribes.map(tribe => ({
            ...tribe,
            myTribe: tribe.id === tribeId && isJoined ? 1 : 0
        }));

        // Update userInfo with tribe information
        if (this.data.userInfo && this.data.userInfo.user) {
            if (isJoined) {
                // User joined a tribe - find the tribe and add it to userInfo
                const joinedTribe = this.data.tribes.find(tribe => tribe.id === tribeId);
                if (joinedTribe) {
                    // Initialize tribes array if it doesn't exist
                    if (!this.data.userInfo.user.tribes) {
                        this.data.userInfo.user.tribes = [];
                    }

                    // Remove any existing tribe (user can only be in one tribe)
                    this.data.userInfo.user.tribes = [];

                    // Add the new tribe
                    this.data.userInfo.user.tribes.push({
                        id: joinedTribe.id,
                        name: joinedTribe.name,
                        color: joinedTribe.color,
                        icon: joinedTribe.icon
                    });
                }
            } else {
                // User left the tribe - clear tribes array
                this.data.userInfo.user.tribes = [];
            }
        }

        this._notifySubscribers();
    }

    // Get specific area by ID
    getAreaById(areaId) {
        return this.data.disciplines.find(area => area.id === areaId);
    }

    // Get specific category by ID within an area
    getCategoryById(areaId, categoryId) {
        const area = this.getAreaById(areaId);
        return area?.categories?.find(category => category.id === categoryId);
    }

    // Get specific content by ID within a category
    getContentById(areaId, categoryId, contentId) {
        const category = this.getCategoryById(areaId, categoryId);
        return category?.contents?.find(content => content.id === contentId);
    }

    // Get all categories from all areas (flattened)
    getAllCategories() {
        return this.data.disciplines.reduce((allCategories, area) => {
            if (area.categories) {
                allCategories.push(...area.categories.map(category => ({
                    ...category,
                    areaId: area.id,
                    areaTitle: area.title,
                    areaColor: area.color
                })));
            }
            return allCategories;
        }, []);
    }

    // Get all contents from all categories (flattened)
    getAllContents() {
        return this.data.disciplines.reduce((allContents, area) => {
            if (area.categories) {
                area.categories.forEach(category => {
                    if (category.contents) {
                        allContents.push(...category.contents.map(content => ({
                            ...content,
                            areaId: area.id,
                            areaTitle: area.title,
                            areaColor: area.color,
                            categoryId: category.id,
                            categoryTitle: category.title,
                            categoryColor: category.color
                        })));
                    }
                });
            }
            return allContents;
        }, []);
    }

    getNotifications() {
        return this.data.notifications || [];
    }

    getSortedNotifications() {
        const notifications = this.getNotifications();
        return [...notifications].sort((a, b) => {
            // Sort by readAt field: null (unread) first, then by date
            const aRead = a.readAt !== null;
            const bRead = b.readAt !== null;
            return Number(aRead) - Number(bRead);
        });
    }

    getUnreadNotificationsCount() {
        const notifications = this.getNotifications();
        return notifications.filter(notification => notification.readAt === null).length;
    }

    async loadNotifications() {
        try {
            //console.log('DataManager: Loading notifications...');
            const notificationData = await this.apiManager.getNotifications();
            //console.log('DataManager: Loaded notifications:', notificationData);

            // Get current notification IDs
            const currentNotificationIds = new Set(notificationData.map(item => item.id));

            // Check if there are any differences
            const hasChanges = currentNotificationIds.size !== this.previousNotificationIds.size ||
                [...currentNotificationIds].some(id => !this.previousNotificationIds.has(id));

            if (!hasChanges) {
                //console.log('DataManager: No changes in notifications, skipping update');
                return { hasChanges: false, newItems: [] };
            }

            // Find new items that weren't in previous notifications
            const newItemIds = [...currentNotificationIds].filter(id => !this.previousNotificationIds.has(id));
            //console.log('DataManager: New notification items:', newItemIds);

            // Update data
            this.data.notifications = notificationData;
            this.previousNotificationIds = currentNotificationIds;

            // Notify subscribers
            this._notifySubscribers();

            return { hasChanges: true, newItems: newItemIds };
        } catch (error) {
            throw error;
        }
    }

    async markNotificationAsRead(notificationId) {
        const isMarkAll = Number(notificationId) === 0;
        const prevNotifications = this.data.notifications.map(n => ({ ...n }));
        try {
            const currentTime = new Date().toISOString();
            if (isMarkAll) {
                // Optimistically mark all unread as read
                this.data.notifications = this.data.notifications.map(n =>
                    n.readAt ? n : { ...n, readAt: currentTime }
                );
            } else {
                // Optimistically mark a single notification
                this.data.notifications = this.data.notifications.map(n =>
                    n.id === notificationId ? { ...n, readAt: currentTime } : n
                );
            }
            this._notifySubscribers();

            await this.apiManager.markNotificationAsRead(notificationId);
            return true;
        } catch (error) {
            // Revert to previous snapshot
            this.data.notifications = prevNotifications;
            this._notifySubscribers();
            throw error;
        }
    }

    // News management methods
    getNews() {
        return this.data.news || [];
    }

    async loadNews() {
        try {
            //console.log('DataManager: Loading news...');
            const newsData = await this.apiManager.getNews();
            //console.log('DataManager: Loaded news:', newsData);

            // Get current news IDs
            const currentNewsIds = new Set(newsData.map(item => item.id));

            // Check if there are any differences
            const hasChanges = currentNewsIds.size !== this.previousNewsIds.size ||
                [...currentNewsIds].some(id => !this.previousNewsIds.has(id));

            if (!hasChanges) {
                //console.log('DataManager: No changes in news, skipping update');
                return { hasChanges: false, newItems: [] };
            }

            // Find new items that weren't in previous news
            const newItemIds = [...currentNewsIds].filter(id => !this.previousNewsIds.has(id));
            //console.log('DataManager: New news items:', newItemIds);

            // Update data
            this.data.news = newsData;
            this.previousNewsIds = currentNewsIds;

            // Notify subscribers
            this._notifySubscribers();

            return { hasChanges: true, newItems: newItemIds };
        } catch (error) {
            throw error;
        }
    }

    // Cosmetics management methods
    getCosmetics() {
        return this.data.cosmetics || [];
    }

    getCosmeticById(cosmeticId) {
        const cosmetics = this.getCosmetics();
        return cosmetics.find(item => item.id === cosmeticId) || null;
    }


    // Get available challenges (published and within date range)
    getAvailableChallenges() {
        // Return all published challenges, sorted with available ones first
        const challenges = this.data.challenges?.filter(challenge => {
            return challenge.status === 'published';
        }) || [];

        // Sort challenges: available first, then expired/completed
        return challenges.sort((a, b) => {
            const now = new Date();
            
            // Helper function to determine challenge state
            const getChallengeState = (challenge) => {
                const startTime = challenge.availableFrom ? new Date(challenge.availableFrom) : null;
                const endTime = challenge.availableUntil ? new Date(challenge.availableUntil) : null;
                
                if (challenge.userHasPlayed === 1) return 'completed'; // Priority 3
                if (endTime && now > endTime) return 'expired'; // Priority 3
                if (startTime && now < startTime) return 'not-started'; // Priority 2
                return 'available'; // Priority 1
            };

            const stateA = getChallengeState(a);
            const stateB = getChallengeState(b);
            
            // Priority order: available > not-started > expired/completed
            const priorityOrder = {
                'available': 1,
                'not-started': 2,
                'expired': 3,
                'completed': 3
            };
            
            const priorityDiff = priorityOrder[stateA] - priorityOrder[stateB];
            if (priorityDiff !== 0) return priorityDiff;
            
            // Within same priority, sort by ID (newest first)
            return b.id - a.id;
        });
    }

    getCosmeticsByType(cosmeticTypeId) {
        const cosmetics = this.getCosmetics();
        return cosmetics.filter(item => item.cosmeticTypeId === cosmeticTypeId);
    }

    getAcquiredCosmeticsByType(cosmeticTypeId) {
        const cosmetics = this.getCosmetics();
        return cosmetics.filter(item => item.cosmeticTypeId === cosmeticTypeId && item.acquired === 1);
    }

    getCosmeticsByRarity(rarityTypeId) {
        const cosmetics = this.getCosmetics();
        return cosmetics.filter(item => item.rarityTypeId === rarityTypeId);
    }

    getAcquiredCosmetics() {
        const cosmetics = this.getCosmetics();
        return cosmetics.filter(item => item.acquired === 1);
    }

    // Purchase cosmetic with optimistic UI updates
    async purchaseCosmetic(cosmeticId) {
        try {
            // Find the cosmetic
            const cosmetic = this.getCosmetics().find(item => item.id === cosmeticId);
            if (!cosmetic) {
                throw new Error('Cosmetic not found');
            }

            // Check if already owned
            if (cosmetic.acquired === 1) {
                throw new Error('Cosmetic already owned');
            }

            // Check user balance
            const userStats = this.getUserStats();
            const cosmeticPrice = cosmetic.coins || 0; // Use 'coins' field from API
            if (!userStats || userStats.coins < cosmeticPrice) {
                throw new Error('Insufficient coins');
            }

            // Optimistic UI update - update local state first
            const newCoins = userStats.coins - cosmeticPrice;
            
            //console.log('Purchase: Updating coins from', userStats.coins, 'to', newCoins, 'for cosmetic', cosmeticId);

            // Update cosmetic as acquired
            const cosmeticsIndex = this.data.cosmetics.findIndex(item => item.id === cosmeticId);
            if (cosmeticsIndex !== -1) {
                this.data.cosmetics[cosmeticsIndex] = {
                    ...this.data.cosmetics[cosmeticsIndex],
                    acquired: 1
                };
            }

            // Update user coins
            if (this.data.userInfo?.user) {
                this.data.userInfo.user.coins = newCoins;
                //console.log('Purchase: Updated user coins to', this.data.userInfo.user.coins);
            } else {
            }

            // Notify subscribers immediately for instant UI feedback
            this._notifySubscribers();

            // Make API call (don't wait for response)
            this.apiManager.purchaseCosmetic(cosmeticId).catch(error => {

                // Revert optimistic changes on API failure
                const cosmeticsIndex = this.data.cosmetics.findIndex(item => item.id === cosmeticId);
                if (cosmeticsIndex !== -1) {
                    this.data.cosmetics[cosmeticsIndex] = {
                        ...this.data.cosmetics[cosmeticsIndex],
                        acquired: 0
                    };
                }

                // Revert user coins
                if (this.data.userInfo?.user) {
                    this.data.userInfo.user.coins = userStats.coins; // Original amount
                }

                // Notify subscribers of the revert
                this._notifySubscribers();

                // Optionally show error to user here or let component handle it
                throw error;
            });

            return {
                success: true,
                newCoins,
                cosmetic: this.data.cosmetics[cosmeticsIndex]
            };

        } catch (error) {
            throw error;
        }
    }

    // Battle management methods
    getBattles() {
        return this.data.battles || [];
    }

    // Get battle by ID
    getBattleById(battleSessionId) {
        return this.data.battles?.find(battle => battle.battleSessionId === battleSessionId) || null;
    }

    // Get processed battle history for HistoryModal
    getBattleHistory() {
        const battles = this.getBattles();
        const currentUser = this.getUser();
        
        if (!battles || !currentUser) {
            return { pending: [], completed: [] };
        }

        const pending = [];
        const completed = [];

        battles.forEach(battle => {
            // Determine if this is a pending or completed battle
            const isPending = battle.endedAt === null;
            
            // Determine user's role in this battle (player1 or player2)
            const isPlayer1 = battle.player1Id === currentUser.id;
            const isPlayer2 = battle.player2Id === currentUser.id;
            
            if (!isPlayer1 && !isPlayer2) {
                // Current user is not involved in this battle, skip
                return;
            }

            // Determine opponent
            const opponent = isPlayer1 
                ? {
                    id: battle.player2Id,
                    nickname: battle.player2Nickname,
                    avatarUrl: battle.player2AvatarUrl,
                    tribe: battle.player2Tribe
                }
                : {
                    id: battle.player1Id,
                    nickname: battle.player1Nickname,
                    avatarUrl: battle.player1AvatarUrl,
                    tribe: battle.player1Tribe
                };

            // Calculate stats for both players
            const userResults = isPlayer1 ? battle.player1Results : battle.player2Results;
            const opponentResults = isPlayer1 ? battle.player2Results : battle.player1Results;

            const calculateStats = (results) => {
                if (!results || results.length === 0) return null;
                const correct = results.filter(r => r.correct === 1).length;
                const total = results.length;
                const timeSec = results.reduce((sum, r) => sum + (r.timeMs || 0), 0) / 1000;
                return { correct, total, timeSec };
            };

            const userStats = calculateStats(userResults);
            const opponentStats = calculateStats(opponentResults);

            // Determine battle status for the current user
            let status = 'pending';
            if (!isPending && battle.winnerId !== null) {
                status = battle.winnerId === currentUser.id ? 'win' : 'lose';
            }

            const rightName = isPending ? (typeof window !== 'undefined' && window.navigator && window.navigator.language && window.navigator.language.startsWith('pt') ? 'Desconhecido' : 'Unknown') : (opponent.nickname || 'Unknown');

            const historyItem = {
                left: currentUser.nickname || 'You',
                right: rightName,
                leftStats: userStats,
                rightStats: opponentStats,
                status: status,
                battleSessionId: battle.battleSessionId,
                startedAt: battle.startedAt,
                endedAt: battle.endedAt
            };

            if (isPending) {
                pending.push(historyItem);
            } else {
                completed.push(historyItem);
            }
        });

        // Sort by date (most recent first)
        const sortByDate = (a, b) => {
            const dateA = new Date(a.startedAt || 0);
            const dateB = new Date(b.startedAt || 0);
            return dateB - dateA;
        };

        return {
            pending: pending.sort(sortByDate),
            completed: completed.sort(sortByDate)
        };
    }

    // Refresh battles data
    async refreshBattles() {
        try {
            await this.refreshSection('battles');
        } catch (error) {
            throw error;
        }
    }

    // Check if data is fresh (loaded within specified minutes)
    isDataFresh(minutes = 5) {
        if (!this.data.lastUpdated) return false;
        const lastUpdate = new Date(this.data.lastUpdated);
        const now = new Date();
        const diffMinutes = (now - lastUpdate) / (1000 * 60);
        return diffMinutes < minutes;
    }

    // Set data freshness threshold (in minutes)
    setDataFreshnessThreshold(minutes) {
        this.dataFreshnessThreshold = minutes * 60 * 1000;
    }

    // Set background threshold (in minutes) - how long app can be in background before requiring reload
    setBackgroundThreshold(minutes) {
        this.backgroundThreshold = minutes * 60 * 1000;
    }

    // Call when app goes to background
    onAppBackground() {
        this.lastAppBackgroundTime = Date.now();
        //console.log('App went to background at:', new Date(this.lastAppBackgroundTime));
    }

    // Call when app comes to foreground - returns true if data should be reloaded
    onAppForeground() {
        const now = Date.now();
        let shouldReload = false;

        // Check if data is stale due to time
        if (!this.isDataFresh()) {
            //console.log('Data is stale due to age');
            shouldReload = true;
        }

        // Check if app was in background too long
        if (this.lastAppBackgroundTime) {
            const backgroundDuration = now - this.lastAppBackgroundTime;
            if (backgroundDuration > this.backgroundThreshold) {
                //console.log(`App was in background for ${Math.round(backgroundDuration / 60000)} minutes - data reload required`);
                shouldReload = true;
            }
            this.lastAppBackgroundTime = null;
        }

        return shouldReload;
    }

    // Check if data needs refresh and optionally auto-reload
    async checkDataFreshness(autoReload = false) {
        const isDataStale = !this.isDataFresh();
        const result = {
            isStale: isDataStale,
            lastUpdated: this.data.lastUpdated,
            minutesSinceUpdate: this.data.lastUpdated
                ? Math.round((Date.now() - new Date(this.data.lastUpdated)) / 60000)
                : null
        };

        if (isDataStale && autoReload) {
            //console.log('Auto-reloading stale data');
            try {
                await this.loadAppData();
                result.reloaded = true;
            } catch (error) {
                result.reloadError = error.message;
            }
        }

        return result;
    }

    // Smart data getter that checks freshness
    async getDataSmart(autoReload = false) {
        const freshnessCheck = await this.checkDataFreshness(autoReload);

        return {
            data: this.data,
            loading: this.loading,
            error: this.error,
            freshness: freshnessCheck
        };
    }

    // Update user stats from quiz quit response
    updateStatsFromQuitResponse(quitResponse, quizType) {
        if (!quitResponse || !quitResponse.success) {
            return;
        }

        const user = this.data.userInfo?.user;
        if (!user) {
            return;
        }

        //console.log('Updating user stats from quit response:', quitResponse, 'quiz type:', quizType);

        // Update coins from response (for challenges)
        if (typeof quitResponse.coins === 'number') {
            const oldCoins = user.coins || 0;
            user.coins = (user.coins || 0) + quitResponse.coins;
            //console.log('Updated coins from', oldCoins, 'to', user.coins, '(+' + quitResponse.coins + ')');
        }

        // Update stars from response (for learn quizzes)
        if (typeof quitResponse.stars === 'number') {
            const oldStars = user.stars || 0;
            user.stars = (user.stars || 0) + quitResponse.stars;
            //console.log('Updated stars from', oldStars, 'to', user.stars, '(+' + quitResponse.stars + ')');
        }

        // Update points from response (could be from XP or general points)
        if (typeof quitResponse.xp === 'number') {
            const oldPoints = user.points || 0;
            user.points = (user.points || 0) + quitResponse.xp;
            //console.log('Updated points from', oldPoints, 'to', user.points, '(+' + quitResponse.xp + ')');
        }

        // Notify subscribers of the stats update
        this._notifySubscribers();
        
            coins: user.coins,
            stars: user.stars,
            points: user.points
        });
    }

    // Equip cosmetics (apply selections for avatar/background/frame) locally and notify
    equipCosmetics({ avatarId = null, backgroundId = null, frameId = null } = {}) {
        try {
            //console.log('DataManager.equipCosmetics called with:', { avatarId, backgroundId, frameId });
            const user = this.data.userInfo?.user;
            if (!user) {
                //console.log('DataManager.equipCosmetics: No user found');
                return false;
            }
            const cosmetics = this.data.cosmetics || [];

            // Create a new user object to ensure React detects the change
            const updatedUser = { ...user };
            //console.log('DataManager.equipCosmetics: Original user:', user.avatarUrl);

            const applyEquip = (id, typeId, userField) => {
                if (!id) return;
                const item = cosmetics.find(c => String(c.id) === String(id));
                if (!item) {
                    //console.log(`DataManager.equipCosmetics: Item ${id} not found in cosmetics`);
                    return;
                }
                //console.log(`DataManager.equipCosmetics: Applying ${userField} = ${item.imageUrl}`);
                // Determine type from item if not given
                const tId = item.cosmeticTypeId || typeId;
                // Update equipped flags for all in the same type
                for (let i = 0; i < cosmetics.length; i++) {
                    if (cosmetics[i].cosmeticTypeId === tId) {
                        cosmetics[i] = { ...cosmetics[i], equipped: Number(String(cosmetics[i].id) === String(id)) };
                    }
                }
                // Update user profile visual in the new user object
                if (userField === 'avatarUrl') updatedUser.avatarUrl = item.imageUrl || updatedUser.avatarUrl;
                if (userField === 'backgroundUrl') updatedUser.backgroundUrl = item.imageUrl || updatedUser.backgroundUrl;
                if (userField === 'frameUrl') updatedUser.frameUrl = item.imageUrl || updatedUser.frameUrl;
            };

            // Map provided ids to expected type groups
            if (avatarId) applyEquip(avatarId, 1, 'avatarUrl');
            if (backgroundId) applyEquip(backgroundId, 2, 'backgroundUrl');
            if (frameId) applyEquip(frameId, 3, 'frameUrl');

            // Update the user object with the new reference
            this.data.userInfo.user = updatedUser;
            //console.log('DataManager.equipCosmetics: Updated user:', updatedUser.avatarUrl);
            // Assign back (cosmetics mutated with new objects in loop)
            this.data.cosmetics = cosmetics;
            //console.log('DataManager.equipCosmetics: Calling _notifySubscribers');
            this._notifySubscribers();
            return true;
        } catch (e) {
            return false;
        }
    }
}


// Create singleton instance
const DataManager = new DataManagerClass();

export default DataManager;