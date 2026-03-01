# 禁毒教育云展馆小程序 - 项目文档

## 项目概述

**项目名称**：禁毒教育云展馆  
**版本**：V1.0  
**平台**：微信小程序  
**主题色**：#1a237e（深蓝色）

这是一款面向公众的禁毒宣传教育小程序，通过云展馆导览、互动故事体验、知识问答等形式，提高公众的禁毒意识。

---

## 目录结构

```
miniprogram/
├── assets/              # 静态资源（图片、音频）
├── components/          # 自定义组件（暂为空）
├── data/                # 数据文件（题库、故事、英雄、展区）
├── pages/               # 页面目录
│   ├── splash/          # 启动页
│   ├── index/           # 首页
│   ├── museum/          # 展馆页
│   ├── experience/      # 体验页
│   ├── quiz/            # 答题页
│   ├── mine/            # 我的页面
│   ├── gift/            # 礼品中心
│   ├── hero/            # 英雄致敬页
│   └── story/           # 故事体验页
├── utils/               # 工具函数
├── app.js               # 应用入口
├── app.json             # 应用配置
└── app.wxss             # 全局样式
```

---

## 核心功能模块

### 1. 积分系统
- **签到**：每日签到 +10 积分
- **参观展区**：每个展区 +30 积分
- **完成故事**：好结局 +50 积分，坏结局 +20 积分
- **答题**：根据正确率获得积分
- **点灯致敬**：每位英雄 +5 积分
- **签署承诺书**：+30 积分

### 2. 等级系统
| 等级 | 称号 | 所需积分 |
|------|------|----------|
| 1 | 禁毒新人 | 0 |
| 2 | 禁毒学员 | 200 |
| 3 | 禁毒卫士 | 500 |
| 4 | 禁毒先锋 | 1000 |
| 5 | 禁毒大使 | 2000 |

### 3. TabBar 导航
- 首页 (`/pages/index/index`)
- 展馆 (`/pages/museum/museum`)
- 体验 (`/pages/experience/experience`)
- 我的 (`/pages/mine/mine`)

---

## 全局数据 (app.globalData)

```javascript
{
  userInfo: null,        // 用户信息
  points: 0,             // 积分
  level: 1,              // 等级
  visitCount: 128956,    // 访问人数（模拟）
  hasSignedToday: false  // 今日是否已签到
}
```

---

## 全局方法 (app.js)

| 方法 | 参数 | 说明 |
|------|------|------|
| `calculateLevel(points)` | points: number | 根据积分计算等级 |
| `getLevelTitle(level)` | level: number | 获取等级称号 |
| `addPoints(amount, reason)` | amount: number, reason: string | 添加积分并记录历史 |
| `dailySign()` | - | 每日签到，返回是否成功 |

---

## 本地存储 Key

| Key | 说明 |
|-----|------|
| `userInfo` | 用户信息 |
| `points` | 积分 |
| `lastSignDate` | 上次签到日期 |
| `pointsHistory` | 积分历史记录 |
| `completedStories` | 已完成故事ID列表 |
| `quizRecords` | 答题记录 |
| `visitedZones` | 已访问展区ID列表 |
| `heroLights` | 已点灯英雄ID列表 |
| `pledgeSigned` | 是否签署承诺书 |
| `exchangeHistory` | 礼品兑换历史 |

---

## 依赖关系图

```
app.js (全局状态管理)
    │
    ├── utils/storage.js (本地存储)
    ├── utils/audio.js (音频管理)
    └── utils/share.js (分享配置)
    
data/ (静态数据)
    ├── stories.js → pages/story, pages/experience
    ├── heroes.js → pages/hero
    ├── zones.js → pages/museum
    └── questions.js → pages/quiz
```

---

## 开发注意事项

1. **积分操作**：统一使用 `app.addPoints()` 方法，会自动记录历史和检查升级
2. **本地存储**：使用 `utils/storage.js` 封装的方法，有错误处理
3. **分享功能**：使用 `utils/share.js` 获取统一的分享配置
4. **页面跳转**：TabBar 页面使用 `wx.switchTab`，其他页面使用 `wx.navigateTo`
