/**
 * 互动故事《职场抉择》- 职场篇数据
 * 版本：V2.0 - 视频互动版
 */

var appConfig = require('../config/app.js');

function getVideoUrl(filename) {
  var baseUrl = appConfig.imageBaseUrl || 'https://oss.bjgjlc.com/drug-education';
  return baseUrl + '/story-workplace/videos/' + filename;
}

var storyWorkplaceData = {
  info: {
    id: 'story_workplace',
    title: '职场抉择 - 职场篇',
    version: '2.0',
    description: '设计公司骨干阿凯面临的职场诱惑',
    estimatedTime: '3-5分钟',
    totalEndings: 2
  },

  characters: {
    akai: { id: 'akai', name: '阿凯', avatar: '' }
  },

  scenes: {
    // 开场场景 - 视频播放
    scene_opening: {
      id: 'scene_opening',
      type: 'video',
      title: '庆功宴上的诱惑',
      videoUrl: getVideoUrl('workplace_intro.mp4'),
      nextScene: 'choice_first'
    },

    // 第一次选择
    choice_first: {
      id: 'choice_first',
      type: 'choice',
      title: '你会怎么做？',
      question: '同事递来的"提神烟"...',
      description: '阿凯会如何选择？',
      countdown: 15,
      options: [
        { id: 'A', text: '接过烟卷', description: '大家都在抽，试试应该没事吧...', label: '随波逐流', labelColor: '#F44336', nextScene: 'scene_video_accept', points: 0 },
        { id: 'B', text: '拒绝烟卷', description: '不，我不需要这种东西来提神。', label: '坚守底线', labelColor: '#4CAF50', nextScene: 'scene_video_refuse', points: 15 }
      ]
    },

    // 选项1视频：接过烟卷
    scene_video_accept: {
      id: 'scene_video_accept',
      type: 'video',
      title: '接过烟卷后',
      videoUrl: getVideoUrl('workplace_choice1_accept.mp4'),
      nextScene: 'ending_bad'
    },

    // 选项2视频：拒绝烟卷
    scene_video_refuse: {
      id: 'scene_video_refuse',
      type: 'video',
      title: '拒绝烟卷后',
      videoUrl: getVideoUrl('workplace_choice2_refuse.mp4'),
      nextScene: 'ending_good'
    },

    // 坏结局
    ending_bad: {
      id: 'ending_bad',
      type: 'ending',
      title: '职场沦陷',
      rating: 1,
      ratingText: '警示结局',
      isGoodEnding: false,
      reflection: '阿凯很快成瘾，上班哈欠连天，\n方案频频出错，客户流失。\n最终被公司辞退。\n\n一支"提神烟"，\n毁掉了他的职业生涯。',
      warning: '毒品会摧毁你的一切，\n包括你的事业和未来。\n\n珍爱生命，远离毒品。',
      points: 10,
      achievement: { id: 'achievement_warning', name: '警钟长鸣', description: '你见证了毒品对职场的毁灭性打击' }
    },

    // 好结局
    ending_good: {
      id: 'ending_good',
      type: 'ending',
      title: '职场家庭双丰收',
      rating: 5,
      ratingText: '最佳结局',
      isGoodEnding: true,
      reflection: '阿凯专注工作，接连拿下大单，\n晋升设计总监。\n带家人出国度假，\n职场家庭双丰收。\n\n拒绝毒品，\n才能拥抱美好未来。',
      points: 80,
      achievement: { id: 'achievement_principle', name: '坚守底线', description: '你选择了拒绝诱惑，收获了精彩人生' }
    }
  }
};

module.exports = { storyWorkplaceData };
