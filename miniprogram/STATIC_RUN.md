# 静态可运行说明

当前项目已切换为静态可运行模式（无需后端服务）：

1. `config/app.js` 中 `development.mockData = true`。  
2. 所有接口由 `utils/api.js` 本地 mock 层提供。  
3. 静态数据集中在 `data/staticMock.js`。  
4. 积分、学习记录、兑换记录等写入小程序本地存储。

## 运行方式

1. 打开微信开发者工具。  
2. 导入项目目录 `miniprogram`。  
3. 直接编译运行即可。

## 可按需调整

1. 修改 `data/staticMock.js` 可更新展区、题库、新闻、礼品。  
2. 若需恢复后端联调：将 `config/app.js` 的 `mockData` 改为 `false`。  
