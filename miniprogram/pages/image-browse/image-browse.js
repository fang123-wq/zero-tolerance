const BASE_URL = 'https://oss.bjgjlc.com/drug-education/image-browse/'

const imageList = [
  { id: 1, url: BASE_URL + 'image-browse-01.jpg' },
  { id: 2, url: BASE_URL + 'image-browse-02.jpg' },
  { id: 3, url: BASE_URL + 'image-browse-03.jpg' },
  { id: 4, url: BASE_URL + 'image-browse-04.jpg' },
  { id: 5, url: BASE_URL + 'image-browse-05.jpg' },
  { id: 6, url: BASE_URL + 'image-browse-06.jpg' },
  { id: 7, url: BASE_URL + 'image-browse-07.jpg' },
  { id: 8, url: BASE_URL + 'image-browse-08.jpg' },
  { id: 9, url: BASE_URL + 'image-browse-09.jpg' },
  { id: 10, url: BASE_URL + 'image-browse-10.jpg' },
  { id: 11, url: BASE_URL + 'image-browse-11.jpg' },
  { id: 12, url: BASE_URL + 'image-browse-12.jpg' },
  { id: 13, url: BASE_URL + 'image-browse-13.jpg' },
  { id: 14, url: BASE_URL + 'image-browse-14.jpg' },
  { id: 15, url: BASE_URL + 'image-browse-15.jpg' },
  { id: 16, url: BASE_URL + 'image-browse-16.jpg' }
]

Page({
  data: {
    images: imageList,
    currentIndex: 0
  },

  onSwiperChange(e) {
    this.setData({
      currentIndex: e.detail.current
    })
  },

  goToImage(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      currentIndex: index
    })
  },

  previewImage(e) {
    const index = e.currentTarget.dataset.index
    const urls = this.data.images.map(item => item.url)
    wx.previewImage({
      current: urls[index],
      urls: urls
    })
  }
})
