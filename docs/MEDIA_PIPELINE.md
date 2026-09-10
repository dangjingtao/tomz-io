# Tomz.io 媒体发布链

## 目标

Tomz.io 的正文与媒体保持两种职责：

- GitHub 是内容与代码的事实源；
- Cloudflare R2 是生产媒体的正式承载；
- Cloudflare Pages 负责生产页面；
- GitHub Pages 预览永远使用仓库里的本地图片 / base64，不依赖 R2。

这套通用媒体链只处理 `src/pages/**/*.md` 中的正文媒体。`scripts/comic-pipeline/` 仍是《余光》等作品的专用发行链，不在这里抽象或替换。

## 生产流程

生产 workflow 只允许 `main` 执行媒体发布：

```text
main checkout
→ media:prepare
→ media:publish -- --confirm
→ media:apply
→ pnpm run build
→ Cloudflare Pages deploy
```

`media:prepare` 不改源码，只在 `.mira-cache/media-r2/` 生成待上传对象、manifest 和引用替换计划。`media:publish` 完成 R2 上传与远端校验后，`media:apply` 才在 CI 临时工作区把本地引用换成 `R2_PUBLIC_BASE_URL` 下的正式 URL。Git 中的 Markdown 不会因此被改写。

PR / GitHub Pages 只运行离线测试与扫描，不运行 `media:publish`、不运行 `media:apply`，因此不会写 R2，也不会把预览站绑到生产媒体。

## 可自动迁移的资源

当前只识别 Markdown/frontmatter 中：

- `cover:` / `image:`；
- Markdown `![alt](...)`；
- HTML `<img src="...">`。

可处理：

- repo 内可解析的 `.png` / `.jpg` / `.jpeg` / `.webp`；
- `data:image/png;base64,...`；
- `data:image/jpeg;base64,...`；
- `data:image/webp;base64,...`。

明确跳过：

- 已有 `http://` / `https://` 外链；
- `data:image/svg+xml`；
- `blob:`；
- 无法识别或无法解析的资源。

跳过项不会被删除或替换；扫描器会对无法解析的本地资源给出 warning。

## 图片质量策略

- 已有 WebP：保持原始字节，尤其 base64 WebP 不做二次有损编码；
- 封面 JPG / PNG：WebP 目标质量 92；
- 普通 JPG：WebP 目标质量 90；
- 非透明 PNG：优先 near-lossless WebP 95；
- 透明 PNG：优先 lossless WebP；
- 如果转换后体积收益不足 5%，且图片不属于超大尺寸，保留原格式与原字节；
- 默认不缩图；长边超过 `MEDIA_MAX_LONG_EDGE` 才限制尺寸，默认 5120px；
- SVG 不进入这条 raster pipeline，继续保持 SVG。

## R2 路径

通用媒体使用稳定的语义目录，不依赖 Vite hash：

```text
tomz-io/jianpi/001/cover.webp
tomz-io/blogs/<group>/<slug>/<asset>.webp
tomz-io/projects/<slug>/<asset>.webp
```

见π使用 frontmatter `issue` 生成三位期号目录。base64 正文图没有文件名时使用内容摘要，例如 `inline-<sha12>.webp`；这样正文移动位置不会无意义地改对象名。

生产公开基址来自 `R2_PUBLIC_BASE_URL`；当前站点已使用 `https://assets.tomz.io`。

## GitHub Actions 凭据

沿用 Mira 组织现有 R2 secret 命名：

```text
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_ACCOUNT_ID
R2_BUCKET
R2_PUBLIC_BASE_URL
```

workflow 将前两项映射成 AWS S3 兼容环境变量。上传对象写入 SHA-256 metadata；远端存在同摘要、同大小对象时跳过上传，上传后再次 `head-object` 校验。正式对象使用短缓存：`public, max-age=300, must-revalidate`，避免稳定 URL 更新后长期卡旧图。

## 不做的事

这条 pipeline 不负责：

- 把第三方外链抓回 R2；
- 重编码已有 WebP 来追求几 KB；
- 处理 SVG 内嵌 raster；
- 改写生产内容的 canonical / URL；
- 删除 R2 历史对象；
- 替代连环画独立的 staging / manifest 发行协议。
