# AGENT 行为规范（tomz-io）

本文件用于约束在本仓库执行任务的 AI Agent 行为，目标是：

- 保持内容与路由稳定
- 不破坏 BR003A / BR003B 的构建与预览流程
- 让改动可验证、可回滚、可追溯

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

## 3. 博客内容改动规范

当任务涉及 `src/pages/blogs/` 下 Markdown 文章时，必须遵守：

1. 文件路径必须是：`src/pages/blogs/<category>/<slug>.md`。
2. `slug` 仅使用小写英文、数字、连字符。
3. frontmatter 至少包含：
   - `title`
   - `description`
   - `group`
   - `order`
   - `date`（格式：`YYYY年M月D日`）
   - `readTime`（格式：`N 分钟阅读`）
4. 正文第一个标题必须是与 `title` 完全一致的 H1。
5. 不得为新增文章手工改 React 路由或导航配置。
6. 若分类已存在，优先继承该分类现有 `group` 约定。

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

### 4.3 失败处理

- 先修复由本次改动引入的问题。
- 不用关闭校验、绕过脚本、删除断言来“假通过”。

## 5. 禁止事项

- 未经要求修改 `.github/workflows/`。
- 未经要求修改 `vite.config.ts` 中的路由、base、静态化与 SEO 守卫逻辑。
- 将计划中的功能描述为已上线事实。
- 在一次任务里混入无关视觉大改或目录迁移。

## 6. 推荐工作流

1. 读取任务相关文件与相邻实现。
2. 用最小改动实现需求。
3. 运行对应校验脚本。
4. 汇报改动文件、校验命令、结果与风险点。

---

如本文件与仓库实时实现冲突，以当前代码与 CI 校验为准，并同步更新本文件。