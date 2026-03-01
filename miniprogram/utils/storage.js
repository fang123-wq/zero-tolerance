// 本地存储工具类
const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  POINTS: 'points',
  LEVEL: 'level',
  COMPLETED_STORIES: 'completedStories',
  QUIZ_RECORDS: 'quizRecords',
  SIGN_DATE: 'lastSignDate',
  VISITED_ZONES: 'visitedZones',
  HERO_LIGHTS: 'heroLights',
  PLEDGE_SIGNED: 'pledgeSigned'
};

const storage = {
  get(key) {
    try {
      return wx.getStorageSync(key);
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  },

  set(key, value) {
    try {
      wx.setStorageSync(key, value);
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  remove(key) {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  },

  // 获取已完成的故事列表
  getCompletedStories() {
    return this.get(STORAGE_KEYS.COMPLETED_STORIES) || [];
  },

  // 标记故事完成
  markStoryCompleted(storyId) {
    const completed = this.getCompletedStories();
    if (!completed.includes(storyId)) {
      completed.push(storyId);
      this.set(STORAGE_KEYS.COMPLETED_STORIES, completed);
    }
  },

  // 获取答题记录
  getQuizRecords() {
    return this.get(STORAGE_KEYS.QUIZ_RECORDS) || {
      totalQuestions: 0,
      correctAnswers: 0,
      dailyCompleted: false,
      lastDailyDate: ''
    };
  },

  // 更新答题记录
  updateQuizRecord(correct, total) {
    const records = this.getQuizRecords();
    records.totalQuestions += total;
    records.correctAnswers += correct;
    this.set(STORAGE_KEYS.QUIZ_RECORDS, records);
  },

  // 获取已访问展区
  getVisitedZones() {
    return this.get(STORAGE_KEYS.VISITED_ZONES) || [];
  },

  // 标记展区已访问
  markZoneVisited(zoneId) {
    const visited = this.getVisitedZones();
    if (!visited.includes(zoneId)) {
      visited.push(zoneId);
      this.set(STORAGE_KEYS.VISITED_ZONES, visited);
    }
  },

  // 获取英雄点灯记录
  getHeroLights() {
    return this.get(STORAGE_KEYS.HERO_LIGHTS) || [];
  },

  // 为英雄点灯
  lightForHero(heroId) {
    const lights = this.getHeroLights();
    if (!lights.includes(heroId)) {
      lights.push(heroId);
      this.set(STORAGE_KEYS.HERO_LIGHTS, lights);
      return true;
    }
    return false;
  }
};

module.exports = { storage, STORAGE_KEYS };
