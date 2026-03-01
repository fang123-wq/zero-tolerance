const app = getApp();

Page({
  data: {
    progress: 0,
    visitCount: 0,
    showImpact: false,
    impactNumber: 0,
    appName: '禁毒云展馆',
    orgName: '禁毒教育基地'
  },

  onLoad() {
    this.loadAppConfig();
    this.setData({
      visitCount: this.formatNumber(app.globalData.visitCount)
    });
    this.startLoading();
  },

  loadAppConfig() {
    var that = this;
    app.getAppConfig(function(config) {
      if (config) {
        that.setData({
          appName: config.name || '禁毒云展馆',
          orgName: config.orgName || '禁毒教育基地'
        });
      }
    });
  },

  startLoading() {
    let progress = 0;
    const timer = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(timer);
        this.onLoadComplete();
      }
      this.setData({ progress: Math.min(progress, 100) });
      
      // 50%时显示数据冲击
      if (progress >= 50 && !this.data.showImpact) {
        this.showImpactData();
      }
    }, 200);
  },

  showImpactData() {
    this.setData({ showImpact: true });
    // 数字递增动画
    let num = 0;
    const targetNum = Math.floor(Math.random() * 3) + 2;
    const numTimer = setInterval(() => {
      num++;
      this.setData({ impactNumber: num });
      if (num >= targetNum) {
        clearInterval(numTimer);
      }
    }, 300);
  },

  onLoadComplete() {
    // 延迟跳转，让用户看完数据冲击
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }, 1500);
  },

  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
});
