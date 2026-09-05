# AGENTS 行为规范（tomz-io）

本文件用于约束在本仓库执行任务的 AI Agent 行为，目标是：

- 保持内容、路由与静态输出稳定；
- 不破坏生产 Cloudflare Pages 与 GitHub Pages 兼容构建；
- 让改动可验证、可回滚、可追溯；
- 严格维护 Tomz.io 的作者署名、内容归属、内容架构与公开事实边界。

## 0. 必读规则

### 内容、作者、URL、SEO 相关

处理内容文章、书架、项目、作品、投稿、作者字段、内容目录、Tag、发布时间、修改时间、URL、SEO 或结构化数据前，必须先完整阅读：

- [docs/AUTHORSHIP.md](docs/AUTHORSHIP.md)
- [docs/CONTENT_ARCHITECTURE.md](docs/CONTENT_ARCHITECTURE.md)

docs/AUTHORSHIP.md 负责作者、共同署名、客座作者、writtenBy / reviewedBy / writingMode，以及页面、目录、URL 与 SEO 作者语义的一致性。

docs/CONTENT_ARCHITECTURE.md 负责 Group、Tag、Book、Tag canonicalization、逻辑归档、内容时间、URL / canonical、单一正文事实源，以及普通归档与历史归属纠正的区别。

### 构建、首页、部署、生成数据相关

涉及构建链、首页 AI 派生数据、静态输出、PWA、部署、内容时间脚本或生成文件时，同时读取：

- [docs/PROJECT_ARCHITECTURE.md](docs/PROJECT_ARCHITECTURE.md)

不得从旧 frontmatter、旧目录、历史分支名、旧 Skill 或过时计划反推出新的正式规则。

## 1. 当前项目事实

- 技术栈：Vite + React + TypeScript + MiraDocs。
- 生产站点：https://tomz.io
- 生产宿主：Cloudflare Pages。
- GitHub Pages 模式保留用于兼容性 / 静态输出验证，不是当前生产宿主。
- 内容入口：src/pages/。
- 当前公开内容根：blogs、submissions、projects、books、works。
- 书架由 src/pages/books/*/_book.yml 数据驱动。
- 内容时间在构建期从 Git 历史生成，不由浏览器查询 GitHub。
- 首页存在两个构建期派生快照：home-recent.generated.ts 与 home-focus.generated.ts。
- 首页 AI 使用 OpenAI Chat Completions 兼容接口；AI 失败时必须保持可构建 fallback。
- 站点包含 PWA / Service Worker 更新机制。

关键脚本（以 package.json 为准）：

- pnpm run dev
- pnpm run generate:content-times
- pnpm run generate:home-recent
- pnpm run generate:home-focus
- pnpm run verify:mira-docs
- pnpm run verify:content-times
- pnpm run build
- pnpm run build:github-pages
- pnpm run verify:static-output

## 2. 通用行为准则

- 只改与任务直接相关的文件，避免顺手重构。
- 变更优先小步提交；不要把内容迁移、视觉大改、部署改造混进同一个无关任务。
- 保持现有命名、目录结构、内容语气与数据边界。
- 不凭猜测声明“构建通过”；必须以实际命令 / CI 结果为准。
- 不自行推断作者关系；署名与归属按 docs/AUTHORSHIP.md。
- 不自行把 Book 收录理解为文件迁移；按 docs/CONTENT_ARCHITECTURE.md。
- 不新增独立 Series / 系列 metadata 层。
- 不在页面组件各自实现 Tag 别名逻辑；canonicalization 集中在 src/content/tag-taxonomy.ts。
- 不人工维护 modifiedAt。
- 不用文件 mtime、构建时间或当前仓库首次提交时间冒充历史内容事实。
- 不把计划、草稿或尚未合并的分支描述成线上已生效功能。

### 生成文件

以下文件由脚本维护，除非任务明确针对生成机制或快照恢复，否则不要手工编辑：

- src/content/content-times.generated.ts
- src/content/home-recent.generated.ts
- src/content/home-focus.generated.ts
- .mira-cache/content-times.json（本地 / CI 派生缓存）

如果生成失败，应修生成器、输入、环境或 fallback；不要直接“修结果”掩盖问题。

## 3. 内容改动规范

### 3.1 博客

处理 src/pages/blogs/ 时：

1. 先读 docs/AUTHORSHIP.md。
2. 涉及 Tag、Book、时间、URL、canonical 或 SEO 时同时读 docs/CONTENT_ARCHITECTURE.md。
3. 物理目录应与真实 Group 归属一致；不要仅因历史位置存在就继续复制错误结构。
4. slug 使用小写英文、数字、连字符。
5. frontmatter 至少保持现有内容体系要求：title、description、group、order、date、readTime。
6. 明确知道精确发布时间时可增加 publishedAt；不要伪造时分秒。
7. 不增加人工 modifiedAt。
8. 作者字段必须满足 docs/AUTHORSHIP.md。
9. 正文第一个 H1 与 title 一致。
10. 普通文章收入 Book 默认是逻辑关系，不复制正文、不换 canonical。

### 3.2 客座投稿

处理 src/pages/submissions/ 时：

- 客座作者规则以 docs/AUTHORSHIP.md 的“客座投稿”为准；
- 投稿正文保持在 submissions/<github-username>/，不要塞回 Blog Group；
- 作者页、公开署名、头像、JSON-LD / SEO 作者必须一致；
- reviewedBy 不改变正文作者身份；
- 客座文章必须保留站点约定的免责声明；
- 若历史 URL 已迁移，检查永久重定向与 canonical 是否仍然唯一。

### 3.3 书架

处理 src/pages/books/ 时：

- 先读取 docs/CONTENT_ARCHITECTURE.md 与 docs/learning-space-plan.md；
- 一本书的定义来自该目录下 _book.yml；
- 新增一本书不应要求在 React 里手工增加固定书目配置；
- Book 页面与条目保持 /books/<book-id>/... 结构；
- 不手工维护 modifiedAt；
- 物理迁移只用于明确的书籍原生内容或专项历史归属纠正，不把“收入书架”等同于搬文件。

## 4. 构建与验收

### 4.1 内容或页面改动

至少执行：

~~~bash
pnpm run verify:mira-docs
pnpm run build
~~~

### 4.2 涉及 GitHub Pages / base / 静态输出

额外执行：

~~~bash
pnpm run build:github-pages
pnpm run verify:static-output
~~~

### 4.3 涉及署名、迁移、内容时间或 SEO

除构建校验外，检查：

- 物理目录；
- 页面分类 / 导航；
- URL；
- canonical；
- 可见作者与顺序；
- writtenBy / reviewedBy / writingMode；
- “发布于 / 更新于”；
- JSON-LD datePublished / dateModified；
- sitemap lastmod；
- SEO / JSON-LD 作者；
- 首页 / 书架 / 投稿等索引；
- 是否生成同一正文的第二个可索引 URL。

### 4.4 内容时间

修改 Git 派生时间机制时：

- 构建期统一生成；
- 生产构建与 CI 必须使用足够完整的 Git 历史；
- 文件移动 / 改名尽可能跟随历史；
- 人工 date / publishedAt 优先于“当前仓库首次出现”；
- 本地没有 .git 时可以降级，但生产不得用 mtime 冒充 Git 时间。

### 4.5 首页 AI 派生数据

修改 generate-home-recent.mjs / generate-home-focus.mjs 时：

- 只能把脚本明确提供的公开事实交给模型；
- 不引入私人聊天、邮件、日历等来源；
- 模型不得直接决定任意 URL；链接必须经过程序允许的 source / href 映射；
- AI 失败不得导致首页空白或生产构建失去稳定 fallback；
- 不在日志输出 API Key、Authorization header 或完整敏感响应。

## 5. 发布与 CI

- PR 验证入口：.github/workflows/verify.yml。
- 生产发布入口：.github/workflows/deploy-cloudflare-pages.yml。
- 生产发布从 main 构建并部署到 Cloudflare Pages 项目 tomz-io。
- 生产 workflow 会在满足条件时持久化成功生成的首页长期关注快照。
- 不为了“让 CI 变绿”关闭校验、删除断言或把失败降级成静默成功。

## 6. 禁止事项

- 未经要求修改 .github/workflows/、部署密钥使用方式或生产域名逻辑。
- 未经要求修改 vite.config.ts 的 base、路由、静态化、SEO guard。
- 将计划中的功能描述为已上线事实。
- 在一次任务混入无关视觉大改或目录迁移。
- 未读正式规则就修改署名、栏目、书架、投稿、URL 或 SEO。
- 自行新增 Series 层或 /series/...。
- 人工维护 modifiedAt 或用 mtime / build time 冒充修改时间。
- 因 AI 实际成文、润色、执行工具较多就自行改变公开作者。
- 因文章被 Book 收录就默认复制正文、移动文件、删除原 URL。
- 直接编辑生成快照来绕过生成器错误。

## 7. 推荐工作流

1. 判断任务属于内容规则、项目架构还是二者同时涉及。
2. 读取对应正式规则。
3. 读取目标文件与相邻实现。
4. 用最小改动完成任务。
5. 运行对应校验。
6. 检查 diff 是否混入生成噪音或无关文件。
7. 汇报改动、验证结果与剩余风险。

---

如一般工程说明与仓库实时实现冲突，以当前代码与 CI 为准；作者与内容归属以 docs/AUTHORSHIP.md 为准；Group / Tag / Book / URL / canonical / 内容时间以 docs/CONTENT_ARCHITECTURE.md 为准；构建、首页派生数据与部署事实以 docs/PROJECT_ARCHITECTURE.md 和当前 workflow 为准。
