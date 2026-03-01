# Data 数据目录文档

## 文件列表

| 文件 | 导出 | 使用页面 |
|------|------|----------|
| stories.js | `stories` | experience, story |
| heroes.js | `heroes`, `statistics` | hero |
| zones.js | `zones` | museum |
| questions.js | `questions`, `categories` | quiz |

---

## stories.js - 故事数据

### 数据结构

```javascript
{
  id: string,           // 故事ID
  title: string,        // 标题
  subtitle: string,     // 副标题
  icon: string,         // 图标emoji
  duration: string,     // 预计时长
  rating: number,       // 评分
  playCount: number,    // 播放次数
  description: string,  // 描述
  scenes: Scene[]       // 场景列表
}
```

### Scene 场景类型

**dialogue - 对话场景**
```javascript
{
  id: string,
  type: 'dialogue',
  background: string,   // 背景：classroom, dark, hospital
  character: string,    // 角色名
  text: string,         // 对话内容
  effect?: string,      // 特效：blur, shake
  next: string          // 下一场景ID
}
```

**choice - 选择场景**
```javascript
{
  id: string,
  type: 'choice',
  background: string,
  text: string,
  choices: [
    { text: string, next: string }
  ]
}
```

**ending - 结局场景**
```javascript
{
  id: string,
  type: 'ending',
  title: string,
  text: string,
  isGood: boolean       // true=好结局(+50分), false=坏结局(+20分)
}
```

### 已实现故事
- `youth` - 少年篇（完整场景）

### 待实现故事
- `workplace` - 职场篇
- `family` - 家庭篇
- `hero` - 英雄篇

---

## heroes.js - 英雄数据

### heroes 数据结构

```javascript
{
  id: string,
  name: string,           // 姓名
  title: string,          // 职务
  photo: string,          // 照片路径
  sacrificeDate: string,  // 牺牲日期 或 '在职'
  age: number | null,     // 牺牲年龄
  story: string,          // 事迹介绍
  honors: string[]        // 荣誉列表
}
```

### statistics 统计数据

```javascript
{
  nationalData: {
    drugUsers: number,    // 吸毒人数
    newUsers: number,     // 新增人数
    rehabilitated: number,// 戒毒人数
    cases: number,        // 破获案件
    seized: number        // 缴获毒品(吨)
  },
  yearlyTrend: [          // 年度趋势
    { year: number, users: number }
  ]
}
```

---

## zones.js - 展区数据

### 数据结构

```javascript
{
  id: string,
  number: string,         // 展区编号 '01'-'08'
  name: string,           // 展区名称
  title: string,          // 展区标题
  description: string,    // 简介
  icon: string,           // 图标emoji
  content: {
    intro: string,        // 详细介绍
    // 各展区特有字段...
  }
}
```

### 展区列表
1. zone1 - 序厅
2. zone2 - 认识毒品
3. zone3 - 危害警示
4. zone4 - 防范拒绝
5. zone5 - 法律法规
6. zone6 - 戒毒康复
7. zone7 - 英雄致敬
8. zone8 - 承诺签名

---

## questions.js - 题库数据

### questions 数据结构

```javascript
{
  id: number,
  question: string,       // 题目
  options: string[],      // 选项 ['A. xxx', 'B. xxx', ...]
  answer: number,         // 正确答案索引 (0-3)
  explanation: string,    // 答案解析
  category: string        // 分类
}
```

### categories 题目分类

| Key | 名称 |
|-----|------|
| basic | 基础知识 |
| identify | 毒品识别 |
| harm | 危害认知 |
| prevent | 防范技巧 |
| law | 法律法规 |

### 当前题库
- 共 12 道题目
- 涵盖所有5个分类
