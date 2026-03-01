# Utils 工具目录文档

## 文件列表

| 文件 | 导出 | 说明 |
|------|------|------|
| storage.js | `storage`, `STORAGE_KEYS` | 本地存储封装 |
| audio.js | `audioManager` | 音频管理 |
| share.js | `shareManager` | 分享配置 |

---

## storage.js - 本地存储工具

### STORAGE_KEYS 常量

```javascript
{
  USER_INFO: 'userInfo',
  POINTS: 'points',
  LEVEL: 'level',
  COMPLETED_STORIES: 'completedStories',
  QUIZ_RECORDS: 'quizRecords',
  SIGN_DATE: 'lastSignDate',
  VISITED_ZONES: 'visitedZones',
  HERO_LIGHTS: 'heroLights',
  PLEDGE_SIGNED: 'pledgeSigned'
}
```

### storage 方法

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `get(key)` | key: string | any | 获取存储值 |
| `set(key, value)` | key, value | boolean | 设置存储值 |
| `remove(key)` | key: string | boolean | 删除存储值 |
| `getCompletedStories()` | - | string[] | 获取已完成故事ID列表 |
| `markStoryCompleted(storyId)` | storyId: string | void | 标记故事完成 |
| `getQuizRecords()` | - | object | 获取答题记录 |
| `updateQuizRecord(correct, total)` | correct, total: number | void | 更新答题记录 |
| `getVisitedZones()` | - | string[] | 获取已访问展区 |
| `markZoneVisited(zoneId)` | zoneId: string | void | 标记展区已访问 |
| `getHeroLights()` | - | string[] | 获取已点灯英雄 |
| `lightForHero(heroId)` | heroId: string | boolean | 为英雄点灯 |

### quizRecords 结构

```javascript
{
  totalQuestions: number,   // 总答题数
  correctAnswers: number,   // 正确数
  dailyCompleted: boolean,  // 今日是否完成
  lastDailyDate: string     // 上次每日答题日期
}
```

---

## audio.js - 音频管理工具

### audioManager 方法

| 方法 | 参数 | 说明 |
|------|------|------|
| `initBgm(src)` | src: string | 初始化背景音乐 |
| `playBgm(src?)` | src?: string | 播放背景音乐 |
| `pauseBgm()` | - | 暂停背景音乐 |
| `stopBgm()` | - | 停止背景音乐 |
| `setBgmVolume(volume)` | volume: 0-1 | 设置音量 |
| `playEffect(src)` | src: string | 播放音效（一次性） |
| `playNarration(src, onEnd)` | src, callback | 播放语音讲解 |
| `destroy()` | - | 销毁所有音频实例 |

### 使用示例

```javascript
const { audioManager } = require('../../utils/audio.js');

// 播放背景音乐
audioManager.playBgm('/assets/audio/bgm.mp3');

// 播放按钮音效
audioManager.playEffect('/assets/audio/click.mp3');

// 页面卸载时销毁
onUnload() {
  audioManager.destroy();
}
```

---

## share.js - 分享配置工具

### shareManager 方法

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `getDefaultShare()` | - | object | 默认分享配置 |
| `getStoryShare(storyId, storyTitle)` | id, title | object | 故事分享配置 |
| `getQuizShare(score, rank)` | score, rank | object | 答题分享配置 |
| `getCertificateShare(userName)` | userName | object | 证书分享配置 |
| `generatePoster(type, data)` | type, data | Promise | 生成海报（待实现） |

### 分享配置结构

```javascript
{
  title: string,      // 分享标题
  path: string,       // 分享路径
  imageUrl: string    // 分享图片
}
```

### 使用示例

```javascript
const { shareManager } = require('../../utils/share.js');

Page({
  onShareAppMessage() {
    return shareManager.getDefaultShare();
  }
});
```
