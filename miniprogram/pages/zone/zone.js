var api = require('../../utils/api.js');
var storage = require('../../utils/storage.js').storage;
var app = getApp();

Page({
  data: {
    zone: null,
    zoneIndex: 0,
    zones: [],
    visited: false,
    activeSection: 0,
    showDetail: false,
    currentItem: null,
    showQuiz: false,
    quizCompleted: false,
    currentQuizIndex: 0,
    quizScore: 0,
    selectedAnswer: -1,
    answerSubmitted: false,
    showSignature: false,
    hasSigned: false,
    signatureNames: ['寮?*', '鏉?*', '鐜?*', '璧?*', '閽?*', '瀛?*', '鍛?*', '鍚?*', '閮?*', '鍐?*', '闄?*', '瑜?*'],
    today: ''
  },

  onLoad: function(options) {
    var now = new Date();
    var today = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    this.setData({ today: today });
    this.visitStartTime = Date.now();
    this.loadZonesFromApi(options.id || 'zone1');
  },

  onShow: function() {
    this.checkVisitStatus();
  },

  loadZonesFromApi: function(zoneId) {
    var that = this;
    
    api.zoneApi.getAll().then(function(zones) {
      // API 宸茶繑鍥炴牸寮忓寲鐨勫畬鏁存暟鎹紝鐩存帴浣跨敤
      if (zones && zones.length > 0) {
        that.setData({ zones: zones });
        that.loadZone(zoneId);
      } else {
        console.error('灞曞尯鏁版嵁涓虹┖');
        wx.showToast({ title: '鍔犺浇灞曞尯澶辫触', icon: 'none' });
      }
    }).catch(function(err) {
      console.error('鍔犺浇灞曞尯澶辫触:', err);
      wx.showToast({ title: '鍔犺浇灞曞尯澶辫触', icon: 'none' });
    });
  },

  loadZone: function(zoneId) {
    var zones = this.data.zones;
    var index = -1;
    var zone = null;
    for (var i = 0; i < zones.length; i++) {
      if (zones[i].id === zoneId) {
        zone = zones[i];
        index = i;
        break;
      }
    }
    if (!zone && zones.length > 0) {
      zone = zones[0];
      index = 0;
    }
    
    if (zone) {
      wx.setNavigationBarTitle({ title: zone.name });
      this.setData({
        zone: zone,
        zoneIndex: index,
        activeSection: 0,
        showDetail: false,
        currentItem: null
      });
    }
    
    this.checkVisitStatus();
    this.checkQuizStatus();
    this.checkSignStatus();
  },

  checkVisitStatus: function() {
    var visited = storage.getVisitedZones();
    var zone = this.data.zone;
    if (zone) {
      this.setData({ visited: visited.indexOf(zone.id) > -1 });
    }
  },

  checkQuizStatus: function() {
    var completed = storage.get('zoneQuizCompleted') || [];
    var zone = this.data.zone;
    if (zone) {
      this.setData({ quizCompleted: completed.indexOf(zone.id) > -1 });
    }
  },

  checkSignStatus: function() {
    var signed = storage.get('pledgeSigned') || false;
    this.setData({ hasSigned: signed });
  },

  switchSection: function(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({ activeSection: index });
  },

  markVisited: async function() {
    var zone = this.data.zone;
    var canUse = await app.ensureLoggedIn({
      content: '请先登录后再参与积分活动'
    });
    if (!canUse) {
      return;
    }
    if (!this.data.visited) {
      storage.markZoneVisited(zone.id);
      app.addPoints(30, '鍙傝' + zone.name + '灞曞尯');
      wx.showToast({ title: '+30绉垎', icon: 'none' });
      this.setData({ visited: true });
      
      // 璁板綍灞曞尯璁块棶
      if (app.globalData.isLoggedIn) {
        var duration = Math.floor((Date.now() - (this.visitStartTime || Date.now())) / 1000);
        api.learningApi.recordZoneVisit({
          zoneId: zone.id,
          zoneName: zone.name,
          duration: duration
        }).catch(function(err) {
          console.error('璁板綍灞曞尯璁块棶澶辫触:', err);
        });
      }
    }
  },

  goToPrevZone: function() {
    var zones = this.data.zones;
    var prevIndex = this.data.zoneIndex - 1;
    if (prevIndex >= 0) {
      this.loadZone(zones[prevIndex].id);
    }
  },

  goToNextZone: function() {
    var zones = this.data.zones;
    var nextIndex = this.data.zoneIndex + 1;
    if (nextIndex < zones.length) {
      this.loadZone(zones[nextIndex].id);
    }
  },

  goToZone: function(e) {
    var zoneId = e.currentTarget.dataset.id;
    this.loadZone(zoneId);
  },

  openDetail: function(e) {
    var item = e.currentTarget.dataset.item;
    this.setData({
      showDetail: true,
      currentItem: item
    });
  },

  closeDetail: function() {
    this.setData({
      showDetail: false,
      currentItem: null
    });
  },

  preventMove: function() {},

  lightCandle: async function() {
    var canUse = await app.ensureLoggedIn({
      content: '请先登录后再参与积分活动'
    });
    if (!canUse) {
      return;
    }
    wx.showToast({ title: '馃暞锔?鑷存暚鑻遍泟', icon: 'none', duration: 2000 });
    app.addPoints(5, '鑷存暚缂夋瘨鑻遍泟');
  },

  makeCall: function(e) {
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: function() {
        wx.showToast({ title: '鎷ㄦ墦澶辫触', icon: 'none' });
      }
    });
  },

  startQuiz: async function() {
    var canUse = await app.ensureLoggedIn({
      content: '请先登录后再参与积分活动'
    });
    if (!canUse) {
      return;
    }
    var zone = this.data.zone;
    if (!zone.quiz || zone.quiz.length === 0) {
      wx.showToast({ title: '鏆傛棤闂瓟棰樼洰', icon: 'none' });
      return;
    }
    this.setData({
      showQuiz: true,
      currentQuizIndex: 0,
      quizScore: 0,
      selectedAnswer: -1,
      answerSubmitted: false
    });
  },

  selectAnswer: function(e) {
    if (this.data.answerSubmitted) return;
    var index = e.currentTarget.dataset.index;
    this.setData({ selectedAnswer: index });
  },

  submitAnswer: function() {
    if (this.data.selectedAnswer === -1) {
      wx.showToast({ title: '璇烽€夋嫨绛旀', icon: 'none' });
      return;
    }
    var zone = this.data.zone;
    var quiz = zone.quiz[this.data.currentQuizIndex];
    var isCorrect = this.data.selectedAnswer === quiz.answer;
    var newScore = this.data.quizScore;
    if (isCorrect) newScore++;
    this.setData({ answerSubmitted: true, quizScore: newScore });
  },

  nextQuestion: function() {
    var zone = this.data.zone;
    var nextIndex = this.data.currentQuizIndex + 1;
    if (nextIndex >= zone.quiz.length) {
      this.finishQuiz();
    } else {
      this.setData({
        currentQuizIndex: nextIndex,
        selectedAnswer: -1,
        answerSubmitted: false
      });
    }
  },

  finishQuiz: function() {
    var zone = this.data.zone;
    var score = this.data.quizScore;
    var total = zone.quiz.length;
    var passed = score >= Math.ceil(total * 0.6);
    if (passed && !this.data.quizCompleted) {
      var completed = storage.get('zoneQuizCompleted') || [];
      completed.push(zone.id);
      storage.set('zoneQuizCompleted', completed);
      app.addPoints(10, '瀹屾垚' + zone.name + '闂瓟');
      this.setData({ quizCompleted: true });
    }
    this.setData({ showQuiz: false });
    wx.showModal({
      title: passed ? '恭喜通过' : '继续加油',
      content: '答对 ' + score + '/' + total + ' 题' + (passed ? '，获得10积分' : ''),
      showCancel: false
    });
  },

  closeQuiz: function() {
    this.setData({ showQuiz: false });
  },

  openSignature: async function() {
    var that = this;
    var canUse = await app.ensureLoggedIn({
      content: '请先登录后再参与积分活动'
    });
    if (!canUse) {
      return;
    }
    this.setData({ showSignature: true });
    setTimeout(function() { that.initCanvas(); }, 100);
  },

  closeSignature: function() {
    this.setData({ showSignature: false });
  },

  initCanvas: function() {
    var that = this;
    var query = wx.createSelectorQuery();
    query.select('#signatureCanvas')
      .fields({ node: true, size: true })
      .exec(function(res) {
        if (res[0]) {
          var canvas = res[0].node;
          var ctx = canvas.getContext('2d');
          var dpr = wx.getSystemInfoSync().pixelRatio;
          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          ctx.scale(dpr, dpr);
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          that.canvas = canvas;
          that.ctx = ctx;
          that.canvasWidth = res[0].width;
          that.canvasHeight = res[0].height;
        }
      });
  },

  canvasStart: function(e) {
    if (!this.ctx) return;
    var touch = e.touches[0];
    this.ctx.beginPath();
    this.ctx.moveTo(touch.x, touch.y);
    this.isDrawing = true;
    this.hasDrawn = true;
  },

  canvasMove: function(e) {
    if (!this.ctx || !this.isDrawing) return;
    var touch = e.touches[0];
    this.ctx.lineTo(touch.x, touch.y);
    this.ctx.stroke();
  },

  canvasEnd: function() {
    this.isDrawing = false;
  },

  clearCanvas: function() {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.hasDrawn = false;
    }
  },

  confirmSignature: async function() {
    var canUse = await app.ensureLoggedIn({
      content: '请先登录后再参与积分活动'
    });
    if (!canUse) {
      return;
    }
    if (!this.hasDrawn) {
      wx.showToast({ title: '璇峰厛绛惧悕', icon: 'none' });
      return;
    }
    storage.set('pledgeSigned', true);
    app.addPoints(30, '签署禁毒承诺书');
    this.setData({ showSignature: false, hasSigned: true });
    wx.showToast({ title: '绛剧讲鎴愬姛 +30绉垎', icon: 'success' });
  },

  backToMuseum: function() {
    wx.navigateBack({ fail: function() {
      wx.switchTab({ url: '/pages/museum/museum' });
    }});
  },

  onShareAppMessage: function() {
    var zone = this.data.zone;
    var appName = app.globalData.appName || '禁毒云展馆';
    return {
      title: appName + ' - ' + zone.name,
      path: '/pages/zone/zone?id=' + zone.id
    };
  }
});




