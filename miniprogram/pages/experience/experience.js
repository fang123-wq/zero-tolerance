var storage = require('../../utils/storage.js').storage;
var app = getApp();

// 本地故事列表数据
var localStories = [
  { id: 'story_youth', title: '少年篇（完整版）', subtitle: '一颗药丸的代价', icon: '🌸', duration: '5分钟', rating: 5.0, playCount: 8650, description: '17岁的小明被同学递来一颗"聪明药"，面对毒品的伪装诱惑，他该如何抉择？两种截然不同的结局等你探索...', hasScenes: true, pageUrl: '/pages/story-youth/story-youth', isNew: true },
  { id: 'story_family', title: '家庭篇（完整版）', subtitle: '深夜的烟卷', icon: '👩', duration: '5分钟', rating: 4.9, playCount: 6150, description: '深夜下班的阿凯被发小递来一根裹着锡纸的"烟卷"，家门口妻子抱着孩子等他回家，他该如何抉择？', hasScenes: true, pageUrl: '/pages/story-family/story-family', isNew: true },
  { id: 'story_workplace', title: '职场篇（完整版）', subtitle: '职场抉择', icon: '💼', duration: '5分钟', rating: 4.8, playCount: 8320, description: '设计公司骨干阿凯在项目庆功宴上，同事递来"提神烟"，他该如何抉择？两种截然不同的人生等你探索...', hasScenes: true, pageUrl: '/pages/story-workplace/story-workplace', isNew: true },
  { id: 'hero', title: '英雄篇（完整版）', subtitle: '缉毒警察的使命', icon: '🎖️', duration: '8分钟', rating: 5.0, playCount: 5890, description: '走进缉毒警察的世界，感受他们的牺牲与坚守，六种结局等你探索...', hasScenes: true, pageUrl: '/pages/story-hero/story-hero', isNew: true }
];

Page({
  data: {
    stories: localStories,
    completedStories: [],
    totalPoints: 0,
    games: [
      { id: 'claw', name: '飞车冲刺', desc: '赛车赢积分', icon: '🏎️', url: '/pages/claw/claw' },
      { id: 'identify', name: '毒品识别', desc: '找出伪装毒品', icon: '🔍', url: '/pages/drug-identify/drug-identify' },
      { id: 'image-browse', name: '图文浏览', desc: '禁毒知识图文', icon: '📖', url: '/pages/image-browse/image-browse' }
    ]
  },

  onLoad: function() {
    this.loadProgress();
  },

  onShow: function() {
    this.loadProgress();
  },

  loadProgress: function() {
    var completed = storage.getCompletedStories();
    this.setData({
      completedStories: completed,
      totalPoints: app.globalData.points || storage.get('userPoints') || 0
    });
  },

  startStory: async function(e) {
    var story = e.currentTarget.dataset.story;
    var canUse = await app.ensureLoggedIn({
      content: '请先登录后再参与积分活动'
    });
    if (!canUse) {
      return;
    }
    if (story.hasScenes) {
      var url = story.pageUrl || '/pages/story/story?id=' + story.id;
      wx.navigateTo({ url: url });
    } else {
      wx.showToast({
        title: '故事内容开发中',
        icon: 'none'
      });
    }
  },

  startGame: async function(e) {
    var game = e.currentTarget.dataset.game;
    var canUse = await app.ensureLoggedIn({
      content: '请先登录后再参与积分活动'
    });
    if (!canUse) {
      return;
    }
    if (game.url) {
      wx.navigateTo({ url: game.url });
    } else {
      wx.showModal({
        title: game.name,
        content: game.desc + '游戏正在开发中，敬请期待！',
        showCancel: false
      });
    }
  },

  goToClaw: async function() {
    var canUse = await app.ensureLoggedIn({
      content: '请先登录后再参与积分活动'
    });
    if (!canUse) {
      return;
    }
    wx.navigateTo({ url: '/pages/claw/claw' });
  },

  onShareAppMessage: function() {
    return {
      title: '禁毒教育互动体验 - 寓教于乐',
      path: '/pages/experience/experience'
    };
  }
});
