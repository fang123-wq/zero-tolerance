// 音频管理工具类
let bgmContext = null;
let effectContext = null;

const audioManager = {
  // 初始化背景音乐
  initBgm(src) {
    if (!bgmContext) {
      bgmContext = wx.createInnerAudioContext();
      bgmContext.loop = true;
    }
    bgmContext.src = src;
    return bgmContext;
  },

  // 播放背景音乐
  playBgm(src) {
    if (src) {
      this.initBgm(src);
    }
    if (bgmContext) {
      bgmContext.play();
    }
  },

  // 暂停背景音乐
  pauseBgm() {
    if (bgmContext) {
      bgmContext.pause();
    }
  },

  // 停止背景音乐
  stopBgm() {
    if (bgmContext) {
      bgmContext.stop();
    }
  },

  // 设置背景音乐音量
  setBgmVolume(volume) {
    if (bgmContext) {
      bgmContext.volume = volume;
    }
  },

  // 播放音效
  playEffect(src) {
    effectContext = wx.createInnerAudioContext();
    effectContext.src = src;
    effectContext.play();
    effectContext.onEnded(() => {
      effectContext.destroy();
    });
  },

  // 播放语音讲解
  playNarration(src, onEnd) {
    if (!src) {
      console.log('[audioManager] 语音URL为空');
      return null;
    }
    
    console.log('[audioManager] 播放语音:', src);
    const narrationContext = wx.createInnerAudioContext();
    narrationContext.src = src;
    
    narrationContext.onPlay(() => {
      console.log('[audioManager] 语音开始播放');
    });
    
    narrationContext.onError((err) => {
      console.error('[audioManager] 语音播放错误:', err.errCode, err.errMsg);
    });
    
    narrationContext.onEnded(() => {
      console.log('[audioManager] 语音播放结束');
      if (onEnd) onEnd();
    });
    
    narrationContext.play();
    return narrationContext;
  },

  // 销毁所有音频
  destroy() {
    if (bgmContext) {
      bgmContext.destroy();
      bgmContext = null;
    }
    if (effectContext) {
      effectContext.destroy();
      effectContext = null;
    }
  }
};

module.exports = { audioManager };
