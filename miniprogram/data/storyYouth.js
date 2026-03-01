/**
 * 互动故事《选择的岔路》- 少年篇数据
 * 版本：V3.0
 */

var appConfig = require('../config/app.js');

// 获取图片URL的辅助函数
function getImageUrl(filename) {
  var baseUrl = appConfig.imageBaseUrl || 'https://oss.bjgjlc.com/drug-education';
  return baseUrl + '/story-youth/' + filename;
}

// 获取音频URL的辅助函数
function getAudioUrl(filename) {
  var baseUrl = appConfig.imageBaseUrl || 'https://oss.bjgjlc.com/drug-education';
  return baseUrl + '/story-youth/audio/' + filename;
}

// 获取视频URL的辅助函数
function getVideoUrl(filename) {
  var baseUrl = appConfig.imageBaseUrl || 'https://oss.bjgjlc.com/drug-education';
  return baseUrl + '/story-youth/videos/' + filename;
}

var storyYouthData = {
  info: {
    id: 'story_youth',
    title: '选择的岔路 - 少年篇',
    version: '3.0',
    description: '晚自修下课，林野在巷口被堵住，面对发小递来的"提神烟"，他该如何抉择？',
    estimatedTime: '3-5分钟',
    totalEndings: 2
  },

  characters: {
    linye: { id: 'linye', name: '林野', avatar: '' },
    faxiao: { id: 'faxiao', name: '发小', avatar: '' },
    banzhang: { id: 'banzhang', name: '班长', avatar: '' }
  },

  scenes: {
    // 开场场景 - 视频播放
    scene_opening: {
      id: 'scene_opening',
      type: 'video',
      title: '少年篇',
      videoUrl: getVideoUrl('youth_intro.mp4'),
      nextScene: 'choice_first'
    },

    // 视频后的选择
    choice_first: {
      id: 'choice_first',
      type: 'choice',
      title: '关键抉择',
      question: '晚自修下课，林野在巷口被堵住。发小递来一包"提神烟"...',
      description: '林野面前摆着两条路，你会怎么选？',
      options: [
        { id: 'V1', text: '接过烟卷', description: '接过发小递来的"提神烟"', label: '接过烟卷', labelColor: '#F44336', nextScene: 'scene_video_accept', points: 0 },
        { id: 'V2', text: '拒绝烟卷', description: '坚定地拒绝诱惑', label: '拒绝烟卷', labelColor: '#4CAF50', nextScene: 'scene_video_refuse', points: 20 }
      ]
    },

    // 选项1视频：接过烟卷
    scene_video_accept: {
      id: 'scene_video_accept',
      type: 'video',
      title: '接过烟卷',
      videoUrl: getVideoUrl('youth_choice1.mp4'),
      nextScene: 'ending_bad'
    },

    // 选项2视频：拒绝烟卷
    scene_video_refuse: {
      id: 'scene_video_refuse',
      type: 'video',
      title: '拒绝烟卷',
      videoUrl: getVideoUrl('youth_choice2.mp4'),
      nextScene: 'ending_good'
    },

    // 坏结局
    ending_bad: {
      id: 'ending_bad',
      type: 'ending',
      title: '迷失的青春',
      rating: 1,
      ratingText: '令人痛心的结局',
      images: [getImageUrl('ending_bad_compressed.jpg')],
      reflection: '林野接过了那根"提神烟"，却不知道这一口将彻底改变他的人生轨迹。\n\n从此沉迷其中，成绩一落千丈，身体日渐消瘦。\n\n毒品的魔爪一旦伸出，便再难挣脱...\n\n一根烟卷，毁掉了一个少年的青春和未来。',
      warning: '警示：所谓的"提神烟"很可能含有毒品成分。毒品善于伪装，一次尝试就可能成瘾。发现涉毒线索请拨打110或禁毒热线12345。',
      points: 10,
      achievement: { id: 'achievement_lost', name: '警钟长鸣', description: '你见证了毒品对青少年的毁灭性打击，愿以此为戒' }
    },

    // 好结局
    ending_good: {
      id: 'ending_good',
      type: 'ending',
      title: '守护的青春',
      rating: 5,
      ratingText: '最好的结局',
      images: [getImageUrl('ending_good_compressed.jpg')],
      reflection: '林野坚定地拒绝了发小的诱惑，转身走向了光明的未来。\n\n他选择了跟班长一起复习，用努力换来了优异的成绩。\n\n拒绝毒品，就是守护自己最好的选择！\n\n青春只有一次，请珍惜。',
      points: 30,
      achievement: { id: 'achievement_guardian', name: '青春守护者', description: '你坚决拒绝了毒品诱惑，守护了自己的青春' }
    }
  }
};

module.exports = { storyYouthData };
