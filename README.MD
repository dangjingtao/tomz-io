# tomz-io

Tomz Dang 的个人主站，也是一个长期维护的个人出版空间。

生产站点：https://tomz.io

当前站点同时承载博客、客座投稿、项目记录、书架、作品，以及首页的近期状态与长期关注主题。

## 技术栈

- Vite
- React 19
- TypeScript
- @uichat-mira/docs / MiraDocs
- Tailwind CSS 4
- vite-plugin-pwa
- Cloudflare Pages

## 内容结构

正文统一从 src/pages/ 进入：

~~~text
src/pages/
├── blogs/        # Tomz / Mira 的博客内容
├── submissions/  # 客座投稿与作者页
├── projects/     # 项目记录
├── books/        # 书架；每本书由 _book.yml 定义
└── works/        # 作品
~~~

页面归属不能只看目录。作者、Group、Tag、Book、URL、canonical、SEO 和内容时间都有独立规则，见本文末尾的“正式规则”。

## 架构概览

~~~text
Markdown / _book.yml
        ↓
@uichat-mira/docs
        ↓
src/content/mira-docs-adapter.ts
        ↓
React 页面 + MiraDocs 静态输出
        ↓
内容时间 / canonical / JSON-LD / sitemap
        ↓
dist/
        ↓
Cloudflare Pages → tomz.io
~~~

几个重要的站点级机制：

- **内容时间**：构建期从 Git 历史生成 publishedAt / modifiedAt 结果，不使用文件 mtime 冒充修改时间。
- **书架**：每本书使用 src/pages/books/<id>/_book.yml，书目与页面由数据驱动，不在 React 中维护固定书单。
- **首页 AI 摘要**：home-recent 与 home-focus 在构建期生成；AI 不可用时保留已提交快照或使用确定性 fallback，不能因为模型故障把首页构建打空。
- **静态 SEO**：公开正文同时生成静态 HTML、canonical、JSON-LD、sitemap 等机器可读输出。
- **PWA**：站点带 manifest、Service Worker 与更新提示。
- **双构建目标**：生产是 Cloudflare Pages 根路径；GitHub Pages 模式保留用于兼容性 / 静态输出验证。

更完整的数据流和部署说明见 [docs/PROJECT_ARCHITECTURE.md](docs/PROJECT_ARCHITECTURE.md)。

## 本地开发

仓库使用 pnpm lockfile。建议使用 Node.js 22 与 pnpm 11。

~~~bash
pnpm install --frozen-lockfile
pnpm run dev
~~~

常用校验：

~~~bash
pnpm run verify:mira-docs
pnpm run build
pnpm run build:github-pages
pnpm run verify:static-output
~~~

内容时间单独排查时，可以先生成索引；如果要运行完整 verifier，必须先有静态构建产物：

~~~bash
pnpm run generate:content-times
# 需要检查生成索引时，到这里即可

pnpm run build
pnpm run verify:content-times
~~~

`verify:content-times` 会读取 `dist/` 中的静态 HTML 与 `sitemap.xml`，因此它是 post-build 校验，不是仅生成时间索引后的独立检查。

书架 / 连环画相关还有独立脚本，完整命令以 package.json 为准。

## 构建流程

pnpm run build 的核心顺序是：

~~~text
generate:content-times
→ verify:mira-docs
→ generate:home-recent
→ generate:home-focus
→ tsc -b
→ vite build
→ apply-content-times-to-static
~~~

因此，构建不是单纯的前端 bundle。它同时承担内容校验、首页派生数据、内容时间、静态 SEO 与最终页面生成。

## 首页 AI 配置

首页生成脚本使用 OpenAI Chat Completions 兼容接口：

~~~text
{HOMEPAGE_AI_BASE_URL}/chat/completions
~~~

生产环境当前使用：

~~~text
HOMEPAGE_AI_BASE_URL
HOMEPAGE_AI_API_KEY
HOMEPAGE_AI_MODEL
HOMEPAGE_AI_FORCE
GITHUB_TOKEN
~~~

可选：

~~~text
HOMEPAGE_GITHUB_TOKEN
HOMEPAGE_GITHUB_REPOS
~~~

AI 输出只能总结脚本提供的公开事实。私聊、邮件、日历等私人来源不进入首页生成输入。

## 部署与验证

- main push 触发 .github/workflows/deploy-cloudflare-pages.yml。
- 生产构建使用完整 Git 历史，以保证内容时间推算一致。
- 成功构建后通过 Wrangler 部署到独立 Cloudflare Pages 项目 tomz-io。
- PR 通过 .github/workflows/verify.yml 验证 MiraDocs、root build、GitHub Pages build 与静态输出。
- AI Review 由 .github/workflows/ai-review-fallback.yml 提供统一门禁：CodeRabbit 正常时采用兔子结论；兔子限流 / 不可用时自动复用已配置的 OpenAI-compatible 自定义模型。
- GitHub Pages 不是当前生产宿主，主要保留为兼容和回归验证目标。

## 目录导览

~~~text
src/
├── App.tsx                    # 主应用 / 内容页面
├── HomepageV1.tsx             # 首页
├── content/                   # 内容适配、书架、Tag、时间、首页派生数据
├── components/                # 通用组件
├── features/                  # 功能模块
├── pages/                     # Markdown / 内容事实源
└── site.config.ts             # 站点配置适配

scripts/
├── generate-content-times.mjs
├── generate-home-recent.mjs
├── generate-home-focus.mjs
├── apply-content-times-to-static.mjs
└── comic-pipeline/

mira-docs-static.ts             # 静态页面 / SEO 输出
site-policy.json                # 站点身份与稳定策略
~~~

## 正式规则

修改内容、作者、书架、URL 或站点架构前，不要只参考 README。以下文件才是对应领域的正式规则：

1. [docs/AUTHORSHIP.md](docs/AUTHORSHIP.md) — 作者、共同署名、投稿作者与内容归属。
2. [docs/CONTENT_ARCHITECTURE.md](docs/CONTENT_ARCHITECTURE.md) — Group / Tag / Book、URL、canonical、内容时间与单一正文事实源。
3. [docs/PROJECT_ARCHITECTURE.md](docs/PROJECT_ARCHITECTURE.md) — 当前代码、构建、首页派生数据、PWA 与部署架构。
4. [AGENTS.md](AGENTS.md) — AI Agent 在本仓库中的执行与验收规范。

书架的已落地模型和后续演进约束见 [docs/learning-space-plan.md](docs/learning-space-plan.md)。
