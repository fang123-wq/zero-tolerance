const app = getApp();
const { newsApi } = require('../../utils/api.js');

Page({
  data: {
    appName: '都昌禁毒云展馆',
    banners: [
      { id: 1, title: '禁毒宣传', desc: '珍爱生命，远离毒品', icon: '🎗️', bgColor: 'linear-gradient(135deg, #1a237e, #3949ab)' },
      { id: 2, title: '缉毒英雄故事', desc: '致敬最可爱的人', icon: '🎖️', bgColor: 'linear-gradient(135deg, #b71c1c, #e53935)' },
      { id: 3, title: '答题赢好礼', desc: '学知识，得积分，换礼品', icon: '🎁', bgColor: 'linear-gradient(135deg, #e65100, #ff9800)' }
    ],
    mainFunctions: [
      { id: 1, name: '云展馆', desc: '导览', icon: '🏛️', bgColor: '#e8eaf6', url: '/pages/museum/museum' },
      { id: 2, name: '互动体验', desc: '游戏', icon: '🏎️', iconImg: '/assets/images/racing-car.png', bgColor: '#fff0f5', url: '/pages/experience/experience' },
      { id: 3, name: '答题闯关', desc: '学习', icon: '📝', bgColor: '#e3f2fd', url: '/pages/quiz/quiz' },
      { id: 4, name: '礼品中心', desc: '兑换', icon: '🎁', bgColor: '#fff3e0', url: '/pages/gift/gift' }
    ],
    hotFunctions: [
      { id: 1, name: '语音讲解', desc: '专业解说', icon: '🎙️', url: '/pages/museum/museum?mode=audio' },
      { id: 2, name: 'VR全景', desc: '身临其境', icon: '🥽', url: '/pages/museum/museum?mode=vr' },
      { id: 3, name: '数据墙', desc: '实时数据', icon: '📊', url: '/pages/museum/museum?tab=data' },
      { id: 4, name: '英雄墙', desc: '点灯致敬', icon: '🕯️', url: '/pages/hero/hero' }
    ],
    newsList: []
  },

  onLoad() {
    this.loadAppConfig();
    this.loadNewsList();
    this.checkDailySign();
  },

  loadAppConfig() {
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

  loadNewsList() {
    var that = this;
    newsApi.getList(1, 5).then(function(res) {
      if (res && res.list) {
        that.setData({ newsList: res.list });
      }
    }).catch(function(err) {
      console.log('加载新闻列表失败', err);
    });
  },

  onShow() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) {
      tabBar.setData({ selected: 0 });
    }
  },

  checkDailySign() {
    if (!app.globalData.isLoggedIn || app.globalData.hasSignedToday) {
      return;
    }

    app.dailySign().then(function(result) {
      if (result && result.success) {
        wx.showToast({ title: '签到成功 +' + result.points + '积分', icon: 'none' });
      }
    }).catch(function() {});
  },

  async navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      const tabBarPages = ['/pages/index/index', '/pages/museum/museum', '/pages/experience/experience', '/pages/mine/mine'];
      const pagePath = url.split('?')[0];
      const pointActivityPages = [
        '/pages/experience/experience',
        '/pages/quiz/quiz',
        '/pages/claw/claw',
        '/pages/story-youth/story-youth',
        '/pages/story-family/story-family',
        '/pages/story-workplace/story-workplace',
        '/pages/story-hero/story-hero',
        '/pages/zone/zone'
      ];

      if (pointActivityPages.includes(pagePath)) {
        const canUse = await app.ensureLoggedIn({
          content: '请先登录后再参与积分活动'
        });
        if (!canUse) {
          return;
        }
      }

      if (tabBarPages.includes(pagePath)) {
        wx.switchTab({ url: pagePath });
      } else {
        wx.navigateTo({ url });
      }
    }
  },

  goNewsDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/news-detail/news-detail?id=' + id
    });
  },

  onShareAppMessage() {
    var appName = app.globalData.appName || '都昌禁毒云展馆';
    return {
      title: appName + ' - 珍爱生命，远离毒品',
      path: '/pages/index/index'
    };
  }
});
