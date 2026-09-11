# 见π PRD v0.2

> 状态：Draft / 可施工约束稿  
> 产品名：见π（暂定；后续改名不影响内容模型）  
> 所属：Tomz.io 一级内容产品  
> 当前实现分支：`preview/weekly-v0-1`  
> 编辑素材分支：`editorial/jianpi-radar`  
> 生产分支：`main`  
> UI：v0.2 不定稿，下一轮单独讨论

---

## 1. 为什么做见π

Tomz.io 目前以博客、书架、作品、项目等长期内容为主，整体气质克制、稳定，适合沉淀完整文章与长期判断。

但很多值得注意的东西并不适合立刻写成长文：

- 新出现的 Agent / AI 工程实践；
- 开源项目的异常增长或新架构；
- 有意思的产品与工具；
- 中国开发者现场；
- 商业与分发变化；
- 研究、论文与值得读的材料；
- 很怪但值得看一眼的项目、论文、产品与用法；
- Tomz 与 Mira 在日常讨论中形成、尚不足以单独成文的判断。

见π用于承接这一类内容。

它不是“新闻周刊”，也不是“链接合集”，而是 Tomz × Mira 对外部世界进行持续观察、筛选、聚类与判断后形成的一期一期内容产品。

核心原则：

> **不是把这一周发生的东西都搬进来，而是留下这一周值得继续看的东西。**

---

## 2. 产品定位

### 2.1 一级内容产品

见π是 Tomz.io 的一级内容产品，与博客、书架、作品、项目等并列。

“周刊”仅描述当前发布节奏，不作为产品名或内容层级。

当前预期：

```text
Tomz.io
├── 博客
├── 见π
├── 投稿
├── 作品
├── 项目
├── 书架
└── 关于
```

### 2.2 不是 OPC 周报

OPC / Company OS / AI Employee / Agent Workforce / Harness / Control Plane / OpenClaw 等仍是重要观察主题，但只是见π Radar 的一部分。

见π的观察范围至少包括：

1. Agent / AI；
2. 开源项目；
3. 产品与工具；
4. 中国开发者现场；
5. 商业与分发；
6. 研究与值得读；
7. 异常信号；
8. 鬼集。

### 2.3 Tomz 是主编

自动化可以：

- 搜索；
- 去重；
- 聚类；
- 摘要；
- 形成候选；
- 提出趋势判断；
- 生成编辑 shortlist；
- 形成草稿建议。

自动化不能：

- 代表 Tomz 做最终入选判断；
- 自动发布正式见π；
- 自动把候选写成 Tomz 的观点；
- 未经人工确认写入生产内容；
- 将素材分支反向合并进 `main`。

---

## 3. 内容模型

### 3.1 一期一篇 Markdown

正式发布内容继续遵守 Tomz.io 的单一事实源原则。

目录建议：

```text
src/pages/weekly/
├── 001-*.md
├── 002-*.md
└── ...
```

当前预览已经使用 `src/pages/weekly/`，v0.2 暂不为了命名调整物理目录。

产品最终 URL 是否使用 `/weekly`、`/jianpi`、`/pi` 或其他路径，暂列 TBD。URL 决策必须单独考虑已有预览实现、SEO、canonical 与未来稳定性，不因产品改名立即迁移。

### 3.2 YAML frontmatter 只保存稳定元数据

示例：

```yaml
---
title: "见π 001：公司开始长出控制面"
group: 见π
issue: 1
date: 2026年9月8日
readTime: 10 分钟阅读
lead: 这一周最明显的变化……
tags:
  - AI
  - Agent
  - OPC
author:
  - tomz
  - mira
writingMode: co-authored
---
```

v0.2 核心字段：

| 字段 | 必填 | 含义 |
| --- | --- | --- |
| `title` | 是 | 本期标题 |
| `group` | 是 | 一级内容性质，目标为“见π” |
| `issue` | 是 | 永久期号，整数，不复用 |
| `date` | 是 | 作者声明的发布日期 |
| `readTime` | 是 | 阅读时间 |
| `lead` | 建议 | 本期导语 / 核心判断摘要 |
| `tags` | 建议 | 本期真正涉及的主题 |
| `author` | 是 | 按 Tomz.io 署名协议 |
| `writingMode` | 按需 | 共著等写作关系 |

注意：

- `issue` 是一期的永久身份；
- 文件 slug 负责 URL；
- Tag 只表达主题；
- 不用 Tag 表达“见π”结构；
- 不把栏目模块写进 frontmatter。

正式落生产前，必须与 `docs/AUTHORSHIP.md` 的实际 author schema 对齐；当前预览样例不作为最终 schema 的唯一依据。

### 3.3 正文模块由 Markdown heading 表达

示例：

```md
## 本期判断

...

## Agent / AI Radar

...

## 产品与工具

...

## 中国开发者现场

...

## 鬼集

...

## 下周继续盯

...
```

不引入：

```yaml
sections:
  - type: agent-radar
  - type: product
```

原因：

> **常驻模块是编辑承诺，动态模块是这一期自己的性格。**

栏目不应该为了机器解析而变成填表系统。

---

## 4. 编辑素材库

### 4.1 固定仓库与分支

素材库固定为：

```text
Repository: dangjingtao/tomz-io
Branch: editorial/jianpi-radar
```

该分支只存编辑素材，不参与 Tomz.io 构建。

硬规则：

> **`editorial/jianpi-radar` 永远不允许合并到 `main`。**

正式内容只能经过人工编辑后，由正常内容分支进入生产。

### 4.2 目录

```text
YYYY/
└── Wxx/
    ├── YYYY-MM-DD.yml
    ├── discussion.yml
    └── shortlist.yml
```

含义：

- `YYYY-MM-DD.yml`：每日 Radar 保留下来的候选；
- `discussion.yml`：Tomz 与 Mira 日常讨论中值得回传的材料；
- `shortlist.yml`：周编辑汇总。

### 4.3 候选结构

基础结构：

```yaml
- title:
  url:
  source:
  radar:
  topic:
  discoveredAt:
  origin: radar
  note:
  status: candidate
```

`origin`：

```text
radar
discussion
```

`status`：

```text
candidate
selected
hold
skip
```

候选池是编辑工作台，不是网站内容，不进入 sitemap、搜索索引或正式站点构建。

---

## 5. Radar 工作流

### 5.1 日常采集

当前自动化任务名称：

```text
见π Radar
```

每天运行。

固定数据目标：

```text
dangjingtao/tomz-io
└── editorial/jianpi-radar
```

日常执行：

```text
公开 Web / GitHub / 一手来源
        ↓
多路 Radar
        ↓
真实性与新鲜度检查
        ↓
去重 / 降噪
        ↓
少量高信号候选
        ↓
YYYY/Wxx/YYYY-MM-DD.yml
```

目标不是完成机械配额。

参考容量：

- 一周浏览约 70–120 条原始信号；
- 留下约 25–40 条有效候选；
- 正式编辑建议约 8–15 条。

以上是工作容量目标，不是 KPI。质量不足时宁缺毋滥。

### 5.2 Radar 分类

基础 Radar：

- `agent-ai`
- `open-source`
- `product`
- `china-dev`
- `business-distribution`
- `research-reading`
- `anomaly`
- `ghost`

其中“鬼集”专门捕捉：

- 怪项目；
- 怪产品；
- 怪论文；
- 旧技术突然复活；
- 正常技术的非常规用法；
- 极小团队 / 单人做出异常体量的东西；
- 不一定重要，但看完会产生新问题的东西。

“鬼集”不以猎奇为目标，至少应满足“真实、有意思、有启发、值得立即理解”中的多项。

### 5.3 周一编辑

周一同一任务额外执行周编辑，不新增第二个定时任务。

```text
最近 7 天候选
    ↓
去重
    ↓
主题聚类
    ↓
3 个趋势判断
    ↓
15–25 个编辑候选
    ↓
8–15 个建议入选项
    ↓
shortlist.yml
```

OPC 相关内容继续参与，但不拥有特殊结构地位。

---

## 6. 对话回传机制

Tomz 与 Mira 的日常聊天也属于见π的输入源之一，但不能机械归档聊天。

当讨论出现以下类型结果时，可以回传：

- 一个真正值得持续观察的新项目；
- 一个有证据支撑的新趋势判断；
- 一个适合“鬼集”的东西；
- 一个尚不足以成文但值得一周后再看的问题；
- 一条可能成为见π素材的产品 / 商业 / 开源线索。

写入：

```text
YYYY/Wxx/discussion.yml
```

并使用：

```yaml
origin: discussion
```

普通聊天、情绪交流、未形成有效线索的随口想法不进入素材库。

---

## 7. 发布流程

完整链路：

```text
Radar Sources
      ↓
每日候选池
      ↓
discussion 回传
      ↓
周一 shortlist
      ↓
Tomz 删除 / 保留 / 调整
      ↓
形成一期结构
      ↓
Tomz × Mira 写作
      ↓
人类审核
      ↓
正式 Markdown
      ↓
生产发布
```

原则：

> **Mira 负责找，Tomz 负责最终判断。**

发布后 Markdown 是唯一公开正文事实源；素材库不会成为第二份正式内容。

---

## 8. 索引与站点行为

见π索引页必须从正式 Markdown 自动派生，不维护独立人工 index 数据。

```text
正式 Markdown
    ↓
content parser
    ↓
识别见π内容
    ↓
按 issue / date 排序
    ↓
见π索引页
```

禁止新增需要人工同步维护的：

- `weekly.json`
- `issues.json`
- `jianpi-index.yml`
- 其他重复记录标题、期号、日期、URL 的索引文件。

---

## 9. UI / 视觉

**v0.2 明确不定稿。**

已知产品要求只有：

1. 见π可以比 Tomz.io 主站整体气质更外放；
2. 但不能破坏全站 Header、主题、可访问性与基础 token；
3. 不得因为见π UI 施工导致博客、书架、项目、作品、关于等既有页面视觉或功能回滚；
4. 当前 `preview/weekly-v0-1` 的 UI 仅视为实验实现，不视为最终设计；
5. UI 信息架构、封面形式、配色、期号表达、模块视觉将在下一轮单独讨论。

因此 v0.2 不规定：

- 杂志式 / 卡片式 / 封面墙；
- 每期主色；
- 字体特殊化；
- 动效；
- “Signal / Radar”式视觉语言；
- 当前预览页面的任何具体版式。

---

## 10. 生产安全边界

这是 v0.2 的硬约束。

### 10.1 禁止整枝合并旧施工分支

当前：

```text
main
preview/weekly-v0-1
```

已经经历过独立演进。

因此：

> **禁止将 `preview/weekly-v0-1` 整枝直接 merge 回 `main`。**

正式发布时必须：

1. 从最新 `main` 新建干净集成分支；
2. 只迁入已经确认的见π能力；
3. 保留 main 当前全部内容与既有功能；
4. 对共享 Header、书架、路由、PWA、静态输出进行回归；
5. 通过人类验收后再进入 main。

### 10.2 main 是生产事实基线

任何集成不得使以下内容倒退：

- 已发布文章 / 书籍章节数量；
- 书架封面与布局；
- 博客 / 投稿 / 项目 / 作品 / 关于；
- Header 与 active 状态；
- 搜索；
- 主题切换；
- PWA；
- sitemap；
- canonical；
- JSON-LD；
- 内容发布时间 / 修改时间；
- GitHub Pages 与生产域名的路径兼容。

### 10.3 Preview 不能覆盖生产事实

预览分支允许实验，但如果与 `main` 不一致：

> **以最新 `main` 的既有功能和内容为保留基线。**

见π的新增价值不能以回滚 Tomz.io 已有能力为代价。

---

## 11. v0.2 验收标准

PRD 层面完成：

- [x] 产品从“周刊”升级为独立内容产品“见π”；
- [x] 周更只是 cadence，不是产品名称；
- [x] 一期一篇 Markdown；
- [x] YAML frontmatter 只保存稳定元数据；
- [x] `issue` 作为永久期号；
- [x] 正文模块继续使用 Markdown heading；
- [x] 正式索引自动派生；
- [x] Radar 与正式内容分离；
- [x] 建立独立 `editorial/jianpi-radar` 素材分支；
- [x] 支持日常 Radar；
- [x] 支持周一 shortlist；
- [x] 支持日常聊天材料回传；
- [x] 明确自动化不能自动发布；
- [x] 明确 preview 不得整枝合回 main；
- [x] 明确 UI 在下一轮单独讨论。

实现层面尚未全部完成：

- [ ] 最终产品 URL；
- [ ] 正式 Group / 导航命名迁移；
- [ ] 正式 author schema 对齐；
- [ ] `docs/CONTENT_ARCHITECTURE.md` 更新；
- [ ] `docs/AUTHORSHIP.md` 必要更新；
- [ ] Radar 首次真实落盘验收；
- [ ] shortlist 首次周编辑验收；
- [ ] 最终 UI；
- [ ] 从最新 main 建立正式集成分支；
- [ ] 生产回归验收。

---

## 12. 下一轮讨论

下一轮只聚焦见π UI，不重新打开本 PRD 已明确的数据和生产安全原则。

优先讨论：

1. 见π首页与普通内容列表的区别；
2. 单期页面的信息层级；
3. 期号 / 标题 / lead 的首屏关系；
4. 常驻模块与动态模块如何视觉区分；
5. “更出圈”具体允许到什么程度；
6. 手机端与桌面端的一致性；
7. 如何保留 Tomz.io 基础气质，又不继续使用当前预览中不满意的版式。

---

## 一句话定义

> **见π是 Tomz × Mira 持续观察外部世界、从噪声中留下值得继续看的技术、产品、开发者与异常信号的一份独立内容产品。**
