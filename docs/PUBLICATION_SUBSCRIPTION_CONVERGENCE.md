# Tomz.io 出版订阅契约收敛（设计草案 v1）

> **状态：Proposed / 仅设计，未实施、未批准发布。**
> 本文件提出对外发布和机器消费的契约，不覆盖 `docs/CONTENT_ARCHITECTURE.md`、`docs/AUTHORSHIP.md`、`docs/PROJECT_ARCHITECTURE.md`、`docs/learning-space-plan.md` 中已经生效的内容、署名、时间和部署规则。正式采用须以专项实现 PR 与生产 HTTP 验收为准。
> 基准：tomz-io `main@0accc2f`、未合并书架订阅候选 PR #189、消费者 tomzlab-web PR #11（2026-11-20 调研）。

## 1. 要解决的问题

内容层目前有正式事实来源：`src/pages/**` 的 Markdown/MiraDocs、`src/pages/books/*/_book.yml`、构建时锁定的 External Book、Git 内容时间和最终静态 HTML/JSON-LD。**混乱发生在对外投影/消费者发现层**：

1. `/rss.xml` 从所有含 `Article` JSON-LD 的静态 HTML 生成；消费者无法只根据 RSS 判断是博客、见π期号、见π内文还是书籍原生章节。
2. `/books/` 已在线；`/books/catalog.json` 仍是 PR #189 的 Draft，生产 404；当前消费者不得依赖它已上线。
3. `/weekly/` 有真实期号及封面、日期、内文关系，但还没有统一的机器可读“期号 vs 文章”标记。RSS 中期号与篇章均可能作为 Article 出现。
4. 国内官网曾不得不解析书架 HTML、按 URL 路径猜周刊、拼 Markdown 目录；现在应终结这种消费者专用实现。

**最终目标：网站负责发布，消费者负责呈现；内容身份、格式、时间与归属由出版端一次定义。**

非目标：增加内容数据库、人工维护另一套 Catalog、复制 Markdown 正文、强制所有内容为 Book、增加 Series 层、更换公开 canonical、做 WebSub/实时推送、重做 Folio、改视觉或替换现有 RSS 地址。

## 2. 三种对外出版语义（必须分清）

| 语义 | 公共入口（目标） | 用途 | 语义与保留策略 |
| --- | --- | --- | --- |
| **更新流 / 传统订阅** | `https://tomz.io/rss.xml` | 现有 RSS 阅读器；向后兼容 | RSS 2.0，现有 `guid/link`、Article 收录和 RSS 自发现机制不在首批变更中破坏 |
| **更新流 / 结构化订阅** | `https://tomz.io/feed.json` **（拟新增）** | Folio、个人 Agent、第三方订阅程序 | 标准 JSON Feed 1.1；项目专用关系放在 `_tomzio` 扩展；只推送**真实出版资源**，不以 Book 编目动作冒充新文章 |
| **当前状态 / 目录快照** | `https://tomz.io/books/catalog.json` **（PR #189，未发布）** | 书架、封面、书内目录、顺序/计数 | 沿用 PR #189 的 `schemaVersion: 1` 结构；不是更新事件流；不能从 `entryCount` 直接推算“新增几篇” |

另拟新增小型**发现清单** `https://tomz.io/feeds.json`，负责指出三种公共资源及其语义；它**不是第四套内容流**，不保存文章、书籍或人工目录。可在第二阶段上线。

普通用户仍可以直接使用 `/rss.xml`；机器消费者首选发现清单，选择自己需要的更新或状态；不知道发现清单的标准 JSON Feed 客户端直接从 HTML 的 `rel="alternate"` 找到 `/feed.json`。

## 3. 唯一出版数据链：衍生而非复制

```text
Markdown / MiraDocs / _book.yml / External Book@固定SHA
                     ↓
正式内容解析、作者、Group/Tag、Book/Issue 关系、Git 时间
                     ↓
Vite 静态路由与 canonical / Article / CollectionPage JSON-LD
                     ↓
[构建期临时 PublicationIndex；不提交、不做数据库]
          ├── /rss.xml                  保留原 RSS2 契约
          ├── /feed.json                JSON Feed 1.1 活动流
          ├── /books/catalog.json       Book 当前快照 (PR #189)
          └── /feeds.json               仅发现清单
```

- **正式事实来源仍是既有内容与内容架构。** 新的 `PublicationIndex` 只是内存/构建期衍生投影，按生成器输入和最终静态输出核对，不引入另一个作者编辑入口。
- 首期可以复用既有 `generate:rss` 与 PR #189 的独立生成器，不为抽象整齐一次性重写它们。随后让公共索引构建器复用最终静态 JSON-LD、已解析的书籍关系和周刊 metadata，把重复路径判断收敛到一处。
- 缺失的元数据应先修正既有公开出版对象的投影（如 issue/Book 关系），**不能靠消费端从路径猜测**。Book/Issue 仍然不是新的 Markdown 正文副本。
- 本构建与 GitHub Pages 构建共享生成逻辑；绝对 canonical 始终指向生产 `https://tomz.io`，公共路由生成尊重各自 base；生产 External Book 必须先按 `external-books.production.json` 的精确 SHA 导入。
- 永远**不**把构建时间、文件 mtime、代理人的判断或一个页面被收入书架的日期冒充出版/修订时间。

## 4. 资源身份与关系：同一文稿只有一个实体

### 4.1 统一资源记录（仅构建期的内部模型）

| 字段 | 来源与规则 |
| --- | --- |
| `id` | 暂以**唯一正文 canonical URL** 标识；正常编辑不得改变。仅专项 URL 迁移允许显式变更，必须维护 301 和迁移对照，绝不能静默重发为新文章 |
| `url` | 当前公开 canonical；所有投影保持相同值 |
| `kind` | `article\|issue\|book\|project\|work`；见π期号 `index.md` 是 `issue`，期内正文 `article`；Book 原生篇章是 `article`，Book 本身 `book` |
| `section` | `blogs\|weekly\|books\|submissions\|projects\|works` 等既有根，不能代替 `kind` |
| `title/description/cover` | 只取经已发布页面/文档确认的值；没有封面则不输出，不生成占位图片 |
| `authors/tags/group` | 服从 AUTHORSHIP 与 Tag canonical 规则；不得因为包含于期号或 Book 就覆盖作者；缺证据则不输出 |
| `publishedAt` / `publishedPrecision` | 按已有 `publishedAt > date > Git 兜底`；精度是 `date` 或 `datetime` |
| `modifiedAt` | 只用现有 Git 内容时间计算结果；修改正文与编排关系的“更改”不得混同 |
| `issue`（可选） | 已确认的 `{number, url}`，取现有 `issue` 和当前期号索引；某期下文章指向该期，不把整个期号当文章 |
| `books`（可选） | 已发表 Book 对该 canonical 的真实编排关系 `[{id, position}]`；已发布 Blog 被逻辑收录时仍用博客 canonical |
| `status` | 只能从实际发布资格派生；Book `draft/archived` 当前不足以安全隔离其静态正文，不得据此推断秘密内容未公开 |

这里的 `kind` 与 `books/issue` 是两种轴：**资源是什么**与**它被组织到哪里**。绝不新增独立 `series` 数据结构。

### 4.2 关键不变量

1. 同一 canonical 在同一更新流中最多出现一次；可以同时在 Book 目录中被引用，但它仍然是同一篇文章。
2. 一篇普通 Blog 后来被收录进 Book，仅改变 Book **状态快照**；**不**生成第二篇内容，不重置 `publishedAt`，不触发“新文章已发布”。
3. 见π `/weekly/010` 为 `issue`；`/weekly/010/the-dark-side-of-efficiency` 为 `article`，并通过 `issue.url` 关联到 010，且各自独立拥有作者与时间。
4. Book 原生章的 canonical 仍是 `/books/<id>/<slug>`；逻辑归档的 Blog 保持 `/blogs/...`，目录中使用原文章 canonical。
5. Book 清单属于**状态**：目录重排、封面更换、章节加入不应制造虚构的文章发布事件。
6. 项目、Works 与外部投稿保留各自归属和署名；v1 结构化活动流只收录实际 Article/Issue 公开对象，不为了覆盖所有页面而把普通项目列表当成文章。

## 5. JSON Feed 1.1：机器可读的统一更新流

目标：`/feed.json`；HTTP MIME `application/feed+json; charset=utf-8`。

格式采用 [JSON Feed 1.1](https://www.jsonfeed.org/version/1.1/) **而不是发明另一套“文章 JSON”**。通用阅读器能识别 `version/title/items/id/url/content_text`，Tomz 专用元数据只放在规范允许的 `_tomzio` 扩展，其他阅读器忽略扩展也能正常工作。

**契约示例（字段示意，非已部署响应）：**

```json
{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "Tomz.io · 出版更新",
  "home_page_url": "https://tomz.io/",
  "feed_url": "https://tomz.io/feed.json",
  "language": "zh-CN",
  "_tomzio": {
    "about": "https://tomz.io/feeds.json",
    "contractVersion": 1,
    "semantics": "activity"
  },
  "items": [
    {
      "id": "https://tomz.io/weekly/010",
      "url": "https://tomz.io/weekly/010",
      "title": "见π 010｜效率的暗面",
      "summary": "《见π》第 010 期。封面讨论 AI 编程的效率、理解与疲劳。",
      "content_text": "《见π》第 010 期。封面讨论 AI 编程的效率、理解与疲劳。阅读全文请访问原文链接。",
      "image": "https://assets.tomz.io/jianpi/010/efficiency-dark-side-cover-qr-v1.webp",
      "_tomzio": {
        "kind": "issue",
        "section": "weekly",
        "issue": { "number": 10, "url": "https://tomz.io/weekly/010" },
        "publishedDate": "2026-11-15",
        "publishedPrecision": "date"
      }
    }
  ]
}
```

注意事项：

- JSON Feed 规范要求每条 `item` 有 `id`，且 **`content_text` 或 `content_html` 至少一个**。本站首期可用已发表的真实 description/lead 生成 `content_text` 摘要，点击 `url` 读完整文章；**不复制完整正文**。没有摘要时使用有依据的标题及固定“阅读全文”提示，不让模型编写事实。
- JSON Feed 的 `date_published`、`date_modified` **必须是 RFC 3339 日期时间**；如果来源只证明 `2026-11-15`，只在 `_tomzio.publishedDate` 记录日期精度，**不伪造当日 00:00:00**。只有真实带时区时间才填标准字段。已有 `modifiedAt` 有精确时间时才填标准 `date_modified`。
- `authors` 仅在已有作者事实可正确映射为公开作者时填写；期号编辑者不覆盖期内文章的原作者。
- `_tomzio.kind` 只允许 `article`、`issue`（首期活动流）；周刊内文与书籍原生章节都属于 `article`，使用 `_tomzio.issue` 或 `_tomzio.books` 表达关联。
- 只保留有限最新条目（建议先 100 条，实测体积；按**内容真实修改时间优先**、再发布时间和稳定 id 排序），但修改排序仅意味着“更新提醒”，不能改变 `date_published`。若需要完整历史，再用标准 JSON Feed `next_url` 分页，不许提供不存在的分页 URL。
- 同一个 `id` 的修订覆写同一条记录，不能新增重复 `item`；未来若需独立变更事件 API，再另立契约，不向 JSON Feed 强塞事件日志。

## 6. Book Catalog：维持当前状态快照语义

**先交付现有 PR #189，不因这份设计扩大其范围。** 现有 v1：

```text
GET /books/catalog.json
schemaVersion: 1
source: https://tomz.io/books/
books[]: { id, title, description, url, cover, entryCount,
           entries[]: { title, url, position } }
```

- `books[].id` 是稳定 Book ID；每本书的 `url` 为 CollectionPage canonical，`entries[].url` 为原文 canonical；可以是 `/books/` 原生章节，也可以是 `/blogs/` 的逻辑归档。
- `entryCount` 为该快照中真实公开目录数量，不是“上次同步以来增加的章节数”；正文的发布时间/更新时间不可在这个 v1 合同中凭空补出。
- 新书、章节增删、目录重排、封面/说明更新都属于目录状态变化。消费者对比最新有效快照与自己保存的上一版，计算差异；不能因为目录重排重发新闻通知。
- 若需要 `revision`，后续采用**对规范化有效目录内容的确定性摘要**，不是构建时间；应作为独立可选扩展经消费者兼容测试后引入。v1 不能突然增加消费端必填字段。
- 没有外部 Book 导入的本机构建与生产构建的书/章数量可能不同；CI 校验**来源一致性**，不能把“6 本 65 章”固化为所有环境永久不变量。

## 7. 发现入口：一个链接表，不是新事实库

建议公开 `GET /feeds.json`，`Content-Type: application/json`，例如：

```json
{
  "schemaVersion": 1,
  "publisher": "https://tomz.io/",
  "resources": [
    { "id": "rss", "href": "https://tomz.io/rss.xml",
      "format": "rss2", "semantics": "activity" },
    { "id": "json-feed", "href": "https://tomz.io/feed.json",
      "format": "jsonfeed1.1", "semantics": "activity" },
    { "id": "books", "href": "https://tomz.io/books/catalog.json",
      "format": "tomzio-book-catalog-v1", "semantics": "state" }
  ]
}
```

- 这是一份**公开 API 发现清单**，不是 JSON Feed、Atom、RFC 9264 Linkset 的伪装。只包含静态资源链接，不保存文章实体。
- 站点 HTML 的 `<head>` 继续保留现有 RSS `rel="alternate"`；新增 JSON Feed 1.1 标准发现：
  `<link rel="alternate" type="application/feed+json" title="Tomz.io JSON Feed" href="/feed.json">`。
- `/feeds.json` 可从站点订阅入口页和文档直接链接；首期不引入 `/.well-known/` 未注册自定义路径或复杂的 RFC 9264 协议实现。
- `resources` 仅标记**已经部署验证**的 endpoint。发布顺序中在 `/books/catalog.json` 仍 404 时，不许在生产发现清单里宣称它已可用。
- 现有 `rss.xml` 自发现链接和订阅地址永久向后兼容。

## 8. HTTP、缓存、错误及消费者契约

### 出版者（Cloudflare Pages 静态输出）

1. 三个 JSON 资源必须真实返回 `200`、合法 UTF-8 JSON、正确 MIME；`/rss.xml` 按 RSS XML 输出。不要用 200 HTML fallback 伪装一个 API。
2. 对**公开且无需凭证**的 JSON 端点添加 `Access-Control-Allow-Origin: *`，不用 cookie/认证，不配置 `Access-Control-Allow-Credentials: true`。
3. 可从 `Cache-Control: public, max-age=300` 起步（具体 TTL 在 Pages 部署验证时定稿）；优先使用 CDN 原生 `ETag` / `Last-Modified`。**不能假设 Cloudflare 已默认提供验证头**，需生产回读确认后才承诺条件请求。
4. 资源内容通过部署原子发布；缓存 TTL 允许短时间观察到不同版本，消费者不得把暂时旧响应判为数据丢失。不要把构建时钟当作 `modifiedAt`。
5. CDN CORS / Headers 路径须覆盖 root 构建真实文件；GitHub Pages 子路径构建仍需生成能被验证的 JSON 资源，生产 canonical 不因 base 更改。

### 消费者（Folio / 国内官网 / 外部客户端）

| 情况 | 正确处理 |
| --- | --- |
| 200，已知 `schemaVersion` 且结构合规 | 原子替换缓存，记录来源 URL、验证时间、修订/HTTP validator（有则用） |
| 304，已有对应有效缓存 | 保持上一版、更新校验时间；没有缓存不能用 304 组成内容，需无条件重取 |
| 404 / 410 | **此渠道尚未提供或已撤回**，不是“空书架”；保留最后有效数据并显式标注 |
| 网络失败 / 5xx / 超时 | 保留最后有效数据，报告快照日期与失败类型；退避重试，不清空列表 |
| 200 但错误 JSON、未知 major version、无效 canonical | 拒绝整份响应，保留最后有效数据；不把部分坏数据合并进状态 |
| 正常有效空集 | 仅当契约允许该集合为空且状态有效时展示空集，不能等同于请求失败 |

- 公开数据可以轮询，例如活动流 10–15 分钟、书架状态 15–30 分钟（**仅建议初始值，不是已实施 SLA**），页面不可见时降频；多消费者重用 ETag/缓存，不能每次 UI 重绘都请求。
- 严格以记录 `id` 去重；不从路径片段推断内容类型；不要根据 `entryCount` 变动数发“新文章”通知。
- 快照要保留可追溯的 `source` 和 `capturedAt`（取实际成功抓取时刻），明确区分“最后成功同步”与“内容最后修改”；快照不可拿前一天时间冒充 `modifiedAt`。
- 跨域严格校验 HTTPS、出版社允许的 canonical/封面链接和响应大小；不要让外部 URL 字段直接决定浏览器可执行内容。

## 9. 兼容、版本与迁移顺序

**阶段 A：先修交付断点（独立候选）**

1. 完成现有 [tomz-io PR #189](https://github.com/dangjingtao/tomz-io/pull/189) 的维护者审查，不趁机将当前 Book Catalog 改成全新大协议。
2. 合并、生产部署后亲测 `/books/catalog.json` 的 HTTP 200、MIME、CORS、缓存，以及真正部署时 External Book 版本；正确对比目录与静态页面；生产未通过不得打开消费者动态订阅。
3. 消费者 [tomzlab-web PR #11](https://github.com/uichat-mira/tomzlab-web/pull/11) 在新端点验证成功后方可正式启用运行时更新；保留离线快照。

**阶段 B：增加标准活动流（本设计首个新实现）**

1. 在构建期增加小型统一 `PublicationIndex` 投影，将现有 RSS 与 JSON Feed 需要的 canonical/作者/时间/类型/期号/书籍关系在一处归一化，但不修改正文真相源。
2. 输出 `/feed.json`（标准 JSON Feed 1.1 + `_tomzio`）；原 `rss.xml` 的 XML 和 RSS 链接保持兼容。修订、发布日期精度和逻辑归档场景做契约回归。
3. 加入 `/feeds.json` 与 HTML JSON Feed 发现链接；上线后核实两个活动流与书架快照所引用的 canonical 一致。

**阶段 C：消费者收敛与清理**

1. 国内官网的记录/周刊将从 RSS URL 解析和 `/weekly/` 路径猜测，迁移到 `_tomzio.kind/issue` 等显式语义；Folio 公共订阅 Hook 只负责轮询/缓存/失败行为，**不负责推断内容的出版归属**。
2. 迁移通过后删掉消费者已无意义的 HTML 抓取 / 专用 RSS 推断；保留旧快照作为真实故障回退，注明来源。
3. 有需求再考虑增量变更、分页历史、分类子流；首期**不加** WebSub、Webhook、WebSocket、所有 Book 独立 Feed、全文 JSON 或独立 Series 层。

**版本兼容约束**

- `/feed.json` 采用 JSON Feed 官方版本 1.1；自家扩展 `_tomzio.contractVersion=1`。增加可忽略的可选字段属于兼容；改变身份、`kind`、必填字段和错误语义是 breaking，须版本化并提供重叠发布期，不能静默在原路径切换。
- `/books/catalog.json` 的 `schemaVersion:1` 继续存在；是否升 v2 应是后续真实需求驱动的独立决定，不借此方案强制。
- 不给生产端宣称尚未合并的接口有 SLA、ETag 或可发现性。

## 10. 可执行验收矩阵

| 测试层 | 必须证明什么 |
| --- | --- |
| 数据身份 | 同一个 Blog 即使被一个或多个 Book 收录，在活动流中仍只有一个 canonical/id；Book 目录引用原文 |
| 周刊 | `weekly/010/index.md` 被识别为 `issue`、期内文章为 `article`；期号、封面、期内关系与原有作者保持一致 |
| 时间 | 仅有 `2026-11-15` 的发布日期绝不生成伪造午夜时间；Git `modifiedAt` 与 Article JSON-LD、sitemap 使用同一个值 |
| 不造内容 | 不输出草稿、隐藏内容、无来源作者或编造全文；RSS Feed 元信息可以聚合但不能制造第二份 Markdown |
| 静态与兼容 | `rss.xml` 原有 guid/canonical 与 RSS alternate 不回归；JSON Feed 验证符合 1.1，`content_text` 存在 |
| Book | 本地未导入/生产已导入 External Book 都通过结构契约；逻辑归档 Blog canonical 不变、position 不重复 |
| Pages | 根路径和 GitHub Pages 子路径生成的 JSON 可用，绝对 canonical 一致，XML/JSON MIME 和发现链接正确 |
| 线上 | 生产 GET/HEAD、HTTP 200/304（如 CDN 支持）、CORS、ETag（如支持）、缓存、SSR link 与静态 JSON 读回一致 |
| 失败与缓存 | 404、500、损坏 JSON、未知 major 版本、断网、无缓存的 304 均有明确处理，绝不把错误当空列表 |
| 消费者 E2E | Folio 在真实浏览器不重建时读到新 Book 与更新信息；禁用 JS 时保留真实静态内容；手机端无溢出 |

## 11. 争议点与明确暂缓

- **是否完整推送作品与项目？** 暂不把普通项目目录、Works 当文章加入更新流；有真实消费需求再以明确 `kind` 拓展。
- **是否给每本 Book 一个 RSS？** 暂不需要，`books/catalog.json` 已提供 Book 状态，活动流的 `_tomzio.books` 可支持按关系过滤；不能为每本书重复生成正文。
- **是否 RSS 迁移到 Atom？** 不迁移；现有 RSS 读者最多。只用 JSON Feed 实现精确日期和类型，不引入第三个重复更新流。
- **是否把 Feed 作为完整远程内容数据库？** 否。JSON Feed 只提供摘要与指向唯一 canonical 的永久链接；书籍状态继续独立快照。
- **站外 External Book 的作者与修改时间** 只从固定源仓库的出版合同和历史投影获得；无证据时字段缺省，不以导入 commit 或本次构建时间补全。

## 12. 参考与归属

- 正式站内规则：`docs/CONTENT_ARCHITECTURE.md`、`docs/AUTHORSHIP.md`、`docs/PROJECT_ARCHITECTURE.md`、`docs/learning-space-plan.md`。
- 当前已实现：`scripts/generate-rss.mjs`、`scripts/verify-rss.mjs`、`src/content/bookshelf.ts`、`src/features/weekly/WeeklyPages.tsx`。
- 现有独立候选：[tomz-io PR #189](https://github.com/dangjingtao/tomz-io/pull/189)、[Folio PR #195](https://github.com/uichat-mira/folio/pull/195)、[tomzlab-web PR #11](https://github.com/uichat-mira/tomzlab-web/pull/11)。
- 外部规范：[JSON Feed 1.1](https://www.jsonfeed.org/version/1.1/)、[Atom 格式与更新语义 RFC 4287](https://www.rfc-editor.org/rfc/rfc4287)、[Feed Archiving RFC 5005](https://www.rfc-editor.org/rfc/rfc5005)（仅备用，不在 v1 实施）。

**本设计的交付边界：仅规范草案。没有新接口上线、没有变更 RSS、没有推断所有消费者已经升级。**
