// pages/learning/learning.js
var api = require('../../utils/api.js');
var storage = require('../../utils/storage.js').storage;
var app = getApp();

Page({
  data: {
    activeTab: 'stats',
    stats: {
      zoneVisits: 0,
      quizCount: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      correctRate: 0,
      storyCount: 0,
      goodEndingCount: 0,
      audioCount: 0,
      audioCompleted: 0
    },
    zoneRecords: [],
    quizRecords: [],
    storyRecords: [],
    audioRecords: [],
    loading: false,
    hasMore: true,
    page: 1
  },

  onLoad: function() {
    this.loadStats();
    if (app.globalData.isLoggedIn) {
      this.loadRecords('zone');
    } else {
      this.setData({
        hasMore: false,
        zoneRecords: [],
        quizRecords: [],
        storyRecords: [],
        audioRecords: []
      });
    }
  },

  switchTab: function(e) {
    var tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab,
      page: 1,
      hasMore: true
    });

    if (tab === 'stats') {
      this.loadStats();
    } else {
      this.loadRecords(tab);
    }
  },

  loadStats: function() {
    var that = this;

    if (!app.globalData.isLoggedIn) {
      var quizLocal = storage.getQuizRecords() || {};
      var totalQuestions = Number(quizLocal.totalQuestions || 0);
      var correctAnswers = Number(quizLocal.correctAnswers || 0);
      var correctRate = totalQuestions > 0 ? Math.round(correctAnswers / totalQuestions * 100) : 0;

      that.setData({
        stats: {
          zoneVisits: storage.getVisitedZones().length,
          quizCount: totalQuestions > 0 ? 1 : 0,
          totalQuestions: totalQuestions,
          correctAnswers: correctAnswers,
          correctRate: correctRate,
          storyCount: storage.getCompletedStories().length,
          goodEndingCount: 0,
          audioCount: 0,
          audioCompleted: 0
        }
      });
      return;
    }

    wx.showLoading({ title: '加载中...' });

    api.learningApi.getStats().then(function(data) {
      that.setData({ stats: data || that.data.stats });
    }).catch(function(err) {
      wx.showToast({ title: (err && err.message) || '加载失败', icon: 'none' });
    }).finally(function() {
      wx.hideLoading();
    });
  },

  loadRecords: function(type) {
    var that = this;
    var page = this.data.page;

    if (!app.globalData.isLoggedIn) {
      var key = type + 'Records';
      var localData = { hasMore: false, loading: false };
      localData[key] = [];
      this.setData(localData);
      return;
    }

    if (this.data.loading) return;
    this.setData({ loading: true });

    var apiMap = {
      zone: api.learningApi.getZoneRecords,
      quiz: api.learningApi.getQuizRecords,
      story: api.learningApi.getStoryRecords,
      audio: api.learningApi.getAudioRecords
    };
    var fetcher = apiMap[type];

    if (!fetcher) {
      this.setData({ loading: false });
      return;
    }

    fetcher(page, 20).then(function(data) {
      var list = (data && data.list) || [];
      var dataKey = type + 'Records';
      var newList = page === 1 ? list : that.data[dataKey].concat(list);

      var updateData = { loading: false };
      updateData[dataKey] = newList;
      updateData.hasMore = list.length >= 20;
      that.setData(updateData);
    }).catch(function(err) {
      that.setData({ loading: false });
      wx.showToast({ title: (err && err.message) || '加载失败', icon: 'none' });
    });
  },

  loadMore: function() {
    if (!this.data.hasMore || this.data.loading) return;

    var tab = this.data.activeTab;
    if (tab === 'stats') return;

    this.setData({ page: this.data.page + 1 });
    this.loadRecords(tab);
  },

  formatDate: function(dateStr) {
    if (!dateStr) return '';
    var date = new Date(dateStr);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    return month + '月' + day + '日 ' +
      (hour < 10 ? '0' + hour : hour) + ':' +
      (minute < 10 ? '0' + minute : minute);
  },

  formatDuration: function(seconds) {
    if (!seconds) return '0秒';
    var min = Math.floor(seconds / 60);
    var sec = seconds % 60;
    if (min > 0) {
      return min + '分' + (sec > 0 ? sec + '秒' : '');
    }
    return sec + '秒';
  },

  getQuizTypeText: function(type) {
    var map = {
      daily: '每日答题',
      challenge: '挑战模式',
      practice: '练习模式'
    };
    return map[type] || type;
  },

  goBack: function() {
    wx.navigateBack();
  }
});
