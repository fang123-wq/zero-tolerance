// pages/audio/audio.js
var api = require('../../utils/api.js');
var audioGuideData = require('../../data/audioGuide.js');

Page({
  data: {
    audioList: [],
    currentIndex: 0,
    currentAudio: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    autoNext: true,
    showPlaylist: false,
    listenedList: {},
    listenedCount: 0,
    totalDuration: 0,
    sliderChanging: false,
    isFirstLoad: true
  },

  innerAudioContext: null,
  startZoneId: null,
  storyId: null,

  onLoad: function(options) {
    options = options || {};
    this.startZoneId = options.zoneId || null;
    this.storyId = options.storyId || null;
    this.autoPlayOnLoad = options.autoPlay !== 'false';
    this.audioStartTime = {};

    this.innerAudioContext = wx.createInnerAudioContext();
    this.bindAudioEvents();
    this.loadAudioList();
  },

  onShow: function() {
    if (this.data.isPlaying && this.innerAudioContext) {
      this.innerAudioContext.play();
    }
  },

  onHide: function() {
    if (this.data.isPlaying && this.innerAudioContext) {
      this.innerAudioContext.pause();
    }
  },

  onUnload: function() {
    if (this.innerAudioContext) {
      this.innerAudioContext.destroy();
    }
  },

  loadAudioList: function() {
    var that = this;

    if (that.storyId) {
      api.storyMusicApi.getByStory(that.storyId).then(function(data) {
        that.processAudioData(that.mapStoryMusicData(data));
      }).catch(function(err) {
        console.log('story-music获取失败，回退audio-guides', err);
        that.loadGuideAudioList();
      });
      return;
    }

    that.loadGuideAudioList();
  },

  loadGuideAudioList: function() {
    var that = this;

    api.audioApi.getAll().then(function(data) {
      that.processAudioData(data);
    }).catch(function(err) {
      console.log('audio-guides获取失败，使用本地数据', err);
      var localData = audioGuideData.audioGuide.zones.map(function(item, index) {
        return {
          id: item.id,
          zoneId: item.zoneId,
          sortOrder: index + 1,
          title: item.title,
          audioUrl: item.src,
          duration: item.duration,
          transcript: item.transcript,
          keyPoints: item.keyPoints ? item.keyPoints.join('\n') : ''
        };
      });
      that.processAudioData(localData);
    });
  },

  mapStoryMusicData: function(list) {
    return (list || []).map(function(item, index) {
      return {
        id: item.id || ('story_music_' + index),
        zoneId: item.sceneId || (index + 1),
        sortOrder: index + 1,
        title: item.musicName || item.sceneName || ('场景音频' + (index + 1)),
        zoneName: item.sceneName || '',
        audioUrl: item.musicUrl,
        duration: item.duration || 90,
        transcript: item.sceneName || '',
        keyPoints: ''
      };
    });
  },

  processAudioData: function(data) {
    var that = this;
    var localZones = audioGuideData.audioGuide.zones;
    var isStoryMode = !!that.storyId;

    var audioList = (data || []).map(function(item, index) {
      var localItem = null;
      if (!isStoryMode) {
        localItem = localZones.find(function(z) { return z.zoneId === item.zoneId; }) || localZones[index];
      }

      var audioSrc = item.audioUrl || item.musicUrl;
      if (!audioSrc && localItem) {
        audioSrc = localItem.src;
      }

      return {
        id: item.id || ('audio_' + index),
        zoneId: item.zoneId || item.sceneId || (index + 1),
        number: item.sortOrder < 10 ? '0' + item.sortOrder : '' + item.sortOrder,
        title: item.title || item.musicName || item.sceneName || ('音频' + (index + 1)),
        zoneName: item.zoneName || item.sceneName || '',
        src: audioSrc,
        duration: item.duration || 90,
        transcript: item.transcript || item.sceneName || '',
        keyPoints: item.keyPoints ? (Array.isArray(item.keyPoints) ? item.keyPoints : item.keyPoints.split('\n')) : []
      };
    });

    var totalDuration = 0;
    for (var i = 0; i < audioList.length; i++) {
      totalDuration += audioList[i].duration;
    }

    var listenedList = wx.getStorageSync('audioListened') || {};
    var listenedCount = Object.keys(listenedList).length;

    that.setData({
      audioList: audioList,
      totalDuration: totalDuration,
      listenedList: listenedList,
      listenedCount: listenedCount
    });

    if (audioList.length === 0) {
      that.setData({ currentAudio: null, duration: 0, currentTime: 0 });
      return;
    }

    var startIndex = 0;
    if (that.startZoneId) {
      for (var j = 0; j < audioList.length; j++) {
        if (String(audioList[j].zoneId) === String(that.startZoneId)) {
          startIndex = j;
          break;
        }
      }
    }

    that.loadAudio(startIndex);

    if (that.data.isFirstLoad && that.autoPlayOnLoad) {
      that.setData({ isFirstLoad: false });
      setTimeout(function() {
        that.playCurrentAudio();
        wx.showToast({ title: '开始语音导览', icon: 'none', duration: 1500 });
      }, 500);
    }
  },

  bindAudioEvents: function() {
    var that = this;

    this.innerAudioContext.onPlay(function() {
      that.setData({ isPlaying: true });
    });

    this.innerAudioContext.onPause(function() {
      that.setData({ isPlaying: false });
    });

    this.innerAudioContext.onStop(function() {
      that.setData({ isPlaying: false, currentTime: 0 });
    });

    this.innerAudioContext.onEnded(function() {
      if (that.data.currentAudio) {
        that.markAsListened(that.data.currentAudio.id);
      }
      if (that.data.autoNext) {
        that.playNext();
      } else {
        that.setData({ isPlaying: false, currentTime: 0 });
      }
    });

    this.innerAudioContext.onTimeUpdate(function() {
      if (!that.data.sliderChanging && that.data.currentAudio) {
        that.setData({
          currentTime: Math.floor(that.innerAudioContext.currentTime || 0),
          duration: Math.floor(that.innerAudioContext.duration || that.data.currentAudio.duration)
        });
      }
    });

    this.innerAudioContext.onError(function(err) {
      console.error('音频播放错误:', err);
      wx.showToast({ title: '音频文件不可用', icon: 'none' });
    });
  },

  loadAudio: function(index) {
    if (index < 0 || index >= this.data.audioList.length) return;
    var audio = this.data.audioList[index];
    this.setData({
      currentIndex: index,
      currentAudio: audio,
      currentTime: 0,
      duration: audio.duration
    });
  },

  togglePlay: function() {
    if (this.data.isPlaying) {
      this.innerAudioContext.pause();
    } else {
      this.playCurrentAudio();
    }
  },

  playCurrentAudio: function() {
    var audio = this.data.currentAudio;
    if (!audio || !audio.src) return;

    this.innerAudioContext.src = audio.src;
    this.innerAudioContext.play();
    this.audioStartTime[audio.id] = Date.now();
  },

  playPrev: function() {
    var prevIndex = this.data.currentIndex - 1;
    if (prevIndex < 0) {
      wx.showToast({ title: '已是第一个', icon: 'none' });
      return;
    }
    this.loadAudio(prevIndex);
    this.playCurrentAudio();
  },

  playNext: function() {
    var nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= this.data.audioList.length) {
      wx.showToast({ title: '已是最后一个', icon: 'none' });
      this.setData({ isPlaying: false });
      return;
    }
    this.loadAudio(nextIndex);
    this.playCurrentAudio();
  },

  toggleAutoNext: function() {
    this.setData({ autoNext: !this.data.autoNext });
    wx.showToast({ title: this.data.autoNext ? '连续播放已开启' : '连续播放已关闭', icon: 'none' });
  },

  onSliderChange: function(e) {
    var position = e.detail.value;
    this.innerAudioContext.seek(position);
    this.setData({ sliderChanging: false, currentTime: position });
  },

  onSliderChanging: function() {
    this.setData({ sliderChanging: true });
  },

  markAsListened: function(audioId) {
    var listenedList = this.data.listenedList;
    if (!listenedList[audioId]) {
      listenedList[audioId] = true;
      wx.setStorageSync('audioListened', listenedList);
      this.setData({
        listenedList: listenedList,
        listenedCount: Object.keys(listenedList).length
      });
    }

    var appInstance = getApp();
    if (appInstance.globalData.isLoggedIn && this.data.currentAudio) {
      var audio = this.data.currentAudio;
      var duration = Math.floor((Date.now() - (this.audioStartTime[audioId] || Date.now())) / 1000);
      api.learningApi.recordAudio({
        audioId: audio.id,
        audioTitle: audio.title,
        zoneId: audio.zoneId,
        duration: duration,
        completed: true
      }).catch(function(err) {
        console.error('记录语音导览失败:', err);
      });
    }
  },

  togglePlaylist: function() {
    this.setData({ showPlaylist: !this.data.showPlaylist });
  },

  onPlaylistItemTap: function(e) {
    var index = e.currentTarget.dataset.index;
    this.loadAudio(index);
    this.playCurrentAudio();
    this.setData({ showPlaylist: false });
  },

  goBack: function() {
    wx.navigateBack();
  },

  stopPropagation: function() {}
});
