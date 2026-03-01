var BASE_IMAGE = 'https://oss.bjgjlc.com/drug-education';

var appConfig = {
  name: '都昌禁毒云展馆',
  shortName: '都昌',
  orgName: '都昌县禁毒办',
  slogan: '珍爱生命 远离毒品'
};

var zones = [
  {
    id: 'zone1',
    zoneId: 'zone1',
    number: '01',
    name: '序厅导览',
    subtitle: '展馆总览',
    title: '认识禁毒教育云展馆',
    icon: '🏛️',
    description: '了解展馆功能与参观路线。',
    coverImage: BASE_IMAGE + '/vr/VR1.jpg',
    content: {
      intro: '这里是展馆起点，先了解毒品危害，再学习识别和防范方法。',
      highlights: ['8大主题展区', 'VR沉浸式体验', '互动答题与积分']
    },
    sections: [
      {
        id: 'z1s1',
        title: '重点提示',
        type: 'gallery',
        items: [
          {
            id: 'z1_i1',
            name: '参观须知',
            alias: '导览提示',
            image: BASE_IMAGE + '/vr/VR1.jpg',
            dangerLevel: 1,
            riskLevel: 1,
            description: '按序参观可获得更完整的禁毒知识。',
            detail: '建议从序厅到签名区依次浏览，每个展区均有互动内容。'
          },
          {
            id: 'z1_i2',
            name: '防毒口诀',
            alias: '识毒拒毒',
            image: BASE_IMAGE + '/vr/VR2.jpg',
            dangerLevel: 1,
            riskLevel: 1,
            description: '不尝试、不轻信、不传播。',
            tips: '遇到可疑物品或可疑邀约，第一时间拒绝并远离。'
          }
        ]
      }
    ],
    quiz: [
      {
        question: '国际禁毒日是每年哪一天？',
        options: ['6月26日', '5月31日', '7月1日', '12月1日'],
        answer: 0,
        explanation: '国际禁毒日为每年6月26日。'
      }
    ],
    stats: { signatures: 0 }
  },
  {
    id: 'zone2',
    zoneId: 'zone2',
    number: '02',
    name: '认识毒品',
    subtitle: '毒品识别',
    title: '常见毒品与伪装形式',
    icon: '🧪',
    description: '识别传统毒品与新型伪装毒品。',
    coverImage: BASE_IMAGE + '/vr/VR2.jpg',
    content: {
      intro: '毒品可能伪装成零食、饮料或电子烟，识别是第一步。',
      highlights: ['伪装毒品样态', '高危场景识别', '误区纠正']
    },
    sections: [
      {
        id: 'z2s1',
        title: '常见伪装',
        type: 'gallery',
        items: [
          {
            id: 'drug_milk_tea',
            name: '奶茶粉',
            alias: '伪装冲饮',
            image: BASE_IMAGE + '/drug/drug-recognize1.jpg',
            dangerLevel: 4,
            riskLevel: 4,
            description: '外观接近冲饮粉末，具有很强迷惑性。',
            harm: '可导致神经兴奋异常、成瘾风险显著上升。',
            tips: '不接受陌生来源冲调食品。'
          },
          {
            id: 'drug_jump_candy',
            name: '跳跳糖毒品伪装',
            alias: '零食伪装',
            image: BASE_IMAGE + '/drug/drug-recognize2.jpg',
            dangerLevel: 5,
            riskLevel: 5,
            description: '借助包装和口味掩盖真实成分。',
            harm: '短时间可出现心率异常、意识障碍。',
            tips: '来源不明零食坚决不尝试。'
          }
        ]
      }
    ],
    quiz: [
      {
        question: '毒品最常见的伪装方式是？',
        options: ['食品和饮料', '课本', '文具', '衣物'],
        answer: 0,
        explanation: '新型毒品常伪装成奶茶粉、糖果等。'
      }
    ],
    stats: { signatures: 0 }
  },
  {
    id: 'zone3',
    zoneId: 'zone3',
    number: '03',
    name: '危害警示',
    subtitle: '身心损害',
    title: '毒品对个人与家庭的危害',
    icon: '⚠️',
    description: '了解毒品造成的生理、心理和社会危害。',
    coverImage: BASE_IMAGE + '/vr/VR3.jpg',
    content: {
      intro: '毒品危害不仅发生在个人，也会破坏家庭和社会关系。',
      highlights: ['器官损伤', '心理障碍', '家庭破裂风险']
    },
    sections: [
      {
        id: 'z3s1',
        title: '危害案例',
        type: 'gallery',
        items: [
          {
            id: 'harm_brain',
            name: '大脑损伤',
            image: BASE_IMAGE + '/drug/%E5%A4%A7%E8%84%91%E6%8D%9F%E4%BC%A4.jpg',
            dangerLevel: 5,
            riskLevel: 5,
            description: '长期使用可损伤认知与情绪调节能力。',
            harm: '冲动控制下降，判断力受损。'
          },
          {
            id: 'harm_heart',
            name: '心脏受损',
            image: BASE_IMAGE + '/drug/%E5%BF%83%E8%84%8F%E5%8F%97%E6%8D%9F.jpg',
            dangerLevel: 4,
            riskLevel: 4,
            description: '可诱发心律异常和急性心血管事件。',
            harm: '严重时危及生命。'
          }
        ]
      }
    ],
    quiz: [
      {
        question: '以下哪项是毒品直接危害？',
        options: ['器官损害', '提高免疫力', '增强记忆', '改善睡眠'],
        answer: 0,
        explanation: '毒品会造成器官和神经系统损害。'
      }
    ],
    stats: { signatures: 0 }
  },
  {
    id: 'zone4',
    zoneId: 'zone4',
    number: '04',
    name: '防范拒绝',
    subtitle: '拒毒技巧',
    title: '高风险场景中的自我保护',
    icon: '🛡️',
    description: '学习拒绝毒品的可执行策略。',
    coverImage: BASE_IMAGE + '/vr/VR4.jpg',
    content: {
      intro: '掌握“坚定拒绝、迅速离开、及时求助”的三步策略。',
      highlights: ['聚会风险识别', '三步拒绝法', '应急求助方式']
    },
    sections: [
      {
        id: 'z4s1',
        title: '拒绝策略',
        type: 'gallery',
        items: [
          {
            id: 'safe_1',
            name: '坚定说不',
            image: BASE_IMAGE + '/vr/VR4.jpg',
            dangerLevel: 1,
            riskLevel: 2,
            description: '直接表达拒绝，避免模糊回应。',
            tips: '简短明确，不争辩不过度解释。'
          },
          {
            id: 'safe_2',
            name: '脱离现场',
            image: BASE_IMAGE + '/vr/VR5.jpg',
            dangerLevel: 1,
            riskLevel: 2,
            description: '发现异常后尽快离开可疑场所。',
            tips: '优先前往人多明亮区域并联系家人。'
          }
        ]
      }
    ],
    quiz: [
      {
        question: '遇到可疑“提神饮料”时，正确做法是？',
        options: ['直接拒绝并离开', '少量尝试', '先拍照再喝', '让别人先喝'],
        answer: 0,
        explanation: '拒绝并离开是最安全的选择。'
      }
    ],
    stats: { signatures: 0 }
  },
  {
    id: 'zone5',
    zoneId: 'zone5',
    number: '05',
    name: '法律法规',
    subtitle: '法治教育',
    title: '涉毒违法犯罪法律后果',
    icon: '⚖️',
    description: '了解涉毒行为的法律责任与后果。',
    coverImage: BASE_IMAGE + '/vr/VR5.jpg',
    content: {
      intro: '任何涉毒行为都可能带来严重法律后果和终身影响。',
      highlights: ['刑事责任', '行政处罚', '信用与就业影响']
    },
    sections: [
      {
        id: 'z5s1',
        title: '法律常识',
        type: 'gallery',
        items: [
          {
            id: 'law_1',
            name: '贩卖运输毒品',
            image: BASE_IMAGE + '/vr/VR5.jpg',
            dangerLevel: 5,
            riskLevel: 5,
            description: '属于严重违法犯罪行为。',
            detail: '依法追究刑责，情节严重可判处重刑。'
          },
          {
            id: 'law_2',
            name: '非法持有毒品',
            image: BASE_IMAGE + '/vr/VR6.jpg',
            dangerLevel: 4,
            riskLevel: 4,
            description: '达到法定数量可能构成犯罪。',
            detail: '涉毒记录还会对升学就业造成影响。'
          }
        ]
      }
    ],
    quiz: [
      {
        question: '下列说法正确的是？',
        options: ['涉毒行为会承担法律责任', '少量毒品不违法', '帮朋友代拿不算', '首次涉毒可免责'],
        answer: 0,
        explanation: '涉毒行为均可能产生法律责任。'
      }
    ],
    stats: { signatures: 0 }
  },
  {
    id: 'zone6',
    zoneId: 'zone6',
    number: '06',
    name: '戒毒康复',
    subtitle: '康复知识',
    title: '科学戒毒与社会支持',
    icon: '🌱',
    description: '了解科学戒毒路径与社区帮扶。',
    coverImage: BASE_IMAGE + '/vr/VR6.jpg',
    content: {
      intro: '科学戒毒需要医疗、心理、家庭和社会多方支持。',
      highlights: ['自愿戒毒', '社区康复', '持续支持体系']
    },
    sections: [
      {
        id: 'z6s1',
        title: '康复支持',
        type: 'gallery',
        items: [
          {
            id: 'rehab_1',
            name: '心理支持',
            image: BASE_IMAGE + '/vr/VR6.jpg',
            dangerLevel: 1,
            riskLevel: 2,
            description: '心理咨询可帮助降低复吸风险。'
          },
          {
            id: 'rehab_2',
            name: '社会帮扶',
            image: BASE_IMAGE + '/vr/VR7.jpg',
            dangerLevel: 1,
            riskLevel: 2,
            description: '社区支持与就业帮扶有助于回归社会。'
          }
        ]
      }
    ],
    quiz: [
      {
        question: '科学戒毒更依赖于？',
        options: ['持续治疗和支持', '单次意志力', '断绝社交', '自行停药'],
        answer: 0,
        explanation: '戒毒需要长期治疗与多方支持。'
      }
    ],
    stats: { signatures: 0 }
  },
  {
    id: 'zone7',
    zoneId: 'zone7',
    number: '07',
    name: '英雄致敬',
    subtitle: '缉毒英雄',
    title: '向缉毒英雄致敬',
    icon: '🕯️',
    description: '铭记缉毒英雄牺牲与奉献精神。',
    coverImage: BASE_IMAGE + '/vr/VR7.jpg',
    content: {
      intro: '英雄精神值得铭记，也提醒我们远离毒品。',
      highlights: ['英雄事迹', '精神传承', '点灯致敬']
    },
    sections: [
      {
        id: 'z7s1',
        title: '英雄事迹',
        type: 'gallery',
        items: [
          {
            id: 'hero_1',
            name: '缉毒英雄甲',
            image: BASE_IMAGE + '/vr/VR7.jpg',
            description: '长期奋战一线，守护人民安全。',
            sacrifice: '2021-12-18'
          },
          {
            id: 'hero_2',
            name: '禁毒服务热线',
            image: BASE_IMAGE + '/vr/VR8.jpg',
            description: '发现涉毒线索可及时咨询和举报。',
            phone: '110'
          }
        ]
      }
    ],
    quiz: [
      {
        question: '对缉毒英雄最正确的态度是？',
        options: ['尊重与铭记', '无所谓', '娱乐化传播', '恶搞戏仿'],
        answer: 0,
        explanation: '应尊重并铭记缉毒英雄。'
      }
    ],
    stats: { signatures: 0 }
  },
  {
    id: 'zone8',
    zoneId: 'zone8',
    number: '08',
    name: '承诺签名',
    subtitle: '互动参与',
    title: '签署禁毒承诺书',
    icon: '✍️',
    description: '完成签名承诺，参与全民禁毒。',
    coverImage: BASE_IMAGE + '/vr/VR8.jpg',
    content: {
      intro: '签名是承诺，更是行动起点。',
      highlights: ['签署承诺书', '线上互动', '共同守护无毒生活']
    },
    sections: [
      {
        id: 'z8s1',
        title: '禁毒承诺',
        type: 'pledge',
        pledgeText: '我承诺珍爱生命，远离毒品；主动学习禁毒知识，不参与涉毒活动。'
      },
      {
        id: 'z8s2',
        title: '签名墙',
        type: 'signatureWall'
      }
    ],
    quiz: [],
    stats: { signatures: 128956 }
  }
];

var questions = [
  {
    id: 'q1',
    question: '国际禁毒日是每年哪一天？',
    options: ['6月26日', '5月31日', '7月1日', '12月1日'],
    answer: 0,
    explanation: '国际禁毒日是每年6月26日。',
    category: 'basic'
  },
  {
    id: 'q2',
    question: '新型毒品常见伪装形式是？',
    options: ['奶茶粉、糖果', '课本', '雨伞', '电池'],
    answer: 0,
    explanation: '常见伪装包括零食和饮料。',
    category: 'identify'
  },
  {
    id: 'q3',
    question: '遇到可疑邀约时正确做法是？',
    options: ['拒绝并离开', '先尝试一点', '跟风参与', '替朋友保管'],
    answer: 0,
    explanation: '拒绝并离开是第一选择。',
    category: 'prevent'
  },
  {
    id: 'q4',
    question: '毒品会造成哪类危害？',
    options: ['生理心理与社会危害', '只有短期兴奋', '有助学习', '无依赖性'],
    answer: 0,
    explanation: '毒品危害是多维度且长期的。',
    category: 'harm'
  },
  {
    id: 'q5',
    question: '涉毒违法行为会怎样？',
    options: ['承担法律责任', '不受处罚', '仅口头警告', '与未成年人无关'],
    answer: 0,
    explanation: '涉毒行为会承担相应法律责任。',
    category: 'law'
  },
  {
    id: 'q6',
    question: '下列哪项是防毒好习惯？',
    options: ['不吃来路不明食品', '陌生饮料随便喝', '夜店陌生人递烟就尝', '帮人带可疑包裹'],
    answer: 0,
    explanation: '不接触不明来源食品饮品是基础防范。',
    category: 'prevent'
  },
  {
    id: 'q7',
    question: '“只试一次不会上瘾”这句话是？',
    options: ['错误认知', '科学结论', '法律规定', '医疗建议'],
    answer: 0,
    explanation: '毒品可能一次尝试就造成严重后果。',
    category: 'basic'
  },
  {
    id: 'q8',
    question: '发现涉毒线索应如何处理？',
    options: ['及时报警', '自行处置', '网络传播', '视而不见'],
    answer: 0,
    explanation: '及时报警和上报是正确方式。',
    category: 'law'
  },
  {
    id: 'q9',
    question: '科学戒毒强调什么？',
    options: ['长期治疗与支持', '靠意志力硬扛', '完全隔离社会', '不需要家人参与'],
    answer: 0,
    explanation: '医疗、心理、家庭和社会支持都重要。',
    category: 'harm'
  },
  {
    id: 'q10',
    question: '哪类场景更容易出现诱导吸毒？',
    options: ['复杂娱乐社交场景', '正规课堂', '图书馆阅览区', '晨跑场地'],
    answer: 0,
    explanation: '复杂社交和夜间娱乐场景风险更高。',
    category: 'identify'
  }
];

var gifts = [
  {
    id: 'gift1',
    name: '禁毒主题徽章',
    image: BASE_IMAGE + '/images/ww1.png',
    points: 120,
    stock: 50,
    description: '禁毒公益纪念徽章。'
  },
  {
    id: 'gift2',
    name: '禁毒帆布袋',
    image: BASE_IMAGE + '/images/ww2.png',
    points: 220,
    stock: 35,
    description: '环保帆布袋，印有禁毒宣传标语。'
  },
  {
    id: 'gift3',
    name: '禁毒科普手册',
    image: BASE_IMAGE + '/images/ww3.png',
    points: 80,
    stock: 120,
    description: '便携式防毒识毒知识手册。'
  }
];

var news = [
  {
    id: 'news1',
    title: '春季校园禁毒宣传周启动',
    date: '2026-02-20',
    tag: '校园',
    blocks: [
      { type: 'text', content: '多所学校开展禁毒主题班会与互动讲座。' },
      { type: 'image', src: BASE_IMAGE + '/vr/VR1.jpg' },
      { type: 'text', content: '活动重点包括新型毒品识别和自我保护。' }
    ]
  },
  {
    id: 'news2',
    title: '社区开展“识毒拒毒”科普活动',
    date: '2026-02-15',
    tag: '社区',
    blocks: [
      { type: 'text', content: '社区网格员联合志愿者发放禁毒科普材料。' },
      { type: 'image', src: BASE_IMAGE + '/vr/VR2.jpg' }
    ]
  },
  {
    id: 'news3',
    title: 'VR禁毒体验专区上线',
    date: '2026-02-10',
    tag: '科技',
    blocks: [
      { type: 'text', content: '通过VR场景模拟提升风险识别能力。' },
      { type: 'image', src: BASE_IMAGE + '/vr/VR3.jpg' }
    ]
  },
  {
    id: 'news4',
    title: '禁毒知识竞赛优秀名单公布',
    date: '2026-02-05',
    tag: '活动',
    blocks: [
      { type: 'text', content: '线上答题活动吸引大量青少年参与。' }
    ]
  },
  {
    id: 'news5',
    title: '缉毒英雄主题宣传片发布',
    date: '2026-02-01',
    tag: '致敬',
    blocks: [
      { type: 'text', content: '宣传片聚焦缉毒警察真实故事与精神传承。' }
    ]
  }
];

var storyMusic = {
  story_youth: [],
  story_family: [],
  story_workplace: [],
  story_hero: []
};

module.exports = {
  appConfig: appConfig,
  zones: zones,
  questions: questions,
  gifts: gifts,
  news: news,
  storyMusic: storyMusic
};
