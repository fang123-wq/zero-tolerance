// pages/gallery/gallery.js
var api = require('../../utils/api.js');

Page({
  data: {
    zones: [],
    currentZoneIndex: 0,
    currentZone: null,
    currentSectionIndex: 0,
    currentSection: null,
    items: [],
    
    showDetail: false,
    currentItem: null,
    currentItemIndex: 0,
    
    viewedItems: {},
    viewProgress: { viewed: 0, total: 0, percent: 0 },
    
    favorites: {},
    favoritesCount: 0,
    
    showSearch: false,
    searchKeyword: '',
    searchResults: [],
    searchHistory: [],
    hotKeywords: ['冰毒', '海洛因', 'K粉', '大麻', '摇头丸', '奶茶粉']
  },

  onLoad: function(options) {
    var viewedItems = wx.getStorageSync('galleryViewed') || {};
    var favorites = wx.getStorageSync('galleryFavorites') || {};
    var searchHistory = wx.getStorageSync('gallerySearchHistory') || [];
    
    this.setData({
      viewedItems: viewedItems,
      favorites: favorites,
      favoritesCount: Object.keys(favorites).length,
      searchHistory: searchHistory
    });
    
    this.loadZonesFromApi(options.itemId);
  },

  loadZonesFromApi: function(itemId) {
    var that = this;
    api.zoneApi.getAll().then(function(data) {
      var zones = (data || []).map(function(z) {
        return {
          id: z.zoneId || z.id,
          name: z.name,
          subtitle: z.subtitle,
          icon: z.icon,
          description: z.description,
          sections: z.sections || []
        };
      });
      
      var total = that.countTotalItems(zones);
      var viewed = Object.keys(that.data.viewedItems).length;
      
      that.setData({
        zones: zones,
        currentZone: zones[0],
        currentSection: zones[0].sections ? zones[0].sections[0] : null,
        items: zones[0].sections && zones[0].sections[0] ? zones[0].sections[0].items : [],
        viewProgress: {
          viewed: viewed,
          total: total,
          percent: total > 0 ? Math.round(viewed / total * 100) : 0
        }
      });
      
      if (itemId) {
        that.locateItem(itemId);
      }
    }).catch(function(err) {
      console.error('鍔犺浇灞曞尯澶辫触:', err);
    });
  },

  countTotalItems: function(zones) {
    var total = 0;
    zones.forEach(function(zone) {
      if (zone.sections) {
        zone.sections.forEach(function(section) {
          if (section.items) {
            total += section.items.length;
          }
        });
      }
    });
    return total;
  },

  onZoneChange: function(e) {
    var index = e.currentTarget.dataset.index;
    var zone = this.data.zones[index];
    var section = zone.sections ? zone.sections[0] : null;
    
    this.setData({
      currentZoneIndex: index,
      currentZone: zone,
      currentSectionIndex: 0,
      currentSection: section,
      items: section ? section.items : []
    });
  },

  onSectionChange: function(e) {
    var index = e.currentTarget.dataset.index;
    var section = this.data.currentZone.sections[index];
    
    this.setData({
      currentSectionIndex: index,
      currentSection: section,
      items: section.items || []
    });
  },

  onItemTap: function(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.items[index];
    
    this.setData({
      showDetail: true,
      currentItem: item,
      currentItemIndex: index
    });
    
    this.markAsViewed(item.id);
  },

  closeDetail: function() {
    this.setData({ showDetail: false });
  },

  prevItem: function() {
    var index = this.data.currentItemIndex;
    if (index > 0) {
      var newIndex = index - 1;
      var item = this.data.items[newIndex];
      this.setData({
        currentItemIndex: newIndex,
        currentItem: item
      });
      this.markAsViewed(item.id);
    }
  },

  nextItem: function() {
    var index = this.data.currentItemIndex;
    if (index < this.data.items.length - 1) {
      var newIndex = index + 1;
      var item = this.data.items[newIndex];
      this.setData({
        currentItemIndex: newIndex,
        currentItem: item
      });
      this.markAsViewed(item.id);
    }
  },

  previewImage: function(e) {
    var current = e.currentTarget.dataset.src;
    var urls = this.data.items.map(function(item) {
      return item.image;
    });
    wx.previewImage({
      current: current,
      urls: urls,
      showmenu: true
    });
  },

  markAsViewed: function(itemId) {
    var viewedItems = this.data.viewedItems;
    if (!viewedItems[itemId]) {
      viewedItems[itemId] = Date.now();
      wx.setStorageSync('galleryViewed', viewedItems);
      
      var viewed = Object.keys(viewedItems).length;
      var total = this.data.viewProgress.total;
      
      this.setData({
        viewedItems: viewedItems,
        viewProgress: {
          viewed: viewed,
          total: total,
          percent: total > 0 ? Math.round(viewed / total * 100) : 0
        }
      });
    }
  },

  toggleFavorite: function(e) {
    var itemId = e.currentTarget.dataset.id || this.data.currentItem.id;
    var favorites = this.data.favorites;
    
    if (favorites[itemId]) {
      delete favorites[itemId];
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    } else {
      favorites[itemId] = { time: Date.now() };
      wx.showToast({ title: '已收藏', icon: 'success' });
    }
    
    wx.setStorageSync('galleryFavorites', favorites);
    this.setData({
      favorites: favorites,
      favoritesCount: Object.keys(favorites).length
    });
  },

  openSearch: function() {
    this.setData({ showSearch: true });
  },

  closeSearch: function() {
    this.setData({
      showSearch: false,
      searchKeyword: '',
      searchResults: []
    });
  },

  onSearchInput: function(e) {
    var keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    
    if (keyword.trim()) {
      this.doSearch(keyword.trim());
    } else {
      this.setData({ searchResults: [] });
    }
  },

  doSearch: function(keyword) {
    var results = [];
    var kw = keyword.toLowerCase();
    
    this.data.zones.forEach(function(zone) {
      if (zone.sections) {
        zone.sections.forEach(function(section) {
          if (section.items) {
            section.items.forEach(function(item) {
              var nameMatch = item.name && item.name.toLowerCase().indexOf(kw) > -1;
              var aliasMatch = item.alias && item.alias.toLowerCase().indexOf(kw) > -1;
              if (nameMatch || aliasMatch) {
                results.push({
                  item: item,
                  zoneName: zone.name,
                  sectionTitle: section.title
                });
              }
            });
          }
        });
      }
    });
    
    this.setData({ searchResults: results });
  },

  onHotKeywordTap: function(e) {
    var keyword = e.currentTarget.dataset.keyword;
    this.setData({ searchKeyword: keyword });
    this.doSearch(keyword);
    this.saveSearchHistory(keyword);
  },

  onHistoryTap: function(e) {
    var keyword = e.currentTarget.dataset.keyword;
    this.setData({ searchKeyword: keyword });
    this.doSearch(keyword);
  },

  saveSearchHistory: function(keyword) {
    var history = this.data.searchHistory;
    var index = history.indexOf(keyword);
    if (index > -1) {
      history.splice(index, 1);
    }
    history.unshift(keyword);
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    wx.setStorageSync('gallerySearchHistory', history);
    this.setData({ searchHistory: history });
  },

  clearHistory: function() {
    wx.setStorageSync('gallerySearchHistory', []);
    this.setData({ searchHistory: [] });
  },

  onSearchResultTap: function(e) {
    var item = e.currentTarget.dataset.item;
    this.setData({
      showSearch: false,
      showDetail: true,
      currentItem: item,
      searchKeyword: '',
      searchResults: []
    });
    this.markAsViewed(item.id);
    this.saveSearchHistory(this.data.searchKeyword || item.name);
  },

  locateItem: function(itemId) {
    var that = this;
    this.data.zones.forEach(function(zone, zoneIndex) {
      if (zone.sections) {
        zone.sections.forEach(function(section, sectionIndex) {
          if (section.items) {
            section.items.forEach(function(item, itemIndex) {
              if (item.id === itemId) {
                that.setData({
                  currentZoneIndex: zoneIndex,
                  currentZone: zone,
                  currentSectionIndex: sectionIndex,
                  currentSection: section,
                  items: section.items,
                  showDetail: true,
                  currentItem: item,
                  currentItemIndex: itemIndex
                });
              }
            });
          }
        });
      }
    });
  },

  goToFavorites: function() {
    wx.navigateTo({ url: '/pages/gallery-favorites/gallery-favorites' });
  },

  onShareAppMessage: function() {
    var item = this.data.currentItem;
    if (item) {
      return {
        title: '【禁毒科普】' + item.name,
        path: '/pages/gallery/gallery?itemId=' + item.id,
        imageUrl: item.image
      };
    }
    return {
      title: '绂佹瘨鏁欒偛浜戝睍棣?- 鍥炬枃娴忚',
      path: '/pages/gallery/gallery'
    };
  },

  stopPropagation: function() {}
});



