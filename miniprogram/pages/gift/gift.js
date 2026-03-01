var api = require('../../utils/api.js');
var app = getApp();

Page({
  data: {
    points: 0,
    gifts: [],
    exchangeRecords: [],
    loading: true,
    showExchangeModal: false,
    selectedGift: null,
    contactName: '',
    contactPhone: '',
    address: '',
    activeTab: 'gifts'
  },

  onLoad: function() {
    this.loadData();
  },

  onShow: function() {
    this.loadData();
  },

  loadData: function() {
    this.setData({ points: app.globalData.points });
    this.loadGifts();
    if (app.globalData.isLoggedIn) {
      this.loadExchangeRecords();
    } else {
      this.setData({ exchangeRecords: wx.getStorageSync('guestExchangeRecords') || [] });
    }
  },

  loadGifts: function() {
    var that = this;
    api.giftApi.getAll().then(function(data) {
      var gifts = data || [];
      that.setData({ gifts: gifts, loading: false });
    }).catch(function(err) {
      console.error('加载礼品失败:', err);
      that.setData({ loading: false });
    });
  },

  loadExchangeRecords: function() {
    var that = this;
    api.exchangeApi.getRecords().then(function(data) {
      that.setData({ exchangeRecords: data.list || [] });
    }).catch(function(err) {
      console.error('加载兑换记录失败:', err);
    });
  },

  switchTab: function(e) {
    var tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    if (tab === 'records') {
      if (app.globalData.isLoggedIn) {
        this.loadExchangeRecords();
      } else {
        this.setData({ exchangeRecords: wx.getStorageSync('guestExchangeRecords') || [] });
      }
    }
  },

  onGiftTap: function(e) {
    var gift = e.currentTarget.dataset.gift;

    if (this.data.points < gift.points) {
      wx.showToast({ title: '积分不足', icon: 'none' });
      return;
    }

    if (gift.stock === 0) {
      wx.showToast({ title: '库存不足', icon: 'none' });
      return;
    }

    this.setData({
      showExchangeModal: true,
      selectedGift: gift,
      contactName: '',
      contactPhone: '',
      address: ''
    });
  },

  closeModal: function() {
    this.setData({ showExchangeModal: false, selectedGift: null });
  },

  onInputChange: function(e) {
    var field = e.currentTarget.dataset.field;
    var data = {};
    data[field] = e.detail.value;
    this.setData(data);
  },

  confirmExchange: function() {
    var that = this;
    var gift = this.data.selectedGift;

    if (!this.data.contactName.trim()) {
      wx.showToast({ title: '请输入联系人姓名', icon: 'none' });
      return;
    }
    if (!this.data.contactPhone.trim()) {
      wx.showToast({ title: '请输入联系电话', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '兑换中...' });

    if (!app.globalData.isLoggedIn) {
      if (this.data.points < gift.points) {
        wx.hideLoading();
        wx.showToast({ title: '积分不足', icon: 'none' });
        return;
      }

      if (gift.stock === 0) {
        wx.hideLoading();
        wx.showToast({ title: '库存不足', icon: 'none' });
        return;
      }

      var remainPoints = this.data.points - gift.points;
      var records = wx.getStorageSync('guestExchangeRecords') || [];
      var newRecord = {
        id: 'guest_' + Date.now(),
        giftId: gift.id,
        giftName: gift.name,
        points: gift.points,
        status: 'SUCCESS',
        contactName: this.data.contactName,
        contactPhone: this.data.contactPhone,
        address: this.data.address,
        createdAt: new Date().toISOString()
      };
      records.unshift(newRecord);
      if (records.length > 50) {
        records = records.slice(0, 50);
      }
      wx.setStorageSync('guestExchangeRecords', records);

      var gifts = (this.data.gifts || []).map(function(item) {
        if (item.id === gift.id) {
          var nextStock = Number(item.stock || 0) - 1;
          item.stock = nextStock < 0 ? 0 : nextStock;
        }
        return item;
      });

      app.globalData.points = remainPoints;
      app.globalData.totalPoints = Math.max(remainPoints, Number(app.globalData.totalPoints || 0));
      wx.setStorageSync('points', remainPoints);

      wx.hideLoading();
      that.setData({
        points: remainPoints,
        gifts: gifts,
        exchangeRecords: records,
        showExchangeModal: false,
        selectedGift: null
      });
      wx.showToast({ title: '兑换成功', icon: 'success' });
      return;
    }

    api.exchangeApi.exchange({
      giftId: gift.id,
      contactName: this.data.contactName,
      contactPhone: this.data.contactPhone,
      address: this.data.address
    }).then(function(data) {
      wx.hideLoading();
      app.globalData.points = data.remainPoints;
      wx.setStorageSync('points', data.remainPoints);

      that.setData({
        points: data.remainPoints,
        showExchangeModal: false,
        selectedGift: null
      });

      wx.showToast({ title: '兑换成功', icon: 'success' });
      that.loadGifts();
      that.loadExchangeRecords();
    }).catch(function(err) {
      wx.hideLoading();
      wx.showToast({ title: err.message || '兑换失败', icon: 'none' });
    });
  },

  stopPropagation: function() {}
});
