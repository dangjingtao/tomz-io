# tomz-io

Tomz Dang 的个人主站（静态页面）。

## 当前状态

项目目前是一个极简落地页，包含：

- 页面标题：Tomz Dang
- 页面文案：个人主站正在搭建。

适合作为后续主页开发的起点。

## 技术栈

- HTML5
- 无框架、无构建工具

## 项目结构

```text
.
├── index.html
└── README.MD
```

## 快速开始

1. 克隆仓库并进入目录。
2. 直接双击打开 `index.html`，或使用本地服务启动。

本地服务方式：

```bash
python3 -m http.server 8080
```

浏览器访问：

```text
http://localhost:8080
```

## 开发建议

- 将样式拆分到 `styles.css`，避免 HTML 内联样式膨胀。
- 将交互逻辑拆分到 `main.js`，便于后续功能扩展。
- 为导航、作品、关于等模块预留语义化结构。

## 可选发布

- GitHub Pages（最省心的静态托管方案）
- Vercel / Netlify（便于后续接入构建流程）

## 计划路线（建议）

1. 完成视觉样式（排版、颜色、间距体系）
2. 增加核心模块（个人介绍、项目列表、联系方式）
3. 补充 SEO 基础信息（`meta description`、Open Graph）
