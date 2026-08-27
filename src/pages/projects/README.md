# 项目内容约定

项目内容由目录和 Markdown Frontmatter 自动生成路由、导航与静态页面，不维护项目清单，也不需要修改 React 代码。

```text
projects/
└── project-id/
    ├── index.md
    └── article-id/
        └── index.md
```

- `projects/<project-id>/index.md` 是项目概览，URL 为 `/projects/<project-id>`。
- `projects/<project-id>/<article-id>/index.md` 是该项目的一篇文章，URL 为 `/projects/<project-id>/<article-id>`。
- 每篇文章独占一个目录，并在该目录的 `index.md` Frontmatter 中维护自己的标题、描述、排序和署名。
- 项目归属由路径中的 `<project-id>` 决定，不添加 `project` 字段。
- 新增项目文章时，只创建文章目录和 `index.md`；导航、项目聚合及上一篇/下一篇会自动更新。

项目页署名统一遵守 [`docs/AUTHORSHIP.md`](../../../docs/AUTHORSHIP.md)。
