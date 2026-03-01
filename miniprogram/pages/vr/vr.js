// pages/vr/vr.js
var api = require('../../utils/api.js');
var vrScenesData = require('../../data/vrScenes.js').vrScenes;

Page({
  data: {
    scenes: [],
    currentScene: null,
    hotspots: [],
    viewX: 0,
    viewY: 0,
    scale: 1,
    scaleMin: 0.5,
    scaleMax: 2,
    loading: true,
    showInfoModal: false,
    infoData: {},
    showHelpModal: false,
    imageWidth: 0,
    imageHeight: 0,
    displayWidth: 0,
    areaWidth: 375,
    areaHeight: 500
  },

  allScenes: [],
  allHotspots: {},
  startSceneId: 'scene_lobby',

  onLoad: function(options) {
    var that = this;
    this.startSceneId = options.scene || 'scene_lobby';
    
    setTimeout(function() {
      that.getAreaSize();
      that.loadScenesFromApi();
    }, 100);
  },

  loadScenesFromApi: function() {
    var that = this;
    api.vrApi.getScenes().then(function(data) {
      if (data && data.length > 0) {
        var scenes = data.map(function(s) {
          return {
            id: s.sceneId,
            name: s.name,
            image: s.imageUrl || '/assets/images/' + s.sceneId.replace('scene_', 'VR') + '.png',
            imageSize: { width: s.imageWidth || 4096, height: s.imageHeight || 2048 },
            hotspots: []
          };
        });
        that.allScenes = scenes;
        that.setData({ scenes: scenes });
        that.loadHotspotsForScenes(scenes);
      } else {
        // API返回空数据，使用本地数据
        that.loadLocalScenes();
      }
    }).catch(function(err) {
      console.error('加载VR场景失败，使用本地数据:', err);
      that.loadLocalScenes();
    });
  },

  // 加载本地VR场景数据
  loadLocalScenes: function() {
    var that = this;
    var localScenes = vrScenesData.scenes.map(function(s) {
      return {
        id: s.id,
        name: s.name,
        image: s.image,
        imageSize: s.imageSize,
        hotspots: s.hotspots || []
      };
    });
    that.allScenes = localScenes;
    that.setData({ scenes: localScenes });
    that.loadScene(that.startSceneId);
  },

  loadHotspotsForScenes: function(scenes) {
    var that = this;
    var promises = scenes.map(function(scene) {
      return api.vrApi.getHotspots(scene.id);
    });
    
    Promise.all(promises).then(function(results) {
      for (var i = 0; i < scenes.length; i++) {
        var hotspots = (results[i] || []).map(function(h) {
          return {
            id: h.hotspotId,
            type: h.type,
            target_id: h.targetSceneId,
            position: { x: h.positionX, y: h.positionY },
            arrow_type: h.arrowType,
            label: h.label,
            icon: h.icon,
            title: h.title,
            content: h.content,
            url: h.linkUrl
          };
        });
        that.allScenes[i].hotspots = hotspots;
      }
      that.loadScene(that.startSceneId);
    }).catch(function(err) {
      console.error('加载热点失败:', err);
      that.loadScene(that.startSceneId);
    });
  },

  getAreaSize: function() {
    var that = this;
    var query = wx.createSelectorQuery();
    query.select('.panorama-area').boundingClientRect(function(rect) {
      if (rect) {
        that.setData({
          areaWidth: rect.width,
          areaHeight: rect.height
        });
      }
    }).exec();
  },

  loadScene: function(sceneId) {
    var scene = null;
    for (var i = 0; i < this.allScenes.length; i++) {
      if (this.allScenes[i].id === sceneId) {
        scene = this.allScenes[i];
        break;
      }
    }
    if (!scene) {
      wx.showToast({ title: '场景不存在', icon: 'none' });
      return;
    }
    this.setData({
      loading: true,
      currentScene: scene,
      hotspots: [],
      viewX: 0,
      viewY: 0,
      scale: 1
    });
  },

  onImageLoad: function(e) {
    var that = this;
    var imgWidth = e.detail.width;
    var imgHeight = e.detail.height;
    
    // 计算图片显示宽度（基于高度适配）
    var displayHeight = this.data.areaHeight;
    var displayWidth = displayHeight * (imgWidth / imgHeight);
    
    this.setData({
      imageWidth: imgWidth,
      imageHeight: imgHeight,
      displayWidth: displayWidth,
      loading: false
    });
    
    // 延迟更新热点，确保布局完成
    setTimeout(function() {
      that.updateHotspots();
      console.log('图片尺寸:', imgWidth, 'x', imgHeight);
      console.log('显示尺寸:', displayWidth, 'x', displayHeight);
      console.log('热点数据:', that.data.currentScene ? that.data.currentScene.hotspots : []);
    }, 100);
  },

  updateHotspots: function() {
    var currentScene = this.data.currentScene;
    var scale = this.data.scale;
    var areaHeight = this.data.areaHeight;
    if (!currentScene || !currentScene.hotspots) return;

    var displayHeight = areaHeight;
    var displayWidth = displayHeight * (currentScene.imageSize.width / currentScene.imageSize.height);
    
    var hotspots = [];
    for (var i = 0; i < currentScene.hotspots.length; i++) {
      var hs = currentScene.hotspots[i];
      var screenX = (hs.position.x / currentScene.imageSize.width) * displayWidth * scale;
      var screenY = (hs.position.y / currentScene.imageSize.height) * displayHeight * scale;
      
      hotspots.push({
        id: hs.id,
        type: hs.type,
        target_id: hs.target_id,
        position: hs.position,
        arrow_type: hs.arrow_type,
        label: hs.label,
        icon: hs.icon,
        title: hs.title,
        content: hs.content,
        url: hs.url,
        screenX: screenX,
        screenY: screenY
      });
    }
    this.setData({ hotspots: hotspots });
  },

  onViewChange: function(e) {
    this.setData({
      viewX: e.detail.x,
      viewY: e.detail.y
    });
  },

  onScaleChange: function(e) {
    this.setData({ scale: e.detail.scale });
    this.updateHotspots();
  },

  onHotspotTap: function(e) {
    var hotspot = e.currentTarget.dataset.hotspot;
    if (!hotspot) return;

    if (hotspot.type === 'navigation') {
      this.navigateToScene(hotspot.target_id);
    } else if (hotspot.type === 'info') {
      this.showInfo(hotspot);
    } else if (hotspot.type === 'link') {
      this.navigateToPage(hotspot.url);
    }
  },

  navigateToScene: function(sceneId) {
    var that = this;
    wx.showLoading({ title: '切换中...' });
    setTimeout(function() {
      that.loadScene(sceneId);
      wx.hideLoading();
    }, 300);
  },

  showInfo: function(hotspot) {
    this.setData({
      showInfoModal: true,
      infoData: {
        title: hotspot.title,
        content: hotspot.content
      }
    });
  },

  navigateToPage: function(url) {
    wx.navigateTo({ url: url });
  },

  onSceneNavTap: function(e) {
    var sceneId = e.currentTarget.dataset.sceneId;
    if (sceneId !== this.data.currentScene.id) {
      this.navigateToScene(sceneId);
    }
  },

  closeInfoModal: function() {
    this.setData({ showInfoModal: false, infoData: {} });
  },

  showHelp: function() {
    this.setData({ showHelpModal: true });
  },

  closeHelp: function() {
    this.setData({ showHelpModal: false });
  },

  goBack: function() {
    wx.navigateBack();
  },

  stopPropagation: function() {}
});
