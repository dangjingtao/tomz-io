# tomz-io

Tomz Dang 的个人主站。

## 开发 / Agent 必读

在修改本站的内容文章、作者署名、书架、项目、作品、内容目录、Tag、URL、SEO 或结构化数据前，**必须先阅读**：

1. [`docs/AUTHORSHIP.md`](docs/AUTHORSHIP.md) — Tomz.io 署名、归属与内容目录原则；
2. [`docs/CONTENT_ARCHITECTURE.md`](docs/CONTENT_ARCHITECTURE.md) — Group、Tag、Book、逻辑归档、URL 与 SEO 的内容架构原则；
3. [`AGENTS.md`](AGENTS.md) — 本仓库 Agent 行为与执行规范。

尤其不得仅根据旧 frontmatter、旧目录位置、历史 Skill 或“谁实际成文更多”自行推断作者关系。作者与内容归属以 `docs/AUTHORSHIP.md` 为准；连续文章需要归类时直接使用 Book，不新增独立 Series 层；Book / 书架收录不得默认触发物理迁移，相关规则以 `docs/CONTENT_ARCHITECTURE.md` 为准。

## 当前状态

主站内容由项目、博客、书架 / 阅读内容与作品等模块构成，使用 MiraDocs 内容体系生成页面与静态输出。

## 技术栈

- Vite
- React
- TypeScript
- MiraDocs

## 内容入口

```text
src/pages/
├── blogs/
├── books/
├── projects/
└── works/
```

内容归属不能只看物理目录；任何新增、迁移或署名调整必须同时遵守 [`docs/AUTHORSHIP.md`](docs/AUTHORSHIP.md) 与 [`docs/CONTENT_ARCHITECTURE.md`](docs/CONTENT_ARCHITECTURE.md)，并检查页面分类、URL、作者 metadata 与 SEO / JSON-LD 是否一致。

## 常用命令

```bash
npm run dev
npm run verify:mira-docs
npm run build
npm run build:github-pages
npm run verify:static-output
```

具体执行约束见 [`AGENTS.md`](AGENTS.md)。
