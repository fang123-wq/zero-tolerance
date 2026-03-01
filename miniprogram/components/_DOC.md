# Components 组件目录文档

## 当前状态

**目录为空** - 暂无自定义组件

---

## 建议组件规划

根据项目需求，建议开发以下公共组件：

| 组件名 | 用途 | 优先级 |
|--------|------|--------|
| custom-modal | 统一弹窗组件 | 高 |
| progress-bar | 进度条组件 | 高 |
| card | 卡片组件 | 中 |
| hero-card | 英雄卡片 | 中 |
| zone-card | 展区卡片 | 中 |
| story-dialog | 故事对话框 | 中 |
| quiz-option | 答题选项 | 低 |
| points-badge | 积分徽章 | 低 |

---

## 组件开发规范

### 目录结构
```
components/
└── component-name/
    ├── index.js
    ├── index.json
    ├── index.wxml
    └── index.wxss
```

### 注册方式

**页面级注册** (page.json)
```json
{
  "usingComponents": {
    "custom-modal": "/components/custom-modal/index"
  }
}
```

**全局注册** (app.json)
```json
{
  "usingComponents": {
    "custom-modal": "/components/custom-modal/index"
  }
}
```
