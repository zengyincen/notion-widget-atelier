# Notion 小组件市场需求洞察

调研日期：2026-07-28

## 结论摘要

市场的核心缺口不是“缺少更多时钟”，而是缺少一个同时满足以下条件的产品：免费、无需账号、风格统一、响应式、高度可定制、稳定托管、能覆盖基础展示与轻交互，并清楚区分本地状态与跨设备同步。

因此 Notion Widget Box 采用“少量可维护的组件引擎 × 多主题 × 多布局”的组合架构，而不是复制上千份静态 HTML。主页只展示 98 个不重复的真实组件；每个组件可在定制器中切换 6 套主题与 3 种布局，共形成 1,764 个配置组合，所有组合仍共享同一套可靠实现。

## 市场信号

### 1. 高频刚需高度集中

[Widgets For Notion 的 2026 汇总](https://widgetsfornotion.com/blog/best-notion-widgets)将时钟、日历、倒计时/计时、天气和效率追踪列为最常添加的类别，并指出时钟是最常被添加的单品。用户需要的是不离开 Notion 就能“一眼看到”的信息，而不是复杂应用。

[Apption](https://apption.co/)公开页面显示其累计生成组件超过 53 万、浏览量超过 8,300 万。公开热度较高的品类包括天气（约 85.8 万）、Spotify（约 72 万）、翻页时钟（约 57.8 万）、番茄待办（约 49 万）、Google Calendar（约 47.1 万）、Studio Ghibli 番茄钟（约 43.3 万）与 Aura Clock（约 34.1 万）。这说明“基础功能 + 强视觉主题”比单纯扩大功能更容易形成使用量。

### 2. 用户把视觉一致性当作功能

[Indify](https://indify.co/)以“完全可定制、设置无缝”为核心卖点；其帮助文档强调响应式、字体、文本对齐、文字/背景颜色、透明度、透明背景、明暗预览与多布局。市场上常见的 Soft Pink、Glass、Retro、Ghibli 等系列，也说明用户倾向于让整页组件使用同一套视觉语言。

本项目因此把主题作为一等数据，而非每个组件各写一套 CSS，并默认提供 Notion Paper、Apple Clean、Frosted Glass、Midnight、Soft Blush、Quiet Sage 六套系列。

### 3. 无账号、免费与稳定链接是强转化点

主流教程反复强调 `/embed`、复制 URL、无需代码和免费使用。用户希望在 30 秒内完成安装。注册、品牌水印、基础颜色付费墙和服务关闭风险，是迁移到开源自托管方案的主要动机。

GitHub Pages 的优势是链接稳定、加载轻量；弱点是无法直接处理跨设备写状态或代理跨域公开数据。因此产品由服务提供商统一托管 Cloudflare Durable Objects：动态宠物默认跨设备同步，用户不接触 Worker 或 GitHub Actions；Notion 数据表采用用户主动 Publish 的零 Token 聚合连接器。

### 4. “动态但低压力”的互动有增长空间

市场已有宠物、虚拟咖啡、Lo-fi、月相、生命日历与焦点花园等氛围型组件。它们不替代 Notion 数据库，而是给工作台提供情绪价值与轻反馈。

[Malinkang 的动态 Notion 图标教程](https://malinkang.com/posts/notion_token/)展示了同一 URL 通过 `date`、`type`、`content`、`color` 参数生成每日变化图标的方式。由此可推导出两个不同需求：

- 无状态动态：日期、周/月/年、倒计时、节气、星座、黄历，可由时间和 URL 参数确定性生成。
- 有状态动态：宠物、植物、习惯、情绪，需要本地存储或安全的跨设备状态层。

本项目将两类能力分开实现，避免把 API Token 暴露在前端。

### 5. 本轮补充调研：缺口集中在“把外部工具带进 Notion”

本轮逐页检查了 [Indify](https://indify.co/)、[Plus AI Notion Widgets](https://plusai.com/notion-widgets)、[Apption](https://apption.co/) 与 [Widgetly](https://www.widgetly.co/)，并用 Exa 搜索了 [Widgets For Notion](https://widgetsfornotion.com/)、[NotionBox](https://www.notion-box.com/all-widgets) 和 [Blocky](https://www.blocky.so/widgets)。这些目录共同暴露出当前目录最值得补齐的组件：

- **工作台连接**：Google Calendar、周计划 / Schedule Builder、新闻摘要、公开网页 iframe。
- **学习与效率**：Pomodoro + Todo、重复任务、闪卡 / Quizlet、白板 / Witeboard。
- **转化与收集**：反馈表单、邮件收集、按钮与支付入口。
- **数据与行情**：Crypto / CoinGecko 行情、TradingView 类市场入口、KPI 与页面浏览。
- **文化与生活**：塔罗、祈祷时间 / Ramadan、调色板、ASCII 艺术。

本轮已将其中无需账号、可以由原生前端或公开 API 稳定实现的 13 个组件加入目录：`google-calendar`、`schedule-builder`、`pomodoro-todo`、`recurring-tasks`、`flashcards`、`whiteboard`、`feedback-form`、`color-palette`、`ascii-art`、`news-feed`、`tarot`、`prayer-times`、`crypto-ticker`。需要 OAuth 或商业数据许可的 Google Calendar 私有数据、TradingView 私有图表、Stripe / PayPal 交易数据、评论后端暂不伪装成“免费内置”，而是保留为后续连接器方向。

## 核心用户与任务

| 用户 | 核心任务 | 最重要的产品条件 |
| --- | --- | --- |
| 学生 / 备考 | 截止日期、番茄钟、学习场次、习惯热力图 | 免费、移动端、低干扰、氛围感 |
| 知识工作者 | 世界时钟、日历、任务、KPI、项目进度 | 信息密度、响应式、暗色模式 |
| 手帐 / 生活记录用户 | 黄历、星座、月相、情绪、照片、宠物 | 系列化审美、每日变化、轻互动 |
| 创作者 | 社交入口、支付、个人名片、数据指标 | 品牌色、透明背景、稳定链接 |
| 团队 / 管理者 | OKR、进度、里程碑、热力图 | 数据来源清楚、状态可共享 |

## 优先级

P0：时钟、月历、倒计时、天气、番茄钟、任务/习惯、进度、热力图、嵌入链接生成。

P1：世界时钟、时间进度、计算/换算、财务目标、图表、图片、导航、社交与动态宠物。

P2：黄历、星座、节气、每日卡牌、情绪轨道、虚拟植物、专注花园、决定转盘、塔罗、ASCII、调色板等差异化内容。

本轮之后的下一阶段：

1. 为 `news-feed` 增加 RSS / Atom 安全代理与缓存，而不是让每个 Notion iframe 直接请求第三方。
2. 为 `google-calendar` 增加公开 ICS 解析；私有日历继续走用户自己的公开链接或 OAuth 连接器。
3. 用独立的 Durable Object 房间实现可选的 Like / Upvote / Guestbook，并加入频率限制。
4. 通过官方 OAuth 或用户主动发布的只读数据，扩展 TradingView、Stripe、Airtable、Google Sheets 等连接器。

## 产品原则

1. 所见即所得：所有设置实时预览。
2. 链接即配置：组件配置可随 URL 迁移，不依赖账号数据库。
3. 数据不装懂：本地、公开 API 与托管云服务三种来源必须明确标识。
4. 一套主题贯穿全页：主题、布局与组件功能正交组合。
5. 先可用再华丽：组件在紧凑尺寸、移动端、暗色背景和网络失败时仍可读。

## 调研来源

- [ShoroukAziz/notion_widgets](https://github.com/ShoroukAziz/notion_widgets) — 开源静态组件参考，调研时约 629 Stars。
- [RylanBot/awesome-notion-widgets](https://github.com/RylanBot/awesome-notion-widgets) 及其配套文章 — 随机诗词、图片引言与 Meting/APlayer 音乐播放器的参数和使用场景。
- [Apption](https://apption.co/) — 组件品类、累计生成量、浏览量与单品热度。
- [Indify](https://indify.co/) — 定制与统一体验定位。
- [Widgets For Notion: Best Free Notion Widgets in 2026](https://widgetsfornotion.com/blog/best-notion-widgets) — 高频品类、安装路径与风格系列。
- [Malinkang: Notion 动态图标使用](https://malinkang.com/posts/notion_token/) — 参数化动态 Icon/封面机制。
- [Plus AI: widgets for Notion](https://plusai.com/notion-widgets) — Google Calendar、Tally、Pomodoro、白板、Spotify、GIF、图表与外部 Snapshot 场景。
- [Widgetly](https://www.widgetly.co/) — 业务 KPI、时间追踪、页面浏览、按钮、支付、重复任务、AI Bot 与 Notion 日历需求。
- [Apption](https://apption.co/apps) — 白板、Pinterest/Giphy、Goodreads、Google Analytics、TradingView、CoinGecko、塔罗、祈祷时间、调色板、ASCII 等目录信号。
- [Indify widget gallery](https://indify.online/widgets) — Habit、Progress、Calendar、QR、Gallery、Color Palette 与 ASCII Art 等常见补位。
- [Blocky widgets](https://www.blocky.so/widgets) — Bar/Line/Pie/Area/Radar 图表、Flashcards、Mood、Streaks 与外部数据连接方向。
- [Widgets For Notion](https://widgetsfornotion.com/widgets) — 无账号、主题化、可验证、直接嵌入的目录体验。

说明：平台公开数字会随时间变化；本文件记录的是调研当日公开页面所见，不代表独立审计结果。
