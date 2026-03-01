var api = require('../../utils/api.js');
var storage = require('../../utils/storage.js').storage;
var app = getApp();

Page({
  data: {
    totalPoints: 0,
    correctRate: 0,
    rank: 128,
    isQuizzing: false,
    quizMode: '',
    quizQuestions: [],
    currentIndex: 0,
    currentQuestion: {},
    selectedOption: -1,
    showAnswer: false,
    timeLeft: 60,
    correctCount: 0,
    allQuestions: [],
    rankList: [
      { rank: 1, medal: '🥇', name: '张三', score: 2580 },
      { rank: 2, medal: '🥈', name: '李四', score: 2350 },
      { rank: 3, medal: '🥉', name: '王五', score: 2120 },
      { rank: 4, medal: '4.', name: '赵六', score: 1980 },
      { rank: 5, medal: '5.', name: '钱七', score: 1850 }
    ]
  },

  timer: null,

  onLoad: function() {
    this.loadStats();
    this.loadQuestions();
  },

  onShow: function() {
    this.loadStats();
  },

  loadQuestions: function() {
    var that = this;
    api.questionApi.getAll().then(function(data) {
      var questions = (data || []).map(function(q) {
        var options = [];
        try {
          options = JSON.parse(q.options || '[]');
        } catch {
          options = [];
        }
        return {
          id: q.id,
          question: q.question,
          options: options,
          category: q.category
        };
      });
      that.setData({ allQuestions: questions });
      if (questions.length === 0) {
        console.warn('题库为空，请在后台添加题目');
      }
    }).catch(function(err) {
      console.error('加载题库失败:', err);
      wx.showToast({ title: '题库加载失败', icon: 'none' });
    });
  },

  loadStats: function() {
    var records = storage.getQuizRecords();
    var rate = records.totalQuestions > 0
      ? Math.round(records.correctAnswers / records.totalQuestions * 100)
      : 0;
    this.setData({
      totalPoints: app.globalData.points,
      correctRate: rate
    });
  },

  startQuiz: async function(e) {
    var canUse = await app.ensureLoggedIn({
      content: '请先登录后再参与积分活动'
    });
    if (!canUse) {
      return;
    }
    var mode = e.currentTarget.dataset.mode;
    var questions = this.data.allQuestions;

    if (!questions || questions.length === 0) {
      wx.showToast({ title: '题库加载中，请稍后再试', icon: 'none' });
      return;
    }

    var quizQuestions = [];
    if (mode === 'daily') {
      quizQuestions = this.shuffleArray(questions.slice()).slice(0, 5);
    } else if (mode === 'challenge' || mode === 'practice') {
      quizQuestions = this.shuffleArray(questions.slice()).slice(0, 10);
    }

    if (quizQuestions.length === 0) {
      wx.showToast({ title: '暂无题目', icon: 'none' });
      return;
    }

    this.setData({
      isQuizzing: true,
      quizMode: mode,
      quizQuestions: quizQuestions,
      currentIndex: 0,
      currentQuestion: quizQuestions[0],
      selectedOption: -1,
      showAnswer: false,
      correctCount: 0,
      timeLeft: 60
    });

    if (mode === 'challenge') {
      this.startTimer();
    }
  },

  startTimer: function() {
    var that = this;
    this.timer = setInterval(function() {
      if (that.data.timeLeft <= 0) {
        that.endQuiz();
      } else {
        that.setData({ timeLeft: that.data.timeLeft - 1 });
      }
    }, 1000);
  },

  selectOption: function(e) {
    if (this.data.showAnswer) return;

    var that = this;
    var index = e.currentTarget.dataset.index;
    var questionId = this.data.currentQuestion.id;

    this.setData({ selectedOption: index });

    api.questionApi.checkAnswer(questionId, index).then(function(result) {
      that.setData({
        showAnswer: true,
        correctCount: result.isCorrect ? that.data.correctCount + 1 : that.data.correctCount,
        'currentQuestion.answer': result.correctAnswer,
        'currentQuestion.explanation': result.explanation
      });
    }).catch(function(err) {
      console.error('验证答案失败:', err);
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      that.setData({ selectedOption: -1 });
    });
  },

  nextQuestion: function() {
    var nextIndex = this.data.currentIndex + 1;

    if (nextIndex >= this.data.quizQuestions.length) {
      this.endQuiz();
    } else {
      this.setData({
        currentIndex: nextIndex,
        currentQuestion: this.data.quizQuestions[nextIndex],
        selectedOption: -1,
        showAnswer: false
      });
    }
  },

  endQuiz: function() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    var correctCount = this.data.correctCount;
    var quizQuestions = this.data.quizQuestions;
    var quizMode = this.data.quizMode;
    var total = quizQuestions.length;

    storage.updateQuizRecord(correctCount, total);

    var points = 0;
    if (quizMode === 'daily') {
      points = Math.round(correctCount / total * 50);
    } else if (quizMode === 'challenge') {
      points = Math.round(correctCount / total * 100);
    } else {
      points = correctCount * 5;
    }

    if (points > 0) {
      app.addPoints(points, '答题闯关').catch(function(err) {
        console.error('积分同步失败:', err);
      });
    }

    if (app.globalData.isLoggedIn) {
      api.learningApi.recordQuiz({
        quizType: quizMode,
        totalQuestions: total,
        correctAnswers: correctCount,
        score: Math.round(correctCount / total * 100),
        pointsEarned: points
      }).catch(function(err) {
        console.error('记录答题失败:', err);
      });
    }

    this.setData({ isQuizzing: false });
    this.loadStats();

    wx.showModal({
      title: '答题结束',
      content: '答对 ' + correctCount + '/' + total + ' 题，获得 ' + points + ' 积分！',
      showCancel: false
    });
  },

  shuffleArray: function(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  },

  onUnload: function() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },

  onHide: function() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  onShareAppMessage: function() {
    var shortName = getApp().globalData.shortName || '';
    return {
      title: '我在' + shortName + '禁毒知识答题中获得了' + this.data.totalPoints + '分，来挑战我吧！',
      path: '/pages/quiz/quiz'
    };
  }
});
