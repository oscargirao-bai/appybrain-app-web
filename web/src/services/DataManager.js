// Web DataManager - replica RN DataManager subscribe/get methods
class DataManagerClass {
  constructor() {
    this.data = {
      userInfo: null,
      disciplines: [],
      userStars: null,
      userChests: null,
      tribes: [],
      rankings: { points: null, stars: null, xp: null },
      notifications: [],
      news: [],
      challenges: [],
      cosmetics: [],
      badges: [],
      lastUpdated: null
    };
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  _notifySubscribers() {
    this.subscribers.forEach(cb => {
      try { cb(this.data); } catch(e) { console.error('Subscriber error', e); }
    });
  }

  setData(appData) {
    // Extract nested arrays like RN DataManager does
    const notificationsData = appData.notifications?.notifications || appData.notifications || [];
    const newsData = appData.news?.news || appData.news || [];
    const disciplinesData = appData.disciplines?.areas || appData.disciplines || [];
    
    this.data = { 
      ...this.data, 
      ...appData,
      notifications: notificationsData,
      news: newsData,
      disciplines: disciplinesData,
      lastUpdated: new Date().toISOString() 
    };
    this._notifySubscribers();
  }

  getData() { return this.data; }
  getUser() { return this.data.userInfo?.user || null; }
  getDisciplines() { return this.data.disciplines || []; }
  getAreaById(id) { 
    return this.data.disciplines?.find(d => d.id === id); 
  }
  getCategoryStars(categoryId) {
    const userStars = this.data.userStars?.categories || {};
    return userStars[categoryId] || { earnedStars: 0, maxStars: 0 };
  }
  getUserStars() { return this.data.userStars; }
  getUserChests() { return this.data.userChests; }
  getUserBadges() { return this.data.badges || []; }
  getNotifications() { return this.data.notifications || []; }
  getSortedNotifications() {
    const n = this.getNotifications();
    return [...n].sort((a,b)=> (a.readAt?1:0) - (b.readAt?1:0));
  }
  getUnreadNotificationsCount() {
    return this.getNotifications().filter(n => !n.readAt).length;
  }
  getRankings(type='points') { return this.data.rankings[type]; }
  getTotalStars() { return this.data.userStars?.totals || { earnedStars:0, maxStars:0 }; }

  async refreshSection(section) {
    console.log('DataManager.refreshSection:', section);
    const api = (await import('./ApiManager.js')).default;
    if (section === 'userInfo') {
      const userInfo = await api.authJson('app/gamification_user_badges');
      this.data.userInfo = userInfo;
      this.data.badges = userInfo?.items || [];
      const user = userInfo?.user || null;
      if (user) this.data.user = user;
      this._notifySubscribers();
      return userInfo;
    } else if (section === 'disciplines') {
      const disciplines = await api.authJson('app/learn_content_list');
      this.data.disciplines = disciplines?.areas || disciplines || [];
      this._notifySubscribers();
      return disciplines;
    }
    console.warn('refreshSection: unknown section', section);
  }

  async markNotificationAsRead(id) {
    const isAll = Number(id) === 0;
    const now = new Date().toISOString();
    if (isAll) {
      this.data.notifications = this.data.notifications.map(n => n.readAt ? n : {...n, readAt:now});
    } else {
      this.data.notifications = this.data.notifications.map(n => n.id===id ? {...n, readAt:now} : n);
    }
    this._notifySubscribers();
    // TODO: call API to persist
  }
}

const DataManager = new DataManagerClass();
export default DataManager;
