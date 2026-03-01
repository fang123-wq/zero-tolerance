var appConfig = require('../../config/app.js');

var PRIMARY_BASE = (appConfig.apiBaseUrl || '').replace(/\/api\/?$/, '');
var FALLBACK_BASES = ['http://127.0.0.1:3000', 'http://localhost:3000'];
var SERVER_BASES = [];

FALLBACK_BASES.forEach(function(base) {
  if (SERVER_BASES.indexOf(base) === -1) {
    SERVER_BASES.push(base);
  }
});

if (PRIMARY_BASE && SERVER_BASES.indexOf(PRIMARY_BASE) === -1) {
  SERVER_BASES.push(PRIMARY_BASE);
}

var VIDEO_PATHS = {
  intro: '/uploads/videos/jimeng-2026-02-27-7176-\u4e3b\u89d2\u662f\u7f09\u6bd2\u8b66\u5c0f\u5cf0\uff0c\u6709\u6e29\u67d4\u59bb\u5b50\u548c\u5e74\u5e7c\u5973\u513f\u3002\u6bd2\u8d29\u884c\u52a8\u5f53\u665a\uff0c\u5973\u513f\u53d1\u70e7\u4e86.mp4',
  mission: '/uploads/videos/jimeng-2026-02-27-5957-\u5973\u513f\u53d1\u70e7\u6c42\u4ed6\u7559\u4e0b\uff0c\u4ed6\u542b\u6cea\u5954\u8d74\u4efb\u52a1\u3002\u6210\u529f\u7834\u83b7\u5927\u6848\uff0c\u5374\u9519\u8fc7\u5973\u513f\u6700\u9700\u8981\u4ed6\u7684\u65f6\u523b\u3002.mp4',
  family: '/uploads/videos/jimeng-2026-03-01-3959-\u4ed6\u7559\u4e0b\u7167\u987e\u5973\u513f\uff0c\u4efb\u52a1\u9519\u5931\u826f\u673a\uff0c\u574f\u4eba\u9003\u8131\u5e76\u7ee7\u7eed\u4f5c\u6076\u3002\u4e8b\u540e\u53d7\u5bb3\u5bb6\u5ead\u589e\u591a\uff0c\u4ed6\u5f88\u6127\u759a\uff0c\u4f59....mp4'
};

var LOCAL_VIDEO_PATHS = {
  intro: '/assets/video/intro.mp4',
  mission: '/assets/video/youth1.mp4',
  family: '/assets/video/youth2.mp4'
};

function buildVideoUrls(path, localPath) {
  var urls = [];
  if (localPath) {
    urls.push(localPath);
  }
  SERVER_BASES.forEach(function(base) {
    urls.push(base + path);
  });
  return urls;
}

var VIDEO_URLS = {
  intro: buildVideoUrls(VIDEO_PATHS.intro, LOCAL_VIDEO_PATHS.intro),
  mission: buildVideoUrls(VIDEO_PATHS.mission, LOCAL_VIDEO_PATHS.mission),
  family: buildVideoUrls(VIDEO_PATHS.family, LOCAL_VIDEO_PATHS.family)
};

Page({
  data: {
    phase: 'intro',
    introVideoUrl: VIDEO_URLS.intro[0] || '',
    resultVideoUrl: '',
    chosenOption: '',
    endTitle: '',
    endDesc: '',
    introSourceIndex: 0,
    resultSourceIndex: 0
  },

  onLoad: function() {
    this.restart();
  },

  onIntroVideoEnded: function() {
    this.setData({ phase: 'choice' });
  },

  chooseOption: function(e) {
    var option = e.currentTarget.dataset.option;
    var urls = VIDEO_URLS[option] || [];
    if (!urls.length) {
      wx.showToast({ title: '\u89c6\u9891\u4e0d\u5b58\u5728', icon: 'none' });
      return;
    }

    this.setData({
      phase: 'result',
      resultVideoUrl: urls[0],
      chosenOption: option,
      resultSourceIndex: 0
    });
  },

  onResultVideoEnded: function() {
    var endTitle = '';
    var endDesc = '';
    if (this.data.chosenOption === 'mission') {
      endTitle = '\u575a\u5b88\u4f7f\u547d';
      endDesc = '\u5c0f\u5cf0\u542b\u6cea\u5954\u8d74\u4efb\u52a1\uff0c\u6210\u529f\u7834\u83b7\u5927\u6848\uff0c\u5374\u9519\u8fc7\u4e86\u5973\u513f\u6700\u9700\u8981\u4ed6\u7684\u65f6\u523b\u3002';
    } else {
      endTitle = '\u9009\u62e9\u5bb6\u5ead';
      endDesc = '\u5c0f\u5cf0\u7559\u4e0b\u7167\u987e\u5973\u513f\uff0c\u4efb\u52a1\u9519\u5931\u826f\u673a\uff0c\u574f\u4eba\u9003\u8131\u5e76\u7ee7\u7eed\u4f5c\u6076\uff0c\u4e8b\u540e\u4ed6\u6df1\u611f\u6127\u759a\u3002';
    }
    this.setData({
      phase: 'end',
      endTitle: endTitle,
      endDesc: endDesc
    });
  },

  tryNextSource: function(key, indexField, urlField) {
    var urls = VIDEO_URLS[key] || [];
    var currentIndex = this.data[indexField] || 0;
    var nextIndex = currentIndex + 1;
    if (nextIndex >= urls.length) {
      return false;
    }

    var patch = {};
    patch[indexField] = nextIndex;
    patch[urlField] = urls[nextIndex];
    var that = this;
    this.setData(patch, function() {
      var videoId = that.data.phase === 'intro' ? 'heroVideo' : 'resultVideo';
      var ctx = wx.createVideoContext(videoId, that);
      if (ctx && ctx.play) {
        setTimeout(function() { ctx.play(); }, 120);
      }
    });

    wx.showToast({
      title: '\u4e3b\u5730\u5740\u5931\u8d25\uff0c\u5c1d\u8bd5\u5907\u7528\u6e90',
      icon: 'none'
    });
    return true;
  },

  onVideoError: function(e) {
    var currentUrl = this.data.phase === 'intro' ? this.data.introVideoUrl : this.data.resultVideoUrl;
    console.error('video play error', this.data.phase, currentUrl, e && e.detail);

    if (this.data.phase === 'intro') {
      if (this.tryNextSource('intro', 'introSourceIndex', 'introVideoUrl')) {
        return;
      }
    } else if (this.data.phase === 'result' && this.data.chosenOption) {
      if (this.tryNextSource(this.data.chosenOption, 'resultSourceIndex', 'resultVideoUrl')) {
        return;
      }
    }

    wx.showToast({ title: '\u89c6\u9891\u52a0\u8f7d\u5931\u8d25', icon: 'none' });
  },

  restart: function() {
    this.setData({
      phase: 'intro',
      introVideoUrl: (VIDEO_URLS.intro[0] || ''),
      resultVideoUrl: '',
      chosenOption: '',
      endTitle: '',
      endDesc: '',
      introSourceIndex: 0,
      resultSourceIndex: 0
    });
  },

  goBack: function() {
    wx.navigateBack();
  },

  onShareAppMessage: function() {
    return {
      title: '\u7f09\u6bd2\u82f1\u96c4\u7684\u6295\u62e9',
      path: '/pages/hero/hero'
    };
  }
});
