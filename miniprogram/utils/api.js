/**
 * API utility.
 * - If config.mockData=true, all API calls are served by local static data + local storage.
 * - Otherwise, requests are forwarded to remote backend.
 */

var appConfig = require('../config/app.js');
var staticMock = require('../data/staticMock.js');
var audioGuide = require('../data/audioGuide.js').audioGuide;
var vrScenesData = require('../data/vrScenes.js').vrScenes;
var clawMachineConfig = require('../data/clawConfig.js').clawMachineConfig;

var BASE_URL = appConfig.apiBaseUrl;
var APP_ID = appConfig.appId;
var DEBUG = !!appConfig.debug;
var USE_MOCK = !!appConfig.mockData;

var KEYS = {
  TOKEN: 'token',
  TOKEN_EXPIRE: 'tokenExpireTime',
  USER_INFO: 'userInfo',
  POINTS: 'points',
  TOTAL_POINTS: 'mockTotalPoints',
  POINTS_HISTORY: 'mockPointsHistory',
  GIFT_STOCK: 'mockGiftStock',
  EXCHANGE_RECORDS: 'mockExchangeRecords',
  LEARN_ZONE: 'mockLearnZoneRecords',
  LEARN_QUIZ: 'mockLearnQuizRecords',
  LEARN_STORY: 'mockLearnStoryRecords',
  LEARN_AUDIO: 'mockLearnAudioRecords',
  CRAW_STATUS: 'mockClawStatus',
  LAST_SIGN_DATE: 'lastSignDate'
};

function log(message, payload) {
  if (DEBUG) {
    console.log('[API] ' + message, payload || '');
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function todayKey() {
  return new Date().toDateString();
}

function getNumber(key, fallback) {
  var raw = wx.getStorageSync(key);
  if (raw === '' || raw === null || raw === undefined) {
    return Number(fallback || 0);
  }
  var n = Number(raw);
  return isNaN(n) ? Number(fallback || 0) : n;
}

function getArray(key) {
  var data = wx.getStorageSync(key);
  return Array.isArray(data) ? data : [];
}

function getObject(key) {
  var data = wx.getStorageSync(key);
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data;
  }
  return {};
}

function setStorage(key, value) {
  wx.setStorageSync(key, value);
}

function calcLevel(points) {
  if (points >= 2000) return 5;
  if (points >= 1000) return 4;
  if (points >= 500) return 3;
  if (points >= 200) return 2;
  return 1;
}

function safeToken() {
  var token = wx.getStorageSync(KEYS.TOKEN);
  var expire = getNumber(KEYS.TOKEN_EXPIRE, 0);
  if (!token || !expire || Date.now() > expire) {
    wx.removeStorageSync(KEYS.TOKEN);
    wx.removeStorageSync(KEYS.TOKEN_EXPIRE);
    return '';
  }
  return token;
}

function getPoints() {
  return getNumber(KEYS.POINTS, 0);
}

function getTotalPoints() {
  var points = getPoints();
  return Math.max(points, getNumber(KEYS.TOTAL_POINTS, points));
}

function setPoints(points, totalPoints) {
  var safePoints = Math.max(0, Number(points) || 0);
  var safeTotal = Math.max(safePoints, Number(totalPoints || safePoints) || safePoints);
  setStorage(KEYS.POINTS, safePoints);
  setStorage(KEYS.TOTAL_POINTS, safeTotal);
}

function addPoints(amount, reason) {
  var safeAmount = Number(amount) || 0;
  var prevPoints = getPoints();
  var prevTotal = getTotalPoints();
  var nextPoints = Math.max(0, prevPoints + safeAmount);
  var nextTotal = Math.max(nextPoints, prevTotal + safeAmount);

  setPoints(nextPoints, nextTotal);

  var history = getArray(KEYS.POINTS_HISTORY);
  history.unshift({
    id: 'ph_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    amount: safeAmount,
    reason: reason || '',
    points: nextPoints,
    createdAt: nowIso()
  });
  if (history.length > 300) {
    history = history.slice(0, 300);
  }
  setStorage(KEYS.POINTS_HISTORY, history);

  return {
    points: nextPoints,
    totalPoints: nextTotal,
    added: safeAmount,
    reason: reason || ''
  };
}

function paginate(list, page, pageSize) {
  var p = Math.max(1, Number(page) || 1);
  var size = Math.max(1, Number(pageSize) || 20);
  var start = (p - 1) * size;
  var end = start + size;
  return {
    list: list.slice(start, end),
    total: list.length,
    page: p,
    pageSize: size
  };
}

function parseQuery(url) {
  var query = {};
  var idx = url.indexOf('?');
  if (idx < 0) return query;
  var queryText = url.slice(idx + 1);
  if (!queryText) return query;
  var pairs = queryText.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var seg = pairs[i];
    if (!seg) continue;
    var eq = seg.indexOf('=');
    if (eq < 0) {
      query[decodeURIComponent(seg)] = '';
      continue;
    }
    var key = decodeURIComponent(seg.slice(0, eq));
    var value = decodeURIComponent(seg.slice(eq + 1));
    query[key] = value;
  }
  return query;
}

function stripQuery(url) {
  var idx = url.indexOf('?');
  return idx < 0 ? url : url.slice(0, idx);
}

function toAudioGuideRows() {
  var zones = (audioGuide && audioGuide.zones) || [];
  return zones.map(function(item, index) {
    return {
      id: item.id || ('audio_' + (index + 1)),
      zoneId: item.zoneId || item.id || ('zone' + (index + 1)),
      sortOrder: index + 1,
      title: item.title || ('语音导览 ' + (index + 1)),
      zoneName: item.title || '',
      audioUrl: item.src || '',
      duration: item.duration || 90,
      transcript: item.transcript || '',
      keyPoints: Array.isArray(item.keyPoints) ? item.keyPoints.join('\n') : ''
    };
  });
}

function toVrScenesRows() {
  var scenes = (vrScenesData && vrScenesData.scenes) || [];
  return scenes.map(function(scene) {
    return {
      sceneId: scene.id,
      name: scene.name,
      imageUrl: scene.image,
      imageWidth: scene.imageSize && scene.imageSize.width ? scene.imageSize.width : 4096,
      imageHeight: scene.imageSize && scene.imageSize.height ? scene.imageSize.height : 2048
    };
  });
}

function toVrHotspotRows(sceneId) {
  var scenes = (vrScenesData && vrScenesData.scenes) || [];
  var scene = null;
  for (var i = 0; i < scenes.length; i++) {
    if (String(scenes[i].id) === String(sceneId)) {
      scene = scenes[i];
      break;
    }
  }
  if (!scene) return [];
  var hotspots = scene.hotspots || [];
  return hotspots.map(function(hotspot) {
    return {
      hotspotId: hotspot.id,
      type: hotspot.type,
      targetSceneId: hotspot.target_id || '',
      positionX: hotspot.position ? hotspot.position.x : 0,
      positionY: hotspot.position ? hotspot.position.y : 0,
      arrowType: hotspot.arrow_type || '',
      label: hotspot.label || '',
      icon: hotspot.icon || '',
      title: hotspot.title || '',
      content: hotspot.content || '',
      linkUrl: hotspot.url || ''
    };
  });
}

function getZoneById(zoneId) {
  var zones = staticMock.zones || [];
  for (var i = 0; i < zones.length; i++) {
    if (String(zones[i].id) === String(zoneId) || String(zones[i].zoneId) === String(zoneId)) {
      return zones[i];
    }
  }
  return null;
}

function getQuestionById(questionId) {
  var list = staticMock.questions || [];
  for (var i = 0; i < list.length; i++) {
    if (String(list[i].id) === String(questionId)) {
      return list[i];
    }
  }
  return null;
}

function getGiftStockMap() {
  var map = getObject(KEYS.GIFT_STOCK);
  var gifts = staticMock.gifts || [];
  var changed = false;
  for (var i = 0; i < gifts.length; i++) {
    var id = String(gifts[i].id);
    if (map[id] === undefined) {
      map[id] = Number(gifts[i].stock || 0);
      changed = true;
    }
  }
  if (changed) {
    setStorage(KEYS.GIFT_STOCK, map);
  }
  return map;
}

function getGiftsWithStock() {
  var stockMap = getGiftStockMap();
  return (staticMock.gifts || []).map(function(gift) {
    var id = String(gift.id);
    return Object.assign({}, gift, {
      stock: Math.max(0, Number(stockMap[id] || 0))
    });
  });
}

function createMockToken() {
  return 'mock-token-' + Date.now();
}

function getMockProfile() {
  var info = wx.getStorageSync(KEYS.USER_INFO) || {};
  var points = getPoints();
  var totalPoints = getTotalPoints();
  return {
    id: info.id || 'mock-user',
    nickName: info.nickName || '游客',
    avatarUrl: info.avatarUrl || '',
    points: points,
    totalPoints: totalPoints,
    level: calcLevel(totalPoints)
  };
}

function setMockProfile(patch) {
  var current = wx.getStorageSync(KEYS.USER_INFO) || {};
  var next = Object.assign({}, current, patch || {});
  setStorage(KEYS.USER_INFO, next);
  return next;
}

function getLearningRecords(key) {
  return getArray(key);
}

function addLearningRecord(key, payload) {
  var list = getArray(key);
  list.unshift(Object.assign({}, payload || {}, {
    id: 'rec_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    createdAt: nowIso()
  }));
  if (list.length > 500) {
    list = list.slice(0, 500);
  }
  setStorage(key, list);
  return list[0];
}

function getClawStatus() {
  var raw = getObject(KEYS.CRAW_STATUS);
  var today = todayKey();
  if (raw.todayKey !== today) {
    raw.todayKey = today;
    raw.todayPlays = 0;
  }
  if (raw.consecutiveFails === undefined) raw.consecutiveFails = 0;
  setStorage(KEYS.CRAW_STATUS, raw);
  return raw;
}

function setClawStatus(patch) {
  var current = getClawStatus();
  var next = Object.assign({}, current, patch || {});
  setStorage(KEYS.CRAW_STATUS, next);
  return next;
}

function weightedPick(prizes) {
  var total = 0;
  var i;
  for (i = 0; i < prizes.length; i++) {
    total += Number(prizes[i].weight || 0);
  }
  if (total <= 0) return prizes[0] || null;
  var rand = Math.random() * total;
  var acc = 0;
  for (i = 0; i < prizes.length; i++) {
    acc += Number(prizes[i].weight || 0);
    if (rand <= acc) return prizes[i];
  }
  return prizes[prizes.length - 1] || null;
}

function resolveMock(data) {
  return new Promise(function(resolve) {
    setTimeout(function() { resolve(clone(data)); }, 60);
  });
}

function rejectMock(code, message) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      reject({ code: code || -1, message: message || 'mock error' });
    }, 60);
  });
}

function requestByHttp(url, options) {
  options = options || {};
  return new Promise(function(resolve, reject) {
    var header = {
      'Content-Type': 'application/json',
      'X-App-Id': APP_ID
    };

    var token = safeToken();
    if (token) {
      header.Authorization = 'Bearer ' + token;
    }

    var fullUrl = BASE_URL + url;
    log('HTTP request start', { url: fullUrl, method: options.method || 'GET', data: options.data });

    wx.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data || {},
      header: header,
      timeout: options.timeout || 10000,
      success: function(res) {
        log('HTTP request ok', res.data);
        if (res.statusCode === 200) {
          if (res.data && res.data.code === 0) {
            resolve(res.data.data);
            return;
          }
          if (res.data && res.data.code === 401) {
            wx.removeStorageSync(KEYS.TOKEN);
            wx.removeStorageSync(KEYS.TOKEN_EXPIRE);
            wx.removeStorageSync(KEYS.USER_INFO);
            reject({ code: 401, message: '登录已过期' });
            return;
          }
          reject({
            code: res.data && res.data.code ? res.data.code : -1,
            message: res.data && res.data.message ? res.data.message : '请求失败'
          });
          return;
        }
        reject({ code: res.statusCode, message: 'HTTP错误: ' + res.statusCode });
      },
      fail: function(err) {
        log('HTTP request fail', err);
        var msg = '网络连接失败';
        if (err && err.errMsg && err.errMsg.indexOf('timeout') > -1) {
          msg = '请求超时';
        }
        reject({ code: -1, message: msg });
      }
    });
  });
}

function request(url, options) {
  if (!USE_MOCK) {
    return requestByHttp(url, options);
  }
  return rejectMock(501, 'request() is disabled in mock mode. Use the typed api methods.');
}

// ---------------- Mock API ----------------

var mockZoneApi = {
  getAll: function() {
    return resolveMock(staticMock.zones || []);
  },
  getById: function(id) {
    return resolveMock(getZoneById(id));
  }
};

var mockAudioApi = {
  getAll: function() {
    return resolveMock(toAudioGuideRows());
  },
  getByZoneId: function(zoneId) {
    var rows = toAudioGuideRows().filter(function(item) {
      return String(item.zoneId) === String(zoneId);
    });
    return resolveMock(rows);
  }
};

var mockQuestionApi = {
  getAll: function() {
    var rows = (staticMock.questions || []).map(function(q) {
      return {
        id: q.id,
        question: q.question,
        options: JSON.stringify(q.options || []),
        answer: q.answer,
        explanation: q.explanation,
        category: q.category
      };
    });
    return resolveMock(rows);
  },
  getRandom: function(count) {
    var list = clone(staticMock.questions || []);
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    var c = Math.max(1, Number(count) || 10);
    return resolveMock(list.slice(0, c));
  },
  checkAnswer: function(questionId, answer) {
    var q = getQuestionById(questionId);
    if (!q) {
      return rejectMock(404, '题目不存在');
    }
    var answerIndex = Number(answer);
    return resolveMock({
      isCorrect: answerIndex === Number(q.answer),
      correctAnswer: Number(q.answer),
      explanation: q.explanation || ''
    });
  },
  submitQuiz: function(answers, quizType) {
    var list = staticMock.questions || [];
    var correct = 0;
    var total = Array.isArray(answers) ? answers.length : 0;
    for (var i = 0; i < total; i++) {
      var a = answers[i] || {};
      var q = getQuestionById(a.questionId || a.id);
      if (q && Number(a.answer) === Number(q.answer)) {
        correct++;
      }
    }
    var score = total > 0 ? Math.round((correct / total) * 100) : 0;
    return resolveMock({
      quizType: quizType || 'practice',
      totalQuestions: total,
      correctAnswers: correct,
      score: score
    });
  }
};

var mockHeroApi = {
  getAll: function() {
    var heroes = [
      { id: 'h1', name: '缉毒英雄甲', title: '缉毒民警', story: '长期奋战缉毒一线，守护群众安全。' },
      { id: 'h2', name: '缉毒英雄乙', title: '禁毒辅警', story: '扎根基层，持续开展禁毒宣传与帮扶。' }
    ];
    return resolveMock(heroes);
  }
};

var mockGiftApi = {
  getAll: function() {
    return resolveMock(getGiftsWithStock());
  }
};

var mockNewsApi = {
  getList: function(page, pageSize) {
    var list = clone(staticMock.news || []);
    var paged = paginate(list, page || 1, pageSize || 10);
    return resolveMock(paged);
  },
  getDetail: function(id) {
    var list = staticMock.news || [];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === String(id)) {
        return resolveMock(list[i]);
      }
    }
    return rejectMock(404, '新闻不存在');
  }
};

var mockVrApi = {
  getScenes: function() {
    return resolveMock(toVrScenesRows());
  },
  getHotspots: function(sceneId) {
    return resolveMock(toVrHotspotRows(sceneId));
  }
};

var mockUserApi = {
  login: function(code, userInfo) {
    var token = createMockToken();
    var profilePatch = Object.assign({}, userInfo || {});
    if (!profilePatch.nickName) profilePatch.nickName = '游客';
    if (!profilePatch.id) profilePatch.id = 'mock-user';
    setMockProfile(profilePatch);
    setStorage(KEYS.TOKEN, token);
    setStorage(KEYS.TOKEN_EXPIRE, Date.now() + 7 * 24 * 60 * 60 * 1000);

    var profile = getMockProfile();
    return resolveMock({
      token: token,
      userInfo: profile,
      code: code || ''
    });
  },
  getInfo: function() {
    return resolveMock(getMockProfile());
  },
  update: function(data) {
    var profile = setMockProfile(data || {});
    profile.points = getPoints();
    profile.totalPoints = getTotalPoints();
    profile.level = calcLevel(profile.totalPoints);
    return resolveMock(profile);
  },
  getPoints: function() {
    return resolveMock({
      points: getPoints(),
      totalPoints: getTotalPoints()
    });
  },
  addPoints: function(amount, reason) {
    return resolveMock(addPoints(amount, reason));
  },
  sign: function() {
    if (wx.getStorageSync(KEYS.LAST_SIGN_DATE) === todayKey()) {
      return resolveMock({
        points: getPoints(),
        totalPoints: getTotalPoints(),
        added: 0,
        alreadySigned: true
      });
    }
    var result = addPoints(10, '每日签到');
    setStorage(KEYS.LAST_SIGN_DATE, todayKey());
    result.added = 10;
    return resolveMock(result);
  },
  getPointsHistory: function(page, pageSize) {
    var list = getArray(KEYS.POINTS_HISTORY);
    return resolveMock(paginate(list, page || 1, pageSize || 20));
  }
};

var mockExchangeApi = {
  exchange: function(data) {
    data = data || {};
    var giftId = String(data.giftId || '');
    if (!giftId) {
      return rejectMock(400, 'giftId required');
    }

    var gifts = getGiftsWithStock();
    var gift = null;
    for (var i = 0; i < gifts.length; i++) {
      if (String(gifts[i].id) === giftId) {
        gift = gifts[i];
        break;
      }
    }
    if (!gift) return rejectMock(404, '礼品不存在');
    if (Number(gift.stock || 0) <= 0) return rejectMock(400, '库存不足');
    if (getPoints() < Number(gift.points || 0)) return rejectMock(400, '积分不足');

    var stockMap = getGiftStockMap();
    stockMap[giftId] = Math.max(0, Number(stockMap[giftId] || 0) - 1);
    setStorage(KEYS.GIFT_STOCK, stockMap);

    var pointsResult = addPoints(-Number(gift.points || 0), '礼品兑换: ' + gift.name);
    var records = getArray(KEYS.EXCHANGE_RECORDS);
    var record = {
      id: 'ex_' + Date.now(),
      giftId: gift.id,
      giftName: gift.name,
      points: gift.points,
      status: 'SUCCESS',
      contactName: data.contactName || '',
      contactPhone: data.contactPhone || '',
      address: data.address || '',
      createdAt: nowIso()
    };
    records.unshift(record);
    if (records.length > 200) records = records.slice(0, 200);
    setStorage(KEYS.EXCHANGE_RECORDS, records);

    return resolveMock({
      remainPoints: pointsResult.points,
      record: record
    });
  },
  getRecords: function(page, pageSize) {
    var records = getArray(KEYS.EXCHANGE_RECORDS);
    return resolveMock(paginate(records, page || 1, pageSize || 20));
  },
  getDetail: function(id) {
    var records = getArray(KEYS.EXCHANGE_RECORDS);
    for (var i = 0; i < records.length; i++) {
      if (String(records[i].id) === String(id)) {
        return resolveMock(records[i]);
      }
    }
    return rejectMock(404, '记录不存在');
  }
};

function computeLearningStats() {
  var zoneRecords = getLearningRecords(KEYS.LEARN_ZONE);
  var quizRecords = getLearningRecords(KEYS.LEARN_QUIZ);
  var storyRecords = getLearningRecords(KEYS.LEARN_STORY);
  var audioRecords = getLearningRecords(KEYS.LEARN_AUDIO);

  var totalQuestions = 0;
  var correctAnswers = 0;
  var goodEndingCount = 0;
  var audioCompleted = 0;

  var i;
  for (i = 0; i < quizRecords.length; i++) {
    totalQuestions += Number(quizRecords[i].totalQuestions || 0);
    correctAnswers += Number(quizRecords[i].correctAnswers || 0);
  }
  for (i = 0; i < storyRecords.length; i++) {
    if (storyRecords[i].isGoodEnding) goodEndingCount++;
  }
  for (i = 0; i < audioRecords.length; i++) {
    if (audioRecords[i].completed) audioCompleted++;
  }

  return {
    zoneVisits: zoneRecords.length,
    quizCount: quizRecords.length,
    totalQuestions: totalQuestions,
    correctAnswers: correctAnswers,
    correctRate: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
    storyCount: storyRecords.length,
    goodEndingCount: goodEndingCount,
    audioCount: audioRecords.length,
    audioCompleted: audioCompleted
  };
}

var mockLearningApi = {
  recordZoneVisit: function(data) {
    return resolveMock(addLearningRecord(KEYS.LEARN_ZONE, data));
  },
  recordQuiz: function(data) {
    return resolveMock(addLearningRecord(KEYS.LEARN_QUIZ, data));
  },
  recordStory: function(data) {
    return resolveMock(addLearningRecord(KEYS.LEARN_STORY, data));
  },
  recordAudio: function(data) {
    return resolveMock(addLearningRecord(KEYS.LEARN_AUDIO, data));
  },
  getStats: function() {
    return resolveMock(computeLearningStats());
  },
  getZoneRecords: function(page, pageSize) {
    return resolveMock(paginate(getLearningRecords(KEYS.LEARN_ZONE), page || 1, pageSize || 20));
  },
  getQuizRecords: function(page, pageSize) {
    return resolveMock(paginate(getLearningRecords(KEYS.LEARN_QUIZ), page || 1, pageSize || 20));
  },
  getStoryRecords: function(page, pageSize) {
    return resolveMock(paginate(getLearningRecords(KEYS.LEARN_STORY), page || 1, pageSize || 20));
  },
  getAudioRecords: function(page, pageSize) {
    return resolveMock(paginate(getLearningRecords(KEYS.LEARN_AUDIO), page || 1, pageSize || 20));
  }
};

var mockClawApi = {
  play: function() {
    var status = getClawStatus();
    var todayPlays = Number(status.todayPlays || 0);
    var consecutiveFails = Number(status.consecutiveFails || 0);
    var costPerPlay = Number(clawMachineConfig.costPerPlay || 100);
    var dailyLimit = Number(clawMachineConfig.dailyLimit || 10);
    var freeLimit = 3;

    if (todayPlays >= dailyLimit) {
      return rejectMock(400, '今日次数已用完');
    }

    var points = getPoints();
    var isFree = todayPlays < freeLimit;
    if (!isFree && points < costPerPlay) {
      return rejectMock(400, '积分不足');
    }

    if (!isFree) {
      var payResult = addPoints(-costPerPlay, '飞车冲刺挑战');
      points = payResult.points;
    }

    todayPlays += 1;
    var guaranteeAfter = Number(clawMachineConfig.guaranteeAfterFails || 5);
    var isGuaranteed = consecutiveFails >= (guaranteeAfter - 1);
    var winRate = Number(clawMachineConfig.baseWinRate || 0.25);
    var isWin = isGuaranteed || (Math.random() < winRate);
    var wonPrize = null;
    var wonPoints = 0;

    if (isWin) {
      wonPrize = weightedPick(clawMachineConfig.prizes || []);
      if (!wonPrize) {
        isWin = false;
      } else {
        wonPoints = Number(wonPrize.points || 0);
        addPoints(wonPoints, '飞车冲刺中奖');
        consecutiveFails = 0;
        points = getPoints();
      }
    }
    if (!isWin) {
      consecutiveFails += 1;
      points = getPoints();
    }

    setClawStatus({
      todayKey: todayKey(),
      todayPlays: todayPlays,
      consecutiveFails: consecutiveFails
    });

    return resolveMock({
      isWin: isWin,
      prize: wonPrize ? { id: wonPrize.id, name: wonPrize.name } : null,
      wonPoints: wonPoints,
      remainPoints: points,
      todayPlays: todayPlays,
      consecutiveFails: consecutiveFails
    });
  },
  getConfig: function() {
    return resolveMock(clawMachineConfig);
  },
  getStatus: function() {
    var status = getClawStatus();
    var ranking = getArray('rankingList');
    return resolveMock({
      userPoints: getPoints(),
      todayPlays: Number(status.todayPlays || 0),
      consecutiveFails: Number(status.consecutiveFails || 0),
      dailyLimit: Number(clawMachineConfig.dailyLimit || 10),
      costPerPlay: Number(clawMachineConfig.costPerPlay || 100),
      guaranteeAfterFails: Number(clawMachineConfig.guaranteeAfterFails || 5),
      ranking: ranking
    });
  }
};

var mockDrugItemApi = {
  getAll: function() {
    var items = [];
    var zones = staticMock.zones || [];
    for (var i = 0; i < zones.length; i++) {
      var sections = zones[i].sections || [];
      for (var j = 0; j < sections.length; j++) {
        var sectionItems = sections[j].items || [];
        for (var k = 0; k < sectionItems.length; k++) {
          items.push(sectionItems[k]);
        }
      }
    }
    return resolveMock(items);
  },
  getRandom: function(count) {
    var all = [];
    var zones = staticMock.zones || [];
    var i;
    var j;
    var k;
    for (i = 0; i < zones.length; i++) {
      var sections = zones[i].sections || [];
      for (j = 0; j < sections.length; j++) {
        var sectionItems = sections[j].items || [];
        for (k = 0; k < sectionItems.length; k++) {
          all.push(sectionItems[k]);
        }
      }
    }
    for (i = all.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      k = all[i];
      all[i] = all[j];
      all[j] = k;
    }
    return resolveMock(all.slice(0, Math.max(1, Number(count) || 5)));
  }
};

var mockStoryMusicApi = {
  getByStory: function(storyId) {
    var list = staticMock.storyMusic && staticMock.storyMusic[storyId];
    return resolveMock(Array.isArray(list) ? list : []);
  },
  getByScene: function(storyId, sceneId) {
    var list = staticMock.storyMusic && staticMock.storyMusic[storyId];
    if (!Array.isArray(list)) return resolveMock([]);
    var filtered = list.filter(function(item) {
      return String(item.sceneId) === String(sceneId);
    });
    return resolveMock(filtered);
  }
};

var mockMiniProgramApi = {
  getConfig: function() {
    return resolveMock(staticMock.appConfig || {});
  }
};

// ---------------- Real API ----------------

var realZoneApi = {
  getAll: function() { return requestByHttp('/zones/all'); },
  getById: function(id) { return requestByHttp('/zones/' + id); }
};

var realAudioApi = {
  getAll: function() { return requestByHttp('/audio-guides/all'); },
  getByZoneId: function(zoneId) { return requestByHttp('/audio-guides/zone/' + zoneId); }
};

var realQuestionApi = {
  getAll: function() { return requestByHttp('/questions/all'); },
  getRandom: function(count) { return requestByHttp('/questions/random?count=' + (count || 10)); },
  checkAnswer: function(questionId, answer) {
    return requestByHttp('/questions/check', { method: 'POST', data: { questionId: questionId, answer: answer } });
  },
  submitQuiz: function(answers, quizType) {
    return requestByHttp('/questions/submit', { method: 'POST', data: { answers: answers, quizType: quizType } });
  }
};

var realHeroApi = {
  getAll: function() { return requestByHttp('/heroes/all'); }
};

var realGiftApi = {
  getAll: function() { return requestByHttp('/gifts/all'); }
};

var realNewsApi = {
  getList: function(page, pageSize) {
    return requestByHttp('/news?page=' + (page || 1) + '&pageSize=' + (pageSize || 10));
  },
  getDetail: function(id) {
    return requestByHttp('/news/' + id);
  }
};

var realVrApi = {
  getScenes: function() { return requestByHttp('/vr-scenes/all'); },
  getHotspots: function(sceneId) { return requestByHttp('/vr-hotspots/scene/' + sceneId); }
};

var realUserApi = {
  login: function(code, userInfo) {
    return requestByHttp('/user/login', { method: 'POST', data: { code: code, userInfo: userInfo } });
  },
  getInfo: function() { return requestByHttp('/user/info'); },
  update: function(data) { return requestByHttp('/user/update', { method: 'POST', data: data }); },
  getPoints: function() { return requestByHttp('/user/points'); },
  addPoints: function(amount, reason) {
    return requestByHttp('/user/points/add', { method: 'POST', data: { amount: amount, reason: reason } });
  },
  sign: function() { return requestByHttp('/user/sign', { method: 'POST' }); },
  getPointsHistory: function(page, pageSize) {
    return requestByHttp('/user/points/history?page=' + (page || 1) + '&pageSize=' + (pageSize || 20));
  }
};

var realExchangeApi = {
  exchange: function(data) { return requestByHttp('/exchange/exchange', { method: 'POST', data: data }); },
  getRecords: function(page, pageSize) {
    return requestByHttp('/exchange/records?page=' + (page || 1) + '&pageSize=' + (pageSize || 20));
  },
  getDetail: function(id) { return requestByHttp('/exchange/records/' + id); }
};

var realLearningApi = {
  recordZoneVisit: function(data) { return requestByHttp('/learning/zone/visit', { method: 'POST', data: data }); },
  recordQuiz: function(data) { return requestByHttp('/learning/quiz/record', { method: 'POST', data: data }); },
  recordStory: function(data) { return requestByHttp('/learning/story/record', { method: 'POST', data: data }); },
  recordAudio: function(data) { return requestByHttp('/learning/audio/record', { method: 'POST', data: data }); },
  getStats: function() { return requestByHttp('/learning/stats'); },
  getZoneRecords: function(page, pageSize) {
    return requestByHttp('/learning/zone/records?page=' + (page || 1) + '&pageSize=' + (pageSize || 20));
  },
  getQuizRecords: function(page, pageSize) {
    return requestByHttp('/learning/quiz/records?page=' + (page || 1) + '&pageSize=' + (pageSize || 20));
  },
  getStoryRecords: function(page, pageSize) {
    return requestByHttp('/learning/story/records?page=' + (page || 1) + '&pageSize=' + (pageSize || 20));
  },
  getAudioRecords: function(page, pageSize) {
    return requestByHttp('/learning/audio/records?page=' + (page || 1) + '&pageSize=' + (pageSize || 20));
  }
};

var realClawApi = {
  play: function() { return requestByHttp('/claw/play', { method: 'POST' }); },
  getConfig: function() { return requestByHttp('/claw/config'); },
  getStatus: function() { return requestByHttp('/claw/status'); }
};

var realDrugItemApi = {
  getAll: function() { return requestByHttp('/drug-items/all'); },
  getRandom: function(count) { return requestByHttp('/drug-items/random?count=' + (count || 5)); }
};

var realStoryMusicApi = {
  getByStory: function(storyId) { return requestByHttp('/story-music/story/' + storyId); },
  getByScene: function(storyId, sceneId) { return requestByHttp('/story-music/scene/' + storyId + '/' + sceneId); }
};

var realMiniProgramApi = {
  getConfig: function() { return requestByHttp('/miniprogram/config'); }
};

var apiSet = USE_MOCK ? {
  zoneApi: mockZoneApi,
  audioApi: mockAudioApi,
  questionApi: mockQuestionApi,
  heroApi: mockHeroApi,
  giftApi: mockGiftApi,
  newsApi: mockNewsApi,
  vrApi: mockVrApi,
  userApi: mockUserApi,
  exchangeApi: mockExchangeApi,
  learningApi: mockLearningApi,
  clawApi: mockClawApi,
  drugItemApi: mockDrugItemApi,
  storyMusicApi: mockStoryMusicApi,
  miniprogramApi: mockMiniProgramApi
} : {
  zoneApi: realZoneApi,
  audioApi: realAudioApi,
  questionApi: realQuestionApi,
  heroApi: realHeroApi,
  giftApi: realGiftApi,
  newsApi: realNewsApi,
  vrApi: realVrApi,
  userApi: realUserApi,
  exchangeApi: realExchangeApi,
  learningApi: realLearningApi,
  clawApi: realClawApi,
  drugItemApi: realDrugItemApi,
  storyMusicApi: realStoryMusicApi,
  miniprogramApi: realMiniProgramApi
};

module.exports = {
  baseUrl: BASE_URL,
  request: request,
  zoneApi: apiSet.zoneApi,
  audioApi: apiSet.audioApi,
  questionApi: apiSet.questionApi,
  heroApi: apiSet.heroApi,
  giftApi: apiSet.giftApi,
  newsApi: apiSet.newsApi,
  vrApi: apiSet.vrApi,
  userApi: apiSet.userApi,
  exchangeApi: apiSet.exchangeApi,
  learningApi: apiSet.learningApi,
  clawApi: apiSet.clawApi,
  drugItemApi: apiSet.drugItemApi,
  storyMusicApi: apiSet.storyMusicApi,
  miniprogramApi: apiSet.miniprogramApi
};
