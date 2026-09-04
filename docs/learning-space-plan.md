# 书架架构与演进规则

> 这个文件最初是“书架 V2 设计方案”。核心方案已经落地，现在收敛为当前实现说明 + 后续演进约束。
>
> Group / Tag / Book、逻辑归档、URL 与内容时间的正式通用规则仍以 [CONTENT_ARCHITECTURE.md](CONTENT_ARCHITECTURE.md) 为准。

## 1. 当前定位

「书架」是 tomz.io 中承载可持续生长、能够作为整体连续阅读内容的一级空间。

公共入口：

~~~text
/books
~~~

核心模型保持两层：

~~~text
书架
  ↓
Book
  ↓
Entry / 篇章
~~~

不新增 Series 层，也不再建立“学习 / 读经 / 小说”等强制一级分类树。

## 2. 当前实现状态

书架 V2 的核心结构已经落地：

- [x] 一级入口统一为 /books / 「书架」
- [x] Books 使用独立内容根 src/pages/books/
- [x] 每本书使用 _book.yml
- [x] /books 书目由 manifest 数据驱动
- [x] 新增一本书不需要修改 React 固定书目配置
- [x] Book Entry 使用 /books/<book-id>/<entry> URL
- [x] Book 页面 / Entry 进入静态 SEO 输出
- [x] 支持 legacy prefix 永久重定向
- [x] sitemap 只保留 canonical 公开页面
- [x] 内容时间接入全站 Git 派生模型
- [x] GitHub Pages / root build 共享同一内容事实源

当前仓库中已有四本 manifest：

~~~text
agent     → 一起学智能体
product   → 结合业务学产品
psalms    → 读诗篇
huangyan  → 谎颜
~~~

这里列的是当前快照，不是硬编码书单。实际公开书目始终以 src/pages/books/*/_book.yml 为准。

## 3. 目录模型

~~~text
src/pages/books/
├── agent/
│   ├── _book.yml
│   └── *.md
├── product/
│   ├── _book.yml
│   └── *.md
├── psalms/
│   ├── _book.yml
│   └── *.md
└── huangyan/
    ├── _book.yml
    └── *.md
~~~

未来增加新书时直接增加平级目录 src/pages/books/<book-id>/。

kind / category 是属性，不改变 /books/<book-id> 的基础层级。

## 4. Book Manifest

当前解析器支持：

~~~yaml
id: agent
title: 一起学智能体
description: 从真实产品与工程问题出发，持续理解 Agent、Tool Calling、MCP、Skill 与相关实践。
category: AI / Agent
kind: study
order: 10
status: active
legacyPrefix: /blogs/agent-learning
~~~

字段：

- id：稳定 book id，必填；**必须与所在目录 `src/pages/books/<book-id>/` 的 `<book-id>` 完全一致**，避免书页路由与 Entry 归属分裂
- title：书名，必填
- description：书的说明
- category：内容属性
- kind：study | reading-notes | novel | collection | other
- order：书架排序
- status：active | completed | draft | archived
- legacyPrefix：可选；用于从历史内容前缀生成永久重定向

当前运行时书架列表会过滤 draft / archived，但静态正文与 sitemap 链还没有把它们当作完整的“未发布”机制。**不要依赖 status 隐藏敏感或未公开正文。** 在静态发布链补齐一致过滤之前，未准备公开的 Book 不应提交可发布 Markdown；status 目前只表示书架聚合层状态。

## 5. Book Entry

条目仍然使用 MiraDocs Markdown frontmatter。

实际时间字段遵循全站规则，而不是旧方案里的 datePublished / dateModified 手工维护方式。

典型条目：

~~~yaml
title: 示例标题
description: ...
group: ...
order: 6
date: 2026年9月5日
readTime: 8 分钟阅读
tags: ...
author:
  - tomz
writtenBy: tomz
~~~

需要精确发布时间时：

~~~yaml
publishedAt: 2026-09-05T10:30:00+08:00
~~~

不要写人工 modifiedAt。

书籍归属通常可以由物理目录推导；适配层也兼容显式 book metadata，但不要求每篇重复维护 book id。

## 6. URL

~~~text
/books
/books/<book-id>
/books/<book-id>/<entry-slug>
~~~

一个公开正文只应有一个 canonical URL。

## 7. 与 Blog 的关系

这里区分两种情况。

### 7.1 Book 原生正文

如果内容从一开始就是一本书的章节，可以直接放在 src/pages/books/<book-id>/，拥有自己的 /books/... canonical。

### 7.2 已经发布的 Blog 后来被收入 Book

默认不要搬文件。

按 CONTENT_ARCHITECTURE.md：

- 原 Markdown 保持唯一正文事实源；
- 原 Blog URL / canonical 保持不变；
- Book 只增加逻辑组织关系；
- 不复制一份正文到 Books；
- 不生成第二个可索引全文。

只有明确的历史归属纠正或专项迁移任务，才允许把原正文迁移成 Book 原生内容。

旧版方案中“收入书架就统一迁移到 /books”不再作为通用规则。

## 8. 历史迁移与 Redirect

对于已经完成的专项历史迁移，旧 URL 必须永久重定向到唯一新 canonical。

vite.config.ts 当前会：

- 读取 Book Manifest 的 legacyPrefix；
- 为对应 Entry 生成 Cloudflare _redirects；
- 同时维护已经发生过的投稿历史迁移 redirect。

站内新链接应直接指向 canonical，不依赖 redirect 完成普通导航。

## 9. 内容时间

书架使用全站统一时间模型：

~~~text
publishedAt = frontmatter publishedAt
           > frontmatter date
           > Git fallback

modifiedAt  = 当前正文源最后一次真实 Git 修改
~~~

注意：

- modifiedAt 不人工维护；
- 迁站 / mirror commit 不能自动成为历史文章发布时间；
- 物理移动时应尽量跟随文件历史；
- JSON-LD / sitemap / 可见“更新于”使用同一套派生结果。

## 10. SEO

Book 与 Entry 都必须进入静态输出。

Book index 使用 CollectionPage 与条目 ItemList。

Book 原生 Entry 需要静态完整正文、canonical、author、datePublished、dateModified、Article JSON-LD 与 sitemap。

已发布 Blog 的逻辑收录只增加书籍组织关系，不生成第二个可索引正文、canonical 或 sitemap 项，继续使用原 Blog URL 与 canonical。

不能只保证 React 客户端路由“点得开”。

## 11. 数据驱动要求

继续禁止在 React 里维护固定书单，或用 book === psalms / kind === novel 之类特判定义基础信息架构。

正确方向：

~~~text
读取所有 _book.yml
  ↓
得到公开 Books
  ↓
按目录 / book id 聚合 entries
  ↓
渲染 /books 与 /books/<id>
~~~

呈现层可以根据 manifest 做有限的视觉差异，但不能为不同 kind 建第二套内容系统。

## 12. 后续演进边界

可以继续增加：

- 新 Book；
- 新 kind；
- 更丰富的书封 / 出版视觉；
- 逻辑收录既有 Blog；
- 搜索 / 推荐 / 关联阅读。

默认不增加：

- Series 层；
- 多级 Books 分类树；
- 复制正文的“归档副本”；
- 人工修改时间台账；
- 为每个 Book 写 React 特判；
- 为 SEO 维护第二套正文。

书架的目标仍然很简单：

> 让长期内容可以自然成册，同时不让内容架构随着书越来越多而越来越重。
