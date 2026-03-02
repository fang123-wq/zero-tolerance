// pages/vr-web/vr-web.js
// VR全景页面 - 使用web-view加载Pannellum

const appConfig = require('../../config/app.js');

// VR全景页面配置 - 从配置文件读取
var VR_BASE_URL = appConfig.vrBaseUrl || '';


Page({
  data: {
    vrUrl: '',
    scene: ''
  },

  onLoad: function(options) {
    var scene = options.scene || '';
    this.setData({ scene: scene });
    
    // 构建VR页面URL，带上appId参数
    if (VR_BASE_URL) {
      var url = VR_BASE_URL + '?appId=' + appConfig.appId;
      // 如果指定了场景，则添加scene参数
      if (scene) {
        url += '&scene=' + scene;
      }
      this.setData({ vrUrl: url });
      console.log('VR URL:', url);
    } else {
      console.warn('VR全景URL未配置，请设置vrBaseUrl');
    }
  },

  onMessage: function(e) {
    // 接收web-view发送的消息
    console.log('收到web-view消息:', e.detail);
    var data = e.detail.data;
    if (data && data.length > 0) {
      var msg = data[data.length - 1];
      if (msg.action === 'navigate') {
        // 处理页面跳转
        wx.navigateTo({ url: msg.url });
      }
    }
  },

  onWebViewLoad: function() {
    console.log('web-view加载完成');
  },

  onError: function(e) {
    console.error('web-view加载失败:', e.detail);
    wx.showToast({
      title: '加载失败',
      icon: 'none'
    });
  },

  goBack: function() {
    wx.navigateBack();
  }
});
