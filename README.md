<p align="center">
  <a href="https://zengyincen.github.io/notion-widget-box/">
    <img src="./favicon.svg" width="88" height="88" alt="Notion Widget Box icon" />
  </a>
</p>

<h1 align="center">Notion Widget Box</h1>

<p align="center">
  一个免费、开源、无需构建的 Notion 小组件市场与可视化生成器。
  <br />
  选择组件，实时定制，然后复制永久链接嵌入 Notion。
</p>

<p align="center">
  <a href="https://github.com/zengyincen/notion-widget-box/actions/workflows/deploy-pages.yml"><img src="https://img.shields.io/github/actions/workflow/status/zengyincen/notion-widget-box/deploy-pages.yml?branch=main&amp;style=flat-square&amp;label=Pages" alt="GitHub Pages status" /></a>
  <a href="https://zengyincen.github.io/notion-widget-box/"><img src="https://img.shields.io/website?url=https%3A%2F%2Fzengyincen.github.io%2Fnotion-widget-box%2F&amp;style=flat-square&amp;label=Demo" alt="Live demo status" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/zengyincen/notion-widget-box?style=flat-square" alt="MIT License" /></a>
  <a href="https://github.com/zengyincen/notion-widget-box/stargazers"><img src="https://img.shields.io/github/stars/zengyincen/notion-widget-box?style=flat-square" alt="GitHub Stars" /></a>
  <a href="https://github.com/zengyincen/notion-widget-box/network/members"><img src="https://img.shields.io/github/forks/zengyincen/notion-widget-box?style=flat-square" alt="GitHub Forks" /></a>
  <a href="https://github.com/zengyincen/notion-widget-box/commits/main"><img src="https://img.shields.io/github/last-commit/zengyincen/notion-widget-box?style=flat-square" alt="Last commit" /></a>
</p>

<p align="center">
  <a href="https://zengyincen.github.io/notion-widget-box/"><strong>在线体验</strong></a>
  ·
  <a href="#快速开始">快速开始</a>
  ·
  <a href="./docs/REFERENCE-COVERAGE.zh-CN.md">组件覆盖</a>
  ·
  <a href="./docs/NOTION-DATABASE.zh-CN.md">连接 Notion 数据</a>
</p>

<p align="center">
  <a href="https://zengyincen.github.io/notion-widget-box/">
    <img src="./assets/readme-banner.svg" width="100%" alt="Notion Widget Box hero banner" />
  </a>
</p>

## 目录

- [项目亮点](#项目亮点)
- [组件与模板](#组件与模板)
- [快速开始](#快速开始)
- [嵌入 Notion](#嵌入-notion)
- [自定义能力](#自定义能力)
- [特色功能](#特色功能)
- [项目结构](#项目结构)
- [部署](#部署)
- [隐私与安全](#隐私与安全)
- [参与贡献](#参与贡献)
- [许可证与致谢](#许可证与致谢)

## 项目亮点

| | 能力 | 说明 |
| --- | --- | --- |
| 🔎 | 组件市场 | 搜索、分类、主题/尺寸筛选、排序、收藏和分页 |
| 🎨 | 深度定制 | 颜色、字体、圆角、阴影、布局、尺寸、语言、地区和时区 |
| 🎵 | 音乐与艺术 | 音乐播放器、歌单、LRC、黑胶、磁带、动态歌词和生成艺术 |
| 📊 | 数据可视化 | 进度条、KPI、图表、日历热力图和连续打卡热力图 |
| 🐾 | 动态宠物 | 独立宠物身份、喂食、喂水、抚摸动画与跨设备状态 |
| 📅 | 时间与文化 | 时钟、日历、倒计时、黄历、星座运势、节气和月相 |
| 🔗 | 永久嵌入 | 所有参数编码在链接中，复制后可直接用于 Notion `/embed` |
| ⚡ | 零构建 | 原生 HTML、CSS 和 JavaScript，可直接部署至 GitHub Pages |

<p align="center">
  <strong>85</strong> 个组件引擎&nbsp;&nbsp;·&nbsp;&nbsp;
  <strong>6</strong> 套主题&nbsp;&nbsp;·&nbsp;&nbsp;
  <strong>3</strong> 种布局&nbsp;&nbsp;·&nbsp;&nbsp;
  <strong>1,530</strong> 个模板组合&nbsp;&nbsp;·&nbsp;&nbsp;
  <strong>603</strong> 款字体
</p>

## 组件与模板

| 分类 | 代表组件 |
| --- | --- |
| 时间与日期 | 数字/模拟/翻页/文字时钟、世界时钟、日历、倒计时、年月周日进度 |
| 效率与专注 | 番茄钟、计时器、任务清单、习惯追踪、学习场次、呼吸训练、优先矩阵 |
| 进度与数据 | 数据库进度、分段进度、KPI、柱状图、环图、热力图、打卡连续记录 |
| 音乐与艺术 | 音乐播放器、黑胶、磁带、氛围混音、诗笺、景深引言、专辑封面、生成艺术 |
| 动态与生活 | 桌面宠物、虚拟植物、专注花园、情绪轨道、每日卡牌、财务与储蓄目标 |
| 信息与文化 | 天气、黄历、星座、二十四节气、月相、日出日落、节日和每日语录 |
| 工具与链接 | 计算器、换算器、密码、二维码、地图、导航、社交链接和按钮 |

完整映射与参考项目覆盖情况见 [组件覆盖说明](./docs/REFERENCE-COVERAGE.zh-CN.md)。

## 快速开始

### 直接使用

打开 [在线组件库](https://zengyincen.github.io/notion-widget-box/)，点击任意组件卡片即可进入预览和定制页面，无需注册。

### 本地运行

```bash
git clone https://github.com/zengyincen/notion-widget-box.git
cd notion-widget-box
python3 -m http.server 4173
```

访问 `http://localhost:4173/`。请使用本地静态服务器，不要直接双击 HTML；部分浏览器会限制本地文件的联网请求。

## 嵌入 Notion

1. 在首页搜索或筛选组件，点击组件卡片进入预览。
2. 调整主题、布局、颜色、字体和组件专属参数。
3. 点击“复制链接”。
4. 在 Notion 页面输入 `/embed`，粘贴链接并确认。
5. 调整嵌入块的宽度和高度。

生成的链接本身包含配置参数，因此 Notion 可以长期嵌入同一个静态地址，不需要账号或数据库。

## 自定义能力

| 范围 | 可调参数 |
| --- | --- |
| 视觉 | 6 套主题、背景色、卡片色、文字色、强调色、边框、阴影和透明背景 |
| 字体 | Notion 默认、衬线、等宽预设，以及 600 款 Google Fonts |
| 布局 | 紧凑、标准、宽幅，支持缩放、内边距、圆角和对齐方式 |
| 本地化 | 语言、时区、地区、城市、日期和时间格式 |
| 内容 | 标题、正文、图片、链接、音频、歌单、歌词、目标值和数据源 |
| 动态 | 动画开关、速度、随机种子、交互状态、自动轮播和刷新行为 |

Google Fonts 均为开源许可；无法访问字体服务时会自动回退到系统字体。

## 特色功能

### 音乐播放器

- 支持公开 MP3 / OGG 直链与多曲手动歌单。
- 支持 Meting 的网易云、QQ 音乐、酷狗和百度音乐资源。
- 支持封面、LRC 时间轴、动态频谱、音量、顺序/随机和单曲/列表循环。
- 提供录音室、极简、玻璃、黑胶和磁带等播放器造型。

> 浏览器和 Notion 可能阻止自动播放；首次点击播放后即可使用。平台 VIP 曲目可能只有试听资源，请确保音频来源和使用方式符合版权要求。

### 动态宠物与 GitHub Actions

每个用户在领养时都会获得随机宠物 ID，同名宠物也不会共享状态。默认跨设备状态保存在 `data/pets/<petId>.json`：

1. 用户通过预填 GitHub Issue 提交喂食、喂水或抚摸动作。
2. [Pet Actions](./.github/workflows/pet-actions.yml) 工作流合并反馈、更新状态并关闭 Issue。
3. GitHub Pages 重新部署后，原有 Notion 嵌入链接会读取新状态。
4. 喂食和喂水按 GitHub 用户分别限制为每两小时一次；抚摸会即时播放本地动画。

若需要免登录、1–2 秒跨设备同步，可按 [Worker 部署说明](./worker/README.md) 启用可选 Cloudflare Durable Object 服务。

### 公开 Notion 数据库进度与热力图

数据库进度条和热力图支持读取用户主动 Publish 的公开 Notion 数据库，不需要 Integration Token。连接器仅向组件返回列结构和聚合结果。

详细配置、限制和安全说明见 [公开 Notion 数据接入文档](./docs/NOTION-DATABASE.zh-CN.md)。该方式依赖 Notion 公共页面兼容接口，Notion 改版时可能需要同步更新。

## 项目结构

```text
.
├── index.html                  # 组件市场与可视化定制器
├── widget.html                 # 统一 Notion 嵌入入口
├── action.html                 # 宠物本地动作反馈页
├── connect.html                # 公开 Notion 数据连接页
├── favicon.svg                 # 项目 Icon
├── assets/
│   ├── readme-banner.svg       # README Hero / Banner
│   ├── catalog.js              # 组件、主题和布局注册表
│   ├── fonts.js                # 603 款字体目录
│   ├── app.js                  # 搜索、筛选、收藏和定制器
│   ├── styles.css              # 主页面样式
│   ├── widget.js               # 组件引擎与交互
│   └── widget.css              # 嵌入组件样式
├── data/pets/                  # GitHub Actions 宠物状态
├── .github/workflows/          # Pages 部署与宠物动作工作流
├── worker/                     # 可选实时同步与公开数据服务
└── docs/                       # 调研、数据接入和覆盖说明
```

### 技术栈

- 原生 HTML5、CSS3、JavaScript
- GitHub Pages 与 GitHub Actions
- 可选 Cloudflare Workers、Durable Objects
- 第三方可选数据源：Google Fonts、Meting、今日诗词等

项目没有前端构建步骤和运行时包管理依赖。

## 部署

### GitHub Pages

1. Fork 本仓库或将代码推送到自己的 GitHub 仓库。
2. 打开 `Settings → Pages`。
3. 将 `Build and deployment → Source` 设置为 `GitHub Actions`。
4. 推送到 `main` 或 `master`。
5. 等待 `Deploy GitHub Pages` 工作流完成。

部署配置位于 [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml)。

### 可选 Worker

只有实时宠物同步和公开 Notion 数据聚合需要 Worker。静态组件市场、定制器及绝大多数组件不依赖后端。部署方法见 [`worker/README.md`](./worker/README.md)。

## 隐私与安全

- 普通组件配置和本地交互状态保存在浏览器 `localStorage`。
- 公共 Notion 数据连接不收集 Integration Token，但数据库必须由用户主动 Publish。
- GitHub Actions 只使用 GitHub 自动提供的短期 `GITHUB_TOKEN`。
- 宠物状态文件不保存昵称和邮箱，只保存随机 ID、数值和截断后的用户哈希。
- 请勿将含敏感信息的 Notion 数据库设为公开。
- 黄历、星座和运势内容仅供娱乐，不构成专业建议。

安全问题请避免提交包含密钥、Token、私人链接或个人数据的公开 Issue。

## 参与贡献

欢迎提交新组件、主题、修复和文档改进：

1. Fork 仓库。
2. 创建分支：`git switch -c feat/my-widget`。
3. 完成修改并在本地运行静态服务器验证。
4. 提交清晰的 Commit。
5. 发起 Pull Request，说明组件用途、参数和测试结果。

提交新组件时，请同时更新 `assets/catalog.js`、对应渲染器、样式和覆盖文档。问题与建议可通过 [GitHub Issues](https://github.com/zengyincen/notion-widget-box/issues) 提交。

## 许可证与致谢

本项目采用 [MIT License](./LICENSE)。

产品范围参考了以下开源项目和社区实践：

- [ShoroukAziz/notion_widgets](https://github.com/ShoroukAziz/notion_widgets)
- [RylanBot/awesome-notion-widgets](https://github.com/RylanBot/awesome-notion-widgets)（MIT）
- Notion 组件社区中的公开分类、交互和嵌入方式

本项目的组件注册表、播放器、交互和视觉均为独立的数据驱动实现。Notion 是其各自权利人的商标，本项目与 Notion 官方无隶属或背书关系。

---

<p align="center">
  如果这个项目对你有帮助，欢迎点一个 ⭐，也欢迎分享你想看到的新组件。
</p>
