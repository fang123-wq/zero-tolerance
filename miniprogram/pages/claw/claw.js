// pages/claw/claw.js - 绂佹瘨椋炶溅鍐插埡
var clawConfig = require('../../data/clawConfig.js');
var storageUtil = require('../../utils/storage.js');
var api = require('../../utils/api.js');
var app = getApp();

// 娓告垙甯搁噺
var ROAD_WIDTH_RATIO = 0.7;
var LANE_COUNT = 3;
var CAR_WIDTH = 44;
var CAR_HEIGHT = 68;
var OBSTACLE_SIZE = 36;
var ITEM_SIZE = 32;
var SPEED_BASE = 4;
var SPEED_MAX = 8;
var SPAWN_INTERVAL = 40;
var HP_DAMAGE = 20;
var HP_MAX = 100;
var CAR_LERP = 0.28;
var CAR_TILT_MAX = 0.22;
var FLAME_COUNT = 6;
var STAR_POINTS = 10;
var JOURNEY_COMPLETE_POINTS = 30;
var DISTANCE_POINTS_RATIO = 0.2;
var OSS_AUDIO_BASE = 'https://oss.bjgjlc.com/drug-education/claw/audio/';
var OBSTACLE_PRODUCTS = [
  { name: '\u6447\u5934\u4e38', style: 'pill' },
  { name: '\u6d77\u6d1b\u56e0', style: 'syringe' },
  { name: '\u51b0\u6bd2', style: 'packet' }
];

Page({
  data: {
    config: clawConfig.clawMachineConfig,
    gameState: 'idle',
    userPoints: 0,
    distance: 0,
    stars: 0,
    hp: HP_MAX,
    score: 0,
    isDrawing: false,
    showResult: false,
    isWin: false,
    wonPrize: {},
    wonPoints: 0,
    gameWon: false,
    gameComment: '',  // 娓告垙璇勪环
    journeyNum: 1,  // 褰撳墠鏃呯▼缂栧彿
    journeyProgress: 0,  // 鏃呯▼杩涘害鐧惧垎姣?    journeyTarget: 100,  // 鏃呯▼鐩爣璺濈
    totalJourneys: 0,  // 绱瀹屾垚鏃呯▼鏁?    showRanking: false,  // 鏄剧ず鎺掕姒?    rankingList: [],  // 鎺掕姒滄暟鎹?    pointsHistory: [],
    totalPointsEarned: 0,
    todayPlays: 0,
    consecutiveFails: 0,
    dailyLimit: 10,
    costPerPlay: 100,
    freeLimit: 3,
    guaranteeAfterFails: 5,
    showSettings: false,
    musicOn: true,
    sfxOn: true
  },

  _canvas: null,
  _ctx: null,
  _dpr: 1,
  _width: 0,
  _height: 0,
  _raf: null,
  _car: null,
  _obstacles: [],
  _items: [],
  _particles: [],
  _fireworks: [],
  _roadOffset: 0,
  _frameCount: 0,
  _speed: SPEED_BASE,
  _distance: 0,
  _stars: 0,
  _hp: HP_MAX,
  _gameOver: false,
  _touchStartX: 0,
  _touchStartY: 0,
  _isDragging: false,
  _carTargetX: 0,
  _carTargetY: 0,
  _carSpeedY: 0,
  _roadLeft: 0,
  _roadRight: 0,
  _laneWidth: 0,
  _invincible: 0,
  _hudCounter: 0,
  _carTilt: 0,
  _carPrevX: 0,
  _flames: [],
  _wheelAngle: 0,
  _canvasLeft: 0,
  _shakeX: 0,
  _shakeY: 0,
  _shakeTime: 0,
  _slogans: [],  // 瀹ｄ紶鏍囪鏁扮粍
  _lastTouchTime: 0,  // 瑙︽懜鑺傛祦
  _carRedTime: 0,  // 椋炶溅鍙樼孩鏃堕棿
  _carBoostSpeed: 0,  // 椋炶溅鍐插埡閫熷害
  _poisonDamageTimer: 0,  // 涓瘨鎸佺画浼ゅ璁℃椂鍣?  _damageFlashTime: 0,  // 鎺夎闂儊鏃堕棿
  _bloodParticles: [],  // 娴佽绮掑瓙
  _journeyNum: 1,  // 褰撳墠鏃呯▼缂栧彿
  _journeyDistance: 0,  // 褰撳墠鏃呯▼宸茶椹惰窛绂?  _journeyTarget: 100,  // 褰撳墠鏃呯▼鐩爣璺濈
  _totalJourneys: 0,  // 绱瀹屾垚鏃呯▼鏁?  _finishLineTimer: 0,  // 鍐插埡绾挎樉绀鸿鏃跺櫒
  _finishLineY: -100,  // 鍐插埡绾縔浣嶇疆锛堥殢閬撹矾婊氬姩锛?  _finishLineCrossed: false,  // 褰撳墠鍐插埡绾挎槸鍚﹀凡瑙﹀彂缁撶畻
  _finishLineJourney: 0,  // 褰撳墠鍐插埡绾垮搴旀梾绋?  _bgmAudio: null,
  _engineAudio: null,
  _crashAudio: null,
  _starAudio: null,
  _journeyAudio: null,
  _carImage: null,  // 璧涜溅鍥剧墖

  onLoad: function() {
    this.loadGameConfig();
    this.loadUserData();
    this.loadSettings();
    this.loadJourneyData();
    this.loadRanking();
    this.initAudio();
    // 杩涘叆椤甸潰灏辨挱鏀捐儗鏅煶涔?
    var that = this;
    setTimeout(function() {
      if (that.data.musicOn) {
        that.playBgm();
      }
    }, 500);
  },

  onShow: function() {
    this.loadUserData();
  },

  onUnload: function() {
    this.stopGame();
    this.destroyAudio();
  },

  onHide: function() {
    this.stopGame();
    this.stopAllAudio();
  },

  loadGameConfig: function() {
    var that = this;
    api.clawApi.getConfig().then(function(data) {
      if (!data) return;
      that.setData({
        dailyLimit: data.dailyLimit || that.data.dailyLimit,
        costPerPlay: data.costPerPlay || that.data.costPerPlay
      });
    }).catch(function() {});
  },

  loadUserData: function() {
    var that = this;
    var userPoints = app.globalData.points || wx.getStorageSync('points') || 0;
    var clawData = storageUtil.storage.get('clawData') || { pointsHistory: [], totalPointsEarned: 0 };

    this.setData({
      userPoints: userPoints,
      pointsHistory: clawData.pointsHistory || [],
      totalPointsEarned: clawData.totalPointsEarned || 0
    });

    if (app.globalData.token) {
      api.clawApi.getStatus().then(function(data) {
        that.setData({
          userPoints: data.userPoints,
          todayPlays: data.todayPlays,
          consecutiveFails: data.consecutiveFails || 0,
          dailyLimit: data.dailyLimit,
          costPerPlay: data.costPerPlay,
          guaranteeAfterFails: data.guaranteeAfterFails || 5
        });
        app.globalData.points = data.userPoints;
        wx.setStorageSync('points', data.userPoints);
      }).catch(function() {});
    }
  },

  // ========== 寮€濮嬫父鎴?==========
  startGame: async function() {
    var that = this;
    if (this.data.gameState === 'playing') return;

    var canUse = await app.ensureLoggedIn({
      content: '请先登录后再参与积分活动'
    });
    if (!canUse) {
      return;
    }
    var isFree = this.data.todayPlays < this.data.freeLimit;
    if (!isFree && this.data.userPoints < this.data.costPerPlay) {
      wx.showToast({ title: '绉垎涓嶈冻', icon: 'none' });
      return;
    }
    if (this.data.todayPlays >= this.data.dailyLimit) {
      wx.showToast({ title: '今日次数已用完', icon: 'none' });
      return;
    }

    console.log('寮€濮嬫父鎴忥紝鍒濆琛€閲?', HP_MAX);
    this.setData({
      gameState: 'playing',
      distance: 0, 
      stars: 0, 
      hp: HP_MAX, 
      score: 0,
      isDrawing: false, 
      showResult: false, 
      showSettings: false
    }, function() {
      console.log('setData瀹屾垚锛屽綋鍓峢p:', that.data.hp);
    });

    this.playBgm();
    this.playEngine();

    setTimeout(function() { that.initCanvas(); }, 100);
  },

  initCanvas: function() {
    var that = this;
    var query = wx.createSelectorQuery();
    query.select('#gameCanvas')
      .fields({ node: true, size: true })
      .exec(function(res) {
        if (!res || !res[0] || !res[0].node) {
          console.error('Canvas not found');
          return;
        }
        var canvas = res[0].node;
        var ctx = canvas.getContext('2d');
        var info = wx.getWindowInfo();
        var dpr = info.pixelRatio || 2;
        var w = res[0].width;
        var h = res[0].height;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        that._canvas = canvas;
        that._ctx = ctx;
        that._dpr = dpr;
        that._width = w;
        that._height = h;

        var roadW = w * ROAD_WIDTH_RATIO;
        that._roadLeft = (w - roadW) / 2;
        that._roadRight = that._roadLeft + roadW;
        that._laneWidth = roadW / LANE_COUNT;

        that._car = {
          x: w / 2,
          y: h - CAR_HEIGHT - 40,
          w: CAR_WIDTH,
          h: CAR_HEIGHT
        };
        that._carTargetX = that._car.x;
        that._carTargetY = that._car.y;
        that._carSpeedY = 0;
        that._carPrevX = that._car.x;

        that._obstacles = [];
        that._items = [];
        that._particles = [];
        that._fireworks = [];
        that._flames = [];
        that._slogans = [];  // 鍒濆鍖栨爣璇暟缁?        that._roadOffset = 0;
        that._frameCount = 0;
        that._speed = SPEED_BASE;
        that._distance = 0;
        that._stars = 0;
        that._hp = HP_MAX;
        that._gameOver = false;
        that._invincible = 0;
        that._hudCounter = 0;
        that._carTilt = 0;
        that._wheelAngle = 0;
        that._shakeX = 0;
        that._shakeY = 0;
        that._shakeTime = 0;
        that._carRedTime = 0;
        that._carBoostSpeed = 0;
        that._poisonDamageTimer = 0;
        that._damageFlashTime = 0;
        that._bloodParticles = [];
        
        // 閲嶇疆鏃呯▼鏁版嵁锛堟瘡娆″紑濮嬮噸鏂颁粠绗?鏃呯▼寮€濮嬶級
        that._journeyNum = 1;
        that._journeyDistance = 0;
        that._journeyTarget = 100;
        that._totalJourneys = 0;
        that._finishLineTimer = 0;
        that._finishLineY = -100;
        that._finishLineCrossed = false;
        that._finishLineJourney = 0;

        // 鍔犺浇璧涜溅鍥剧墖
        var carImg = canvas.createImage();
        carImg.onload = function() {
          that._carImage = carImg;
        };
        carImg.onerror = function() {
          console.error('赛车图片加载失败，使用代码绘制');
        };
        carImg.src = '/assets/images/racing-car.png';

        that.gameLoop();
      });
  },

  // ========== 娓告垙涓诲惊鐜?==========
  gameLoop: function() {
    if (this._gameOver) return;
    var that = this;
    this._raf = this._canvas.requestAnimationFrame(function() {
      that.update();
      that.draw();
      that.gameLoop();
    });
  },

  update: function() {
    this._frameCount++;
    // 閫熷害閫愭笎鍔犲揩锛堟瘡200璺濈澧炲姞0.5閫熷害锛?
    this._speed = Math.min(SPEED_MAX, SPEED_BASE + this._distance / 400);
    this._distance += this._speed * 0.15;
    var dist = Math.floor(this._distance);
    // Keep a continuous road offset so every road element scrolls from one source.
    this._roadOffset += this._speed;
    if (this._roadOffset > 1000000) {
      this._roadOffset = 0;
    }
    
    // 鏇存柊鏃呯▼杩涘害
    this._journeyDistance += this._speed * 0.15;
    if (this._journeyDistance >= this._journeyTarget) {
      // 鍒拌揪鏃呯▼鐩爣锛岀敓鎴愬彲琚啿绾跨殑缁堢偣绾?
      var completedJourney = this._journeyNum;
      this._journeyDistance -= this._journeyTarget;
      this._journeyNum++;
      this._journeyTarget = this._journeyNum * 100;  // 涓嬩竴鏃呯▼鐩爣锛?00,200,300...
      this._totalJourneys++;
      this._finishLineTimer = 1;  // 婵€娲诲啿鍒虹嚎
      this._finishLineY = -30;
      this._finishLineCrossed = false;
      this._finishLineJourney = completedJourney;

      // 淇濆瓨鏃呯▼鏁版嵁
      wx.setStorageSync('journeyData', {
        journeyNum: this._journeyNum,
        journeyDistance: this._journeyDistance,
        totalJourneys: this._totalJourneys
      });
    }
    
    // 鍐插埡绾块殢閬撹矾婊氬姩
    if (this._finishLineTimer > 0) {
      this._finishLineY += this._speed;
      if (this._finishLineY > this._height + 50) {
        this._finishLineTimer = 0;
        this._finishLineCrossed = false;
        this._finishLineJourney = 0;
      }
    }

    if (this._invincible > 0) this._invincible--;
    if (this._shakeTime > 0) {
      this._shakeTime--;
      this._shakeX = (Math.random() - 0.5) * 6;
      this._shakeY = (Math.random() - 0.5) * 4;
    } else {
      this._shakeX = 0;
      this._shakeY = 0;
    }
    
    // 椋炶溅鍙樼孩鍊掕鏃?
    if (this._carRedTime > 0) {
      this._carRedTime--;
    }
    
    // 涓瘨鎸佺画浼ゅ锛堟瘡绉掓帀1%锛屽叡3绉掞級
    if (this._poisonDamageTimer > 0) {
      this._poisonDamageTimer--;
      // 姣?0甯э紙1绉掞級鎵?鐐硅
      if (this._poisonDamageTimer % 60 === 0) {
        this._hp = Math.max(0, this._hp - 1);
        this._damageFlashTime = 15;  // 鍗婇殣韬棯鐑?5甯?        // 鐢熸垚娴佽绮掑瓙
        this.spawnBloodParticles();
      }
    }
    
    // 鎺夎闂儊鍊掕鏃?
    if (this._damageFlashTime > 0) {
      this._damageFlashTime--;
    }
    
    // 璧涜溅璺熼殢瑙︽懜浣嶇疆锛堟敮鎸佷笂涓嬪乏鍙宠嚜鐢辩Щ鍔級
    var car = this._car;
    
    // 椋炶溅鍐插埡鏁堟灉锛堝悜鍓嶅啿锛?
    if (this._carBoostSpeed !== 0) {
      car.y += this._carBoostSpeed;
      this._carBoostSpeed *= 0.9;
      if (Math.abs(this._carBoostSpeed) < 0.5) {
        this._carBoostSpeed = 0;
      }
    }

    // 鍙湪鎷栧姩鏃舵墠鏇存柊浣嶇疆锛岄伩鍏嶄笉蹇呰鐨勮绠?
    if (this._isDragging) {
      var dx = this._carTargetX - car.x;
      var dy = this._carTargetY - car.y;
      car.x += dx * 0.25;
      car.y += dy * 0.25;
    }
    
    // 闄愬埗璧涜溅鍦ㄩ亾璺竟鐣屽唴锛堝乏鍙筹級
    car.x = Math.max(this._roadLeft + car.w / 2 + 4, Math.min(this._roadRight - car.w / 2 - 4, car.x));
    
    // 闄愬埗璧涜溅鍦ㄥ睆骞曡寖鍥村唴锛堜笂涓嬶級
    var minY = CAR_HEIGHT / 2 + 20;
    var maxY = this._height - CAR_HEIGHT / 2 - 20;
    car.y = Math.max(minY, Math.min(maxY, car.y));

    // 璧涜溅瀹為檯鍐茬嚎鍚庡啀瑙﹀彂濂栧姳銆侀煶鏁堝拰绀艰姳
    if (this._finishLineTimer > 0 && !this._finishLineCrossed) {
      var lineTop = this._finishLineY;
      var lineBottom = this._finishLineY + 30;
      var carTop = car.y - car.h / 2;
      var carBottom = car.y + car.h / 2;
      if (carBottom >= lineTop && carTop <= lineBottom) {
        this._finishLineCrossed = true;
        this.onFinishLineCrossed(this._finishLineJourney || (this._journeyNum - 1));
      }
    }

    // 璧涜溅杞悜鍊炬枩
    var moveSpeed = car.x - this._carPrevX;
    this._carTilt += (moveSpeed * 0.03 - this._carTilt) * 0.2;
    this._carTilt = Math.max(-CAR_TILT_MAX, Math.min(CAR_TILT_MAX, this._carTilt));
    this._carPrevX = car.x;

    // 杞﹁疆鏃嬭浆
    this._wheelAngle += this._speed * 0.15;

    // 鐢熸垚闅滅鐗╁拰閬撳叿
    if (this._frameCount % SPAWN_INTERVAL === 0) {
      this.spawnObjects();
    }

    // 鏇存柊闅滅鐗?
    for (var i = this._obstacles.length - 1; i >= 0; i--) {
      var ob = this._obstacles[i];
      ob.y += this._speed;
      if (ob.y > this._height + 50) {
        this._obstacles.splice(i, 1);
        continue;
      }
      if (this._invincible <= 0 && this.hitTest(car, ob)) {
        this._hp = Math.max(0, this._hp - HP_DAMAGE);
        this._invincible = 30;
        this._shakeTime = 8;
        this._carRedTime = 180;
        this._carBoostSpeed = -8;  // 鍚戝墠鍐插埡
        this._poisonDamageTimer = 180;
        this.burst(ob.x, ob.y, '#ff4444');
        this._obstacles.splice(i, 1);
        this.playCrash();
      }
    }

    // 鏇存柊閬撳叿
    for (var j = this._items.length - 1; j >= 0; j--) {
      var it = this._items[j];
      it.y += this._speed;
      if (it.y > this._height + 50) {
        this._items.splice(j, 1);
        continue;
      }
      if (this.hitTest(car, it)) {
        this._stars++;
        // 瀹炴椂娣诲姞绉垎鍒扮敤鎴疯处鎴?
        var newPoints = this.data.userPoints + STAR_POINTS;
        this.setData({ userPoints: newPoints });
        app.globalData.points = newPoints;
        wx.setStorageSync('points', newPoints);
        
        // 濡傛灉宸茬櫥褰曪紝鍚屾鍒版湇鍔″櫒
        if (app.globalData.token) {
          api.userApi.addPoints(STAR_POINTS, '椋炶溅鍐插埡鏀堕泦鏄熸槦').catch(function(err) {
            console.error('绉垎鍚屾澶辫触:', err);
          });
        }
        
        this.burst(it.x, it.y, '#ffd700');
        this._items.splice(j, 1);
        this.playStar();
      }
    }

    // 鏇存柊绮掑瓙
    for (var k = this._particles.length - 1; k >= 0; k--) {
      var p = this._particles[k];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) this._particles.splice(k, 1);
    }

    // 鏇存柊绀艰姳绮掑瓙
    for (var f = this._fireworks.length - 1; f >= 0; f--) {
      var fw = this._fireworks[f];
      fw.x += fw.vx;
      fw.y += fw.vy;
      fw.vy += 0.08;
      fw.life--;
      if (fw.life <= 0) {
        this._fireworks.splice(f, 1);
      }
    }
    
    // 鏇存柊娴佽绮掑瓙
    for (var b = this._bloodParticles.length - 1; b >= 0; b--) {
      var bp = this._bloodParticles[b];
      bp.x += bp.vx;
      bp.y += bp.vy;
      bp.vy += 0.2;  // 閲嶅姏
      bp.life--;
      bp.alpha = bp.life / bp.maxLife;
      if (bp.life <= 0) this._bloodParticles.splice(b, 1);
    }

    // 璁＄畻绉垎 = 鏄熸槦 * 鍒嗗€硷紙鍙敱鏄熸槦鍐冲畾锛?
    var score = this._stars * STAR_POINTS;

    // 姣?0甯ф洿鏂癏UD锛堢珛鍗虫洿鏂颁竴娆＄‘淇濇樉绀猴級
    this._hudCounter++;
    if (this._hudCounter >= 10) {
      this._hudCounter = 0;
      var journeyProgress = Math.min(100, Math.floor(this._journeyDistance / this._journeyTarget * 100));
      this.setData({ 
        distance: dist, stars: this._stars, hp: this._hp, score: score,
        journeyNum: this._journeyNum, journeyProgress: journeyProgress, 
        journeyTarget: this._journeyTarget, totalJourneys: this._totalJourneys
      });
    }
    
    // 棣栨鏇存柊鏃剁珛鍗虫樉绀?
    if (this._frameCount === 1) {
      this.setData({ 
        distance: dist, stars: this._stars, hp: this._hp, score: score,
        journeyNum: this._journeyNum, journeyProgress: 0, 
        journeyTarget: this._journeyTarget, totalJourneys: this._totalJourneys
      });
    }

    // 娓告垙缁撴潫鍒ゅ畾锛堜粎琛€閲忎负0鏃剁粨鏉燂紝娌℃湁璺濈闄愬埗锛?
    if (this._hp <= 0) {
      this._gameOver = true;
      this.setData({ distance: dist, stars: this._stars, hp: 0, score: score });
      this.stopAllAudio();
      // 淇濆瓨鏃呯▼鏁版嵁
      this.saveJourneyData();
      this.endGame(score >= 50);
    }
  },

  spawnObjects: function() {
    var lanes = [0, 1, 2];
    // 娲楃墝
    for (var a = 2; a > 0; a--) {
      var b = Math.floor(Math.random() * (a + 1));
      var t = lanes[a]; lanes[a] = lanes[b]; lanes[b] = t;
    }

    var obCount = Math.random() < 0.4 ? 2 : 1;
    for (var m = 0; m < obCount; m++) {
      var lane = lanes[m];
      var cx = this._roadLeft + this._laneWidth * lane + this._laneWidth / 2;
      this._obstacles.push({
        x: cx, y: -OBSTACLE_SIZE,
        w: OBSTACLE_SIZE, h: OBSTACLE_SIZE,
        type: Math.floor(Math.random() * OBSTACLE_PRODUCTS.length)
      });
    }

    if (Math.random() < 0.3 && obCount < 3) {
      var il = lanes[obCount];
      var ix = this._roadLeft + this._laneWidth * il + this._laneWidth / 2;
      this._items.push({ x: ix, y: -ITEM_SIZE, w: ITEM_SIZE, h: ITEM_SIZE });
    }
  },

  hitTest: function(a, b) {
    var s = 6;
    return (a.x - a.w/2 + s < b.x + b.w/2 - s) &&
           (a.x + a.w/2 - s > b.x - b.w/2 + s) &&
           (a.y - a.h/2 + s < b.y + b.h/2 - s) &&
           (a.y + a.h/2 - s > b.y - b.h/2 + s);
  },

  burst: function(x, y, color) {
    for (var i = 0; i < 12; i++) {
      var ang = Math.random() * Math.PI * 2;
      var spd = 1.5 + Math.random() * 4;
      this._particles.push({
        x: x, y: y,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        life: 18 + Math.floor(Math.random() * 12),
        color: color, size: 2 + Math.random() * 5
      });
    }
  },

  onFinishLineCrossed: function(completedJourney) {
    var journeyPoints = JOURNEY_COMPLETE_POINTS;
    var updatedPoints = (this.data.userPoints || 0) + journeyPoints;
    this.setData({ userPoints: updatedPoints });
    app.globalData.points = updatedPoints;
    wx.setStorageSync('points', updatedPoints);

    if (app.globalData.token) {
      api.userApi.addPoints(journeyPoints, '完成第' + completedJourney + '旅程冲刺').catch(function(err) {
        console.error('鏃呯▼绉垎鍚屾澶辫触:', err);
      });
    }

    this.playJourneyComplete();
    this.spawnFireworks(this._roadLeft + (this._roadRight - this._roadLeft) * 0.2, this._height * 0.28);
    this.spawnFireworks(this._roadLeft + (this._roadRight - this._roadLeft) * 0.5, this._height * 0.22);
    this.spawnFireworks(this._roadLeft + (this._roadRight - this._roadLeft) * 0.8, this._height * 0.28);
    wx.showToast({ title: '鍐茬嚎鎴愬姛 +30绉垎', icon: 'none', duration: 1200 });
  },
  
  // 鐢熸垚娴佽绮掑瓙锛堝崱閫氭晥鏋滐級
  spawnBloodParticles: function() {
    var car = this._car;
    // 浠庤禌杞︿綅缃敓鎴愬涓婊?
    for (var i = 0; i < 8; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 1 + Math.random() * 2;
      this._bloodParticles.push({
        x: car.x + (Math.random() - 0.5) * 20,
        y: car.y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,  // 鍚戜笂鍠锋簠
        size: 4 + Math.random() * 6,
        life: 30 + Math.floor(Math.random() * 20),
        maxLife: 50,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2
      });
    }
  },

  // ========== 缁樺埗 ==========
  draw: function() {
    var ctx = this._ctx;
    var w = this._width;
    var h = this._height;

    ctx.save();
    ctx.translate(this._shakeX, this._shakeY);

    ctx.fillStyle = '#1a1a3e';
    ctx.fillRect(-5, -5, w + 10, h + 10);

    this.drawRoad(ctx, w, h);
    this.drawFinishLine(ctx, w, h);  // 鍐插埡绾匡紙璐村湪閬撹矾涓婏級
    this.drawHpBar(ctx, w, h);
    this.drawObstacles(ctx);
    this.drawItems(ctx);
    this.drawFlames(ctx);
    this.drawCar(ctx);
    this.drawParticles(ctx);
    this.drawFireworks(ctx);
    this.drawBloodParticles(ctx);  // 缁樺埗娴佽绮掑瓙

    ctx.restore();
  },

  drawRoad: function(ctx, w, h) {
    var rl = this._roadLeft;
    var rr = this._roadRight;
    var roadW = rr - rl;

    // 鑽夊湴
    ctx.fillStyle = '#0d3b0d';
    ctx.fillRect(0, 0, rl - 6, h);
    ctx.fillRect(rr + 6, 0, w - rr - 6, h);

    // 璧涢亾
    ctx.fillStyle = '#2d2d5e';
    ctx.fillRect(rl, 0, roadW, h);

    // 璺偐
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(rl - 6, 0, 6, h);
    ctx.fillRect(rr, 0, 6, h);
    ctx.fillStyle = '#fff';
    ctx.fillRect(rl - 3, 0, 3, h);
    ctx.fillRect(rr, 0, 3, h);

    // 杞﹂亾铏氱嚎锛堟墜鍔ㄧ粯鍒讹紝鏇磋嚜鐒剁殑娴呰壊椋庢牸锛?
    var off = this._roadOffset % h;
    var dashLen = 20;
    var gapLen = 26;
    var dashCycle = dashLen + gapLen;
    var laneOffset = this._roadOffset % dashCycle;
    var lineW = 2;
    ctx.strokeStyle = 'rgba(210,220,245,0.32)';
    ctx.lineWidth = lineW;
    ctx.lineCap = 'round';
    for (var i = 1; i < LANE_COUNT; i++) {
      var lx = rl + this._laneWidth * i;
      for (var dy = -dashCycle + laneOffset; dy < h + dashLen; dy += dashCycle) {
        ctx.beginPath();
        ctx.moveTo(lx, dy);
        ctx.lineTo(lx, dy + dashLen);
        ctx.stroke();
      }
    }

    // 鑽夊湴瑁呴グ
    ctx.fillStyle = '#1a5c1a';
    for (var g = 0; g < 10; g++) {
      var gx = (g * 37 + this._frameCount * 0.5) % (rl - 10);
      var gy = (g * 67 + off * 2) % h;
      ctx.fillRect(gx, gy, 4, 4);
      ctx.fillRect(w - gx - 4, gy, 4, 4);
    }

    // 閫熷害绾匡紙楂橀€熸椂鍑虹幇锛?
    if (this._speed > SPEED_BASE + 1) {
      var lineAlpha = Math.min(0.3, (this._speed - SPEED_BASE) / SPEED_MAX * 0.4);
      ctx.strokeStyle = 'rgba(255,255,255,' + lineAlpha + ')';
      ctx.lineWidth = 1;
      for (var sl = 0; sl < 6; sl++) {
        var slx = rl + 10 + (sl * 47 + this._frameCount * 3) % roadW;
        var sly = (sl * 97 + off * 5) % h;
        ctx.beginPath();
        ctx.moveTo(slx, sly);
        ctx.lineTo(slx, sly + 15 + this._speed * 2);
        ctx.stroke();
      }
    }
  },

  // 缁樺埗鍐插埡绾匡紙璐村湪閬撹矾涓婏紝闅忛亾璺粴鍔級
  drawFinishLine: function(ctx, w, h) {
    if (this._finishLineTimer <= 0) return;
    
    var rl = this._roadLeft;
    var roadW = this._roadRight - rl;
    var fLineY = this._finishLineY;
    var sqSize = 10;
    var rows = 3;
    var cols = Math.floor(roadW / sqSize);
    
    // 榛戠櫧鏍煎瓙锛堢粡鍏歌禌杞︾粓鐐圭嚎锛?
    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        ctx.fillStyle = (col + row) % 2 === 0 ? '#ffffff' : '#000000';
        ctx.fillRect(rl + col * sqSize, fLineY + row * sqSize, sqSize, sqSize);
      }
    }
    
    // 涓婁笅鐧借壊杈圭嚎
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rl, fLineY - 2, roadW, 2);
    ctx.fillRect(rl, fLineY + rows * sqSize, roadW, 2);
    
    // 瀹屾垚鏂囧瓧锛堝湪鍐插埡绾夸笂鏂癸級
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText('第' + (this._journeyNum - 1) + '旅程完成！', rl + roadW / 2, fLineY - 6);
    ctx.fillText('第' + (this._journeyNum - 1) + '旅程完成！', rl + roadW / 2, fLineY - 6);
  },

  // 缁樺埗琛€鏉★紙鍦ㄩ亾璺《绔級
  drawHpBar: function(ctx, w, h) {
    var rl = this._roadLeft;
    var rr = this._roadRight;
    var roadW = rr - rl;
    
    // ===== 鏃呯▼杩涘害鏉★紙鍦ㄨ鏉′笂鏂癸級 =====
    var jBarY = 10;
    var jBarHeight = 12;
    var jBarX = rl + 6;
    var jBarWidth = roadW - 12;
    var jProgress = Math.min(1, this._journeyDistance / this._journeyTarget);
    
    // 鏃呯▼鏂囧瓧锛堜笂鏂癸級
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('第' + this._journeyNum + '旅程  ' + Math.floor(this._journeyDistance) + '/' + this._journeyTarget + 'm', rl + roadW / 2, jBarY - 1);
    
    // 杩涘害鏉¤儗鏅?
    var pRadius = jBarHeight / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(jBarX + pRadius, jBarY + pRadius, pRadius, Math.PI * 0.5, Math.PI * 1.5);
    ctx.lineTo(jBarX + jBarWidth - pRadius, jBarY);
    ctx.arc(jBarX + jBarWidth - pRadius, jBarY + pRadius, pRadius, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.stroke();
    
    // 杩涘害鏉″～鍏咃紙钃濊壊锛?
    var fillW = jBarWidth * jProgress;
    if (fillW > pRadius * 2) {
      ctx.fillStyle = '#00bcd4';
      ctx.beginPath();
      ctx.arc(jBarX + pRadius, jBarY + pRadius, pRadius - 1, Math.PI * 0.5, Math.PI * 1.5);
      ctx.lineTo(jBarX + fillW - pRadius, jBarY + 1);
      ctx.arc(jBarX + fillW - pRadius, jBarY + pRadius, pRadius - 1, Math.PI * 1.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();
    } else if (fillW > 0) {
      ctx.fillStyle = '#00bcd4';
      ctx.beginPath();
      ctx.arc(jBarX + fillW / 2 + 1, jBarY + pRadius, Math.max(1, fillW / 2), 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 缁堢偣鏃楀笢鏍囪
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('馃弫', jBarX + jBarWidth + 2, jBarY + pRadius);
    
    // ===== 琛€鏉★紙鍦ㄦ梾绋嬭繘搴︽潯涓嬫柟锛?=====
    var barWidth = roadW * 0.8;
    var barHeight = 20;
    var barX = rl + (roadW - barWidth) / 2;
    var barY = jBarY + jBarHeight + 6;
    var radius = barHeight / 2;
    
    // 缁樺埗鍦嗚鐭╁舰澶栬竟妗嗭紙鐧借壊锛?
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(barX + radius, barY + radius, radius, Math.PI, Math.PI * 1.5);
    ctx.lineTo(barX + barWidth - radius, barY);
    ctx.arc(barX + barWidth - radius, barY + radius, radius, Math.PI * 1.5, 0);
    ctx.lineTo(barX + barWidth, barY + barHeight);
    ctx.arc(barX + barWidth - radius, barY + radius, radius, 0, Math.PI * 0.5);
    ctx.lineTo(barX + radius, barY + barHeight);
    ctx.arc(barX + radius, barY + radius, radius, Math.PI * 0.5, Math.PI);
    ctx.closePath();
    ctx.stroke();
    
    // 琛€鏉″～鍏咃紙绾㈣壊锛屾牴鎹綋鍓嶈閲忥級
    var hpPercent = this._hp / HP_MAX;
    var fillWidth = (barWidth - 6) * hpPercent;  // 鍑忓幓杈规瀹藉害
    
    if (fillWidth > radius * 2) {
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(barX + 3 + radius, barY + 3 + radius - 3, radius - 3, Math.PI, Math.PI * 1.5);
      ctx.lineTo(barX + 3 + fillWidth - radius, barY + 3);
      ctx.arc(barX + 3 + fillWidth - radius, barY + 3 + radius - 3, radius - 3, Math.PI * 1.5, 0);
      ctx.lineTo(barX + 3 + fillWidth, barY + barHeight - 3);
      ctx.arc(barX + 3 + fillWidth - radius, barY + 3 + radius - 3, radius - 3, 0, Math.PI * 0.5);
      ctx.lineTo(barX + 3 + radius, barY + barHeight - 3);
      ctx.arc(barX + 3 + radius, barY + 3 + radius - 3, radius - 3, Math.PI * 0.5, Math.PI);
      ctx.closePath();
      ctx.fill();
    } else if (fillWidth > 0) {
      // 琛€閲忓緢灏戞椂锛屽彧鏄剧ず宸︿晶鍦嗚
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(barX + 3 + fillWidth / 2, barY + radius, fillWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 琛€閲忔枃瀛?
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this._hp + '%', rl + roadW / 2, barY + barHeight / 2);
  },

  drawCar: function(ctx) {
    var car = this._car;
    var cx = car.x;
    var cy = car.y;
    var tilt = this._carTilt;
    var flash = this._invincible > 0 && this._frameCount % 4 < 2;
    
    // 鎺夎鏃跺崐闅愯韩闂儊鏁堟灉
    var damageFlash = this._damageFlashTime > 0 && this._frameCount % 4 < 2;
    
    if (flash) {
      ctx.globalAlpha = 0.4;
    } else if (damageFlash) {
      ctx.globalAlpha = 0.5;
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);

    // 杞﹁韩闃村奖
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(2, 30, 22, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    var isRed = this._carRedTime > 0;

    if (this._carImage && !isRed) {
      // 姝ｅ父鐘舵€佺敤鍥剧墖缁樺埗
      var imgW = 50;
      var imgH = 70;
      ctx.drawImage(this._carImage, -imgW / 2, -imgH / 2, imgW, imgH);
    } else {
      // 鍙樼孩鏃舵垨鍥剧墖鏈姞杞芥椂鐢ㄤ唬鐮佺粯鍒?
      var bodyColor = isRed ? '#e53935' : '#2196F3';
      var bodyDark = isRed ? '#c62828' : '#1565C0';
      var bodyLight = isRed ? '#ef5350' : '#42A5F5';
      var bodyLighter = isRed ? '#ff8a80' : '#90CAF9';

      // 杞﹁疆锛堝厛鐢伙紝鍦ㄨ溅韬笅闈級
      var wheels = [[-22, -18], [18, -18], [-22, 14], [18, 14]];
      for (var i = 0; i < wheels.length; i++) {
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(wheels[i][0], wheels[i][1], 5.5, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3a3a3a';
        ctx.beginPath();
        ctx.ellipse(wheels[i][0], wheels[i][1], 3.5, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 杞﹁韩涓讳綋锛堝渾娑︽洸绾匡級
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.bezierCurveTo(14, -30, 20, -22, 20, -10);
      ctx.lineTo(20, 22);
      ctx.quadraticCurveTo(20, 28, 14, 28);
      ctx.lineTo(-14, 28);
      ctx.quadraticCurveTo(-20, 28, -20, 22);
      ctx.lineTo(-20, -10);
      ctx.bezierCurveTo(-20, -22, -14, -30, 0, -32);
      ctx.closePath();
      ctx.fill();

      // 杞﹁韩宸︿晶楂樺厜
      ctx.fillStyle = bodyLight;
      ctx.beginPath();
      ctx.moveTo(-2, -30);
      ctx.bezierCurveTo(-14, -28, -16, -20, -16, -10);
      ctx.lineTo(-16, 6);
      ctx.lineTo(-6, 6);
      ctx.lineTo(-6, -10);
      ctx.bezierCurveTo(-6, -22, -6, -28, -2, -30);
      ctx.closePath();
      ctx.fill();

      // 杞﹁韩涓嚎楂樺厜锛堜粠澶村埌灏剧殑鐧借壊鍙嶅厜绾匡級
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(0, 26);
      ctx.stroke();

      // 杞﹀ご鐏骇锛堝ぇ鍦嗗舰娴呰壊搴曪級
      ctx.fillStyle = bodyLight;
      ctx.beginPath();
      ctx.arc(-13, -27, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(13, -27, 6, 0, Math.PI * 2);
      ctx.fill();

      // 杞﹀ご鐏紙榛勮壊鐏姱锛?
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.arc(-13, -27, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(13, -27, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // 鐏珮鍏?
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.arc(-13, -28, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(13, -28, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 椹鹃┒鑸憋紙娣辫壊搴曪級
      ctx.fillStyle = bodyDark;
      ctx.beginPath();
      ctx.moveTo(-12, -16);
      ctx.quadraticCurveTo(-13, -16, -13, -14);
      ctx.lineTo(-13, 8);
      ctx.quadraticCurveTo(-13, 10, -11, 10);
      ctx.lineTo(11, 10);
      ctx.quadraticCurveTo(13, 10, 13, 8);
      ctx.lineTo(13, -14);
      ctx.quadraticCurveTo(13, -16, 12, -16);
      ctx.closePath();
      ctx.fill();

      // 鎸￠鐜荤拑锛堝ぇ闈㈢Н娴呰摑锛?
      ctx.fillStyle = bodyLighter;
      ctx.beginPath();
      ctx.moveTo(-10, -14);
      ctx.lineTo(10, -14);
      ctx.lineTo(9, -3);
      ctx.lineTo(-9, -3);
      ctx.closePath();
      ctx.fill();
      // 鐜荤拑鍙嶅厜鏉?
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.moveTo(-8, -13);
      ctx.lineTo(-3, -13);
      ctx.lineTo(-4, -4);
      ctx.lineTo(-9, -4);
      ctx.closePath();
      ctx.fill();

      // 鍚庣獥
      ctx.fillStyle = bodyLighter;
      ctx.beginPath();
      ctx.moveTo(-8, 2);
      ctx.lineTo(8, 2);
      ctx.lineTo(7, 8);
      ctx.lineTo(-7, 8);
      ctx.closePath();
      ctx.fill();

      // 椹鹃┒鑸变腑绾块珮鍏?
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(0, 9);
      ctx.stroke();

      // 灏剧伅
      ctx.fillStyle = '#f44336';
      ctx.beginPath();
      ctx.arc(-13, 26, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(13, 26, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    if (flash || damageFlash) ctx.globalAlpha = 1;
  },

  drawFlames: function(ctx) {
    var car = this._car;
    var cx = car.x;
    var cy = car.y + 30;
    var speed = this._speed;

    // 灏剧劙鏁堟灉
    for (var i = 0; i < FLAME_COUNT; i++) {
      var t = (this._frameCount * 0.3 + i * 1.2) % 3;
      var alpha = (1 - t / 3) * 0.6 * (speed / SPEED_MAX);
      if (alpha <= 0) continue;
      var size = 3 + t * 4;
      var offsetX = (Math.random() - 0.5) * 8;
      var offsetY = t * 8;

      ctx.fillStyle = 'rgba(255,' + Math.floor(150 + t * 35) + ',0,' + alpha + ')';
      ctx.beginPath();
      ctx.arc(cx - 8 + offsetX, cy + offsetY, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 8 + offsetX, cy + offsetY, size, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawObstacles: function(ctx) {
    for (var i = 0; i < this._obstacles.length; i++) {
      var ob = this._obstacles[i];
      var x = ob.x, y = ob.y, s = OBSTACLE_SIZE;
      var product = OBSTACLE_PRODUCTS[ob.type] || OBSTACLE_PRODUCTS[0];

      // 绾㈣壊鍏夋檿
      ctx.fillStyle = 'rgba(255,0,0,0.15)';
      ctx.beginPath();
      ctx.arc(x, y, s * 0.7, 0, Math.PI * 2);
      ctx.fill();

      if (product.style === 'pill') {
        // 鑽父
        ctx.fillStyle = '#e91e63';
        ctx.beginPath();
        ctx.arc(x - s/6, y, s/5, 0, Math.PI * 2);
        ctx.arc(x + s/6, y, s/5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - s/6, y - s/5, s/3, s*2/5);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - 1, y - s/5, 2, s*2/5);
      } else if (product.style === 'syringe') {
        // 閽堢
        ctx.fillStyle = '#9c27b0';
        ctx.fillRect(x - 3, y - s/2, 6, s * 0.7);
        ctx.fillStyle = '#ce93d8';
        ctx.fillRect(x - 6, y - s/2, 12, 4);
        ctx.fillStyle = '#eee';
        ctx.fillRect(x - 1, y + s * 0.2, 2, s * 0.3);
      } else {
        // 姣掑搧鍖?
        ctx.fillStyle = '#ff5722';
        ctx.fillRect(x - s/3, y - s/3, s*2/3, s*2/3);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold ' + (s * 0.35) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('毒', x, y);
      }

      // 鍗遍櫓鏍囪
      ctx.font = (s * 0.3) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff4444';
      ctx.fillText(product.name, x, y + s / 2 + 8);
    }
  },

  drawItems: function(ctx) {
    for (var i = 0; i < this._items.length; i++) {
      var it = this._items[i];
      var x = it.x, y = it.y, s = ITEM_SIZE;
      var pulse = 1 + Math.sin(this._frameCount * 0.1) * 0.1;

      // 閲戣壊鍏夋檿
      ctx.fillStyle = 'rgba(255,215,0,0.2)';
      ctx.beginPath();
      ctx.arc(x, y, s * 0.6 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // 鏄熸槦褰㈢姸
      ctx.fillStyle = '#ffd700';
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(pulse, pulse);
      ctx.beginPath();
      for (var p = 0; p < 5; p++) {
        var angle = -Math.PI / 2 + p * Math.PI * 2 / 5;
        var r1 = s * 0.45;
        var r2 = s * 0.2;
        ctx.lineTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
        var angle2 = angle + Math.PI / 5;
        ctx.lineTo(Math.cos(angle2) * r2, Math.sin(angle2) * r2);
      }
      ctx.closePath();
      ctx.fill();
      // 鏄熸槦楂樺厜
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(-2, -3, s * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },

  drawParticles: function(ctx) {
    for (var i = 0; i < this._particles.length; i++) {
      var p = this._particles[i];
      ctx.globalAlpha = p.life / 25;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  },

  spawnFireworks: function(x, y) {
    var palette = ['#ffd700', '#ff6b6b', '#00e5ff', '#7c4dff', '#66ff66'];
    for (var i = 0; i < 36; i++) {
      var ang = Math.random() * Math.PI * 2;
      var spd = 1.8 + Math.random() * 3.6;
      this._fireworks.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 1.2,
        life: 24 + Math.floor(Math.random() * 16),
        maxLife: 40,
        color: palette[Math.floor(Math.random() * palette.length)],
        size: 2 + Math.random() * 3
      });
    }
  },

  drawFireworks: function(ctx) {
    for (var i = 0; i < this._fireworks.length; i++) {
      var fw = this._fireworks[i];
      var alpha = fw.life / fw.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = fw.color;
      ctx.beginPath();
      ctx.arc(fw.x, fw.y, fw.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },
  
  // 缁樺埗娴佽绮掑瓙锛堝崱閫氳婊存晥鏋滐級
  drawBloodParticles: function(ctx) {
    for (var i = 0; i < this._bloodParticles.length; i++) {
      var bp = this._bloodParticles[i];
      
      ctx.save();
      ctx.globalAlpha = bp.alpha;
      ctx.translate(bp.x, bp.y);
      ctx.rotate(bp.rotation);
      
      // 缁樺埗鍗￠€氳婊村舰鐘讹紙姘存淮褰級
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      // 鍦嗗舰閮ㄥ垎
      ctx.arc(0, -bp.size * 0.3, bp.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      
      // 灏栬閮ㄥ垎锛堜笁瑙掑舰锛?
      ctx.beginPath();
      ctx.moveTo(-bp.size * 0.3, -bp.size * 0.3);
      ctx.lineTo(bp.size * 0.3, -bp.size * 0.3);
      ctx.lineTo(0, bp.size * 0.7);
      ctx.closePath();
      ctx.fill();
      
      // 楂樺厜鏁堟灉
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(-bp.size * 0.2, -bp.size * 0.4, bp.size * 0.2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  },

  // ========== 瑙︽懜鎺у埗锛堟嫋鍔ㄩ杞︼級 ==========
  onTouchStart: function(e) {
    if (this._gameOver) return;
    var touch = e.touches[0];
    this._isDragging = true;
    this._carTargetX = touch.clientX;
    this._carTargetY = touch.clientY;
  },

  onTouchMove: function(e) {
    if (this._gameOver) return;
    // 浣跨敤鑺傛祦锛岄伩鍏嶈繃浜庨绻佺殑鏇存柊锛堝鍔犲埌33ms锛岀害30fps锛?
    var now = Date.now();
    if (!this._lastTouchTime || now - this._lastTouchTime > 33) {
      var touch = e.touches[0];
      this._isDragging = true;
      this._carTargetX = touch.clientX;
      this._carTargetY = touch.clientY;
      this._lastTouchTime = now;
    }
  },

  onTouchEnd: function() {
    this._isDragging = false;
  },

  // ========== 鍓嶈繘鍚庨€€鎺у埗锛堝凡绉婚櫎锛?==========
  onAccelerate: function() {},
  onStopAccelerate: function() {},
  onBrake: function() {},
  onStopBrake: function() {},

  // ========== 娓告垙缁撴潫 ==========
  endGame: function(won) {
    var that = this;
    if (this._raf && this._canvas) {
      this._canvas.cancelAnimationFrame(this._raf);
      this._raf = null;
    }
    
    // 鏍规嵁鏄熸槦鏁伴噺鐢熸垚璇勪环
    var stars = this._stars;
    var comment = '';
    if (stars >= 20) {
      comment = '\u5b8c\u7f8e\u8868\u73b0\uff01';
    } else if (stars >= 15) {
      comment = '\u975e\u5e38\u51fa\u8272\uff01';
    } else if (stars >= 10) {
      comment = '\u8868\u73b0\u4f18\u79c0\uff01';
    } else if (stars >= 5) {
      comment = '\u8fd8\u4e0d\u9519\uff01';
    } else if (stars >= 3) {
      comment = '\u7ee7\u7eed\u52a0\u6cb9\uff01';
    } else if (stars >= 1) {
      comment = '\u518d\u63a5\u518d\u5389\uff01';
    } else {
      comment = '\u4e0b\u6b21\u4f1a\u66f4\u597d\uff01';
    }

    this.setData({
      gameState: 'over',
      gameWon: won,
      isDrawing: true,
      showResult: false,
      gameComment: comment  // 娣诲姞璇勪环
    });

    // 璋冪敤鏈嶅姟绔娊濂栵紙鏈櫥褰曟椂鏈湴妯℃嫙锛?
    if (app.globalData.token) {
      api.clawApi.play().then(function(result) {
        that.handlePrizeResult(result);
      }).catch(function(err) {
        console.error('鎶藉澶辫触:', err);
        wx.showToast({ title: err.message || '缁撶畻澶辫触', icon: 'none' });
        that.setData({ isDrawing: false, showResult: true, isWin: false });
      });
    } else {
      // 鏈櫥褰曪細鏈湴妯℃嫙鎶藉缁撴灉
      var prizes = that.data.config.prizes || [];
      var rand = Math.random();
      var isWin = won && rand < 0.5;
      var wonPoints = 0;
      var prize = null;
      if (isWin && prizes.length > 0) {
        prize = prizes[Math.floor(Math.random() * prizes.length)];
        wonPoints = prize.points || 50;
      }
      setTimeout(function() {
        that.setData({
          isDrawing: false,
          showResult: true,
          isWin: isWin,
          wonPrize: prize,
          wonPoints: wonPoints
        });
      }, 1500);
    }
  },

  handlePrizeResult: function(result) {
    var that = this;
    this.setData({
      userPoints: result.remainPoints,
      todayPlays: result.todayPlays,
      consecutiveFails: result.consecutiveFails || 0
    });
    app.globalData.points = result.remainPoints;
    wx.setStorageSync('points', result.remainPoints);

    if (result.isWin && result.prize) {
      var clawData = storageUtil.storage.get('clawData') || { pointsHistory: [], totalPointsEarned: 0 };
      var record = {
        id: Date.now(),
        points: result.wonPoints,
        prizeId: result.prize.id,
        prizeName: result.prize.name,
        time: new Date().toLocaleString('zh-CN', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        })
      };
      clawData.pointsHistory = clawData.pointsHistory || [];
      clawData.pointsHistory.unshift(record);
      if (clawData.pointsHistory.length > 50) clawData.pointsHistory = clawData.pointsHistory.slice(0, 50);
      clawData.totalPointsEarned = (clawData.totalPointsEarned || 0) + result.wonPoints;
      storageUtil.storage.set('clawData', clawData);

      var localPrize = {};
      var prizes = that.data.config.prizes;
      for (var m = 0; m < prizes.length; m++) {
        if (prizes[m].id === result.prize.id) { localPrize = prizes[m]; break; }
      }

      setTimeout(function() {
        that.setData({
          isDrawing: false, showResult: true, isWin: true,
          wonPrize: Object.assign({}, result.prize, localPrize),
          wonPoints: result.wonPoints,
          pointsHistory: clawData.pointsHistory,
          totalPointsEarned: clawData.totalPointsEarned
        });
        wx.vibrateShort({ type: 'heavy' });
      }, 800);
    } else {
      setTimeout(function() {
        that.setData({ isDrawing: false, showResult: true, isWin: false });
      }, 800);
    }
  },

  stopGame: function() {
    this._gameOver = true;
    if (this._raf && this._canvas) {
      this._canvas.cancelAnimationFrame(this._raf);
      this._raf = null;
    }
    this.stopAllAudio();
  },

  retryGame: function() {
    this.setData({ gameState: 'idle' });
    var that = this;
    setTimeout(function() { that.startGame(); }, 200);
  },

  backToStart: function() {
    this.setData({ gameState: 'idle' });
    this.loadUserData();
  },

  goToGiftShop: function() {
    wx.navigateTo({ url: '/pages/gift/gift' });
  },

  // ========== 璁剧疆 ==========
  toggleSettings: function() {
    this.setData({ showSettings: !this.data.showSettings });
  },

  toggleMusic: function() {
    var on = !this.data.musicOn;
    this.setData({ musicOn: on });
    wx.setStorageSync('claw_musicOn', on);
    if (on && this.data.gameState === 'playing') {
      this.playBgm();
    } else {
      this.stopBgm();
    }
  },

  toggleSfx: function() {
    var on = !this.data.sfxOn;
    this.setData({ sfxOn: on });
    wx.setStorageSync('claw_sfxOn', on);
    if (!on) {
      this.stopEngine();
    } else if (this.data.gameState === 'playing') {
      this.playEngine();
    }
  },

  loadSettings: function() {
    var musicOn = wx.getStorageSync('claw_musicOn');
    var sfxOn = wx.getStorageSync('claw_sfxOn');
    this.setData({
      musicOn: musicOn === '' ? true : musicOn,
      sfxOn: sfxOn === '' ? true : sfxOn
    });
  },

  // ========== 鏃呯▼绯荤粺 ==========
  loadJourneyData: function() {
    var journeyData = wx.getStorageSync('journeyData') || { journeyNum: 1, journeyDistance: 0, totalJourneys: 0 };
    this.setData({
      journeyNum: journeyData.journeyNum || 1,
      journeyTarget: (journeyData.journeyNum || 1) * 100,
      totalJourneys: journeyData.totalJourneys || 0
    });
  },

  saveJourneyData: function() {
    wx.setStorageSync('journeyData', {
      journeyNum: this._journeyNum,
      journeyDistance: this._journeyDistance,
      totalJourneys: this._totalJourneys
    });
    // 鍚屾鍒版湇鍔″櫒锛堝鏋滃凡鐧诲綍锛?
    if (app.globalData.token) {
      api.userApi.addPoints(0, '旅程更新:第' + this._journeyNum + '旅程').catch(function() {});
    }
  },

  // ========== 鎺掕姒?==========
  loadRanking: function() {
    var that = this;
    // 浠庢湰鍦板姞杞芥帓琛屾暟鎹?
    var rankingList = wx.getStorageSync('rankingList') || [];
    
    // 纭繚鑷繁鍦ㄦ帓琛屾涓?
    var userInfo = wx.getStorageSync('userInfo') || {};
    var journeyData = wx.getStorageSync('journeyData') || { journeyNum: 1 };
    var myData = {
      avatarUrl: userInfo.avatarUrl || '',
      nickName: userInfo.nickName || '我',
      journeyNum: journeyData.journeyNum || 1,
      isMe: true
    };
    
    // 鏇存柊鑷繁鐨勬暟鎹?
    var found = false;
    for (var i = 0; i < rankingList.length; i++) {
      if (rankingList[i].isMe) {
        rankingList[i] = myData;
        found = true;
        break;
      }
    }
    if (!found) {
      rankingList.push(myData);
    }
    
    // 鎸夋梾绋嬫帓搴忥紙闄嶅簭锛?    rankingList.sort(function(a, b) { return b.journeyNum - a.journeyNum; });
    
    wx.setStorageSync('rankingList', rankingList);
    this.setData({ rankingList: rankingList });
    
    // 濡傛灉宸茬櫥褰曪紝浠庢湇鍔″櫒鑾峰彇鎺掕
    if (app.globalData.token) {
      api.clawApi.getStatus().then(function(data) {
        if (data && data.ranking) {
          that.setData({ rankingList: data.ranking });
        }
      }).catch(function() {});
    }
  },

  // 鍒嗕韩
  onShareAppMessage: function() {
    return {
      title: '我已到达第' + this.data.journeyNum + '旅程，来禁毒飞车冲刺挑战我吧！',
      path: '/pages/claw/claw'
    };
  },

  // ========== 闊抽 ==========
  initAudio: function() {
    var that = this;
    
    // 鑳屾櫙闊充箰
    this._bgmAudio = wx.createInnerAudioContext();
    this._bgmAudio.loop = true;
    this._bgmAudio.volume = 0.4;
    this._bgmAudio.src = '/assets/audio/racing-bgm.mp3';
    this._bgmAudio.onError(function() {});

    // 姹借溅寮曟搸澹帮紙寰幆鎾斁锛?
    this._engineAudio = wx.createInnerAudioContext();
    this._engineAudio.loop = true;
    this._engineAudio.volume = 0.5;
    this._engineAudio.src = '/assets/audio/engine.mp3';
    this._engineAudio.onError(function() { that._engineAudio = null; });

    // 鎾炲嚮姣掑搧澹伴煶
    this._crashAudio = wx.createInnerAudioContext();
    this._crashAudio.volume = 0.5;
    this._crashAudio.src = '/assets/audio/crash.mp3';
    this._crashAudio.onError(function() { that._crashAudio = null; });

    // 鏀堕泦鏄熸槦澹伴煶
    this._starAudio = wx.createInnerAudioContext();
    this._starAudio.volume = 0.5;
    this._starAudio.src = '/assets/audio/star.mp3';
    this._starAudio.onError(function() { that._starAudio = null; });

    // 鏃呯▼瀹屾垚闊虫晥
    this._journeyAudio = wx.createInnerAudioContext();
    this._journeyAudio.volume = 0.7;
    this._journeyAudio.src = '/assets/audio/good.mp3';
    this._journeyAudio.onError(function() { that._journeyAudio = null; });
  },

  playBgm: function() {
    if (!this.data.musicOn || !this._bgmAudio) return;
    this._bgmAudio.play();
  },

  stopBgm: function() {
    if (!this._bgmAudio) return;
    this._bgmAudio.pause();
  },

  playEngine: function() {
    if (!this.data.sfxOn || !this._engineAudio) return;
    this._engineAudio.play();
  },

  stopEngine: function() {
    if (!this._engineAudio) return;
    this._engineAudio.pause();
  },

  playCrash: function() {
    if (!this.data.sfxOn || !this._crashAudio) return;
    try {
      this._crashAudio.stop();
      this._crashAudio.play();
    } catch(e) {}
    try { wx.vibrateShort({ type: 'heavy' }); } catch(e) {}
  },

  playStar: function() {
    if (!this.data.sfxOn || !this._starAudio) return;
    try {
      this._starAudio.stop();
      this._starAudio.play();
    } catch(e) {}
  },

  playJourneyComplete: function() {
    if (!this.data.sfxOn || !this._journeyAudio) return;
    try {
      this._journeyAudio.stop();
      this._journeyAudio.play();
    } catch(e) {}
    try { wx.vibrateShort({ type: 'medium' }); } catch(e) {}
  },

  stopAllAudio: function() {
    this.stopBgm();
    this.stopEngine();
  },

  destroyAudio: function() {
    if (this._bgmAudio) { this._bgmAudio.destroy(); this._bgmAudio = null; }
    if (this._engineAudio) { this._engineAudio.destroy(); this._engineAudio = null; }
    if (this._crashAudio) { this._crashAudio.destroy(); this._crashAudio = null; }
    if (this._starAudio) { this._starAudio.destroy(); this._starAudio = null; }
    if (this._journeyAudio) { this._journeyAudio.destroy(); this._journeyAudio = null; }
  },

  preventMove: function() {}
});

