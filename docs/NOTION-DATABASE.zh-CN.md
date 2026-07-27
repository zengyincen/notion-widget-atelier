# Notion 数据库进度与热力图

## 原生数据库进度条

数据库单元格内不能直接嵌入一个独立 iframe。最适合的方式是使用 Formula 属性：

1. 建立数字属性 `已完成` 与 `总数`。
2. 建立 Formula 属性。
3. 在主页面选择“数据库进度条”。
4. 填写两个属性名，复制定制器生成的 Formula 2.0 公式。

示例：

```text
lets(
  done, toNumber(prop("已完成")),
  total, max(1, toNumber(prop("总数"))),
  ratio, min(1, max(0, done / total)),
  filled, floor(ratio * 10),
  repeat("■", filled).style("blue") + repeat("□", 10 - filled).style("gray") + " " + format(round(ratio * 100)) + "%"
)
```

## 页面内嵌进度条

若要在数据库页面或 Dashboard 中显示更美观的圆环、分段、里程碑进度，使用生成器复制 `widget.html?type=progress...` 链接并通过 `/embed` 插入。

组件值可以直接放在 URL 中：

```text
widget.html?type=database-progress&value=42&max=100&label=项目完成度
```

Notion 不会自动把每行数据库属性插值到 iframe URL。我们提供零 Token 的公开页面连接器：将数据库页面 Publish 后，在定制器点击“安全连接 Notion 数据库”，选择属性映射即可。托管服务会读取公开数据库并返回聚合后的 `{ value, max }`。

## 热力图数据格式

定制器支持 `YYYY-MM-DD:数值`，每行一条：

```text
2026-07-21:2
2026-07-22:5
2026-07-23:3
```

“连续打卡热力图”无需远程数据，点击格子后状态保存在当前浏览器。“日历热力图”可以通过公开连接器选择日期列与可选数值列；不选数值列时，每一行计为 1 次活动。

## 公开数据库连接步骤

1. 在 Notion 打开数据库原始页面（不要使用仅链接视图）。
2. Share → Publish，并用匿名浏览器确认表格和行可见。
3. 在组件定制器点击“安全连接 Notion 数据库”。
4. 粘贴公开 Notion URL，读取列结构。
5. 选择聚合列并生成数据 URL；无需自行部署 Worker。

公开连接器使用 Notion 网页自身的未公开公共页面接口，不是官方 API，因此存在兼容性风险。项目会缓存聚合结果 60 秒，降低请求频率；若 Notion 调整内部接口，仍可回退到手动 `日期:数值` 数据或原生 Formula。

## 安全边界

- 此连接方式完全不需要 Notion Internal Integration Token。
- 发布前应移除邮箱、客户资料、内部项目等敏感字段。Notion 公共页面本身对所有拿到链接的人可见。
- 我们的托管服务只返回列名/类型和聚合值，不代理完整原始行。
- 私有数据库不适用此模式；不要尝试使用登录 Cookie 或其他私有凭证绕过权限。
