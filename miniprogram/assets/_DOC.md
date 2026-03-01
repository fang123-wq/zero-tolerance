# Assets 资源目录文档

## 目录结构

```
assets/
├── images/          # 图片资源
└── audio/           # 音频资源
```

---

## images/ - 图片资源

### 需要的图片文件

| 文件名 | 用途 | 建议尺寸 |
|--------|------|----------|
| share-default.png | 默认分享图 | 500x400 |
| share-story.png | 故事分享图 | 500x400 |
| share-quiz.png | 答题分享图 | 500x400 |
| share-certificate.png | 证书分享图 | 500x400 |
| poster-default.png | 默认海报 | 750x1334 |
| hero1.png | 英雄照片-蔡晓东 | 200x200 |
| hero2.png | 英雄照片-张从顺 | 200x200 |
| hero3.png | 英雄照片-贾巴伍各 | 200x200 |
| hero4.png | 英雄照片-印春荣 | 200x200 |
| hero5.png | 英雄照片-吴光林 | 200x200 |

### TabBar 图标（如需自定义）

| 文件名 | 用途 |
|--------|------|
| tab-home.png | 首页图标 |
| tab-home-active.png | 首页选中图标 |
| tab-museum.png | 展馆图标 |
| tab-museum-active.png | 展馆选中图标 |
| tab-experience.png | 体验图标 |
| tab-experience-active.png | 体验选中图标 |
| tab-mine.png | 我的图标 |
| tab-mine-active.png | 我的选中图标 |

---

## audio/ - 音频资源

### 需要的音频文件

| 文件名 | 用途 | 格式 |
|--------|------|------|
| bgm.mp3 | 背景音乐 | MP3 |
| click.mp3 | 点击音效 | MP3 |
| success.mp3 | 成功音效 | MP3 |
| correct.mp3 | 答对音效 | MP3 |
| wrong.mp3 | 答错音效 | MP3 |
| narration-zone1.mp3 | 展区1语音讲解 | MP3 |
| narration-zone2.mp3 | 展区2语音讲解 | MP3 |
| ... | ... | ... |

---

## 注意事项

1. **图片优化**：建议使用压缩工具优化图片大小
2. **音频格式**：微信小程序支持 MP3、AAC、WAV 等格式
3. **文件大小**：单个文件建议不超过 2MB
4. **总包大小**：小程序主包限制 2MB，建议使用分包或云存储
