# Tomz.io 项目架构

> 本文描述当前代码已经存在的项目事实：内容如何进入站点、构建时发生什么、首页派生数据如何生成、静态 SEO / RSS 如何落地，以及生产如何发布。
>
> 作者 / 署名规则见 `docs/AUTHORSHIP.md`；Group / Tag / Book / URL / 内容时间语义见 `docs/CONTENT_ARCHITECTURE.md`；正文媒体发布细节见 `docs/MEDIA_PIPELINE.md`。

## 1. 产品边界

Tomz.io 是个人主站和长期出版空间，不是单一博客模板。

当前公开内容根：

~~~text
/blogs
/weekly
/submissions
/projects
/books
/works
~~~

首页 `/` 负责聚合近期状态、长期关注、最近写作与主要内容入口。

## 2. 内容入口与运行时数据流

本仓库原生源内容位于 `src/pages/`。外部项目 Book 是例外：其内容真相保留在项目仓库，tomz.io 只在 CI 工作区按精确 commit SHA 临时导入，导入结果不提交回本仓库。

MiraDocs Vite 插件读取 Markdown 后，运行时数据主要经过：

~~~text
src/pages/**
  ↓
@uichat-mira/docs
  ↓
src/content/mira-docs-adapter.ts
  ↓
site model / feature pages / bookshelf
  ↓
React 页面
~~~

适配层统一 route / root / directory、作者字段、Tag canonicalization、Book 归属、内容时间、headings 与 merged content。不要在不同页面组件重新发明一套内容解析逻辑。

顶部公开导航由 `src/site.config.ts` 的 `siteNavigation` 提供单一真相源；运行时 Header、MiraDocs 静态页面以及 Vite 生成的静态首页 / 书架都消费同一配置，不应再维护平行导航数组。

## 3. 六个内容根

### blogs

Tomz / Mira 的持续写作。Blog Group 是正文自身的一级内容性质。稳定 Group 与物理目录映射由 `site-policy.json` 管理。

### weekly

《见π》的出版空间。`/weekly` 是历期索引，单期索引与详情文章仍由 Markdown 驱动；静态 SEO 中详情按 Article 输出，并进入统一内容时间、RSS 与 sitemap 链路。

### submissions

客座投稿单独拥有内容根：

~~~text
src/pages/submissions/<github-username>/
~~~

它不是 Blog Group。作者页、投稿正文、署名与机器元数据都应保持客座作者身份。

### projects

公开项目记录。项目页作者归属以 `docs/AUTHORSHIP.md` 为准。

### books

书架是独立内容空间：

~~~text
src/pages/books/<book-id>/
├── _book.yml
└── *.md
~~~

`src/content/bookshelf.ts` 通过 `import.meta.glob` 读取 manifest；新增公开书籍不应要求在 React 维护固定书单。

### works

作品保持独立根。连环画相关还有独立素材检查、构建与 R2 发布 pipeline；它与通用正文媒体链分开维护。

### External Book

长期研究 / 写作项目可以由独立仓库持有正文与出版合同：

~~~text
project repository @ exact SHA
├── publication.json
└── essays / source content
        ↓
scripts/import-external-book.mjs
        ↓
CI workspace: src/pages/books/<book-id>/**
        ↓
现有 MiraDocs / Bookshelf / static SEO
~~~

边界：

- 项目仓库是正文、Book 元数据、条目关系与署名声明的单一真相源；
- tomz.io 不提交外部 Book 的 Markdown 副本；
- importer 不执行外部仓库代码，只读取 `publication.json` 和被声明的 Markdown；
- 外部来源必须固定到精确 commit SHA，不使用浮动 branch 作为实际构建输入；
- 署名必须由项目仓库显式声明，tomz.io 不允许用默认作者推断补齐；
- Preview 输出仍只是 `gh-pages` 派生物。

## 4. 内容时间

内容时间不是页面组件临时计算。

构建前：

~~~text
scripts/generate-content-times.mjs
  ↓
Git file history
  ↓
src/content/content-times.generated.ts
.mira-cache/content-times.json
~~~

运行时通过 `src/content/content-time.ts` 读取派生结果。

静态构建完成后，`scripts/apply-content-times-to-static.mjs` 把同一套时间写回可见 HTML / JSON-LD / sitemap 等静态输出。blogs、submissions 与 weekly 统一按文章元数据处理。

正式语义：

~~~text
publishedAt = publishedAt > date > Git fallback
modifiedAt  = 正文源最近一次真实 Git 修改
~~~

生产 CI 必须 checkout 完整历史；不得用文件 mtime 代替 Git。

## 5. 首页派生数据

首页有两类构建期快照。

### 5.1 最近状态：home-recent

生成器：`scripts/generate-home-recent.mjs`

输出：`src/content/home-recent.generated.ts`

输入包括本仓库近期公开 blogs / projects、配置的 GitHub 仓库近期 commits，以及程序明确注册的公开 source。

AI 只负责从输入事实中选 3 条并写短摘要。链接不是模型自由生成：模型返回 sourceId，程序再映射到允许的 href。

如果 AI 不可用：

- 优先保留已提交快照；
- 没有快照时写确定性 fallback；
- 不因为 AI 故障让首页构建失败或出现空块。

### 5.2 长期关注：home-focus

生成器：`scripts/generate-home-focus.mjs`

输出：`src/content/home-focus.generated.ts`

它从公开 blogs / projects / books 中收集证据，默认按周期刷新；`HOMEPAGE_AI_FORCE` 可以强制刷新。

生产构建可以直接使用本次成功生成的结果，但生产 workflow 不直接写回受保护的 main。仓库中的已提交快照继续作为稳定 fallback；如需持久化更新，必须走仓库允许的 PR / 合并流程。

### 5.3 AI 协议

当前使用 OpenAI Chat Completions 兼容协议：

~~~text
{HOMEPAGE_AI_BASE_URL}/chat/completions
~~~

主要环境变量：

~~~text
HOMEPAGE_AI_BASE_URL
HOMEPAGE_AI_API_KEY
HOMEPAGE_AI_MODEL
HOMEPAGE_AI_FORCE
HOMEPAGE_GITHUB_TOKEN
HOMEPAGE_GITHUB_REPOS
GITHUB_TOKEN
~~~

私人聊天、邮件、日历默认不属于生成输入。

## 6. 构建链

`package.json` 的 `prepare:site`：

~~~text
generate:content-times
→ verify:mira-docs
→ generate:home-recent
→ generate:home-focus
→ tsc -b
~~~

Root production build：

~~~text
prepare:site
→ vite build
→ apply-content-times-to-static
→ generate:rss
~~~

GitHub Pages build：

~~~text
prepare:site
→ vite build --mode github-pages
→ apply-content-times-to-static
→ generate:rss
~~~

两种模式共享内容、静态 SEO 与 RSS 逻辑，主要差别是 base：

- Cloudflare / root：`/`
- GitHub Pages：`/tomz-io/`

## 7. 静态 SEO 与 RSS

主要入口：

~~~text
mira-docs-static.ts
vite.config.ts
scripts/apply-content-times-to-static.mjs
scripts/generate-rss.mjs
scripts/verify-rss.mjs
~~~

公开页面构建时输出或校验静态正文 HTML、canonical、metadata、JSON-LD、Article / CollectionPage 语义、sitemap、lastmod、404 / noindex 行为与历史 URL redirect。

RSS 不维护第二套文章清单，而是从最终静态 HTML 中的 canonical 与 Article JSON-LD 派生 `dist/rss.xml`，并把 RSS alternate link 写回静态 HTML。这样 RSS、SEO 与实际公开正文共用同一事实源。

书籍原生内容、客座投稿与《见π》都必须进入同一套静态 SEO / 内容时间链，而不是只在客户端能打开。

## 8. 通用正文媒体与 R2

通用 Markdown 媒体链位于 `scripts/media-pipeline/`，详细合同见 `docs/MEDIA_PIPELINE.md`。

核心原则：

- GitHub 中 Markdown / 本地资源仍是内容事实源；
- `media:prepare` 扫描并优化可处理图片，生成内容哈希 manifest，不改源码；
- `media:publish` 只把缺失的内容寻址对象上传到 Cloudflare R2；
- `media:apply` 只在生产 CI 的临时工作区把引用改为 `https://assets.tomz.io/...`；
- PR / GitHub Pages 只测试和扫描，不上传 R2，也不改写源码；
- 相同最终字节共用同一个 SHA-256 key，不按 commit 复制整套媒体。

连环画仍使用 `scripts/comic-pipeline/` 的独立发行协议，不与通用正文媒体链混用。

## 9. PWA

`vite-plugin-pwa` 提供 Web App Manifest、app icons、Service Worker、旧 cache 清理与更新可用事件。

`src/main.tsx` 注册 Service Worker；UI 监听 `mira:pwa-update-available` 提示用户刷新。

修改 PWA 时必须注意旧 HTML shell 引用已被清理的 hashed assets 这一类发布风险。

## 10. 生产部署

生产入口：

~~~text
.github/workflows/deploy-cloudflare-pages.yml
~~~

触发：push to main 或 manual workflow dispatch。

主要步骤：

~~~text
checkout (fetch-depth: 0)
→ pnpm install --frozen-lockfile
→ media:prepare
→ media:publish -- --confirm
→ media:apply
→ pnpm run build
→ 确认 Cloudflare Pages 项目
→ wrangler pages deploy dist
→ 验证 tomz.io domain active
~~~

生产 workflow 对仓库内容保持只读，不直接提交或推送生成快照。媒体 URL 的替换只发生在 CI 工作区。

生产项目名：`tomz-io`。GitHub Pages 不是当前生产宿主。

### 10.1 《见π》GitHub Pages 施工预览

《见π》从 002 起使用独立施工分支：

~~~text
content/jianpi-<issue>
~~~

该分支每次 push 都由 `.github/workflows/pages-preview.yml` 构建 GitHub Pages 模式并强制更新 `gh-pages`，作为当前一期的编辑 / 视觉预览环境。

预览环境具有以下边界：

- 仅用于施工验收，不代表生产已发布；
- 使用 `/tomz-io/` base；
- 发布前执行 `prepare-pages-preview.mjs`，统一加入 `noindex,nofollow` 并禁止 robots 抓取；
- 只执行媒体扫描，不上传 R2，不改写正文源文件；
- `gh-pages` 是“当前最新施工预览”通道，同一时刻以最近一次成功部署为准；
- 正式生产仍只从 `main` 进入 Cloudflare Pages。

### 10.2 External Book GitHub Pages 预览

入口：

~~~text
.github/workflows/external-book-preview.yml
~~~

触发支持：

- `workflow_dispatch`：人工提供公开项目仓库与精确 SHA；
- `repository_dispatch: external-book-preview`：由项目仓库在晋级 preview 后通知。

工作流始终 checkout tomz.io `main` 作为受信任渲染器，再 checkout 外部项目的精确 SHA。导入只发生在 runner 工作区；构建完成后继续执行静态校验、`noindex,nofollow` 和 robots 隔离，再覆盖 `gh-pages`。

## 11. PR 验证

PR 验证入口：

~~~text
.github/workflows/verify.yml
~~~

当前核心确定性校验 job：`reduction-and-build`，覆盖：

~~~text
unit tests
→ media pipeline unit tests
→ media production scan（不上传、不改源码）
→ MiraDocs parse / route uniqueness
→ root build
→ root static output
→ GitHub Pages build
→ GitHub Pages static output
~~~

另有 Pages-like runtime smoke，验证构建产物在接近 GitHub Pages 的运行环境中可以正常工作。

PR 另有统一 AI Review Gate；其 provider / fallback 规则以当前 `.github` 配置与 workflow 为准，不在本文复制第二套运行合同。

## 12. 生成数据与事实源

人工事实源：

- `src/pages/**`（tomz.io 原生内容）
- 外部 Book：对应项目仓库的 `publication.json` + 被其引用的正文，按精确 SHA 读取；tomz.io 中的临时导入目录不是人工事实源
- `src/pages/books/*/_book.yml`
- `site-policy.json`
- `src/site.config.ts`
- 正式规则文档

构建派生：

- `src/content/content-times.generated.ts`
- `src/content/home-recent.generated.ts`
- `src/content/home-focus.generated.ts`
- `.mira-cache/content-times.json`
- `.mira-cache/media-r2/**`
- `dist/**`

原则：修生成器，不要为了让结果“看起来对”长期手改派生文件。

## 13. 修改边界

涉及作者 / 署名、Tag canonicalization、内容时间、Book 定义、canonical / sitemap / JSON-LD、顶部导航、首页 AI source / link policy、媒体发布或 deployment base 时，不应只在单个 React 页面修补。

这些属于站点级合同，必须检查运行时、静态输出和生产链是否一致。
