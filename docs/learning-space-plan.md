# 书架设计与信息架构方案

## 1. 定位

「书架」是 tomz.io 中承载一组可持续生长、能够独立阅读的“书”的一级内容空间。

这里的“书”不要求已经正式出版，也不限定为学习内容。

它可以是：

- 连续学习专题
- 阅读札记
- 长期研究
- 小说
- 随笔集
- 未来其他适合以“成册”方式组织的内容

新的核心模型只有两层：

```text
书架
  ↓
平铺的书
  ↓
篇章 / 条目
```

不再以 Blog 分类、Docs 目录或「研习路径」作为基础模型。

当前第一批书：

- 《一起学智能体》
- 《读诗篇》

未来可以自然加入：

- 《读马太福音》
- 《读创世记》
- 某部小说
- 某个设计专题
- 某个产品研究专题

重点不是把分类层级做深，而是让新的书可以不断平铺增加。

---

## 2. 核心信息架构

正式一级入口：

```text
/books
```

顶栏名称：

```text
书架
```

一级页面只展示“书”。

```text
/books
├─ 一起学智能体
├─ 读诗篇
├─ 未来某部小说
└─ 未来的其他书
```

进入一本书以后，才看到它自己的篇章 / 条目：

```text
/books/agent
  ├─ 01 ...
  ├─ 02 ...
  └─ ...

/books/psalms
  ├─ 01 ...
  ├─ 02 ...
  └─ 06 当神似乎沉默的时候

/books/<novel-id>
  ├─ 01 ...
  ├─ 02 ...
  └─ ...
```

不建立额外的专题导航层：

```text
书架
  ↓
读经札记
  ↓
诗篇
  ↓
文章
```

也不建立：

```text
书架
  ↓
学习
  ↓
一起学智能体
```

在产品层面，所有“书”保持平级。

---

## 3. 「书」的定义

Book 是书架的核心单位。

一本 Book 应满足至少一个特征：

- 内容具有明确连续性
- 有相对稳定的标题和主题
- 条目之间存在阅读顺序或上下文
- 内容预计会持续增长
- 适合被作为一个整体阅读或理解

Book 不等于内容类型。

例如：

```text
《一起学智能体》
kind: study

《读诗篇》
kind: reading-notes

《未来某部小说》
kind: novel
```

`kind` 只是内容属性，不制造新的导航层级。

---

## 4. 「读经札记」的定位

「读经札记」保留，但只作为内容属性 / 分类，不再作为用户必须经过的专题页。

例如：

```text
《读诗篇》
category: 读经札记

《读马太福音》
category: 读经札记

《读创世记》
category: 读经札记
```

因此未来读经内容不会被锁死在《诗篇》下面，也不会形成越来越深的“读经札记目录树”。

用户在书架上直接看到：

```text
读诗篇
读马太福音
读创世记
```

系统仍然知道它们都属于：

```text
读经札记
```

这个关系主要用于：

- 标签
- 搜索
- 内容统计
- 相关推荐

不用于增加导航层级。

---

## 5. 与 Blog 的关系

书架内容从 Blog 完全解耦。

不再使用：

```text
Blog group
  ↓
书架聚合
```

也不再要求一本书里的内容必须首先是一篇 Blog 文章。

新的关系是：

```text
Book 内容
  ↓
自己的目录、URL、元数据与静态页面
```

因此：

- 书架有独立内容根
- 每本书有独立 canonical URL
- 条目不依赖 `doc.root === "blogs"`
- 条目不依赖 Blog `group`
- 书详情页不跳回 `/blogs?category=...`
- Blog 不再拥有这些正文的第二套 URL

如果首页「最近写了」需要同时展示 Blog 与 Books，可以在首页聚合层完成，但不能让 Books 重新依赖 Blog。

---

## 6. 内容目录

建议目录：

```text
src/pages/books/
├─ agent/
│  ├─ _book.yml
│  ├─ 01-...
│  ├─ 02-...
│  └─ ...
│
├─ psalms/
│  ├─ _book.yml
│  ├─ 01-...
│  ├─ 02-...
│  └─ 06-when-god-seems-silent.md
│
└─ <novel-id>/
   ├─ _book.yml
   ├─ 01-...
   └─ ...
```

未来增加其他经卷时直接增加平级目录：

```text
src/pages/books/
├─ agent/
├─ psalms/
├─ matthew/
├─ genesis/
└─ novel-x/
```

不建立：

```text
books/bible/psalms
books/bible/matthew
books/novels/novel-x
```

因为 `/books` 下的 Book 在产品层面保持平铺。

---

## 7. Book Manifest

每本书拥有自己的 `_book.yml`。

Book Manifest 负责定义书本身，React 不维护具体书目配置。

《一起学智能体》示例：

```yaml
id: agent
title: 一起学智能体
description: 从真实产品与工程问题出发理解 Agent、Tool Calling、MCP、Skill 与相关实践。
kind: study
category: AI / Agent
order: 10
status: active
```

《读诗篇》示例：

```yaml
id: psalms
title: 读诗篇
description: 按实际阅读顺序记录诗篇的背景、疑问、理解与仍然没有答案的地方。
kind: reading-notes
category: 读经札记
order: 20
status: active
```

小说示例：

```yaml
id: novel-x
title: 小说标题
description: ...
kind: novel
order: 30
status: serializing
```

React 不应该知道：

- 什么是诗篇
- 什么是马太福音
- 什么是智能体
- 什么是小说
- 当前一共有几本书

它只负责读取 Book Manifest 并渲染。

---

## 8. 条目元数据

书内条目使用独立语义，不再复用 Blog 分类作为身份。

建议最小字段：

```yaml
title: 当神似乎沉默的时候
type: book-entry
book: psalms
order: 6
status: published

datePublished: 2026-08-21
dateModified: 2026-08-21

author:
  - tomz
  - mira
```

读经内容可以额外保留：

```yaml
category: 读经札记
scripture: 诗篇 6
```

Agent 内容：

```yaml
book: agent
order: 8
```

小说章节同样使用统一模型：

```yaml
type: book-entry
book: novel-x
order: 12
```

原则：

- `book` 决定归属
- `order` 决定书内顺序
- `kind` / `category` 是属性，不制造路由层级
- React 不通过标题正则猜内容类型
- React 不通过 `if (book === "psalms")`、`if (kind === "novel")` 写死业务结构

---

## 9. URL 设计

书架使用自己的稳定 URL。

### 书架首页

```text
/books
```

### 书首页

```text
/books/agent
/books/psalms
/books/matthew
/books/novel-x
```

### 条目

```text
/books/agent/mcp-is-not-a-plugin-system
/books/psalms/06-when-god-seems-silent
/books/novel-x/chapter-01
```

URL 只表达：

```text
Bookshelf → Book → Entry
```

不再把 Blog 分类结构带进来。

---

## 10. 旧内容迁移与 SEO

本次 SEO 目标只有一个：

> 现有内容从 Blog URL 迁移到 Books URL 后，尽量保留已有搜索价值，并让新 URL 成为唯一权威地址。

不额外建设复杂 GEO 系统，也不为了 SEO 重写正文。

### 10.1 永久重定向

每篇被迁移的旧 Blog 正文必须永久跳转到新 Books URL。

例如：

```text
/blogs/.../psalm-6
  → 301 / 308
/books/psalms/06-when-god-seems-silent
```

迁移后的 Markdown 建议保存：

```yaml
redirectFrom:
  - /blogs/旧地址
```

构建时自动生成 Cloudflare Pages `_redirects`，避免另维护一份迁移表。

旧实验 `/books` 本身不承载需要继承的正文 SEO；真正需要保护的是现有 Blog 条目的搜索价值。

### 10.2 Canonical

新页面必须在静态 HTML 中直接输出唯一 canonical：

```text
https://tomz.io/books/...
```

旧 Blog URL 不再拥有自己的 canonical 正文页。

### 10.3 Sitemap

`sitemap.xml`：

- 只收录新的 Books canonical URL
- 不继续收录已迁移的旧 Blog URL
- 包含 `/books`
- 包含每一本公开书首页
- 包含公开的 Book Entry

### 10.4 站内链接

迁移完成后：

- 首页
- 书架
- 相关文章
- 上一篇 / 下一篇
- 其他内部导航

全部直接指向新 URL，不依赖重定向完成内部跳转。

### 10.5 原始内容事实

URL 迁移不是重新发表。

必须保留原始：

- 标题
- 作者
- `datePublished`
- description（除非确实需要编辑）

只有正文真实修改时才更新 `dateModified`。

### 10.6 静态输出

Books 正文继续由 MiraDocs / 静态生成链输出完整 HTML：

- H1
- description
- 正文
- canonical
- author
- datePublished / dateModified
- Article JSON-LD

SEO 关键内容不能依赖客户端 JavaScript 执行后才出现。

---

## 11. `/books` 首页设计

首页不是课程 Dashboard，也不是分类目录树。

它就是一组平铺的“书”。

示意：

```text
书架
一些正在持续写下、阅读和生长的书。

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

┌────────────────────┐
│ 未来某部小说        │
│ 小说                │
│ 连载中 · 最近：...  │
└────────────────────┘
```

“书”是信息结构，不强制做拟物封面墙。

可以有出版物 / 编辑视觉感，也允许未来小说拥有更明显的封面视觉，但整体继续继承 tomz.io：

- 字体
- token
- 页面宽度
- 留白
- Header / Footer
- 主题系统

避免：

- SaaS Dashboard
- LMS 课程卡片
- 木质拟物书架
- 复杂分类树
- 一级页面再分“学习 / 读经 / 小说 / 设计”等栏目

所有书在 `/books` 中保持平级。

---

## 12. 一本书的详情页

书首页例如：

```text
/books/psalms
```

负责展示：

1. 书名
2. 简短说明
3. 当前已有条目数量
4. 最近更新
5. 按 `order` 排列的完整篇章 / 条目

《读诗篇》示意：

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

不用出现「读经札记 → 诗篇」中间页。

未来《读马太福音》使用相同模型。

小说也使用相同 Book → Entry 骨架，只允许在呈现层根据 Manifest 提供必要的视觉差异，不另外建立第二套内容系统。

---

## 13. 数据驱动要求

书架 UI 必须由内容数据驱动。

禁止继续保留 V1 类型硬编码：

```ts
const pathConfigs = [agent, bible]
```

禁止通过：

```ts
doc.root === "blogs"
doc.group === "读经札记"
```

决定书架内容归属。

禁止：

```ts
if (config.key === "bible")
```

这种专题特判。

最终应是：

```text
读取所有 _book.yml
  ↓
生成 /books 的书目
  ↓
读取 book=<id> 的条目
  ↓
生成书详情与篇章列表
```

新增一本书不修改书架首页 React 业务配置。

---

## 14. V2 迁移范围

需要完成：

- [ ] Books 从 Blog 数据模型彻底解耦
- [ ] 建立 Book Manifest
- [ ] 一级入口统一为 `/books` / 「书架」
- [ ] `/books` 展示平铺书目
- [ ] 《一起学智能体》成为独立 Book
- [ ] 《读诗篇》成为独立 Book
- [ ] 「读经札记」改为属性，不再作为导航层级
- [ ] 内容模型允许未来小说直接加入书架
- [ ] 迁移现有两组 Markdown 到 `src/pages/books/`
- [ ] 为迁移内容建立新 URL
- [ ] 为旧 Blog URL 生成永久重定向
- [ ] 新 URL 输出正确 canonical
- [ ] sitemap 只保留新 canonical URL
- [ ] 保留原 `datePublished` / author 等内容事实
- [ ] 站内链接全部改用新 URL
- [ ] 静态输出、Root build、Cloudflare Pages 构建通过

暂不做：

- 书架后台
- 用户阅读进度
- 收藏 / 打卡 / 积分
- 多级 Books 分类树
- 专门 GEO 内容副本
- 为 SEO 重写原文章正文

---

## 15. 验收标准

### 信息架构

- `/books` 下看到的是一组平级的书
- 《一起学智能体》《读诗篇》和未来小说处于同一层级
- 「读经札记」不挡在用户和《读诗篇》之间
- 新增《读马太福音》不需要新增导航层级
- 新增小说不需要创建独立“小说区”才能进入书架
- 新增一本书不需要修改 React 业务配置

### 内容模型

- Books 不依赖 Blog root / group
- 一篇内容只拥有一个正文源
- 每个条目通过 `book` 明确归属
- Book 信息来自 manifest，不来自 React 硬编码
- `kind` / `category` 只表达属性，不改变基础层级

### SEO 迁移

- 每个被迁移的旧 Blog URL 永久重定向到唯一新 URL
- 新页面 canonical 指向自己
- sitemap 不重复收录旧 URL
- 原 `datePublished`、author 等事实保留
- 新页面静态 HTML 包含完整正文与 SEO metadata

### 视觉

- 像个人长期维护的一组书，而不是课程平台
- 所有书平级，但允许各自拥有轻微气质差异
- 小说加入后不会破坏整体信息架构
- 整体仍明显属于 tomz.io

---

## 16. 当前产品定义

最终产品名称：

```text
书架
```

公共入口：

```text
/books
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

未来可以平级增加：

```text
读马太福音
读创世记
某部小说
其他长期专题
...
```

「读经札记」「学习」「小说」都只是 Book 的内容属性，不成为书架一级导航层。