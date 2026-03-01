var storyData = require('../../data/storyFamily.js').storyFamilyData;
var audioManager = require('../../utils/audio.js').audioManager;
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
    storyMusics: {},
    displayText: '',
    textComplete: false,
    showDialogue: false,
    showFlashback: false,
    showMessages: false,
    showChat: false,
    showNarration: false,
    showButton: false,
    currentDialogue: {},
    dialogueIndex: 0,
    visibleMessages: [],
    messagesComplete: false,
    visibleChatMessages: [],
    chatComplete: false,
    scrollToMessage: '',
    showEndingDialogue: false,
    showReflection: false,
    endingDialogueIndex: 0,
    countdown: 0,
    countdownTotal: 15,
    userChoices: [],
    awardedPoints: 0,
    musicPlaying: false,
    currentMusic: null,
    imageLoaded: false,
    imageError: false,
    videoEnded: false
  },

  textTimer: null,
  countdownTimer: null,
  messageTimer: null,
  chatTimer: null,
  narrationContext: null,

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

    console.log('家庭篇故事数据加载完成');

    this.setData({
      scenes: scenes,
      characters: characters,
      totalScenes: totalScenes
    });

    this.loadStoryMusics();
    this.preloadImages();
    this.loadScene('scene_opening');
  },

  preloadImages: function() {
    var scenes = this.data.scenes;
    var imageUrls = [];

    Object.keys(scenes).forEach(function(key) {
      var scene = scenes[key];
      if (scene.images && scene.images.length > 0) {
        imageUrls = imageUrls.concat(scene.images);
      }
    });

    imageUrls.slice(0, 5).forEach(function(url) {
      if (url && url.indexOf('http') === 0) {
        wx.getImageInfo({
          src: url,
          success: function() {},
          fail: function() {}
        });
      }
    });
  },

  loadStoryMusics: function() {
    var that = this;
    api.storyMusicApi.getByStory('story_family').then(function(musics) {
      if (musics && musics.length > 0) {
        var musicMap = {};
        musics.forEach(function(m) {
          musicMap[m.sceneId] = m;
        });
        that.setData({ storyMusics: musicMap });
      }
    }).catch(function(err) {
      console.log('加载故事音乐失败，使用本地配置:', err);
    });
  },

  onShow: function() {
    if (this.data.musicPlaying && this.data.currentMusic) {
      audioManager.playBgm();
    }
  },

  onHide: function() {
    audioManager.pauseBgm();
  },

  onUnload: function() {
    this.clearAllTimers();
    this.stopNarration();
    audioManager.stopBgm();
  },

  clearAllTimers: function() {
    if (this.textTimer) clearInterval(this.textTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    if (this.messageTimer) clearTimeout(this.messageTimer);
    if (this.chatTimer) clearTimeout(this.chatTimer);
  },

  playNarration: function(audioUrl) {
    var that = this;
    if (!audioUrl) return;
    this.stopNarration();
    this.narrationContext = audioManager.playNarration(audioUrl, function() {
      that.narrationContext = null;
    });
  },

  stopNarration: function() {
    if (this.narrationContext) {
      this.narrationContext.stop();
      this.narrationContext.destroy();
      this.narrationContext = null;
    }
  },

  testPlayVoice: function() {
    var scene = this.data.currentScene;
    if (scene.narrationAudio) {
      wx.showToast({ title: '播放语音...', icon: 'none' });
      this.playNarration(scene.narrationAudio);
    } else {
      wx.showToast({ title: '无语音', icon: 'none' });
    }
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

    this.clearAllTimers();
    this.stopNarration();

    this.setData({
      currentScene: scene,
      currentSceneId: sceneId,
      visitedScenes: visited,
      progress: Math.min(progress, 100),
      displayText: '',
      textComplete: false,
      showDialogue: false,
      showFlashback: false,
      showMessages: false,
      showChat: false,
      showNarration: false,
      showButton: false,
      dialogueIndex: 0,
      visibleMessages: [],
      messagesComplete: false,
      visibleChatMessages: [],
      chatComplete: false,
      showEndingDialogue: false,
      showReflection: false,
      endingDialogueIndex: 0,
      countdown: 0,
      countdownTotal: 15,
      awardedPoints: 0,
      imageLoaded: false,
      imageError: false,
      videoEnded: false
    });

    var serverMusic = this.data.storyMusics[sceneId];
    if (serverMusic && serverMusic.musicUrl) {
      this.playSceneMusic(serverMusic.musicUrl);
    } else if (scene.music && scene.music.url) {
      this.playSceneMusic(scene.music.url);
    }

    if (scene.type === 'normal') {
      this.handleNormalScene(scene);
    } else if (scene.type === 'video') {
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

  handleNormalScene: function(scene) {
    var that = this;

    if (scene.narrationAudio) {
      setTimeout(function() {
        that.playNarration(scene.narrationAudio);
      }, 300);
    }

    if (scene.description) {
      this.typeText(scene.description, function() {
        if (scene.flashback) {
          setTimeout(function() { that.showFlashbackContent(scene); }, 500);
        } else if (scene.messages) {
          setTimeout(function() { that.showMessagesContent(scene); }, 500);
        } else if (scene.chatMessages) {
          setTimeout(function() { that.showChatContent(scene); }, 500);
        } else if (scene.dialogues && scene.dialogues.length > 0) {
          setTimeout(function() { that.showDialogueContent(scene); }, 500);
        } else if (scene.narration) {
          setTimeout(function() { that.showNarrationContent(scene); }, 500);
        } else {
          that.setData({ showButton: true });
        }
      });
    } else if (scene.dialogues && scene.dialogues.length > 0) {
      this.showDialogueContent(scene);
    } else if (scene.flashback) {
      this.showFlashbackContent(scene);
    } else if (scene.messages) {
      this.showMessagesContent(scene);
    } else if (scene.chatMessages) {
      this.showChatContent(scene);
    } else if (scene.narration) {
      this.showNarrationContent(scene);
    } else {
      this.setData({ showButton: true });
    }
  },

  showDialogueContent: function(scene) {
    var dialogues = scene.dialogues;
    if (!dialogues || dialogues.length === 0) {
      this.checkNextContent(scene);
      return;
    }

    this.setData({
      showDialogue: true,
      dialogueIndex: 0,
      currentDialogue: dialogues[0]
    });
    this.typeText(dialogues[0].text);

    if (dialogues[0].audio) {
      this.playNarration(dialogues[0].audio);
    }
  },

  showFlashbackContent: function(scene) {
    var flashback = scene.flashback;
    if (!flashback || !flashback.dialogues || flashback.dialogues.length === 0) {
      this.checkNextContent(scene);
      return;
    }

    this.setData({
      showFlashback: true,
      dialogueIndex: 0,
      currentDialogue: flashback.dialogues[0]
    });
    this.typeText(flashback.dialogues[0].text);
  },

  showMessagesContent: function(scene) {
    var messages = scene.messages;
    if (!messages || messages.length === 0) {
      this.checkNextContent(scene);
      return;
    }

    this.setData({
      showMessages: true,
      visibleMessages: [],
      messagesComplete: false
    });

    this.showNextMessage(messages, 0);
  },

  showNextMessage: function(messages, index) {
    var that = this;
    if (index >= messages.length) {
      this.setData({ messagesComplete: true });
      return;
    }

    var visible = this.data.visibleMessages.concat([messages[index]]);
    this.setData({ visibleMessages: visible });

    this.messageTimer = setTimeout(function() {
      that.showNextMessage(messages, index + 1);
    }, 800);
  },

  showChatContent: function(scene) {
    var chatMessages = scene.chatMessages;
    if (!chatMessages || chatMessages.length === 0) {
      this.checkNextContent(scene);
      return;
    }

    this.setData({
      showChat: true,
      visibleChatMessages: [],
      chatComplete: false
    });

    this.showNextChatMessage(chatMessages, 0);
  },

  showNextChatMessage: function(messages, index) {
    var that = this;
    if (index >= messages.length) {
      this.setData({ chatComplete: true });
      return;
    }

    var visible = this.data.visibleChatMessages.concat([messages[index]]);
    this.setData({
      visibleChatMessages: visible,
      scrollToMessage: 'msg-' + index
    });

    this.chatTimer = setTimeout(function() {
      that.showNextChatMessage(messages, index + 1);
    }, 600);
  },

  showNarrationContent: function(scene) {
    var that = this;
    this.setData({ showNarration: true });
    this.typeText(scene.narration, function() {
      that.setData({ showButton: true });
    });
  },

  checkNextContent: function(scene) {
    var that = this;
    if (scene.narration && !this.data.showNarration) {
      setTimeout(function() { that.showNarrationContent(scene); }, 500);
    } else {
      this.setData({ showButton: true });
    }
  },

  nextDialogue: function() {
    var that = this;
    var scene = this.data.currentScene;
    var dialogues = this.data.showFlashback ? scene.flashback.dialogues : scene.dialogues;
    var nextIndex = this.data.dialogueIndex + 1;

    if (nextIndex < dialogues.length) {
      this.setData({
        dialogueIndex: nextIndex,
        currentDialogue: dialogues[nextIndex],
        textComplete: false
      });
      this.typeText(dialogues[nextIndex].text);

      if (dialogues[nextIndex].audio) {
        this.playNarration(dialogues[nextIndex].audio);
      }
    } else {
      if (this.data.showFlashback) {
        this.setData({ showFlashback: false }, function() {
          if (scene.messages) {
            that.showMessagesContent(scene);
          } else if (scene.narration) {
            that.showNarrationContent(scene);
          } else {
            that.setData({ showButton: true });
          }
        });
      } else {
        this.setData({ showDialogue: false });
        this.checkNextContent(scene);
      }
    }
  },

  nextStep: function() {
    var scene = this.data.currentScene;

    if (this.data.showMessages) {
      this.setData({ showMessages: false });
      if (scene.narration) {
        this.showNarrationContent(scene);
      } else {
        this.setData({ showButton: true });
      }
    } else if (this.data.showChat) {
      this.setData({ showChat: false });
      if (scene.narration) {
        this.showNarrationContent(scene);
      } else {
        this.setData({ showButton: true });
      }
    } else if (this.data.showNarration) {
      this.setData({ showButton: true });
    } else {
      this.setData({ showButton: true });
    }
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
    if (scene.descriptionAudio) {
      this.playNarration(scene.descriptionAudio);
    }

    if (scene.dialogues && scene.dialogues.length > 0) {
      this.setData({
        showEndingDialogue: true,
        endingDialogueIndex: 0,
        currentDialogue: scene.dialogues[0]
      });
      this.typeText(scene.dialogues[0].text);

      if (scene.dialogues[0].audio) {
        this.playNarration(scene.dialogues[0].audio);
      }
    } else {
      this.setData({ showReflection: true });
      this.handleEndingComplete(scene);
    }
  },

  nextEndingDialogue: function() {
    var scene = this.data.currentScene;
    var dialogues = scene.dialogues;
    var nextIndex = this.data.endingDialogueIndex + 1;

    if (nextIndex < dialogues.length) {
      this.setData({
        endingDialogueIndex: nextIndex,
        currentDialogue: dialogues[nextIndex],
        textComplete: false
      });
      this.typeText(dialogues[nextIndex].text);

      if (dialogues[nextIndex].audio) {
        this.playNarration(dialogues[nextIndex].audio);
      }
    } else {
      this.setData({
        showEndingDialogue: false,
        showReflection: true
      });
      this.handleEndingComplete(scene);
    }
  },

  handleEndingComplete: function(scene) {
    var that = this;
    storage.markStoryCompleted('story_family_' + scene.id);

    storyReward.claimStoryEndingReward(
      app,
      'story_family',
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
          storyId: 'story_family',
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

  typeText: function(text, callback) {
    var that = this;
    if (!text) {
      this.setData({ displayText: '', textComplete: true });
      if (callback) callback();
      return;
    }

    this.setData({ displayText: '', textComplete: false });
    var index = 0;
    var speed = 40;

    this.textTimer = setInterval(function() {
      if (index < text.length) {
        that.setData({ displayText: that.data.displayText + text[index] });
        index++;
      } else {
        clearInterval(that.textTimer);
        that.setData({ textComplete: true });
        if (callback) callback();
      }
    }, speed);
  },

  playSceneMusic: function(url) {
    if (!url) return;

    this.setData({
      currentMusic: url,
      musicPlaying: true
    });
    audioManager.playBgm(url);
  },

  toggleMusic: function() {
    if (this.data.musicPlaying) {
      audioManager.pauseBgm();
      this.setData({ musicPlaying: false });
    } else {
      audioManager.playBgm();
      this.setData({ musicPlaying: true });
    }
  },

  getStars: function(rating) {
    var stars = '';
    for (var i = 0; i < rating; i++) {
      stars += '⭐';
    }
    return stars;
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
    var title = '我在《深夜的烟卷》中获得了"' + (scene.title || '未知') + '"结局！';

    return {
      title: title,
      path: '/pages/story-family/story-family',
      imageUrl: scene.images ? scene.images[0] : ''
    };
  }
});
