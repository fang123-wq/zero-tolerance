const { newsApi } = require('../../utils/api.js');

Page({
  data: {
    news: {},
    contentBlocks: [],
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.loadNewsById(options.id);
    }
  },

  loadNewsById(id) {
    var that = this;
    that.setData({ loading: true });
    
    newsApi.getDetail(id).then(function(res) {
      if (res) {
        var blocks = res.blocks || [];
        if (typeof blocks === 'string') {
          try {
            blocks = JSON.parse(blocks);
          } catch {
            blocks = [];
          }
        }
        if (!Array.isArray(blocks)) {
          blocks = [];
        }

        that.setData({
          news: res,
          contentBlocks: blocks,
          loading: false
        });
        wx.setNavigationBarTitle({ title: '璧勮璇︽儏' });
      } else {
        that.setData({ loading: false });
        wx.showToast({ title: '新闻不存在', icon: 'none' });
      }
    }).catch(function(err) {
      console.log('鍔犺浇鏂伴椈璇︽儏澶辫触', err);
      that.setData({ loading: false });
      wx.showToast({ title: '新闻不存在', icon: 'none' });
    });
  },

  previewImage(e) {
    const src = e.currentTarget.dataset.src;
    const images = this.data.contentBlocks
      .filter(block => block.type === 'image')
      .map(block => block.src);
    
    wx.previewImage({
      current: src,
      urls: images.length > 0 ? images : [src]
    });
  },

  onShareAppMessage() {
    const news = this.data.news;
    return {
      title: news.title || '绂佹瘨璧勮',
      path: '/pages/news-detail/news-detail?id=' + news.id
    };
  }
});


