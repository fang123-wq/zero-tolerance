var storyData = require('../../data/storyWorkplace.js').storyWorkplaceData;
var storage = require('../../utils/storage.js').storage;
var api = require('../../utils/api.js');
var storyReward = require('../../utils/storyReward.js');
var app = getApp();

Page({
  data: {
    scenes: {},
    characters: {},
    currentScene: {},
    currentSceneId: 'scene_opening',
    progress: 0,
    totalScenes: 0,
    visitedScenes: [],
    videoEnded: false,
    countdown: 0,
    countdownTotal: 15,
    userChoices: [],
    awardedPoints: 0,
    stars: ''
  },

  countdownTimer: null,

  onLoad: async function() {
    var canUse = await app.ensureLoggedIn({
      content: '请先登录后再参与积分活动'
    });
    if (!canUse) {
      wx.navigateBack({
        fail: function() {
          wx.switchTab({ url: '/pages/experience/experience' });
        }
      });
      return;
    }

    var scenes = storyData.scenes;
    var characters = storyData.characters;
    var totalScenes = Object.keys(scenes).length;
    
    this.setData({
      scenes: scenes,
      characters: characters,
      totalScenes: totalScenes
    });
    
    this.loadScene('scene_opening');
  },

  onUnload: function() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  },

  loadScene: function(sceneId) {
    var scene = this.data.scenes[sceneId];
    if (!scene) {
      wx.showToast({ title: '场景不存在', icon: 'none' });
      return;
    }
    
    var visited = this.data.visitedScenes;
    if (visited.indexOf(sceneId) === -1) {
      visited.push(sceneId);
    }
    var progress = (visited.length / this.data.totalScenes) * 100;
    
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    
    var starsText = '';
    if (scene.type === 'ending' && scene.rating) {
      for (var i = 0; i < scene.rating; i++) {
        starsText += '⭐';
      }
    }
    
    this.setData({
      currentScene: scene,
      currentSceneId: sceneId,
      visitedScenes: visited,
      progress: Math.min(progress, 100),
      videoEnded: false,
      countdown: 0,
      countdownTotal: 15,
      awardedPoints: 0,
      stars: starsText
    });
    
    if (scene.type === 'video') {
      this.handleVideoScene(scene);
    } else if (scene.type === 'choice') {
      this.handleChoiceScene(scene);
    } else if (scene.type === 'ending') {
      this.handleEndingScene(scene);
    }
  },

  handleVideoScene: function(scene) {
    this.setData({ videoEnded: false });
  },

  onVideoEnded: function() {
    this.setData({ videoEnded: true });
    var nextSceneId = this.data.currentScene.nextScene;
    if (nextSceneId) {
      this.loadScene(nextSceneId);
    }
  },

  onVideoError: function(e) {
    console.error('视频播放失败:', e.detail);
    wx.showToast({ title: '视频加载失败', icon: 'none' });
    this.setData({ videoEnded: true });
  },

  handleChoiceScene: function(scene) {
    var that = this;
    var choiceSeconds = 15;
    this.setData({
      countdown: choiceSeconds,
      countdownTotal: choiceSeconds
    });
    this.countdownTimer = setInterval(function() {
      var newCount = that.data.countdown - 1;
      if (newCount <= 0) {
        clearInterval(that.countdownTimer);
        var options = scene.options;
        var randomOption = options[Math.floor(Math.random() * options.length)];
        that.makeChoice({ currentTarget: { dataset: { option: randomOption } } });
      } else {
        that.setData({ countdown: newCount });
      }
    }, 1000);
  },

  makeChoice: function(e) {
    var option = e.currentTarget.dataset.option;
    if (!option) return;
    
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    
    var choices = this.data.userChoices;
    choices.push({
      sceneId: this.data.currentSceneId,
      optionId: option.id,
      optionText: option.text,
      points: option.points || 0,
      timestamp: Date.now()
    });
    this.setData({ userChoices: choices });
    
    if (option.nextScene) {
      this.loadScene(option.nextScene);
    }
  },

  handleEndingScene: function(scene) {
    var that = this;
    storage.markStoryCompleted('story_workplace_' + scene.id);

    storyReward.claimStoryEndingReward(
      app,
      'story_workplace',
      scene.id,
      '\u6c89\u6d78\u5f0f\u6545\u4e8b\u5b8c\u6210\uff1a' + (scene.title || storyData.info.title)
    ).then(function(result) {
      var points = result.awardedPoints || 0;
      that.setData({ awardedPoints: points });

      if (result.status === 'already_claimed') {
        wx.showToast({ title: '\u8be5\u7ed3\u5c40\u79ef\u5206\u5df2\u9886\u53d6', icon: 'none' });
      } else if (result.status === 'not_logged_in') {
        wx.showToast({ title: '\u767b\u5f55\u540e\u53ef\u9886\u53d6\u6545\u4e8b\u79ef\u5206', icon: 'none' });
      }

      if (app.globalData.isLoggedIn) {
        api.learningApi.recordStory({
          storyId: 'story_workplace',
          storyTitle: storyData.info.title,
          endingType: scene.title,
          endingId: scene.id,
          rating: scene.rating,
          isGoodEnding: !!scene.isGoodEnding,
          pointsEarned: points,
          choices: that.data.userChoices
        }).catch(function(err) {
          console.error('record story error:', err);
        });
      }
    });
  },

  
  goToNextScene: function() {
    var nextSceneId = this.data.currentScene.nextScene;
    if (nextSceneId) {
      this.loadScene(nextSceneId);
    }
  },

  restartStory: function() {
    this.setData({ userChoices: [] });
    this.loadScene('scene_opening');
  },

  goBack: function() {
    wx.navigateBack();
  },

  onShareAppMessage: function() {
    var scene = this.data.currentScene;
    var title = '我在《职场抉择》中获得了"' + (scene.title || '未知') + '"结局！';
    
    return {
      title: title,
      path: '/pages/story-workplace/story-workplace'
    };
  }
});
