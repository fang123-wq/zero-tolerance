/**
 * 互动故事《无名英雄》- 英雄篇数据
 * 版本：V1.0
 */

var appConfig = require('../config/app.js');

// 获取图片URL的辅助函数
function getImageUrl(filename) {
  var baseUrl = appConfig.imageBaseUrl || 'https://oss.bjgjlc.com/drug-education';
  return baseUrl + '/story-hero/' + filename;
}

// 获取语音URL的辅助函数
function getAudioUrl(sceneId, type, index, character) {
  var baseUrl = appConfig.imageBaseUrl || 'https://oss.bjgjlc.com/drug-education';
  if (type === 'narration') {
    return baseUrl + '/story-hero/audio/' + sceneId + '/narration.mp3';
  } else if (type === 'dialogue') {
    return baseUrl + '/story-hero/audio/' + sceneId + '/dialogue_' + index + '_' + character + '.mp3';
  }
  return '';
}

var storyHeroData = {
  info: {
    id: 'story_hero',
    title: '无名英雄 - 英雄篇',
    version: '1.0',
    description: '走进缉毒警察的世界，感受他们的牺牲与坚守',
    estimatedTime: '5-8分钟',
    totalEndings: 6
  },

  characters: {
    liming: { id: 'liming', name: '李铭', avatar: '' },
    linwan: { id: 'linwan', name: '林婉', avatar: '' },
    zhangdui: { id: 'zhangdui', name: '张队长', avatar: '' },
    xiaowang: { id: 'xiaowang', name: '小王', avatar: '' },
    duijiangi: { id: 'duijiangi', name: '对讲机', avatar: '' },
    hushi: { id: 'hushi', name: '护士', avatar: '' }
  },

  scenes: {
    // 开场场景
    scene_opening: {
      id: 'scene_opening',
      type: 'normal',
      title: '深夜的电话',
      images: [getImageUrl('scene_opening_compressed.jpg')],
      dialogues: [
        { character: 'zhangdui', text: '李铭，紧急任务。"蝎子"的线索有了突破，今晚可能是抓住他的唯一机会。', action: '电话那头，声音急促', audio: getAudioUrl('scene_opening', 'dialogue', 0, 'zhangdui') }
      ],
      narration: '凌晨2点，城市已经沉睡。\n李铭的手机突然响起。\n\n他看了眼身边熟睡的妻子林婉——\n她已经怀孕7个月了。\n\n"蝎子"——这个名字他追了三年。\n他的毒品害死了多少家庭，\n毁掉了多少年轻人的未来。\n\n今晚，也许就是终结的时刻。',
      narrationAudio: getAudioUrl('scene_opening', 'narration'),
      music: { name: '紧张氛围', url: '' },
      nextScene: 'scene_bedroom',
      button: { text: '继续' }
    },

    // 卧室告别
    scene_bedroom: {
      id: 'scene_bedroom',
      type: 'normal',
      title: '妻子的牵挂',
      images: [getImageUrl('scene_bedroom_compressed.jpg')],
      dialogues: [
        { character: 'linwan', text: '又要出任务？', action: '迷糊中醒来', audio: getAudioUrl('scene_bedroom', 'dialogue', 0, 'linwan') },
        { character: 'liming', text: '嗯，你继续睡，我很快回来。', action: '轻声', audio: getAudioUrl('scene_bedroom', 'dialogue', 1, 'liming') },
        { character: 'linwan', text: '小心点...宝宝还等着见爸爸呢。', action: '握住他的手', audio: getAudioUrl('scene_bedroom', 'dialogue', 2, 'linwan') }
      ],
      narration: '每次出任务前，李铭都会看看她的脸。\n这是他坚持下去的理由，\n也是他最大的牵挂。',
      narrationAudio: getAudioUrl('scene_bedroom', 'narration'),
      music: { name: '温情', url: '' },
      nextScene: 'scene_briefing',
      button: { text: '前往大队' }
    },

    // 任务简报
    scene_briefing: {
      id: 'scene_briefing',
      type: 'normal',
      title: '任务简报',
      images: [getImageUrl('scene_briefing_compressed.jpg')],
      dialogues: [
        { character: 'zhangdui', text: '各位，我们追踪"蝎子"三年了。今晚，线人阿坤传来消息——他将在码头进行一笔大交易。', action: '表情严肃', audio: getAudioUrl('scene_briefing', 'dialogue', 0, 'zhangdui') },
        { character: 'zhangdui', text: '这是我们最接近他的一次。但是..."蝎子"手下有重武器，这次行动，风险极高。', action: '停顿', audio: getAudioUrl('scene_briefing', 'dialogue', 1, 'zhangdui') },
        { character: 'xiaowang', text: '队长，我们有多少人？', audio: getAudioUrl('scene_briefing', 'dialogue', 2, 'xiaowang') },
        { character: 'zhangdui', text: '能调动的只有8个人。对方至少20人，还有枪。', action: '看向李铭', audio: getAudioUrl('scene_briefing', 'dialogue', 3, 'zhangdui') }
      ],
      narration: '会议室里灯光昏暗，\n白板上贴满了"蝎子"的资料和照片。\n\n三年的追踪，无数次的失败，\n今晚，终于等到了这个机会。',
      narrationAudio: getAudioUrl('scene_briefing', 'narration'),
      music: { name: '紧张', url: '' },
      nextScene: 'scene_office',
      button: { text: '继续' }
    },

    // 决策时刻
    scene_office: {
      id: 'scene_office',
      type: 'normal',
      title: '艰难的抉择',
      images: [getImageUrl('scene_office_compressed.jpg')],
      dialogues: [
        { character: 'zhangdui', text: '李铭，你妻子快生了...这次任务，你可以不参加。', action: '看向李铭', audio: getAudioUrl('scene_office', 'dialogue', 0, 'zhangdui') }
      ],
      narration: '会议室里一片沉默。\n所有人都看着李铭。\n\n他想起了妻子的话，\n也想起了被"蝎子"毒品害死的表弟...',
      narrationAudio: getAudioUrl('scene_office', 'narration'),
      music: { name: '抉择', url: '' },
      nextScene: 'choice_first',
      button: { text: '做出选择' }
    },

    // 第一次选择
    choice_first: {
      id: 'choice_first',
      type: 'choice',
      title: '第一次选择：面对危险任务',
      question: '队长说你可以不参加这次任务...',
      description: '你会怎么做？',
      countdown: 15,
      options: [
        { id: 'A', text: '主动请缨', description: '队长，我必须去', label: '使命担当', labelColor: '#E53935', nextScene: 'scene_a1', points: 10 },
        { id: 'B', text: '内心挣扎', description: '让我想一想...', label: '艰难抉择', labelColor: '#FB8C00', nextScene: 'scene_b1', points: 5 },
        { id: 'C', text: '选择退出', description: '队长，这次我...', label: '家庭优先', labelColor: '#43A047', nextScene: 'scene_c1', points: 5 }
      ],
      music: { name: 'choice', url: '' }
    },

    // ==================== A线：使命担当 ====================
    scene_a1: {
      id: 'scene_a1',
      type: 'normal',
      title: '义无反顾',
      images: [getImageUrl('scene_office_compressed.jpg')],
      dialogues: [
        { character: 'liming', text: '队长，"蝎子"的毒品害死了我表弟。三年了，我一直在等这个机会。今晚，我必须去。', action: '站起来', audio: getAudioUrl('scene_a1', 'dialogue', 0, 'liming') },
        { character: 'zhangdui', text: '我知道你的决心。但是李铭，答应我——活着回来。', action: '点头', audio: getAudioUrl('scene_a1', 'dialogue', 1, 'zhangdui') },
        { character: 'liming', text: '队长放心。', audio: getAudioUrl('scene_a1', 'dialogue', 2, 'liming') },
        { character: 'liming', text: '兄弟们，今晚我们并肩作战。为了那些被毒品毁掉的家庭，为了我们身后的城市——出发！', action: '转身对同事们', audio: getAudioUrl('scene_a1', 'dialogue', 3, 'liming') }
      ],
      narration: '李铭站起来，眼神坚定。他知道，这一刻，他必须做出选择。',
      narrationAudio: getAudioUrl('scene_a1', 'narration'),
      music: { name: '热血', url: '' },
      nextScene: 'scene_a_dock',
      button: { text: '前往码头' }
    },

    scene_a_dock: {
      id: 'scene_a_dock',
      type: 'normal',
      title: '码头潜伏',
      images: [getImageUrl('scene_a_dock_compressed.jpg')],
      dialogues: [
        { character: 'duijiangi', text: '报告，目标车辆出现，三辆黑色SUV，正在靠近。', audio: getAudioUrl('scene_a2', 'dialogue', 0, 'duijiangi') },
        { character: 'liming', text: '所有人注意，等我信号。', action: '低声', audio: getAudioUrl('scene_a2', 'dialogue', 1, 'liming') }
      ],
      narration: '码头，凌晨3点。空气中弥漫着海水的咸腥味。李铭带领小组潜伏在集装箱后面，等待"蝎子"的出现。',
      narrationAudio: getAudioUrl('scene_a2', 'narration'),
      music: { name: '潜伏', url: '' },
      nextScene: 'scene_a_action',
      button: { text: '继续' }
    },

    scene_a_action: {
      id: 'scene_a_action',
      type: 'normal',
      title: '意外发生',
      images: [getImageUrl('scene_a_action_compressed.jpg')],
      dialogues: [
        { character: 'xiaowang', text: '有埋伏！保护老大！', action: '毒枭手下大喊', audio: getAudioUrl('scene_a2', 'dialogue', 2, 'baoan') }
      ],
      narration: '车门打开，一个戴墨镜的男人走下来。\n"蝎子"——终于现身了。\n\n就在这时，意外发生了——\n一个巡逻的保安发现了潜伏的警察！\n\n枪声响起，场面瞬间混乱。\n"蝎子"正在向车里跑去！',
      music: { name: '紧张', url: '' },
      effects: { animation: 'shake' },
      nextScene: 'choice_second_a',
      button: { text: '危急时刻' }
    },

    choice_second_a: {
      id: 'choice_second_a',
      type: 'choice',
      title: '第二次选择：危急时刻',
      question: '"蝎子"正在逃跑，如果让他上车，就会功亏一篑！',
      description: '你会怎么做？',
      countdown: 10,
      options: [
        { id: 'A1', text: '强攻突击', description: '全体出击！不能让他跑了！', label: '英勇冲锋', labelColor: '#E53935', nextScene: 'ending_a1', points: 30 },
        { id: 'A2', text: '智取包围', description: '分散包围，切断退路！', label: '冷静指挥', labelColor: '#1E88E5', nextScene: 'ending_a2', points: 25 }
      ]
    },

    // ==================== B线：艰难抉择 ====================
    scene_b1: {
      id: 'scene_b1',
      type: 'normal',
      title: '内心挣扎',
      images: [getImageUrl('scene_b_call_compressed.jpg')],
      dialogues: [
        { character: 'liming', text: '队长，让我想一想...', action: '低头', audio: getAudioUrl('scene_b1', 'dialogue', 0, 'liming') },
        { character: 'zhangdui', text: '李铭，我明白。家庭和使命，从来都是最难的选择。', action: '理解地', audio: getAudioUrl('scene_b1', 'dialogue', 1, 'zhangdui') },
        { character: 'liming', text: '她说，宝宝还等着见爸爸。', audio: getAudioUrl('scene_b1', 'dialogue', 2, 'liming') },
        { character: 'zhangdui', text: '你有5分钟时间决定。无论你怎么选，我都尊重。', audio: getAudioUrl('scene_b1', 'dialogue', 3, 'zhangdui') }
      ],
      narration: '李铭低下头，看着手机里妻子的照片。她的笑容那么温暖，肚子里的孩子还在等着见爸爸。',
      narrationAudio: getAudioUrl('scene_b1', 'narration'),
      music: { name: '纠结', url: '' },
      nextScene: 'scene_b2',
      button: { text: '打电话' }
    },

    scene_b2: {
      id: 'scene_b2',
      type: 'normal',
      title: '妻子的支持',
      images: [getImageUrl('scene_bedroom_compressed.jpg')],
      dialogues: [
        { character: 'linwan', text: '老公，你还没出发吗？', action: '电话', audio: getAudioUrl('scene_b2', 'dialogue', 0, 'linwan') },
        { character: 'liming', text: '婉儿，我。', audio: getAudioUrl('scene_b2', 'dialogue', 1, 'liming') },
        { character: 'linwan', text: '我知道你在想什么。你是警察，抓坏人是你的责任。我和宝宝会等你回来。', action: '温柔但坚定', audio: getAudioUrl('scene_b2', 'dialogue', 2, 'linwan') },
        { character: 'linwan', text: '但是，答应我——一定要平安。', audio: getAudioUrl('scene_b2', 'dialogue', 3, 'linwan') },
        { character: 'liming', text: '婉儿。', audio: getAudioUrl('scene_b2', 'dialogue', 4, 'liming') },
        { character: 'linwan', text: '去吧，我相信你。我们的孩子，需要一个英雄爸爸。', audio: getAudioUrl('scene_b2', 'dialogue', 5, 'linwan') }
      ],
      narration: '电话那头，林婉的声音温柔而坚定。她比任何人都了解自己的丈夫。',
      narrationAudio: getAudioUrl('scene_b2', 'narration'),
      music: { name: '温情', url: '' },
      nextScene: 'choice_second_b',
      button: { text: '做出决定' }
    },

    choice_second_b: {
      id: 'choice_second_b',
      type: 'choice',
      title: '第二次选择：最终决定',
      question: '妻子的话给了你力量...',
      description: '你会怎么做？',
      countdown: 10,
      options: [
        { id: 'B1', text: '决定参加', description: '队长，我去！', label: '勇敢前行', labelColor: '#E53935', nextScene: 'scene_b3', points: 20 },
        { id: 'B2', text: '留守后方', description: '我在后方支援', label: '另一种担当', labelColor: '#1E88E5', nextScene: 'ending_b2', points: 15 }
      ]
    },

    scene_b3: {
      id: 'scene_b3',
      type: 'normal',
      title: '穿上战衣',
      images: [getImageUrl('scene_b_decide_compressed.jpg')],
      dialogues: [
        { character: 'liming', text: '队长，我去！婉儿说，我们的孩子需要一个英雄爸爸。', action: '穿上防弹衣' }
      ],
      narration: '李铭穿上防弹衣，\n眼神变得坚定。\n\n为了妻子，为了孩子，\n更为了那些被毒品毁掉的家庭。',
      music: { name: '出征', url: '' },
      nextScene: 'ending_b1',
      button: { text: '出发' }
    },

    // ==================== C线：家庭优先 ====================
    scene_c1: {
      id: 'scene_c1',
      type: 'normal',
      title: '艰难的决定',
      images: [getImageUrl('scene_office_compressed.jpg')],
      dialogues: [
        { character: 'liming', text: '队长，这次...我想请假。婉儿快生了，我不能...', action: '声音低沉', audio: getAudioUrl('scene_c1', 'dialogue', 0, 'liming') },
        { character: 'zhangdui', text: '李铭，我理解。家人永远是最重要的。', action: '沉默片刻', audio: getAudioUrl('scene_c1', 'dialogue', 1, 'zhangdui') },
        { character: 'xiaowang', text: '李哥，你放心，我们能行的！', audio: getAudioUrl('scene_c1', 'dialogue', 2, 'xiaowang') },
        { character: 'liming', text: '兄弟们，对不起...', action: '愧疚', audio: getAudioUrl('scene_c1', 'dialogue', 3, 'liming') },
        { character: 'zhangdui', text: '不用道歉。你已经为这份工作付出太多了。今晚，好好陪陪嫂子。', audio: getAudioUrl('scene_c1', 'dialogue', 4, 'zhangdui') }
      ],
      narration: '李铭的声音有些低沉。他知道，这个决定会让他愧疚很久。但是，家人永远是最重要的。',
      narrationAudio: getAudioUrl('scene_c1', 'narration'),
      music: { name: '沉重', url: '' },
      nextScene: 'scene_c2',
      button: { text: '回家' }
    },

    scene_c2: {
      id: 'scene_c2',
      type: 'normal',
      title: '深夜的等待',
      images: [getImageUrl('scene_c_home_compressed.jpg')],
      dialogues: [
        { character: 'liming', text: '该死...', action: '握紧拳头', audio: getAudioUrl('scene_c2', 'dialogue', 0, 'liming') },
        { character: 'linwan', text: '你在担心他们？', action: '走出来', audio: getAudioUrl('scene_c2', 'dialogue', 1, 'linwan') },
        { character: 'liming', text: '我应该和他们在一起的...', audio: getAudioUrl('scene_c2', 'dialogue', 2, 'liming') },
        { character: 'linwan', text: '你做了正确的选择。他们会没事的。', audio: getAudioUrl('scene_c2', 'dialogue', 3, 'linwan') }
      ],
      narration: '李铭回到家，却无法入睡。他坐在客厅，盯着手机。对讲机里传来断断续续的声音：目标出现，交火！需要支援！小王受伤了！',
      narrationAudio: getAudioUrl('scene_c2', 'narration'),
      music: { name: '焦虑', url: '' },
      nextScene: 'choice_second_c',
      button: { text: '内心煎熬' }
    },

    choice_second_c: {
      id: 'choice_second_c',
      type: 'choice',
      title: '第二次选择：内心的煎熬',
      question: '对讲机里传来激烈的枪声，战友需要支援...',
      description: '你会怎么做？',
      countdown: 10,
      options: [
        { id: 'C1', text: '赶去支援', description: '我不能坐在这里！', label: '无法袖手旁观', labelColor: '#E53935', nextScene: 'ending_c1', points: 22 },
        { id: 'C2', text: '留在家中', description: '我相信他们', label: '守护家人', labelColor: '#43A047', nextScene: 'ending_c2', points: 12 }
      ]
    },

    // ==================== 结局 ====================
    
    // 结局A1：英雄牺牲
    ending_a1: {
      id: 'ending_a1',
      type: 'ending',
      title: '英雄牺牲',
      rating: 5,
      ratingText: '最崇高的结局',
      images: [getImageUrl('ending_a1_compressed.jpg')],
      dialogues: [
        { character: 'linwan', text: '孩子，你爸爸是英雄。他用生命守护了这座城市。', action: '抱着刚出生的儿子，泪流满面', audio: getAudioUrl('ending_a1', 'dialogue', 0, 'linwan') }
      ],
      reflection: '李铭冲在最前面，\n为战友挡住了致命的子弹。\n\n"蝎子"被成功抓获，\n但李铭永远留在了那个夜晚。\n\n追悼会上，林婉抱着刚出生的儿子，\n泪流满面。\n\n这不是故事，这是现实。\n每年，都有缉毒警察牺牲在一线。\n他们是无名英雄，\n用生命守护万家灯火。\n\n致敬，所有缉毒英雄！',
      descriptionAudio: getAudioUrl('ending_a1', 'narration'),
      music: { name: '致敬', url: '' },
      points: 60,
      achievement: { id: 'achievement_hero', name: '无名英雄', description: '你选择了最崇高的牺牲，致敬所有缉毒英雄' }
    },

    // 结局A2：完美收网
    ending_a2: {
      id: 'ending_a2',
      type: 'ending',
      title: '完美收网',
      rating: 5,
      ratingText: '最完美的结局',
      images: [getImageUrl('ending_a2_compressed.jpg')],
      dialogues: [
        { character: 'zhangdui', text: '李铭，干得漂亮！', audio: getAudioUrl('ending_a2', 'dialogue', 0, 'zhangdui') },
        { character: 'liming', text: '是大家的功劳。队长，我得赶紧回去了，婉儿说宝宝快出来了！', action: '看着手机', audio: getAudioUrl('ending_a2', 'dialogue', 1, 'liming') }
      ],
      reflection: '李铭的战术部署完美执行。\n"蝎子"及其团伙全部落网，\n缴获毒品500公斤。\n\n那一夜，李铭既是英雄，\n也是即将迎接新生命的父亲。\n\n使命与家庭，\n在这一刻完美交汇。',
      descriptionAudio: getAudioUrl('ending_a2', 'narration'),
      music: { name: '胜利', url: '' },
      points: 50,
      achievement: { id: 'achievement_perfect', name: '完美收网', description: '你用智慧和勇气，完成了最完美的行动' }
    },

    // 结局B1：负伤凯旋
    ending_b1: {
      id: 'ending_b1',
      type: 'ending',
      title: '负伤凯旋',
      rating: 4,
      ratingText: '英勇的结局',
      images: [getImageUrl('ending_b1_compressed.jpg')],
      dialogues: [
        { character: 'linwan', text: '你这个傻瓜...', action: '握着他的手，泪流满面', audio: getAudioUrl('ending_b1', 'dialogue', 0, 'linwan') },
        { character: 'liming', text: '我答应过你，活着回来。', action: '虚弱地笑', audio: getAudioUrl('ending_b1', 'dialogue', 1, 'liming') },
        { character: 'linwan', text: '以后不许再这样了！', audio: getAudioUrl('ending_b1', 'dialogue', 2, 'linwan') },
        { character: 'liming', text: '好...我答应你。', audio: getAudioUrl('ending_b1', 'dialogue', 3, 'liming') }
      ],
      reflection: '行动中，李铭腿部中弹。\n但"蝎子"被成功抓获。\n\n三个月后，李铭康复出院。\n同一天，他的儿子出生了。\n\n他给儿子取名"李安"——\n平安的安。',
      descriptionAudio: getAudioUrl('ending_b1', 'narration'),
      music: { name: '温情', url: '' },
      points: 40,
      achievement: { id: 'achievement_brave', name: '负伤凯旋', description: '你用伤疤换来了胜利，这就是缉毒警察的日常' }
    },

    // 结局B2：遗憾与释然
    ending_b2: {
      id: 'ending_b2',
      type: 'ending',
      title: '遗憾与释然',
      rating: 3,
      ratingText: '另一种担当',
      images: [getImageUrl('ending_b2_compressed.jpg')],
      dialogues: [
        { character: 'zhangdui', text: '李铭，你的指挥功不可没！', action: '凯旋归来', audio: getAudioUrl('ending_b2', 'dialogue', 0, 'zhangdui') },
        { character: 'liming', text: '我应该和他们在一起的...', audio: getAudioUrl('ending_b2', 'dialogue', 1, 'liming') },
        { character: 'zhangdui', text: '每个人都有自己的位置。你即将成为父亲，守护家人，也是一种英雄。', audio: getAudioUrl('ending_b2', 'dialogue', 2, 'zhangdui') }
      ],
      reflection: '李铭选择留在后方指挥。\n他的战术建议帮助前线成功抓获"蝎子"。\n\n但他心里，始终有一丝遗憾。\n\n那一夜，李铭明白了——\n英雄不只是冲锋陷阵，\n也是默默守护。',
      descriptionAudio: getAudioUrl('ending_b2', 'narration'),
      music: { name: '释然', url: '' },
      points: 30,
      achievement: { id: 'achievement_support', name: '后方英雄', description: '你用另一种方式参与了战斗，同样功不可没' }
    },

    // 结局C1：关键时刻
    ending_c1: {
      id: 'ending_c1',
      type: 'ending',
      title: '关键时刻',
      rating: 4,
      ratingText: '扭转乾坤',
      images: [getImageUrl('ending_c1_compressed.jpg')],
      dialogues: [
        { character: 'liming', text: '蝎子，你跑不掉了！', action: '在码头拦住逃跑的车', audio: getAudioUrl('ending_c1', 'dialogue', 0, 'liming') }
      ],
      reflection: '李铭无法坐视不管。\n他驾车赶往码头。\n\n就在"蝎子"即将逃脱的瞬间，\n李铭的车拦住了他的去路。\n\n那一夜，李铭的出现扭转了战局。\n"蝎子"落网，战友获救。\n\n回到家，林婉抱住他，\n什么都没说。\n\n她知道，这就是她爱的那个男人——\n一个永远无法对正义袖手旁观的人。',
      descriptionAudio: getAudioUrl('ending_c1', 'narration'),
      music: { name: '热血', url: '' },
      points: 45,
      achievement: { id: 'achievement_key', name: '关键先生', description: '你在关键时刻出现，扭转了战局' }
    },

    // 结局C2：另一种守护
    ending_c2: {
      id: 'ending_c2',
      type: 'ending',
      title: '另一种守护',
      rating: 3,
      ratingText: '温暖的结局',
      images: [getImageUrl('ending_c2_compressed.jpg')],
      dialogues: [
        { character: 'liming', text: '儿子，爸爸今天没能去抓坏人。但爸爸守护了你和妈妈。', action: '抱着孩子', audio: getAudioUrl('ending_c2', 'dialogue', 0, 'liming') }
      ],
      reflection: '李铭选择留在家中。\n那一夜，林婉突然腹痛。\n\n他紧急送妻子去医院，\n在产房外焦急等待。\n\n凌晨5点，孩子出生了。\n同一时刻，新闻传来——\n"蝎子"被成功抓获。\n\n英雄有很多种。\n有人冲锋陷阵，\n有人守护家人。\n\n每一种选择，\n都值得尊重。',
      descriptionAudio: getAudioUrl('ending_c2', 'narration'),
      music: { name: '温馨', url: '' },
      points: 25,
      achievement: { id: 'achievement_family', name: '家庭守护者', description: '你选择了守护家人，迎来了新生命的诞生' }
    },

    // 致敬结尾（所有结局后展示）
    ending_tribute: {
      id: 'ending_tribute',
      type: 'tribute',
      title: '致敬缉毒英雄',
      images: [getImageUrl('ending_tribute_compressed.jpg')],
      text: '据统计，近年来全国有数百名缉毒警察\n在执行任务中牺牲。\n\n他们是父亲、丈夫、儿子，\n也是守护我们的无名英雄。\n\n他们的名字可能不为人知，\n但他们的牺牲，\n换来了万家灯火的安宁。\n\n珍爱生命，远离毒品。\n致敬，所有缉毒英雄！',
      narrationAudio: getAudioUrl('scene_tribute', 'narration')
    }
  }
};

module.exports = { storyHeroData };
