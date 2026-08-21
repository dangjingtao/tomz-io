# Learning Space 设计与信息架构方案

## 1. 定位

「研习」是 tomz.io 中承载长期学习、连续阅读与实践过程的一级内容空间。

它不再以 Blog 分类或 Docs 目录为基础，也不再以“路径下面继续分专题”的方式组织内容。

新的核心模型是：

```text
研习
  ↓
平铺的书
  ↓
篇章 / 条目
```

这里的“书”不是拟物书架，也不一定对应已经出版的实体书。

它表示一个可以持续生长、能够独立阅读的长期专题。

当前第一批书：

- 《一起学智能体》
- 《读诗篇》

未来可以继续增加：

- 《读马太福音》
- 《读创世记》
- 某个设计专题
- 某个产品研究专题

V2 的重点不是把层级做深，而是让新的书可以不断平铺增加。

---

## 2. 核心信息架构

正式入口：

```text
/learning
```

一级页面只展示“书”。

```text
/learning
├─ 一起学智能体
├─ 读诗篇
├─ 未来的第三本
└─ 未来的第四本
```

进入一本书以后才看到它自己的篇章 / 条目：

```text
/learning/agent
  ├─ 01 ...
  ├─ 02 ...
  └─ ...

/learning/psalms
  ├─ 01 ...
  ├─ 02 ...
  └─ 06 当神似乎沉默的时候
```

不再采用：

```text
研习
  ↓
读经札记
  ↓
诗篇
  ↓
文章
```

原因是「读经札记」更适合作为内容属性，而不是用户必须经过的一层导航。

---

## 3. 「读经札记」的定位

「读经札记」保留，但从专题层级降为内容分类 / 标签。

例如：

```text
《读诗篇》
category: 读经札记

《读马太福音》
category: 读经札记

《读创世记》
category: 读经札记
```

因此未来读经内容不会被锁死在《诗篇》下面，也不会出现一个越来越庞大的“读经札记目录树”。

用户看到的是一本本具体的研习内容：

```text
读诗篇
读马太福音
读创世记
```

系统仍然知道它们都属于：

```text
读经札记
```

但这个关系主要用于：

- 标签
- 搜索
- 内容统计
- 未来可能的相关推荐

不用于制造新的导航层级。

---

## 4. 与 Blog 的关系

Learning 从 Blog 完全解耦。

不再使用下面的关系：

```text
Blog group
  ↓
Learning 聚合
```

也不再要求一篇 Learning 内容必须首先是一篇 Blog 文章。

新的关系是：

```text
Learning 内容
  ↓
自己的目录、URL、元数据与静态页面
```

因此：

- Learning 有独立内容根
- Learning 有独立 canonical URL
- Learning 不依赖 `doc.root === "blogs"`
- Learning 不依赖 Blog `group`
- Learning 页面不跳回 `/blogs?category=...`
- Blog 不再拥有这些文章的正文 URL

如果未来首页「最近写了」希望同时展示 Blog 和 Learning，可以在首页聚合层处理，但这不意味着 Learning 重新依赖 Blog。

---

## 5. 内容目录

建议目录：

```text
src/pages/learning/
├─ agent/
│  ├─ _book.yml
│  ├─ 01-...
│  ├─ 02-...
│  └─ ...
│
└─ psalms/
   ├─ _book.yml
   ├─ 01-...
   ├─ 02-...
   └─ 06-when-god-seems-silent.md
```

未来继续增加经卷时直接增加新的平级目录：

```text
src/pages/learning/
├─ agent/
├─ psalms/
├─ matthew/
└─ genesis/
```

不建立：

```text
learning/bible/psalms
learning/bible/matthew
```

因为产品层面要求 `/learning` 下的“书”保持平铺。

---

## 6. Book Manifest

每本书拥有自己的 `_book.yml`，负责定义书本身，而不是把专题配置写死在 React。

《一起学智能体》示例：

```yaml
id: agent
title: 一起学智能体
description: 从真实产品与工程问题出发理解 Agent、Tool Calling、MCP、Skill 与相关实践。
category: AI / Agent
order: 10
status: active
```

《读诗篇》示例：

```yaml
id: psalms
title: 读诗篇
description: 按实际阅读顺序记录诗篇的背景、疑问、理解与仍然没有答案的地方。
category: 读经札记
order: 20
status: active
```

未来《读马太福音》只需要再增加一个 manifest：

```yaml
id: matthew
title: 读马太福音
category: 读经札记
order: 30
status: active
```

React 不应该知道：

- 什么是诗篇
- 什么是马太福音
- 什么是智能体
- 当前一共有几本书

它只负责读取 Book Manifest 并渲染。

---

## 7. 条目元数据

Learning 条目使用独立语义，不再复用 Blog 分类作为身份。

建议最小字段：

```yaml
title: 当神似乎沉默的时候
type: learning-entry
book: psalms
order: 6
status: published

datePublished: 2026-08-21
dateModified: 2026-08-21

author:
  - tomz
  - mira
```

对于读经内容，可以额外保留经文信息：

```yaml
category: 读经札记
scripture: 诗篇 6
```

对于 Agent 内容：

```yaml
book: agent
order: 8
```

原则：

- `book` 决定它属于哪本研习书
- `order` 决定书内顺序
- `category` 是属性，不制造路由层级
- React 不通过标题正则猜内容类型
- React 不通过 `if (book === "psalms")` 生成业务文案

---

## 8. URL 设计

Learning 使用自己的稳定 URL。

### 书首页

```text
/learning/agent
/learning/psalms
/learning/matthew
```

### 条目

```text
/learning/agent/mcp-is-not-a-plugin-system
/learning/psalms/06-when-god-seems-silent
```

URL 只表达：

```text
Learning → Book → Entry
```

不再把 Blog 分类结构带进来。

---

## 9. 旧内容迁移与 SEO

本次 SEO 目标只有一个：

> 内容从 Blog URL 迁移到 Learning URL 后，尽量保留已有搜索价值，并让新 URL 成为唯一权威地址。

不额外建设复杂 GEO 系统。

### 9.1 永久重定向

每篇旧文章从原 Blog URL 永久跳转到新 Learning URL。

例如：

```text
/blogs/.../psalm-6
  → 301 / 308
/learning/psalms/06-when-god-seems-silent
```

建议在迁移后的 Markdown 中保存：

```yaml
redirectFrom:
  - /blogs/旧地址
```

构建时自动生成 Cloudflare Pages `_redirects`，避免另外维护一份容易失真的迁移表。

### 9.2 Canonical

新页面必须在静态 HTML 中直接输出唯一 canonical：

```text
https://tomz.io/learning/...
```

旧 URL 不再拥有自己的 canonical 页面。

### 9.3 Sitemap

`sitemap.xml`：

- 只收录新的 Learning canonical URL
- 不继续收录旧 Blog URL
- 包含 `/learning`
- 包含每一本书首页
- 包含公开的 Learning 条目

### 9.4 站内链接

迁移完成后：

- 首页
- Learning
- 相关文章
- 上一篇 / 下一篇
- 其他内部导航

全部直接指向新 URL，不依赖重定向完成内部跳转。

### 9.5 原始内容事实

URL 迁移不是重新发表。

因此必须保留原始：

- 标题
- 作者
- `datePublished`
- description（除非确实需要编辑）

只有内容真实修改时才更新 `dateModified`。

### 9.6 静态输出

Learning 正文继续由 MiraDocs / 静态生成链输出完整 HTML：

- H1
- description
- 正文
- canonical
- author
- datePublished / dateModified
- Article JSON-LD

不能依赖客户端 JavaScript 执行后才出现 SEO 关键内容。

---

## 10. `/learning` 首页设计

首页不是路径树，也不是课程 Dashboard。

它就是一个平铺的“书目”。

首版：

```text
研习
一些正在持续阅读、学习和写下来的东西。

┌────────────────────┐
│ 一起学智能体        │
│ AI / AGENT          │
│ 12 篇 · 最近：...   │
└────────────────────┘

┌────────────────────┐
│ 读诗篇              │
│ 读经札记            │
│ 6 篇 · 最近：...    │
└────────────────────┘
```

这里的“书”是信息结构，不要求做成拟物封面墙。

可以有轻微的出版物 / 编辑视觉感，但继续继承 tomz.io：

- 字体
- token
- 页面宽度
- 留白
- Header / Footer
- 主题系统

避免：

- SaaS Dashboard 卡片
- LMS 课程卡片
- 拟物木质书架
- 复杂分类树
- 一级页面再分“AI / 读经 / 设计”等栏目

所有书在 `/learning` 中保持平级。

---

## 11. 一本书的详情页

书首页，例如：

```text
/learning/psalms
```

负责展示：

1. 书名
2. 简短说明
3. 当前已有条目数量
4. 最近更新
5. 按 `order` 排列的完整篇章 / 条目

《读诗篇》可以呈现：

```text
读诗篇
读经札记

01 · ...
02 · ...
03 · ...
04 · ...
05 · ...
06 · 当神似乎沉默的时候
```

不用再出现「读经札记 → 诗篇」的中间页。

未来《读马太福音》拥有完全相同的页面模型，不需要修改 React 业务逻辑。

---

## 12. 数据驱动要求

Learning UI 必须由内容数据驱动。

禁止继续保留当前 V1 类型的硬编码：

```ts
const pathConfigs = [agent, bible]
```

禁止：

```ts
doc.root === "blogs"
doc.group === "读经札记"
```

来决定 Learning 内容归属。

禁止：

```ts
if (config.key === "bible")
```

这种专题特判。

最终应是：

```text
读取所有 _book.yml
  ↓
生成 /learning 的书目
  ↓
读取 book=<id> 的条目
  ↓
生成书详情与篇章列表
```

新增一本书不修改 `LearningHub.tsx`。

---

## 13. V2 迁移范围

需要完成：

- [ ] Learning 从 Blog 数据模型彻底解耦
- [ ] 建立 Book Manifest
- [ ] `/learning` 改为平铺书目
- [ ] 《一起学智能体》成为独立 Learning Book
- [ ] 《读诗篇》成为独立 Learning Book
- [ ] 「读经札记」改为属性，不再作为导航层级
- [ ] 迁移现有两组 Markdown 到 `src/pages/learning/`
- [ ] 为迁移内容建立新 URL
- [ ] 为旧 Blog URL 生成永久重定向
- [ ] 新 URL 输出正确 canonical
- [ ] sitemap 只保留新 canonical URL
- [ ] 保留原 datePublished / author 等内容事实
- [ ] 站内链接全部改用新 URL
- [ ] 静态输出、Root build、Cloudflare Pages 构建通过

暂不做：

- Learning 后台
- 用户学习进度
- 收藏 / 打卡 / 积分
- 多级 Learning 分类树
- 专门的 GEO 内容副本
- 为 SEO 重写原文章正文

---

## 14. 验收标准

### 信息架构

- `/learning` 下看到的是一组平级的书
- 《一起学智能体》和《读诗篇》处于同一层级
- 「读经札记」不再挡在用户和《读诗篇》之间
- 新增《读马太福音》不需要新增导航层级
- 新增一本书不需要修改 React 业务配置

### 内容模型

- Learning 不依赖 Blog root / group
- 一篇内容只拥有一个正文源
- 每个条目通过 `book` 明确归属
- Book 信息来自 manifest，不来自 React 硬编码

### SEO 迁移

- 每个旧 Blog URL 永久重定向到唯一新 URL
- 新页面 canonical 指向自己
- sitemap 不重复收录旧 URL
- 原 `datePublished`、author 等事实保留
- 新页面静态 HTML 中包含完整正文与 SEO metadata

### 视觉

- 像个人长期研习书目，而不是课程平台
- 所有书平级，但视觉上允许各自拥有轻微气质差异
- 仍然明显属于 tomz.io

---

## 15. 当前产品定义

最终产品概念：

```text
Learning / 研习
```

核心单位：

```text
Book / 书
```

当前两本：

```text
一起学智能体
读诗篇
```

读经内容的长期扩展方式：

```text
读诗篇
读马太福音
读创世记
...
```

它们可以共享「读经札记」这个内容属性，但在研习中始终保持平级。