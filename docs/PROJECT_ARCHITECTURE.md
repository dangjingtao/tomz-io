# Tomz.io 项目架构

> 本文描述当前代码已经存在的项目事实：内容如何进入站点、构建时发生什么、首页派生数据如何生成、静态 SEO 如何落地，以及生产如何发布。
>
> 作者 / 署名规则见 docs/AUTHORSHIP.md；Group / Tag / Book / URL / 内容时间语义见 docs/CONTENT_ARCHITECTURE.md。

## 1. 产品边界

Tomz.io 是个人主站和长期出版空间，不是单一博客模板。

当前公开内容根：

~~~text
/blogs
/submissions
/projects
/books
/works
~~~

首页 / 负责把近期状态、长期关注、最近写作与主要内容入口聚合起来。

## 2. 内容入口与运行时数据流

源内容位于 src/pages/。

MiraDocs Vite 插件读取 Markdown 后，运行时数据主要经过：

~~~text
src/pages/**
  ↓
@uichat-mira/docs
  ↓
src/content/mira-docs-adapter.ts
  ↓
allDocs / site areas / bookshelf
  ↓
React 页面
~~~

适配层统一 route / root / directory、作者字段、Tag canonicalization、Book 归属、内容时间、headings 与 merged content。

不要在不同页面组件重新发明一套内容解析逻辑。

## 3. 五个内容根

### blogs

Tomz / Mira 的持续写作。Blog Group 是正文自身的一级内容性质。稳定 Group 与物理目录映射由 site-policy.json 管理。

### submissions

客座投稿单独拥有内容根：

~~~text
src/pages/submissions/<github-username>/
~~~

它不是 Blog Group。作者页、投稿正文、署名与机器元数据都应保持客座作者身份。

### projects

公开项目记录。项目页作者归属以 docs/AUTHORSHIP.md 为准。

### books

书架是独立内容空间：

~~~text
src/pages/books/<book-id>/
├── _book.yml
└── *.md
~~~

src/content/bookshelf.ts 通过 import.meta.glob 读取所有 manifest；新增公开书籍不应要求在 React 维护固定书单。

### works

作品保持独立根。连环画相关还有独立素材检查、构建与 R2 发布 pipeline。

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

运行时通过 src/content/content-time.ts 读取派生结果。

静态构建完成后，scripts/apply-content-times-to-static.mjs 把同一套时间写回可见 HTML / sitemap 等静态输出。

正式语义：

~~~text
publishedAt = publishedAt > date > Git fallback
modifiedAt  = 正文源最近一次真实 Git 修改
~~~

生产 CI 必须 checkout 完整历史；不得用文件 mtime 代替 Git。

## 5. 首页派生数据

首页有两类构建期快照。

### 5.1 最近状态：home-recent

生成器：scripts/generate-home-recent.mjs

输出：src/content/home-recent.generated.ts

输入包括本仓库近期公开 blogs / projects、配置的 GitHub 仓库近期 commits，以及程序明确注册的公开 source。

AI 只负责从输入事实中选 3 条并写短摘要。链接不是模型自由生成：模型返回 sourceId，程序再映射到允许的 href。

如果 AI 不可用：

- 优先保留已提交快照；
- 没有快照时写确定性 fallback；
- 不因为 AI 故障让首页构建失败或出现空块。

### 5.2 长期关注：home-focus

生成器：scripts/generate-home-focus.mjs

输出：src/content/home-focus.generated.ts

它从公开 blogs / projects / books 中收集证据，默认按周期刷新；HOMEPAGE_AI_FORCE 可以强制刷新。

生产 workflow 只会持久化成功的 AI 生成结果，不会把 fallback 自动提交回 main。

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

package.json 的 prepare:site：

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
~~~

GitHub Pages build：

~~~text
prepare:site
→ vite build --mode github-pages
→ apply-content-times-to-static
~~~

两种模式共享内容和静态 SEO 逻辑，主要差别是 base：

- Cloudflare / root：/
- GitHub Pages：/tomz-io/

## 7. 静态 SEO

主要入口：

~~~text
mira-docs-static.ts
vite.config.ts
~~~

公开页面构建时输出或校验静态正文 HTML、canonical、metadata、JSON-LD、Article / CollectionPage 语义、sitemap、lastmod、404 / noindex 行为与历史 URL redirect。

书籍原生内容与客座投稿都必须进入同一套静态 SEO / 内容时间链，而不是只在客户端能打开。

## 8. PWA

vite-plugin-pwa 提供 Web App Manifest、app icons、Service Worker、旧 cache 清理与更新可用事件。

src/main.tsx 注册 Service Worker；UI 监听 mira:pwa-update-available 提示用户刷新。

修改 PWA 时必须注意旧 HTML shell 引用已被清理的 hashed assets 这一类发布风险。

## 9. 生产部署

生产入口：

~~~text
.github/workflows/deploy-cloudflare-pages.yml
~~~

触发：push to main 或 manual workflow dispatch。

主要步骤：

~~~text
checkout (fetch-depth: 0)
→ pnpm install --frozen-lockfile
→ pnpm run build
→ 可选持久化成功的 home-focus AI snapshot
→ 确认 Cloudflare Pages 项目
→ wrangler pages deploy dist
→ 验证 tomz.io domain active
~~~

生产项目名：tomz-io。

GitHub Pages 不是当前生产宿主。

## 10. PR 验证

PR 验证入口：

~~~text
.github/workflows/verify.yml
~~~

当前核心确定性校验 job：reduction-and-build。

它覆盖 MiraDocs parse / route uniqueness、root build、root static output、GitHub Pages build 与 GitHub Pages static output。

PR 另有统一的 AI Review Gate：

- CodeRabbit 正常完成并给出明确 APPROVED / CHANGES_REQUESTED 时，直接采用该结果；
- CodeRabbit 被限流、失败、不可用，或在短等待窗口内没有形成明确结论时，自动切换到站点已经配置的 OpenAI Chat Completions 兼容模型；
- fallback reviewer 读取当前 PR diff 与 AGENTS / AUTHORSHIP / CONTENT_ARCHITECTURE / PROJECT_ARCHITECTURE 规则，输出 APPROVE 或 REQUEST_CHANGES；
- fallback 的详细结果写入 PR comment，门禁本身以 GitHub Actions 的 AI Review Gate status check 表达，不依赖 GitHub Actions bot 直接批准 PR。

用于 review 的环境变量优先使用 AI_REVIEW_BASE_URL / AI_REVIEW_API_KEY / AI_REVIEW_MODEL；未单独配置时复用 HOMEPAGE_AI_BASE_URL / HOMEPAGE_AI_API_KEY / HOMEPAGE_AI_MODEL。

历史 workflow / script 中仍可能保留 BR003A / BR003B 命名；它们是迁移阶段遗留名称，不再代表当前产品阶段。

## 11. 生成数据与事实源

人工事实源：

- src/pages/**
- src/pages/books/*/_book.yml
- site-policy.json
- 正式规则文档

构建派生：

- src/content/content-times.generated.ts
- src/content/home-recent.generated.ts
- src/content/home-focus.generated.ts
- .mira-cache/content-times.json
- dist/**

原则：修生成器，不要为了让结果“看起来对”长期手改派生文件。

首页快照作为稳定 fallback 可以提交进仓库，但仍由生成器维护。

## 12. 修改边界

涉及作者 / 署名、Tag canonicalization、内容时间、Book 定义、canonical / sitemap / JSON-LD、首页 AI source / link policy 或 deployment base 时，不应只在单个 React 页面修补。

这些属于站点级合同，必须检查运行时和静态输出两条链是否一致。
