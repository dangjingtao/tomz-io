# AGENTS 行为规范（tomz-io）

本文件用于约束在本仓库执行任务的 AI Agent 行为，目标是：

- 保持内容与路由稳定；
- 不破坏 BR003A / BR003B 的构建与预览流程；
- 让改动可验证、可回滚、可追溯；
- 严格维护 Tomz.io 的作者署名、内容归属与内容架构。

## 0. 必读：署名、归属与内容架构原则

**在处理任何内容文章、书架、项目、作品、作者字段、内容目录、Tag、发布时间、修改时间、URL、SEO 或结构化数据前，必须先完整阅读：**

- [`docs/AUTHORSHIP.md`](docs/AUTHORSHIP.md)
- [`docs/CONTENT_ARCHITECTURE.md`](docs/CONTENT_ARCHITECTURE.md)

`docs/AUTHORSHIP.md` 是本仓库关于以下事项的正式规则：

- Tomz / Mira 的公开署名；
- 各栏目第一作者及共同作者顺序；
- `author` / `writtenBy` / `reviewedBy` / `writingMode`；
- 《谎颜》的归属；
- Mira 来信、开发者生活、共同思考、读经、一起学智能体、项目页、连环画的边界；
- 物理目录、URL 与 SEO 的归属一致性。

`docs/CONTENT_ARCHITECTURE.md` 是本仓库关于以下事项的正式设计规则：

- Group、Tag 与 Book 的内容关系；
- 连续文章直接使用 Book 归类，不新增独立 Series 层；
- Tag 作为全站共享主题词表的 canonical 与收敛规则；
- 逻辑归档优先于物理迁移；
- 内容的 `publishedAt` / `modifiedAt` 时间模型与 Git 推算边界；
- 已发布 URL 与 canonical 的稳定性；
- 单一正文事实源；
- 普通归档与历史归属纠正的区别。

不得从旧 frontmatter、旧目录位置或历史 Skill 反推出新的署名、归档或时间规则。作者与内容归属冲突以 `docs/AUTHORSHIP.md` 为准；Tag、Book、内容时间、逻辑归档、URL 与 SEO 组织方式冲突以 `docs/CONTENT_ARCHITECTURE.md` 为准。

## 1. 项目事实（执行前必须理解）

- 技术栈：Vite + React + TypeScript + MiraDocs。
- 内容入口：`src/pages/`，博客内容在 `src/pages/blogs/`。
- 站点构建前会执行内容校验与首页数据生成。
- GitHub Pages 构建模式使用 `build:github-pages`。

关键脚本（来自 `package.json`）：

- `npm run dev`
- `npm run verify:mira-docs`
- `npm run generate:home-recent`
- `npm run build`
- `npm run build:github-pages`
- `npm run verify:static-output`

## 2. 通用行为准则

- 只改与任务直接相关的文件，避免顺手重构。
- 不修改发布流程、路由规则、SEO/静态输出逻辑，除非任务明确要求。
- 变更优先小步提交：先最小可行改动，再补充优化。
- 保持现有命名风格、目录结构和中英文内容风格一致。
- 不凭猜测声明“构建通过”；必须以实际命令结果为准。
- 不自行推断作者关系；署名与内容归属按 `docs/AUTHORSHIP.md` 执行。
- 不自行把 Book 收录理解为文件迁移；内容组织按 `docs/CONTENT_ARCHITECTURE.md` 执行。
- 不新增独立 Series / 系列 metadata 层；连续内容需要归组时直接使用 Book。
- 不在页面组件里各自发明 Tag 过滤逻辑；站点 Tag canonicalization 集中在 `src/content/tag-taxonomy.ts` 维护。
- 不人工维护 `modifiedAt`；修改时间必须来自实际正文 Git 历史，不得使用文件 mtime 代替。
- 不把当前仓库的首次提交时间机械当成旧文章的原始发布时间；历史发布时间按 `docs/CONTENT_ARCHITECTURE.md` 的精度和证据规则处理。

## 3. 博客内容改动规范

当任务涉及 `src/pages/blogs/` 下 Markdown 文章时，必须遵守：

1. 先读取 `docs/AUTHORSHIP.md`；涉及 Tag、Book、书架、归档、内容时间、URL 或 SEO 时同时读取 `docs/CONTENT_ARCHITECTURE.md`。
2. 文件路径必须符合该内容体系的真实归属，不得仅因历史路径存在就继续沿用错误目录。
3. `slug` 仅使用小写英文、数字、连字符。
4. frontmatter 至少包含：
   - `title`
   - `description`
   - `group`
   - `order`
   - `date`（格式：`YYYY年M月D日`，作为现有兼容的作者声明发布日期）
   - `readTime`（格式：`N 分钟阅读`）
5. 如果明确知道需要覆盖的发布时间，可以增加 `publishedAt`；日期时间必须包含明确时区。不要为了补齐格式伪造时分秒。
6. 不新增或人工维护 frontmatter `modifiedAt`；修改时间由构建期 Git 历史统一派生。
7. 涉及作者的 frontmatter 必须与 `docs/AUTHORSHIP.md` 一致。
8. 正文第一个标题必须是与 `title` 完全一致的 H1。
9. 不得为新增文章手工改 React 路由或导航配置，除非当前内容体系明确需要或任务要求。
10. 若历史分类、路径或 metadata 与署名原则冲突，不得以“沿用现状”为理由保留错误归属。
11. 普通博客文章收入 Book 时，默认只增加逻辑关系，不复制正文、不换 URL、不改变 canonical；只有明确的历史归属纠正或专项迁移任务可以另行处理。
12. Tag 只表达文章主题，不用来替代 Group 或 Book；Tag 是全站共享词表，创建新 Tag 前优先复用已有 canonical 词，不把当前 `group` 再写进 `tags`，也不继续新增已被 canonical 规则替代的旧别名。

## 4. 构建与验收要求

### 4.1 内容或页面改动后的最小校验

至少执行：

```bash
npm run verify:mira-docs
npm run build
```

### 4.2 涉及 GitHub Pages 输出时

额外执行：

```bash
npm run build:github-pages
npm run verify:static-output
```

### 4.3 涉及署名、迁移、内容时间或 SEO 时

除构建校验外，还必须检查：

- 物理目录；
- 页面分类 / 导航；
- URL；
- canonical；
- 可见作者顺序；
- `writtenBy` / `reviewedBy` / `writingMode`；
- 可见的“发布于 / 更新于”是否来自统一时间结果；
- JSON-LD `datePublished` / `dateModified`；
- sitemap 若输出 `lastmod`，是否与 `modifiedAt` 同源；
- SEO 与 JSON-LD 作者；
- sitemap / 首页 / 书架等索引输出；
- 是否意外生成同一正文的第二个可索引 URL。

### 4.4 内容时间实现的额外要求

如果任务实现或修改 Git 派生时间：

- 构建期统一生成，不允许浏览器逐页请求 GitHub API；
- 生产构建和负责验证时间的 CI 必须能访问足够完整的 Git 历史；GitHub Actions checkout 应显式避免浅历史，例如使用 `fetch-depth: 0`；
- 文件改名 / 移动时应尽可能跟随历史，而不是把迁移提交当作首次发布；
- 旧文章有更早人工 `date` 而 Git 只看到后来的迁站 / mirror 提交时，应保留人工日期，不伪造精确时间；
- 本地缺少 `.git` 时可以降级，但生产环境不得静默使用文件 mtime 冒充 Git 时间。

### 4.5 失败处理

- 先修复由本次改动引入的问题。
- 不用关闭校验、绕过脚本、删除断言来“假通过”。

## 5. 禁止事项

- 未经要求修改 `.github/workflows/`。
- 未经要求修改 `vite.config.ts` 中的路由、base、静态化与 SEO 守卫逻辑。
- 将计划中的功能描述为已上线事实。
- 在一次任务里混入无关视觉大改或目录迁移。
- 未读 `docs/AUTHORSHIP.md` 就修改作者、栏目、书架、作品、内容路径或 SEO。
- 未读 `docs/CONTENT_ARCHITECTURE.md` 就实施 Tag 体系调整、Book / 书架归档、内容时间、URL 迁移或 canonical 调整。
- 自行新增独立 Series 层、series metadata 或 `/series/...` 内容体系。
- 人工写入或维护 `modifiedAt`，或把文件 mtime / 构建时间当成文章修改时间。
- 把迁站、mirror、重构时的首次仓库提交无条件当作历史文章发布时间。
- 因 Mira 实际成文、润色或工具执行量较大，就擅自改变 Tomz 指定的公开署名。
- 因文章被收入书架，就默认复制正文、移动文件、删除原博客 URL 或生成第二套正文 URL。

## 6. 推荐工作流

1. 读取 `docs/AUTHORSHIP.md`（涉及内容归属时为强制步骤）。
2. 涉及 Tag、Book、书架、归档、内容时间、URL 或 SEO 时读取 `docs/CONTENT_ARCHITECTURE.md`。
3. 读取任务相关文件与相邻实现。
4. 用最小改动实现需求。
5. 运行对应校验脚本。
6. 汇报改动文件、校验命令、结果与风险点。

---

如一般工程说明与仓库实时实现冲突，以当前代码与 CI 校验为准；**如作者、署名、作品归属规则发生冲突，以 `docs/AUTHORSHIP.md` 为准；如 Group、Tag、Book、内容时间、逻辑归档、URL 与 SEO 组织规则发生冲突，以 `docs/CONTENT_ARCHITECTURE.md` 为准。**