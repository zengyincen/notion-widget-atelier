# Notion Widget Box 托管服务运维说明

> 本文档面向服务管理员。终端用户无需部署 Worker、填写服务地址或接触任何密钥。

生产服务：`https://nwb.imnotfound.eu.org`

`workers.dev` 地址只作为管理员故障排查备用入口；所有面向用户的宠物动作、状态读取和公开 Notion 数据链接都使用生产自定义域名。

## 服务职责

- 动态宠物：每个随机 `petId` 对应一个独立的 SQLite Durable Object，保存饱腹、水分、安心、冷却时间与状态版本。
- 公开 Notion 数据：读取用户主动 Publish 的数据库，返回列结构、进度或热力图聚合值，并缓存 60 秒。
- 管理员接口：可使用 Worker Secret 保护的重置接口恢复指定宠物状态。

喂食与喂水分别限制为每两小时一次；抚摸可重复触发，并通过短间隔节流避免意外连击。任何密钥都不得进入 `assets/service.js`、组件 URL 或浏览器代码。

## 部署与验证

```bash
cd worker
npm install
npx wrangler whoami
npm run check
npm run deploy
```

部署后验证健康状态：

```bash
curl https://nwb.imnotfound.eu.org/health
```

若 Worker 地址发生变化，请同步更新 `assets/service.js` 和 `wrangler.jsonc`，再发布 GitHub Pages。

## 管理员重置

首次启用重置功能时，通过交互式命令写入 Secret：

```bash
npx wrangler secret put RESET_SECRET
```

重置指定宠物：

```bash
curl -X POST \
  -H "Authorization: Bearer <RESET_SECRET>" \
  "https://nwb.imnotfound.eu.org/pet/<PET_ID>/reset"
```

## 公开接口

```text
GET /health
GET /pet/<PET_ID>
GET /pet/<PET_ID>/action/feed
GET /pet/<PET_ID>/action/water
GET /pet/<PET_ID>/action/pet
POST /pet/<PET_ID>/reset
GET /notion/public?page=<PUBLIC_NOTION_URL>&mode=schema
GET /notion/public?page=<PUBLIC_NOTION_URL>&mode=progress&current=<PROPERTY_ID>&max=<PROPERTY_ID>
GET /notion/public?page=<PUBLIC_NOTION_URL>&mode=heatmap&date=<PROPERTY_ID>&value=<PROPERTY_ID>
```

公开 Notion 功能依赖 Notion 网页的公共页面兼容接口，可能随 Notion 改版而变化。接口只接受 `notion.so` / `notion.site` 公开链接，只返回列结构或聚合结果，不返回完整行。
