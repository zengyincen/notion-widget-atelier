(function () {
  const F = {
    text: (key, label, value, placeholder = "") => ({ key, label, type: "text", value, placeholder }),
    area: (key, label, value, placeholder = "") => ({ key, label, type: "textarea", value, placeholder }),
    num: (key, label, value, min = 0, max = 9999) => ({ key, label, type: "number", value, min, max }),
    date: (key, label, value = "") => ({ key, label, type: "date", value }),
    datetime: (key, label, value = "") => ({ key, label, type: "datetime-local", value }),
    toggle: (key, label, value = true) => ({ key, label, type: "checkbox", value }),
    select: (key, label, value, options) => ({ key, label, type: "select", value, options })
  };

  const C = (id, title, category, icon, description, fields = [], extra = {}) => ({
    id, title, category, icon, description, fields,
    tags: extra.tags || [], popular: Boolean(extra.popular), isNew: Boolean(extra.isNew),
    interactive: Boolean(extra.interactive), online: Boolean(extra.online),
    added: extra.added || 2025
  });

  const components = [
    C("digital-clock", "数字时钟", "time", "◷", "精确、安静的本地数字时钟。", [F.text("title", "问候标题", "今天也要保持专注"), F.select("hour12", "时制", "false", [["false", "24 小时"], ["true", "12 小时"]]), F.toggle("seconds", "显示秒钟", true)], { tags: ["clock", "时钟", "时间"], popular: true }),
    C("analog-clock", "模拟时钟", "time", "◴", "带秒针与刻度的经典表盘。", [F.text("title", "表盘标题", "SHANGHAI"), F.toggle("seconds", "显示秒针", true)], { tags: ["clock", "analog", "钟表"], popular: true }),
    C("flip-clock", "翻页时钟", "time", "▥", "机场翻牌式大数字时钟。", [F.select("hour12", "时制", "false", [["false", "24 小时"], ["true", "12 小时"]]), F.toggle("seconds", "显示秒钟", false)], { tags: ["flip", "clock", "翻页"], popular: true }),
    C("word-clock", "文字时钟", "time", "Aa", "用自然语言描述当前时间。", [F.text("title", "标题", "此刻"), F.toggle("showDate", "显示日期", true)], { tags: ["文字", "clock", "word"], isNew: true }),
    C("world-clock", "世界时钟", "time", "◎", "同时查看三个城市的当地时间。", [F.select("timezone2", "第二时区", "Europe/London", [["Europe/London", "伦敦"], ["Europe/Paris", "巴黎"], ["Asia/Tokyo", "东京"], ["America/New_York", "纽约"]]), F.select("timezone3", "第三时区", "America/New_York", [["America/New_York", "纽约"], ["America/Los_Angeles", "洛杉矶"], ["Asia/Seoul", "首尔"], ["Australia/Sydney", "悉尼"]])], { tags: ["world", "timezone", "世界时钟"], popular: true }),
    C("greeting", "问候日期", "time", "☻", "随当地时间变化的个性化问候。", [F.text("name", "你的名字", "朋友"), F.toggle("showDate", "显示完整日期", true)], { tags: ["greeting", "问候", "日期"], popular: true }),
    C("calendar", "月历", "time", "▦", "无需数据库的月度日期视图。", [F.select("weekStart", "每周开始", "1", [["1", "星期一"], ["0", "星期日"]]), F.toggle("weekNumbers", "显示周数", false)], { tags: ["calendar", "日历", "月历"], popular: true }),
    C("week-calendar", "本周计划", "time", "▤", "一眼查看本周七天与今日。", [F.select("weekStart", "每周开始", "1", [["1", "星期一"], ["0", "星期日"]]), F.text("title", "标题", "本周节奏")], { tags: ["week", "calendar", "周计划"] }),
    C("countdown", "事件倒计时", "time", "⌛", "让考试、旅行与发布日期保持可见。", [F.text("label", "事件名称", "下一个里程碑"), F.datetime("target", "目标时间"), F.text("emoji", "图标", "✦"), F.select("countMode", "计数方式", "full", [["full", "天时分秒"], ["days", "仅天数"]])], { tags: ["countdown", "倒计时", "deadline"], popular: true, interactive: true }),
    C("day-progress", "今日进度", "time", "◒", "可视化今天已经走过多少。", [F.text("label", "标题", "今天")], { tags: ["today", "progress", "今日"], popular: true }),
    C("week-progress", "本周进度", "time", "◫", "显示本周剩余与已完成比例。", [F.text("label", "标题", "这一周"), F.select("weekStart", "每周开始", "1", [["1", "星期一"], ["0", "星期日"]])], { tags: ["week", "progress", "本周"] }),
    C("month-progress", "本月进度", "time", "▰", "把一个月压缩成清晰的进度条。", [F.text("label", "标题", "这个月")], { tags: ["month", "progress", "本月"] }),
    C("year-progress", "年度进度", "time", "◩", "年度百分比与剩余天数。", [F.text("label", "标题", "今年")], { tags: ["year", "progress", "年度"], popular: true }),
    C("life-calendar", "人生格子", "time", "▦", "用周格子呈现人生时间。", [F.date("birthday", "出生日期", "1995-01-01"), F.num("lifeExpectancy", "预期年龄", 85, 1, 120)], { tags: ["life", "calendar", "人生"], popular: true }),
    C("moon-phase", "月相", "info", "◐", "根据日期展示实时月相。", [F.text("title", "标题", "今晚的月亮"), F.toggle("illumination", "显示照明比例", true)], { tags: ["moon", "lunar", "月相"], popular: true }),

    C("pomodoro", "番茄钟", "focus", "◎", "可调节的专注 / 休息循环。", [F.text("label", "专注标题", "深度工作"), F.num("focus", "专注分钟", 25, 1, 120), F.num("rest", "休息分钟", 5, 1, 60)], { tags: ["pomodoro", "番茄钟", "focus"], popular: true, interactive: true }),
    C("timer", "计时器", "focus", "◵", "适合运动、烹饪与时间盒。", [F.text("label", "标题", "专注计时"), F.num("minutes", "分钟", 10, 1, 240)], { tags: ["timer", "计时器"], interactive: true }),
    C("stopwatch", "秒表", "focus", "◶", "支持开始、暂停与圈次记录。", [F.text("label", "标题", "秒表")], { tags: ["stopwatch", "秒表"], interactive: true }),
    C("habit-tracker", "习惯追踪", "focus", "✓", "本地保存的每日习惯打卡。", [F.text("label", "习惯名称", "每天阅读"), F.num("goal", "每周目标", 5, 1, 7)], { tags: ["habit", "tracker", "习惯"], popular: true, interactive: true }),
    C("task-list", "今日清单", "focus", "☑", "轻量、本地保存的待办事项。", [F.text("title", "标题", "今日三件事"), F.area("items", "初始事项（每行一项）", "整理桌面\n完成重点任务\n散步 20 分钟")], { tags: ["todo", "task", "待办"], popular: true, interactive: true }),
    C("water-tracker", "饮水追踪", "focus", "◉", "轻点杯子记录每日饮水。", [F.num("goal", "每日杯数", 8, 1, 16), F.text("label", "标题", "今日饮水")], { tags: ["water", "health", "饮水"], interactive: true }),
    C("counter", "计数器", "focus", "±", "为习惯、库存或里程碑计数。", [F.text("label", "名称", "连续专注"), F.num("start", "起始值", 0, -9999, 9999), F.num("step", "每次增量", 1, 1, 100)], { tags: ["counter", "计数"], interactive: true }),
    C("breathing", "呼吸练习", "focus", "◌", "跟随动画完成一轮平静呼吸。", [F.num("inhale", "吸气秒数", 4, 2, 12), F.num("hold", "屏息秒数", 4, 0, 12), F.num("exhale", "呼气秒数", 6, 2, 16)], { tags: ["breathing", "mindfulness", "呼吸"], isNew: true, interactive: true }),
    C("priority-matrix", "优先矩阵", "focus", "⊞", "四象限梳理重要与紧急事项。", [F.text("title", "标题", "今日优先级"), F.text("urgent", "最重要事项", "完成核心交付")], { tags: ["eisenhower", "priority", "优先级"], interactive: true }),
    C("study-sessions", "学习场次", "focus", "⌁", "记录今天完成的专注场次。", [F.text("label", "目标", "学习冲刺"), F.num("sessions", "每日目标场次", 6, 1, 20)], { tags: ["study", "sessions", "学习"], isNew: true, interactive: true }),

    C("calculator", "计算器", "tools", "＋", "适合嵌入页面的基础计算器。", [F.text("title", "标题", "快速计算")], { tags: ["calculator", "计算器"], interactive: true }),
    C("unit-converter", "单位换算", "tools", "⇄", "长度、重量与温度快速换算。", [F.select("unitType", "默认类型", "length", [["length", "长度"], ["weight", "重量"], ["temperature", "温度"]])], { tags: ["converter", "单位换算"], interactive: true }),
    C("currency-converter", "汇率换算", "tools", "¤", "通过公开汇率 API 换算货币。", [F.select("from", "原货币", "CNY", [["CNY", "CNY"], ["USD", "USD"], ["EUR", "EUR"], ["JPY", "JPY"]]), F.select("to", "目标货币", "USD", [["USD", "USD"], ["CNY", "CNY"], ["EUR", "EUR"], ["JPY", "JPY"]])], { tags: ["currency", "exchange", "汇率"], online: true, interactive: true }),
    C("date-difference", "日期间隔", "tools", "↔", "计算两个日期之间相隔多久。", [F.date("startDate", "开始日期"), F.date("endDate", "结束日期")], { tags: ["date", "difference", "日期"], interactive: true }),
    C("bmi-calculator", "BMI 计算", "tools", "⌁", "根据身高体重估算 BMI。", [F.select("units", "单位", "metric", [["metric", "公制 kg / cm"], ["imperial", "英制 lb / in"]])], { tags: ["bmi", "health", "健康"], interactive: true }),
    C("age-calculator", "年龄计算", "tools", "◯", "精确显示年龄与下次生日。", [F.date("birthday", "出生日期", "2000-01-01")], { tags: ["age", "birthday", "年龄"], interactive: true }),
    C("random-number", "随机数字", "tools", "⌘", "在指定范围内生成随机数。", [F.num("min", "最小值", 1, -9999, 9999), F.num("max", "最大值", 100, -9999, 9999)], { tags: ["random", "number", "随机"], interactive: true }),
    C("password-generator", "密码生成器", "tools", "✳", "本地生成强随机密码。", [F.num("length", "长度", 16, 6, 64), F.toggle("symbols", "包含符号", true)], { tags: ["password", "security", "密码"], interactive: true }),
    C("qr-code", "二维码", "tools", "▦", "把文字或链接变成二维码。", [F.text("qrText", "内容", "https://www.notion.so"), F.text("label", "说明", "扫描打开")], { tags: ["qr", "二维码", "link"], online: true }),
    C("clipboard", "一键复制", "tools", "▣", "轻点按钮复制常用文本。", [F.area("copyText", "要复制的内容", "这是一段可以一键复制的文字。"), F.text("buttonLabel", "按钮文字", "复制内容")], { tags: ["clipboard", "copy", "复制"], interactive: true }),

    C("weather", "实时天气", "info", "☀", "任意城市的当前天气与体感。", [F.text("city", "城市 / 地区", "上海"), F.select("unit", "温度单位", "celsius", [["celsius", "摄氏 °C"], ["fahrenheit", "华氏 °F"]]), F.select("details", "信息密度", "full", [["full", "完整"], ["minimal", "极简"]])], { tags: ["weather", "天气", "地区"], popular: true, online: true }),
    C("daily-quote", "语录卡片", "info", "❞", "展示自定义语录与署名。", [F.area("quote", "语录", "Simplicity is the ultimate sophistication."), F.text("author", "署名", "Leonardo da Vinci"), F.toggle("showMark", "显示引号", true)], { tags: ["quote", "语录", "inspiration"], popular: true }),
    C("emoji-card", "Emoji 卡片", "info", "☺", "用一个表情传达今天的情绪。", [F.text("emoji", "Emoji", "🌱"), F.text("label", "文字", "Slow growth is still growth.")], { tags: ["emoji", "mood", "表情"], popular: true }),
    C("zodiac", "星座卡片", "info", "✦", "根据生日显示星座与今日提示。", [F.date("birthday", "生日", "2000-07-27"), F.text("name", "名字", "我的星象")], { tags: ["zodiac", "astrology", "星座"], isNew: true }),
    C("affirmation", "每日肯定", "info", "♡", "给自己一条柔和而坚定的提醒。", [F.text("name", "称呼", "你"), F.area("message", "肯定语", "不必完美，也值得为今天的每一步感到骄傲。")], { tags: ["affirmation", "daily", "肯定语"], isNew: true }),
    C("word-of-day", "每日一词", "info", "A", "适合语言学习的单词卡片。", [F.text("word", "单词", "serendipity"), F.text("meaning", "释义", "意外发现美好事物的运气"), F.text("phonetic", "音标", "/ˌserənˈdɪpəti/")], { tags: ["word", "learning", "单词"], isNew: true }),
    C("holiday", "节日提示", "info", "✺", "显示下一个重要节日。", [F.text("holidayName", "节日名称", "新年"), F.date("holidayDate", "节日日期", "2027-01-01")], { tags: ["holiday", "节日", "countdown"], isNew: true }),
    C("sunrise", "日出日落", "info", "◑", "根据城市显示日出与日落。", [F.text("city", "城市 / 地区", "上海"), F.toggle("dayLength", "显示日长", true)], { tags: ["sunrise", "sunset", "日出"], online: true }),

    C("financial-goal", "财务目标", "life", "¥", "可视化储蓄或还款目标。", [F.text("label", "目标名称", "旅行基金"), F.num("value", "当前金额", 6800, 0, 99999999), F.num("max", "目标金额", 10000, 1, 99999999), F.text("currency", "货币符号", "¥")], { tags: ["finance", "goal", "财务"], popular: true }),
    C("savings-goal", "储蓄罐", "life", "◒", "把长期储蓄变成可见进展。", [F.text("label", "目标名称", "梦想储蓄罐"), F.num("value", "已存", 2400, 0, 99999999), F.num("max", "目标", 8000, 1, 99999999)], { tags: ["savings", "money", "储蓄"], interactive: true }),
    C("photo-gallery", "照片画廊", "life", "▧", "支持自定义图片链接的拼贴画廊。", [F.area("images", "图片链接（每行一个）", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80\nhttps://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80\nhttps://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80"), F.text("title", "标题", "最近的风景")], { tags: ["gallery", "photo", "照片"], popular: true, online: true }),
    C("image-slider", "图片轮播", "life", "▱", "自动播放的沉浸式图片轮播。", [F.area("images", "图片链接（每行一个）", "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1000&q=80\nhttps://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=80"), F.num("interval", "切换秒数", 5, 2, 20)], { tags: ["slider", "image", "轮播"], online: true, interactive: true }),
    C("travel-map", "旅行足迹", "life", "⌖", "用地点标签记录走过的城市。", [F.area("places", "城市（每行一个）", "上海\n京都\n巴黎\n墨尔本"), F.text("title", "标题", "我的旅行足迹")], { tags: ["travel", "map", "旅行"], popular: true }),
    C("distance-map", "两地距离", "life", "↗", "估算两个城市之间的直线距离。", [F.text("fromCity", "出发地", "上海"), F.text("toCity", "目的地", "东京")], { tags: ["distance", "airport", "距离"], online: true, interactive: true }),
    C("globe", "旋转地球", "life", "◉", "轻量 CSS 地球与访问地点。", [F.text("title", "标题", "Explore the world"), F.toggle("rotate", "自动旋转", true)], { tags: ["globe", "earth", "地球"], popular: true }),

    C("link-button", "链接按钮", "links", "↗", "干净醒目的行动按钮。", [F.text("buttonLabel", "按钮文字", "打开我的页面"), F.text("url", "目标链接", "https://www.notion.so"), F.text("subtext", "辅助说明", "在新窗口中打开")], { tags: ["button", "link", "按钮"], interactive: true }),
    C("social-links", "社交链接", "links", "⌁", "一组统一风格的社交入口。", [F.text("name", "名称", "Shorouk"), F.text("links", "链接标签", "GitHub · Instagram · X · LinkedIn"), F.text("url", "主页链接", "https://github.com/")], { tags: ["social", "links", "社交"], popular: true, interactive: true }),
    C("navigation", "页面导航", "links", "☰", "横向或纵向的 Notion 页面导航。", [F.text("title", "标题", "Workspace"), F.area("items", "导航项（每行一个）", "Home\nProjects\nNotes\nArchive")], { tags: ["navigation", "nav", "导航"], popular: true, interactive: true }),
    C("profile-card", "个人名片", "links", "◉", "头像、简介与链接的个人卡片。", [F.text("name", "名字", "Your Name"), F.text("bio", "简介", "Designer, maker & lifelong learner."), F.text("avatar", "头像链接（可选）", "")], { tags: ["profile", "resume", "名片"], isNew: true }),
    C("payment-button", "支持 / 购买按钮", "links", "♡", "适合 Gumroad、Etsy 与赞赏链接。", [F.text("buttonLabel", "按钮文字", "支持我的创作"), F.text("url", "支付链接", "https://gumroad.com/"), F.text("price", "价格 / 提示", "Buy me a coffee")], { tags: ["payment", "gumroad", "etsy", "支付"], interactive: true }),
    C("link-list", "链接集合", "links", "↳", "紧凑的书签与资源列表。", [F.text("title", "标题", "常用链接"), F.area("items", "链接名称（每行一个）", "Notion\nGitHub\nReadwise\nFigma")], { tags: ["bookmark", "links", "链接"], interactive: true }),

    C("progress", "目标进度", "data", "↗", "圆环或进度条形式的通用目标。", [F.text("label", "目标名称", "本周阅读计划"), F.num("value", "当前值", 7, 0, 9999), F.num("max", "目标值", 10, 1, 9999), F.text("unitLabel", "单位", "章节"), F.select("progressStyle", "形式", "ring", [["ring", "圆环"], ["bar", "进度条"]])], { tags: ["progress", "goal", "进度"], popular: true }),
    C("kpi", "KPI 指标", "data", "↗", "展示关键数字与环比变化。", [F.text("label", "指标名称", "本月完成"), F.text("valueText", "指标数值", "128"), F.text("change", "变化", "+18.4%"), F.text("unitLabel", "单位", "tasks")], { tags: ["kpi", "metric", "数据"], isNew: true }),
    C("bar-chart", "柱状图", "data", "▥", "适合周趋势与分类对比。", [F.text("title", "标题", "本周专注时间"), F.area("values", "数值（逗号分隔）", "3,5,4,7,6,8,5"), F.text("labels", "标签（逗号分隔）", "一,二,三,四,五,六,日")], { tags: ["chart", "bar", "柱状图"], isNew: true }),
    C("donut-chart", "环形图", "data", "◔", "简洁的比例与构成展示。", [F.text("title", "标题", "项目构成"), F.num("value", "主要占比", 68, 0, 100), F.text("label", "中心标签", "完成")], { tags: ["chart", "donut", "环形图"], isNew: true }),
    C("heatmap", "日历热力图", "data", "▦", "GitHub 风格的年度习惯与活动热力图。", [F.text("title", "标题", "年度专注热力图"), F.text("dataUrl", "Notion 聚合数据 URL（可选）", "", "由安全连接向导生成"), F.area("heatData", "手动数据（日期:数值，每行一条）", "2026-07-21:2\n2026-07-22:5\n2026-07-23:3\n2026-07-24:8\n2026-07-25:6\n2026-07-26:4\n2026-07-27:9"), F.num("levels", "颜色级数", 5, 2, 8), F.select("heatRange", "日期范围", "year", [["year", "最近一年"], ["quarter", "最近 90 天"], ["month", "最近 30 天"]])], { tags: ["heatmap", "calendar", "热力图", "习惯", "notion api"], popular: true, isNew: true, online: true }),
    C("streak-heatmap", "连续打卡热力图", "data", "▦", "点击每日格子打卡，并自动计算连续天数。", [F.text("label", "习惯名称", "每日创作"), F.num("days", "显示天数", 91, 28, 365), F.num("goal", "每日目标", 1, 1, 99)], { tags: ["streak", "heatmap", "打卡", "habit"], isNew: true, interactive: true }),
    C("database-progress", "数据库进度条", "data", "▰", "URL 参数与 Notion Formula 友好的动态进度条。", [F.text("label", "字段名称", "项目完成度"), F.text("dataUrl", "Notion 聚合数据 URL（可选）", "", "由安全连接向导生成"), F.num("value", "当前值", 42, 0, 999999), F.num("max", "目标值", 100, 1, 999999), F.text("currentProp", "Notion 当前值属性名", "已完成"), F.text("maxProp", "Notion 目标值属性名", "总数"), F.select("barStyle", "样式", "blocks", [["blocks", "分段方块"], ["smooth", "平滑进度"], ["milestone", "里程碑"]]), F.text("source", "数据来源标签", "Notion Database")], { tags: ["database", "formula", "progress", "数据库", "进度条", "notion api"], popular: true, isNew: true, online: true }),
    C("segmented-progress", "分段里程碑", "data", "◫", "把项目阶段显示为可读的分段进度。", [F.text("label", "项目名称", "产品发布"), F.area("stages", "阶段（每行一个）", "构思\n设计\n开发\n测试\n发布"), F.num("current", "当前阶段", 3, 1, 12)], { tags: ["milestone", "stages", "里程碑", "进度"], isNew: true }),

    C("pet-companion", "桌面宠物", "life", "◕", "会饿、会渴、需要陪伴的动态宠物。", [F.text("ownerName", "主人昵称", "朋友"), F.text("petName", "宠物名字", "Mochi"), F.select("petType", "宠物", "cat", [["cat", "小猫"], ["dog", "小狗"], ["bunny", "兔子"], ["blob", "软团子"]]), F.text("petId", "宠物 ID（自动生成）", "mochi-2026"), F.select("syncMode", "状态同步", "github", [["github", "GitHub Actions（推荐）"], ["local", "仅当前浏览器"], ["worker", "Cloudflare Worker（即时）"]]), F.text("githubRepo", "GitHub 仓库", "zengyincen/notion-widget-box", "格式：owner/repo"), F.text("syncUrl", "Worker 地址（仅 Worker 模式）", "", "https://xxx.workers.dev"), F.toggle("showNeeds", "显示状态条", true)], { tags: ["pet", "dynamic", "宠物", "互动", "github actions", "cloud sync"], popular: true, isNew: true, interactive: true }),
    C("almanac", "每日黄历", "info", "宜", "根据日期生成宜忌、农历与幸运提示。", [F.text("title", "标题", "今日黄历"), F.toggle("showLunar", "显示农历日期", true), F.toggle("showLucky", "显示幸运色与方位", true)], { tags: ["almanac", "lunar", "黄历", "宜忌"], popular: true, isNew: true }),
    C("horoscope", "星座运势", "info", "✧", "依据星座与日期稳定生成每日运势。", [F.select("sign", "星座", "leo", [["aries", "白羊座"], ["taurus", "金牛座"], ["gemini", "双子座"], ["cancer", "巨蟹座"], ["leo", "狮子座"], ["virgo", "处女座"], ["libra", "天秤座"], ["scorpio", "天蝎座"], ["sagittarius", "射手座"], ["capricorn", "摩羯座"], ["aquarius", "水瓶座"], ["pisces", "双鱼座"]]), F.select("detail", "信息密度", "full", [["full", "完整运势"], ["compact", "一句话"]])], { tags: ["horoscope", "zodiac", "星座", "运势"], popular: true, isNew: true }),
    C("solar-terms", "节气时钟", "info", "☼", "显示当前与下一个二十四节气。", [F.text("title", "标题", "四时有序"), F.toggle("countdown", "显示距离下一节气", true)], { tags: ["solar terms", "节气", "calendar"], isNew: true }),
    C("focus-garden", "专注花园", "focus", "✿", "完成专注场次，让花园逐渐生长。", [F.text("label", "花园名称", "我的专注花园"), F.num("minutes", "每场分钟", 25, 1, 120), F.num("dailyGoal", "每日目标场次", 4, 1, 12)], { tags: ["focus", "garden", "专注", "花园"], isNew: true, interactive: true }),
    C("mood-orbit", "情绪轨道", "life", "◌", "每天选择心情，形成一周情绪轨迹。", [F.text("label", "标题", "本周心情"), F.select("defaultMood", "默认心情", "calm", [["great", "很好"], ["calm", "平静"], ["tired", "疲惫"], ["low", "低落"]])], { tags: ["mood", "emotion", "情绪", "轨道"], isNew: true, interactive: true }),
    C("virtual-plant", "虚拟植物", "life", "♧", "浇水与签到会让植物持续成长。", [F.text("plantName", "植物名字", "小绿"), F.select("plantType", "植物", "monstera", [["monstera", "龟背竹"], ["cactus", "仙人掌"], ["flower", "小雏菊"]]), F.num("growthGoal", "成熟所需天数", 14, 3, 60)], { tags: ["plant", "growth", "植物", "养成"], isNew: true, interactive: true }),
    C("daily-card", "每日卡牌", "info", "✦", "每天稳定抽取一张主题卡与行动建议。", [F.select("deck", "卡牌主题", "gentle", [["gentle", "温柔提醒"], ["creative", "创意灵感"], ["focus", "专注行动"]]), F.text("name", "称呼", "给今天的你")], { tags: ["daily", "card", "每日", "卡牌"], isNew: true, interactive: true }),
    C("decision-wheel", "决定转盘", "tools", "◉", "输入选项，让转盘帮你做一个小决定。", [F.text("title", "标题", "今天选什么？"), F.area("choices", "选项（每行一个）", "先做最难的事\n整理十分钟\n出去走走\n喝杯水")], { tags: ["decision", "wheel", "随机", "转盘"], isNew: true, interactive: true })
  ];

  const categories = [
    { id: "all", label: "全部组件", icon: "⌘" },
    { id: "time", label: "时间与日期", icon: "◷" },
    { id: "focus", label: "效率与专注", icon: "◎" },
    { id: "tools", label: "实用工具", icon: "⌁" },
    { id: "info", label: "信息与灵感", icon: "☀" },
    { id: "life", label: "生活与记录", icon: "♡" },
    { id: "links", label: "链接与社交", icon: "↗" },
    { id: "data", label: "数据与目标", icon: "▥" }
  ];

  const themes = [
    { id: "notion", label: "Notion Paper", short: "Notion", bg: "#f7f6f2", surface: "#ffffff", text: "#20201e", accent: "#ff8a65", kind: "light" },
    { id: "apple", label: "Apple Clean", short: "Apple", bg: "#f2f2f7", surface: "#ffffff", text: "#1c1c1e", accent: "#007aff", kind: "light" },
    { id: "glass", label: "Frosted Glass", short: "Glass", bg: "#dfeeff", surface: "#eef7ff", text: "#183153", accent: "#4f8cff", kind: "glass" },
    { id: "midnight", label: "Midnight", short: "Dark", bg: "#121214", surface: "#1c1c1e", text: "#f5f5f7", accent: "#78a9ff", kind: "dark" },
    { id: "blush", label: "Soft Blush", short: "Blush", bg: "#f9e7e1", surface: "#fff7f4", text: "#4a302d", accent: "#e9786a", kind: "light" },
    { id: "sage", label: "Quiet Sage", short: "Sage", bg: "#e4ece5", surface: "#f5f8f3", text: "#263a2e", accent: "#5e9472", kind: "light" }
  ];

  const layouts = [
    { id: "compact", label: "紧凑", width: 320, height: 180 },
    { id: "standard", label: "标准", width: 420, height: 300 },
    { id: "hero", label: "宽幅", width: 680, height: 300 }
  ];

  window.WIDGET_BOX = { components, categories, themes, layouts, F };
})();
