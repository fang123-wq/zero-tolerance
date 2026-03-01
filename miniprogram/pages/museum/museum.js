var api = require('../../utils/api.js');
var storage = require('../../utils/storage.js').storage;
var app = getApp();

Page({
  data: {
    zones: [],
    visitedZones: [],
    showZoneModal: false,
    currentZone: {},
    appName: '都昌禁毒云展馆'
  },

  onLoad: function(options) {
    this.loadAppConfig();
    this.loadZones();
    if (options.mode === 'audio') {
      this.startAudioTour();
    } else if (options.mode === 'vr') {
      this.enterVR();
    }
  },

  loadAppConfig: function() {
    var that = this;
    app.getAppConfig(function(config) {
      if (config) {
        that.setData({
          appName: config.name || '都昌禁毒云展馆'
        });
        wx.setNavigationBarTitle({ title: config.name || '都昌禁毒云展馆' });
      }
    });
  },

  onShow: function() {
    this.loadVisitedZones();
  },

  loadZones: function() {
    var that = this;

    api.zoneApi.getAll().then(function(zones) {
      if (zones && zones.length > 0) {
        that.setData({ zones: zones });
      } else {
        console.error('展区数据为空');
        wx.showToast({ title: '加载展区失败', icon: 'none' });
      }
    }).catch(function(err) {
      console.error('加载展区失败:', err);
      wx.showToast({ title: '加载展区失败', icon: 'none' });
    });
  },

  loadVisitedZones: function() {
    var visited = storage.getVisitedZones();
    this.setData({ visitedZones: visited });
  },

  enterZone: function(e) {
    var zone = e.currentTarget.dataset.zone;
    this.setData({
      currentZone: zone,
      showZoneModal: true
    });
  },

  closeModal: function() {
    this.setData({ showZoneModal: false });
  },

  stopPropagation: function() {
    // 阻止事件冒泡
  },

  startZoneTour: function() {
    var zone = this.data.currentZone;
    this.closeModal();
    wx.navigateTo({
      url: '/pages/zone/zone?id=' + zone.id
    });
  },

  enterVR: function() {
    wx.navigateTo({
      url: '/pages/vr/vr?scene=scene_lobby'
    });
  },

  startAudioTour: function() {
    wx.navigateTo({
      url: '/pages/audio/audio'
    });
  },

  onShareAppMessage: function() {
    var appName = app.globalData.appName || '都昌禁毒云展馆';
    return {
      title: appName + ' - 云上逛展馆',
      path: '/pages/museum/museum'
    };
  }
});
