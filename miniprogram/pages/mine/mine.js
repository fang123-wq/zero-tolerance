var storage = require('../../utils/storage.js').storage;
var STORAGE_KEYS = require('../../utils/storage.js').STORAGE_KEYS;
var app = getApp();

Page({
  data: {
    isLoggedIn: false,
    userInfo: {},
    points: 0,
    level: 1,
    levelTitle: '禁毒新人',
    levelProgress: 0,
    pointsToNext: 200,
    completedStories: 0,
    correctRate: 0,
    certificates: 0,
    heroLights: 0,
    pledgeSigned: false,
    hasSignedToday: false
  },

  onLoad: function() {
    this.loadUserData();
  },

  onShow: function() {
    this.loadUserData();
  },

  loadUserData: function() {
    var points = app.globalData.points;
    var level = app.calculateLevel(points);
    var levelTitle = app.getLevelTitle(level);

    var levelThresholds = [0, 200, 500, 1000, 2000];
    var currentThreshold = levelThresholds[level - 1] || 0;
    var nextThreshold = levelThresholds[level] || 2000;
    var progress = Math.min(100, ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
    var pointsToNext = Math.max(0, nextThreshold - points);

    var completedStories = storage.getCompletedStories().length;
    var quizRecords = storage.getQuizRecords();
    var correctRate = quizRecords.totalQuestions > 0
      ? Math.round(quizRecords.correctAnswers / quizRecords.totalQuestions * 100)
      : 0;
    var heroLights = storage.getHeroLights().length;
    var pledgeSigned = storage.get(STORAGE_KEYS.PLEDGE_SIGNED) || false;

    this.setData({
      isLoggedIn: app.globalData.isLoggedIn,
      userInfo: app.globalData.userInfo || {},
      points: points,
      level: level,
      levelTitle: levelTitle,
      levelProgress: progress,
      pointsToNext: pointsToNext,
      completedStories: completedStories,
      correctRate: correctRate,
      heroLights: heroLights,
      pledgeSigned: pledgeSigned,
      certificates: completedStories > 0 ? 1 : 0,
      hasSignedToday: app.globalData.hasSignedToday
    });
  },

  onLogin: function() {
    var that = this;
    wx.showLoading({ title: '登录中...' });
    app.login().then(function() {
      wx.hideLoading();
      wx.showToast({ title: '登录成功', icon: 'success' });
      that.loadUserData();
    }).catch(function() {
      wx.hideLoading();
      wx.showToast({ title: '登录失败', icon: 'none' });
    });
  },

  onSign: async function() {
    var that = this;
    if (this.data.hasSignedToday) {
      wx.showToast({ title: '今日已签到', icon: 'none' });
      return;
    }

    var canUse = await app.ensureLoggedIn({
      content: '请先登录后再参与积分活动'
    });
    if (!canUse) {
      return;
    }

    app.dailySign().then(function(result) {
      if (result.success) {
        wx.showToast({ title: '签到成功 +' + result.points + '积分', icon: 'success' });
        that.loadUserData();
      } else {
        wx.showToast({ title: result.message || '签到失败', icon: 'none' });
      }
    });
  },

  navigateTo: function(e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({ url: url });
  },

  showCertificates: function() {
    if (this.data.certificates > 0) {
      wx.showModal({
        title: '我的证书',
        content: '您已获得禁毒教育体验证书。',
        showCancel: false
      });
    } else {
      wx.showToast({ title: '完成故事体验可获得证书', icon: 'none' });
    }
  },

  showPledge: async function() {
    var that = this;
    var pledgeText = '我郑重承诺：珍爱生命，远离毒品；积极学习禁毒知识，提高防毒意识；发现涉毒行为，及时举报。';

    if (this.data.pledgeSigned) {
      wx.showModal({
        title: '禁毒承诺书',
        content: pledgeText,
        showCancel: false
      });
    } else {
      var canUse = await app.ensureLoggedIn({
        content: '请先登录后再参与积分活动'
      });
      if (!canUse) {
        return;
      }
      wx.showModal({
        title: '签署禁毒承诺书',
        content: pledgeText,
        confirmText: '签署承诺',
        success: function(res) {
          if (res.confirm) {
            storage.set(STORAGE_KEYS.PLEDGE_SIGNED, true);
            app.addPoints(30, '签署禁毒承诺书');
            that.setData({ pledgeSigned: true });
            that.loadUserData();
            wx.showToast({ title: '签署成功 +30积分', icon: 'none' });
          }
        }
      });
    }
  },

  showHistory: function() {
    wx.navigateTo({ url: '/pages/gift/gift' });
  },

  showAbout: function() {
    wx.showModal({
      title: '关于我们',
      content: '禁毒教育云展馆是一款面向公众的禁毒宣传教育小程序，通过互动体验和知识问答提升防毒意识。',
      showCancel: false
    });
  },

  onShareAppMessage: function() {
    return {
      title: '禁毒教育云展馆 - 珍爱生命，远离毒品',
      path: '/pages/index/index'
    };
  }
});
