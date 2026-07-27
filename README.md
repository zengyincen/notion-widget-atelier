# Notion Widget Box

一个可直接部署到 GitHub Pages 的 Notion 小组件市场与可视化生成器。项目使用原生 HTML / CSS / JavaScript，无构建步骤、无默认后端。

**在线使用：[zengyincen.github.io/notion-widget-box](https://zengyincen.github.io/notion-widget-box/)**

- 85 个真实组件引擎
- 6 套 Apple × Notion 视觉主题
- 3 种响应式布局
- 1,530 个可搜索模板组合
- 603 款可检索字体：Notion 默认 / 衬线 / 等宽预设，以及 600 款 Google Fonts
- 支持颜色、字体、圆角、阴影、尺寸、对齐、语言、时区、地区与组件专属参数
- 支持主页面搜索、分类、主题/尺寸筛选、排序、收藏和分页
- 支持生成永久 Notion `/embed` 链接

## 组件范围

完整覆盖参考项目 `ShoroukAziz/notion_widgets` 的时钟、日期问候、日历、倒计时、时间进度、番茄钟、计时器、计算器、单位/汇率换算、天气、语录、Emoji、财务目标、图片画廊/轮播、地图/距离、地球、按钮、导航和社交链接等类型；也覆盖 `RylanBot/awesome-notion-widgets` 的随机诗句、英文图片引言与音乐播放器。

新增的重点类别包括：

- 数据：数据库进度条、Notion Formula、圆环/分段/里程碑进度、柱状图、环图、日历热力图、连续打卡热力图
- 动态：桌面宠物、虚拟植物、专注花园、情绪轨道、每日卡牌、决定转盘
- 日期文化：黄历、星座运势、二十四节气、月相、日出日落、节日提醒
- 效率：任务清单、习惯、饮水、学习场次、呼吸训练、优先矩阵
- 工具：BMI、年龄、日期间隔、密码、二维码、一键复制、随机数
- 音乐：完整播放器、Meting 歌曲/歌单、手动歌单、LRC 歌词、黑胶唱片机、复古磁带机、氛围声音混音
- 艺术：竖排诗笺、景深引言、动态歌词、专辑封面、动态文字海报、生成艺术、流体渐变与星图签名

## 音乐播放器

- 直链模式支持公开的 MP3 / OGG 音频链接、手动多曲歌单、封面、歌词、音量、顺序/随机播放和循环模式。
- Meting 模式兼容网易云、QQ 音乐、酷狗与百度音乐的歌曲、歌单、专辑和歌手 ID，并允许替换 API 模板。
- 黑胶和磁带播放器共享同一套播放能力，但拥有独立艺术造型；氛围混音器可同时叠加三条用户提供的环境音。
- 浏览器和 Notion 可能阻止自动播放，用户首次点击播放后即可正常使用。部分平台 VIP 曲目可能只能试听，请确保音频链接和使用方式符合版权要求。

## 本地预览

不能直接双击 HTML 测试所有联网功能，请启动一个静态服务器：

```bash
python3 -m http.server 4173
```

访问 `http://localhost:4173/`。

## 部署到 GitHub Pages

1. 新建 GitHub 仓库并推送本项目。
2. 打开仓库 `Settings → Pages`。
3. 在 `Build and deployment` 中将 Source 设为 `GitHub Actions`。
4. 推送到 `main` 或 `master` 后，`Deploy GitHub Pages` 工作流会发布站点。
5. 进入主页面选择模板、完成自定义、复制嵌入链接。
6. 在 Notion 中输入 `/embed`，粘贴链接并调整块大小。

## 动态宠物：GitHub Actions 模式

这是默认的跨设备方案，状态存放在 `data/pets/<petId>.json`：

1. 仓库必须启用 Issues 和 GitHub Actions。
2. 在宠物定制器填写当前仓库，例如 `zengyincen/notion-widget-box`。
3. 主页面会先让用户预览宠物、切换种类与样式；确认选择后才填写主人昵称和宠物名，并自动生成随机宠物 ID。同名不会撞车。
4. 用户点击喂食、喂水或抚摸后，会打开预填的 GitHub Issue；提交后 Action 更新状态、合并历史反馈、关闭 Issue 并重新部署 Pages。
5. 喂食与喂水按 GitHub 用户分别限流为每 2 小时一次；重复版本链接不会重复计入。抚摸点击时会立刻播放本地满意动画，持久状态在 Action 完成后更新。

GitHub Pages 无法检测单纯的 URL 访问，因此用户必须提交预填 Issue。通常需要等待几十秒让 Action 和 Pages 部署完成。

若希望不登录 GitHub且 1–2 秒跨设备同步，可部署 [worker/README.md](worker/README.md) 中的可选 Cloudflare Durable Object 服务，然后把宠物同步方式切换为 Worker。

## 公开 Notion 数据库进度 / 热力图（零 Token）

选择“数据库进度条”或“日历热力图”后，点击“安全连接 Notion 数据库”：

1. 将目标 Notion 数据库页面设为 Publish，确认匿名窗口可查看。
2. 填入项目自带 Worker 的公开地址和 Notion 公共链接。
3. 选择当前值/目标值，或日期/数值列。
4. 连接器生成聚合数据 URL 并自动填回定制器。

此模式不需要 Integration Token。它通过服务端读取 Notion 公共页面兼容接口，只返回聚合结果；接口不是 Notion 官方公开 API，Notion 改版时可能需要更新。原生 Formula 2.0 仍适合数据库单元格。详见 [docs/NOTION-DATABASE.zh-CN.md](docs/NOTION-DATABASE.zh-CN.md)。

## 项目结构

```text
.
├── index.html                 # 可检索组件市场与定制器
├── widget.html                # 统一嵌入入口
├── action.html                # 本地宠物一次性动作页
├── assets/
│   ├── catalog.js             # 85 个组件与主题/布局注册表
│   ├── fonts.js               # 603 款可检索字体目录
│   ├── app.js                 # 搜索、筛选、收藏、定制与 URL 生成
│   ├── styles.css             # 主页面 Apple × Notion 视觉
│   ├── widget.js              # 所有组件引擎与交互
│   └── widget.css             # 嵌入组件样式
├── data/pets/                 # GitHub Actions 宠物状态
├── .github/workflows/         # Pages 部署与宠物动作处理
├── worker/                    # 可选实时跨设备同步服务
└── docs/                      # 市场洞察、数据接入与覆盖说明
```

## 隐私与安全

- 本地组件状态保存在当前来源的 `localStorage`。
- 本项目的公共 Notion 数据连接不使用 Token；数据库必须由用户主动 Publish。
- GitHub Actions 只使用 GitHub 自动提供的短期 `GITHUB_TOKEN`。
- 宠物状态 JSON 是公开的；其中只保存随机宠物 ID、数值和经过 SHA-256 截断的 GitHub 用户标识，不保存昵称或邮箱。
- 公共 Notion 连接器只返回列结构与聚合值，但源页面本身是公开的；不要发布含敏感内容的数据库。
- 黄历与星座为娱乐性、确定性生成内容，不应作为专业建议。

## 字体许可与联网说明

- Notion 默认、衬线与等宽预设使用设备内置字体，不需要联网。
- 其余 600 款来自 [Google Fonts](https://fonts.google.com/)。Google Fonts 字体均为开源许可，可用于商业项目；选择后由嵌入页按需加载对应字体文件。
- 若 Notion 所在网络无法访问 Google Fonts，组件会自动回退到系统字体，内容与布局仍可正常显示。

## 许可

本项目代码使用 MIT License。`ShoroukAziz/notion_widgets` 没有在根目录声明统一许可证，因此本项目只借鉴其产品思路与功能清单；`RylanBot/awesome-notion-widgets` 使用 MIT License。本项目的组件注册表、原生播放器、交互和视觉均为独立的数据驱动实现，没有复制参考项目源码。
