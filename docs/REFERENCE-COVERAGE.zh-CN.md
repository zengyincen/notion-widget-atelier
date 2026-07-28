# 参考项目覆盖对照

参考仓库：[ShoroukAziz/notion_widgets](https://github.com/ShoroukAziz/notion_widgets)

| 参考项目类型 | Widget Atelier 对应引擎 |
| --- | --- |
| greetings-date-clock / 多语言问候 | `greeting`、`digital-clock`、`word-clock` |
| calendar / calendar2 / minimal calendar | `calendar`、`week-calendar` |
| countDown / days only | `countdown` |
| today / week / month / year time left | `day-progress`、`week-progress`、`month-progress`、`year-progress` |
| pomodoro / pomodoro2 / pomodoro3 | `pomodoro`、`focus-garden` |
| timer | `timer`、`stopwatch` |
| calculator / minimal calculator | `calculator`、`bmi-calculator`、`age-calculator` |
| converter / minimal unit converter | `unit-converter`、`currency-converter` |
| currency rates | `currency-converter` |
| weather / Giza weather | `weather`、`sunrise` |
| emoji | `emoji-card` |
| minimal quote | `daily-quote`、`affirmation`、`daily-card` |
| financial goals | `financial-goal`、`savings-goal` |
| photo gallery / image gallery / slider | `photo-gallery`、`image-slider` |
| globe | `globe` |
| travel / map2 | `travel-map` |
| US airport distance map | `distance-map` |
| world clock | `world-clock` |
| button / Gumroad / Etsy | `link-button`、`payment-button` |
| socials variants | `social-links`、`profile-card` |
| nav / nav vertical | `navigation`、`link-list`，由布局参数控制方向 |

以上实现为原创的数据驱动版本，没有复制参考仓库 HTML/CSS/JS 源码。

## Awesome Notion Widgets 覆盖

参考仓库：[RylanBot/awesome-notion-widgets](https://github.com/RylanBot/awesome-notion-widgets)（MIT License）

| 参考项目类型 | Widget Atelier 对应引擎 | 扩展能力 |
| --- | --- | --- |
| 随机诗句 | `vertical-poem` | 今日诗词 API、自定义内容、主题/分类、竖排方向、诗名/作者、字号、字体与主题 |
| 英文图片引言 | `scenic-quote` | 每日/自定义引言、自定义背景、遮罩、模糊、三种排版、全部全局样式参数 |
| 音乐播放器 | `music-player` | 直链、手动歌单、Meting 平台/类型/ID、LRC、播放列表、频谱、音量、循环、随机播放 |

同类扩展引擎：`vinyl-player`、`cassette-player`、`ambient-mixer`、`lyric-card`、`album-cover`、`kinetic-type`、`generative-art`、`gradient-mesh`、`constellation`。

参考仓库依赖 Express、Quotesy、APlayer 与 MetingJS；本项目为适配 GitHub Pages，使用原生 HTML Audio 和浏览器端数据源，不要求部署 Node 服务。

## 本轮市场缺口补齐（2026-07-28）

| 市场常见组件 | Widget Atelier 对应引擎 | 数据 / 交互边界 |
| --- | --- | --- |
| Google Calendar / 外部日历 | `google-calendar` | 用户粘贴公开日历 URL；私有 OAuth 连接器留待后续 |
| Schedule Builder / 周计划 | `schedule-builder` | URL 配置日程，完成状态保存在浏览器 |
| Pomodoro + Todo | `pomodoro-todo` | 计时与任务在同一卡片，本地持久化 |
| Recurring Tasks | `recurring-tasks` | 每日按日期生成独立完成记录 |
| Flashcards / Quizlet | `flashcards` | `正面|背面` 数据格式，点击翻面与切卡 |
| Whiteboard / Witeboard | `whiteboard` | Pointer Events + Canvas，本地保存草图 |
| Tally / Mail Form / Feedback | `feedback-form` | 通过 `mailto:` 交给用户自己的邮箱，不托管表单数据 |
| Coolors / Color Palette | `color-palette` | 从主色生成色板，点击复制 HEX |
| ASCII Art | `ascii-art` | 等宽文本与强调色主题 |
| News / RSS 摘要 | `news-feed` | 当前为 URL 配置的标题列表，RSS 安全代理列为下一阶段 |
| Tarot / Daily Card | `tarot` | 日期 + 牌组种子稳定抽牌，仅作娱乐灵感 |
| Ramadan / Prayer Times | `prayer-times` | AlAdhan 公开 API，城市、国家、计算方法可调 |
| Crypto / CoinGecko | `crypto-ticker` | CoinGecko 公共行情，组件联网时显示 24 小时变化 |
