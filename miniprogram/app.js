var api = require('./utils/api.js');

App({
  globalData: {
    userInfo: null,
    token: null,
    points: 0,
    totalPoints: 0,
    level: 1,
    levelTitle: '\u7981\u6bd2\u65b0\u4eba',
    isLoggedIn: false,
    visitCount: 128956,
    hasSignedToday: false,
    appConfig: null,
    appName: '\u7981\u6bd2\u4e91\u5c55\u9986',
    shortName: '',
    orgName: ''
  },

  onLaunch: function() {
    this.loadAppConfig();
    this.initUserData();
    this.updateVisitCount();
  },

  loadAppConfig: function() {
    var that = this;
    api.miniprogramApi.getConfig().then(function(config) {
      config = config || {};
      that.globalData.appConfig = config;
      that.globalData.appName = config.name || '\u7981\u6bd2\u4e91\u5c55\u9986';
      that.globalData.shortName = config.shortName || '';
      that.globalData.orgName = config.orgName || '';
      that.globalData.levelTitle = that.getLevelTitle(that.globalData.level);
    }).catch(function(err) {
      console.error('load app config failed:', err);
    });
  },

  getAppConfig: function(callback) {
    var that = this;
    if (this.globalData.appConfig) {
      callback && callback(this.globalData.appConfig);
      return;
    }

    api.miniprogramApi.getConfig().then(function(config) {
      config = config || {};
      that.globalData.appConfig = config;
      that.globalData.appName = config.name || '\u7981\u6bd2\u4e91\u5c55\u9986';
      that.globalData.shortName = config.shortName || '';
      that.globalData.orgName = config.orgName || '';
      callback && callback(config);
    }).catch(function(err) {
      console.error('load app config failed:', err);
      callback && callback(null);
    });
  },

  initUserData: function() {
    var token = wx.getStorageSync('token');
    var userInfo = wx.getStorageSync('userInfo');
    var points = wx.getStorageSync('points') || 0;

    this.globalData.token = token;
    this.globalData.userInfo = userInfo;
    this.globalData.points = points;
    this.globalData.totalPoints = points;
    this.globalData.isLoggedIn = !!token;
    this.globalData.level = this.calculateLevel(points);
    this.globalData.levelTitle = this.getLevelTitle(this.globalData.level);

    if (token) {
      this.syncUserData();
    }

    var lastSignDate = wx.getStorageSync('lastSignDate');
    var today = new Date().toDateString();
    this.globalData.hasSignedToday = (lastSignDate === today);
  },

  login: function() {
    var that = this;
    return new Promise(function(resolve, reject) {
      wx.login({
        success: function(res) {
          if (!res.code) {
            reject(new Error('get wx code failed'));
            return;
          }

          api.userApi.login(res.code, that.globalData.userInfo).then(function(data) {
            data = data || {};
            var serverUserInfo = data.userInfo || {};
            var serverPoints = Number(serverUserInfo.points || 0);
            var totalPoints = Number(serverUserInfo.totalPoints || serverPoints);
            var level = Number(serverUserInfo.level || that.calculateLevel(totalPoints));

            that.globalData.token = data.token || null;
            that.globalData.userInfo = serverUserInfo;
            that.globalData.points = serverPoints;
            that.globalData.totalPoints = totalPoints;
            that.globalData.level = level;
            that.globalData.levelTitle = that.getLevelTitle(level);
            that.globalData.isLoggedIn = !!data.token;

            if (data.token) {
              wx.setStorageSync('token', data.token);
              wx.setStorageSync('tokenExpireTime', Date.now() + 7 * 24 * 60 * 60 * 1000);
            }
            wx.setStorageSync('userInfo', serverUserInfo);
            wx.setStorageSync('points', serverPoints);

            resolve(data);
          }).catch(function(err) {
            console.error('login failed:', err);
            reject(err);
          });
        },
        fail: function(err) {
          reject(err);
        }
      });
    });
  },

  // Guest mode enabled: all feature-entry checks pass.
  ensureLoggedIn: function(options) {
    options = options || {};
    return Promise.resolve(true);
  },

  syncUserData: function() {
    var that = this;
    api.userApi.getInfo().then(function(data) {
      data = data || {};
      that.globalData.userInfo = data;
      that.globalData.points = Number(data.points || 0);
      that.globalData.totalPoints = Number(data.totalPoints || that.globalData.points);
      that.globalData.level = Number(data.level || that.calculateLevel(that.globalData.totalPoints));
      that.globalData.levelTitle = that.getLevelTitle(that.globalData.level);
      wx.setStorageSync('userInfo', data);
      wx.setStorageSync('points', that.globalData.points);
    }).catch(function(err) {
      console.error('sync user data failed:', err);
      if (err && err.code === 401) {
        that.globalData.isLoggedIn = false;
        that.globalData.token = null;
      }
    });
  },

  calculateLevel: function(points) {
    if (points >= 2000) return 5;
    if (points >= 1000) return 4;
    if (points >= 500) return 3;
    if (points >= 200) return 2;
    return 1;
  },

  getLevelTitle: function(level) {
    var shortName = this.globalData.shortName || '';
    var prefix = shortName || '';
    var titles = {
      1: prefix + '\u7981\u6bd2\u65b0\u4eba',
      2: prefix + '\u7981\u6bd2\u5b66\u5458',
      3: prefix + '\u7981\u6bd2\u536b\u58eb',
      4: prefix + '\u7981\u6bd2\u5148\u950b',
      5: prefix + '\u7981\u6bd2\u5927\u4f7f'
    };
    return titles[level] || titles[1];
  },

  addPoints: function(amount, reason) {
    var that = this;

    if (this.globalData.token) {
      return api.userApi.addPoints(amount, reason).then(function(data) {
        data = data || {};
        var points = Number(data.points || 0);
        var totalPoints = Number(data.totalPoints || points);

        that.globalData.points = points;
        that.globalData.totalPoints = totalPoints;
        that.globalData.level = that.calculateLevel(totalPoints);
        that.globalData.levelTitle = that.getLevelTitle(that.globalData.level);
        wx.setStorageSync('points', points);
        return data;
      }).catch(function(err) {
        console.error('sync points failed:', err);
        wx.showToast({ title: '\u79ef\u5206\u540c\u6b65\u5931\u8d25', icon: 'none' });
        throw err;
      });
    }

    // Guest local points.
    var safeAmount = Number(amount) || 0;
    var currentPoints = Number(this.globalData.points || wx.getStorageSync('points') || 0);
    var nextPoints = Math.max(0, currentPoints + safeAmount);
    var totalPoints = Number(this.globalData.totalPoints || currentPoints || 0) + safeAmount;

    this.globalData.points = nextPoints;
    this.globalData.totalPoints = Math.max(nextPoints, totalPoints);
    this.globalData.level = this.calculateLevel(this.globalData.totalPoints);
    this.globalData.levelTitle = this.getLevelTitle(this.globalData.level);
    wx.setStorageSync('points', nextPoints);

    return Promise.resolve({
      points: nextPoints,
      totalPoints: this.globalData.totalPoints,
      added: safeAmount,
      reason: reason || ''
    });
  },

  dailySign: function() {
    var that = this;

    if (this.globalData.hasSignedToday) {
      return Promise.resolve({ success: false, message: '\u4eca\u65e5\u5df2\u7b7e\u5230' });
    }

    if (!this.globalData.token) {
      return this.addPoints(10, '\u6bcf\u65e5\u7b7e\u5230').then(function() {
        that.globalData.hasSignedToday = true;
        wx.setStorageSync('lastSignDate', new Date().toDateString());
        return { success: true, points: 10 };
      });
    }

    return api.userApi.sign().then(function(data) {
      data = data || {};
      var points = Number(data.points || 0);
      var totalPoints = Number(data.totalPoints || points);

      that.globalData.points = points;
      that.globalData.totalPoints = totalPoints;
      that.globalData.level = that.calculateLevel(totalPoints);
      that.globalData.levelTitle = that.getLevelTitle(that.globalData.level);
      that.globalData.hasSignedToday = true;
      wx.setStorageSync('points', points);
      wx.setStorageSync('lastSignDate', new Date().toDateString());
      return { success: true, points: Number(data.added || 0) };
    }).catch(function(err) {
      console.error('daily sign failed:', err);
      wx.showToast({ title: '\u7b7e\u5230\u5931\u8d25', icon: 'none' });
      throw err;
    });
  },

  updateVisitCount: function() {
    var count = wx.getStorageSync('visitCount') || 128956;
    count += Math.floor(Math.random() * 10) + 1;
    wx.setStorageSync('visitCount', count);
    this.globalData.visitCount = count;
  }
});
