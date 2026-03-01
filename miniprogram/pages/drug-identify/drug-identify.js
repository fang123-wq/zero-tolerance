// pages/drug-identify/drug-identify.js

Page({
  data: {
    loading: false,
    currentIndex: 0,
    previewVisible: false,
    previewImage: '',
    images: [
      { id: 1, url: 'https://oss.bjgjlc.com/drug-education/drug/drug-recognize1.jpg', title: '姣掑搧璇嗗埆1' },
      { id: 2, url: 'https://oss.bjgjlc.com/drug-education/drug/drug-recognize2.jpg', title: '姣掑搧璇嗗埆2' },
      { id: 3, url: 'https://oss.bjgjlc.com/drug-education/drug/drug-recognize3.jpg', title: '姣掑搧璇嗗埆3' },
      { id: 4, url: 'https://oss.bjgjlc.com/drug-education/drug/drug-recognize4.jpg', title: '姣掑搧璇嗗埆4' },
      { id: 5, url: 'https://oss.bjgjlc.com/drug-education/drug/drug-recognize5.jpg', title: '姣掑搧璇嗗埆5' },
      { id: 6, url: 'https://oss.bjgjlc.com/drug-education/drug/drug-recognize6.jpg', title: '姣掑搧璇嗗埆6' },
      { id: 7, url: 'https://oss.bjgjlc.com/drug-education/drug/drug-recognize7.jpg', title: '姣掑搧璇嗗埆7' },
      { id: 8, url: 'https://oss.bjgjlc.com/drug-education/drug/drug-recognize8.jpg', title: '姣掑搧璇嗗埆8' },
      { id: 9, url: 'https://oss.bjgjlc.com/drug-education/drug/drug-recognize9.jpg', title: '姣掑搧璇嗗埆9' },
      { id: 10, url: 'https://oss.bjgjlc.com/drug-education/drug/drug-recognize10.jpg', title: '姣掑搧璇嗗埆10' }
    ],
    harmImages: [
      { id: 1, url: 'https://oss.bjgjlc.com/drug-education/drug/%E5%A4%A7%E8%84%91%E6%8D%9F%E4%BC%A4.jpg', title: '澶ц剳鎹熶激' },
      { id: 2, url: 'https://oss.bjgjlc.com/drug-education/drug/%E5%BF%83%E8%84%8F%E5%8F%97%E6%8D%9F.jpg', title: '蹇冭剰鍙楁崯' },
      { id: 3, url: 'https://oss.bjgjlc.com/drug-education/drug/%E8%82%9D%E8%84%8F%E5%8F%97%E6%8D%9F.jpg', title: '鑲濊剰鍙楁崯' },
      { id: 4, url: 'https://oss.bjgjlc.com/drug-education/drug/%E7%B2%BE%E7%A5%9E%E9%9A%9C%E7%A2%8D.jpg', title: '绮剧闅滅' },
      { id: 5, url: 'https://oss.bjgjlc.com/drug-education/drug/%E6%88%90%E7%98%BE%E4%BE%9D%E8%B5%96.jpg', title: '鎴愮樉渚濊禆' },
      { id: 6, url: 'https://oss.bjgjlc.com/drug-education/drug/%E7%A4%BE%E4%BC%9A%E5%8D%B1%E5%AE%B3%EF%BC%8C%E5%AE%B6%E5%BA%AD%E7%A0%B4%E8%A3%82.jpg', title: '社会危害，家庭破裂' },
      { id: 7, url: 'https://oss.bjgjlc.com/drug-education/drug/%E8%BF%9D%E6%B3%95%E7%8A%AF%E7%BD%AA.jpg', title: '杩濇硶鐘姜' }
    ],
    newDrugImages: [
      { id: 1, url: 'https://oss.bjgjlc.com/drug-education/drug/%E5%8F%B3%E7%BE%8E%E6%B2%99%E8%8A%AC.jpg', title: '鍙崇編娌欒姮' },
      { id: 2, url: 'https://oss.bjgjlc.com/drug-education/drug/%E6%96%B0%E5%9E%8B%E6%AF%92%E5%93%81%E4%BE%9D%E6%89%98%E5%92%AA%E9%85%AF%E7%94%B5%E5%AD%90%E7%83%9F.jpg', title: '新型毒品依托咪酯电子烟' }
],
    pdfUrl: 'https://oss.bjgjlc.com/drug-education/drug/jinduxuanchuanshouce.pdf'
  },

  onLoad: function() {},

  openPdf: function() {
    wx.showLoading({ title: '鍔犺浇涓?..' });
    wx.downloadFile({
      url: this.data.pdfUrl,
      success: function(res) {
        wx.hideLoading();
        if (res.statusCode === 200) {
          wx.openDocument({
            filePath: res.tempFilePath,
            fileType: 'pdf',
            showMenu: true,
            success: function() {},
            fail: function() {
              wx.showToast({ title: '鎵撳紑澶辫触', icon: 'none' });
            }
          });
        }
      },
      fail: function() {
        wx.hideLoading();
        wx.showToast({ title: '涓嬭浇澶辫触', icon: 'none' });
      }
    });
  },

  previewImage: function(e) {
    var url = e.currentTarget.dataset.url;
    var urls = this.data.images.map(function(item) { return item.url; });
    wx.previewImage({
      current: url,
      urls: urls
    });
  },

  previewHarmImage: function(e) {
    var url = e.currentTarget.dataset.url;
    var urls = this.data.harmImages.map(function(item) { return item.url; });
    wx.previewImage({
      current: url,
      urls: urls
    });
  },

  previewNewDrugImage: function(e) {
    var url = e.currentTarget.dataset.url;
    var urls = this.data.newDrugImages.map(function(item) { return item.url; });
    wx.previewImage({
      current: url,
      urls: urls
    });
  },

  onShareAppMessage: function() {
    return {
      title: '姣掑搧璇嗗埆 - 浜嗚В姣掑搧鍗卞',
      path: '/pages/drug-identify/drug-identify'
    };
  }
});



