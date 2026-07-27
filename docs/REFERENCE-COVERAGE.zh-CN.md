# 参考项目覆盖对照

参考仓库：[ShoroukAziz/notion_widgets](https://github.com/ShoroukAziz/notion_widgets)

| 参考项目类型 | Notion Widget Box 对应引擎 |
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

| 参考项目类型 | Notion Widget Box 对应引擎 | 扩展能力 |
| --- | --- | --- |
| 随机诗句 | `vertical-poem` | 今日诗词 API、自定义内容、主题/分类、竖排方向、诗名/作者、字号、字体与主题 |
| 英文图片引言 | `scenic-quote` | 每日/自定义引言、自定义背景、遮罩、模糊、三种排版、全部全局样式参数 |
| 音乐播放器 | `music-player` | 直链、手动歌单、Meting 平台/类型/ID、LRC、播放列表、频谱、音量、循环、随机播放 |

同类扩展引擎：`vinyl-player`、`cassette-player`、`ambient-mixer`、`lyric-card`、`album-cover`、`kinetic-type`、`generative-art`、`gradient-mesh`、`constellation`。

参考仓库依赖 Express、Quotesy、APlayer 与 MetingJS；本项目为适配 GitHub Pages，使用原生 HTML Audio 和浏览器端数据源，不要求部署 Node 服务。
