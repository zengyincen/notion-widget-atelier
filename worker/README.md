# 动态同步与公开 Notion 数据连接（可选）

主站仍部署在 GitHub Pages。这个 Worker 提供两项能力：

- 为动态宠物保存 `food / water / love`；每个 `petId` 对应一个强一致 Durable Object。
- 零 Token 读取用户主动 Publish 的 Notion 数据库，返回进度或热力图聚合值，并缓存 60 秒。

## 部署

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put RESET_SECRET
npm run deploy
```

部署后，动态宠物可在组件定制器中填写：

- 同步地址：`https://notion-widget-box-sync.<你的子域>.workers.dev`
- 宠物 ID：自定义一个不容易撞名的 ID，例如 `shorouk-mochi-2026`

恒久嵌入链接仍是 GitHub Pages 的 `widget.html?...`。组件每两秒读取 Worker；“喂食 / 喂水 / 抚摸”链接直接写入同一个 Durable Object。

重置宠物（仅管理员）：

```bash
curl -X POST \
  -H "Authorization: Bearer <RESET_SECRET>" \
  "https://notion-widget-box-sync.<你的子域>.workers.dev/pet/<PET_ID>/reset"
```

不要把 `RESET_SECRET` 写进组件 URL、仓库或浏览器代码。

## 公开 Notion 数据库

打开主站的 `connect.html`，填写 Worker 地址与已 Publish 的 Notion 数据库链接。这个功能不需要任何 Notion Token。

公开读取接口示例：

```text
GET /notion/public?page=<PUBLIC_NOTION_URL>&mode=schema
GET /notion/public?page=<PUBLIC_NOTION_URL>&mode=progress&current=<PROPERTY_ID>&max=<PROPERTY_ID>
GET /notion/public?page=<PUBLIC_NOTION_URL>&mode=heatmap&date=<PROPERTY_ID>&value=<PROPERTY_ID>
```

该功能使用 Notion 网页的未公开公共页面接口，可能因 Notion 改版失效。它只接受 `notion.so` / `notion.site` 公共链接，只向客户端返回列结构或聚合数据，不返回完整行。
