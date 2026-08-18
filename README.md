# tomz.io

Tomz Dang 的个人主站 / 作者主页 / 数字住所。

## 技术栈

React + TypeScript + Vite，内容与静态站点基础能力由 `@uichat-mira/docs` 提供。

边界：

- MiraDocs：Markdown 发现、frontmatter 解析、排序、roots、热更新、静态路由与 SEO 输出；
- tomz.io adapter：作者关系、栏目展示语义和 Tomz 站点品牌；
- React 页面：作者主页、导航、项目入口和视觉呈现。

Markdown 根目录为 `src/content/markdown`。BR002 不迁移历史博客正文。

## 开发

```bash
npm install
npm run dev
npm run build
npm run verify:static-output
```

GitHub Pages base 兼容检查：

```bash
npm run build:github-pages
npm run verify:static-output -- --base=/tomz-io/
```
