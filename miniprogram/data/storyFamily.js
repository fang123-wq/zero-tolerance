/**
 * 互动故事《深夜的烟卷》- 家庭篇数据
 * 版本：V2.0
 */

var appConfig = require('../config/app.js');

// 获取图片URL的辅助函数
function getImageUrl(filename) {
  var baseUrl = appConfig.imageBaseUrl || 'https://oss.bjgjlc.com/drug-education';
  return baseUrl + '/story-family/' + filename;
}

// 获取视频URL的辅助函数
function getVideoUrl(filename) {
  var baseUrl = appConfig.imageBaseUrl || 'https://oss.bjgjlc.com/drug-education';
  return baseUrl + '/story-family/videos/' + filename;
}

// 获取音频URL的辅助函数
function getAudioUrl(filename) {
  var baseUrl = appConfig.imageBaseUrl || 'https://oss.bjgjlc.com/drug-education';
  return baseUrl + '/story-family/audio/' + filename;
}

var storyFamilyData = {
  info: {
    id: 'story_family',
    title: '深夜的烟卷 - 家庭篇',
    version: '2.0',
    description: '深夜小区楼下，一根裹着锡纸的烟卷，一个改变命运的选择',
    estimatedTime: '3-5分钟',
    totalEndings: 2
  },

  characters: {
    akai: { id: 'akai', name: '阿凯', avatar: '' },
    wife: { id: 'wife', name: '妻子', avatar: '' },
    faxiao: { id: 'faxiao', name: '发小', avatar: '' }
  },

  scenes: {
    // 开场场景 - 视频播放
    scene_opening: {
      id: 'scene_opening',
      type: 'video',
      title: '深夜的烟卷',
      videoUrl: getVideoUrl('family_intro.mp4'),
      nextScene: 'choice_first'
    },

    // 视频后的选择
    choice_first: {
      id: 'choice_first',
      type: 'choice',
      title: '命运的抉择',
      question: '深夜，刚下班的阿凯在小区楼下被发小递来一根裹着锡纸的"烟卷"。家门打开，妻子抱着孩子站在门口...',
      description: '你会怎么做？',
      options: [
        { id: 'V1', text: '接过烟卷', description: '发小的面子不好拒绝，抽一口应该没事', label: '接过烟卷', labelColor: '#F44336', nextScene: 'scene_video_accept', points: 0 },
        { id: 'V2', text: '拒绝烟卷', description: '为了家人，坚决说不', label: '拒绝烟卷', labelColor: '#4CAF50', nextScene: 'scene_video_refuse', points: 20 }
      ]
    },

    // 选项1视频：接过烟卷
    scene_video_accept: {
      id: 'scene_video_accept',
      type: 'video',
      title: '接过烟卷',
      videoUrl: getVideoUrl('family_choice1_accept.mp4'),
      nextScene: 'ending_bad'
    },

    // 选项2视频：拒绝烟卷
    scene_video_refuse: {
      id: 'scene_video_refuse',
      type: 'video',
      title: '拒绝烟卷',
      videoUrl: getVideoUrl('family_choice2_refuse.mp4'),
      nextScene: 'ending_good'
    },

    // 坏结局：家庭破碎
    ending_bad: {
      id: 'ending_bad',
      type: 'ending',
      title: '破碎的家',
      rating: 1,
      ratingText: '令人痛心的结局',
      images: [getImageUrl('ending_bad_compressed.jpg')],
      reflection: '阿凯接过烟卷，从此沉迷其中。\n\n工资耗尽，还变卖了妻子的首饰。\n\n孩子发烧时，他瘫在沙发上神志不清。\n\n一根"烟卷"，毁掉了一个原本幸福的家庭。\n\n毒品不分场合、不分关系，哪怕是最亲近的人递来的，也要坚决拒绝。',
      warning: '警示：锡纸烟卷是常见的吸毒方式，常被伪装成"提神""解压"的东西。一次尝试就可能成瘾，摧毁你的家庭和人生。发现涉毒线索请拨打110或禁毒热线12345。',
      music: { name: '警示', url: getAudioUrl('ending_bad.mp3') },
      points: 50,
      achievement: { id: 'achievement_broken', name: '警钟长鸣', description: '你见证了毒品对家庭的毁灭性打击，愿以此为戒' }
    },

    // 好结局：幸福的家
    ending_good: {
      id: 'ending_good',
      type: 'ending',
      title: '温暖的家',
      rating: 5,
      ratingText: '最好的结局',
      images: [getImageUrl('ending_good_compressed.jpg')],
      reflection: '阿凯拒绝了那根烟卷，选择了家人。\n\n他换了一份轻松的工作，每天陪孩子搭积木、和妻子散步。\n\n周末全家去公园野餐，孩子举着风筝奔跑，笑声回荡在阳光里。\n\n拒绝毒品，就是守护家庭最好的方式。',
      music: { name: '幸福', url: getAudioUrl('ending_good.mp3') },
      points: 50,
      achievement: { id: 'achievement_family', name: '家庭守护者', description: '你为了家人坚决拒绝了毒品，守护了幸福的家庭' }
    }
  }
};

module.exports = { storyFamilyData };
