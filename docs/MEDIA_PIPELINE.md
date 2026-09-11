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

`media:prepare` 不改源码，只在 `.mira-cache/media-r2/` 生成待上传对象、manifest 和引用替换计划。`media:publish` 先检查内容哈希对象是否已存在，只上传缺失对象；成功后 `media:apply` 才在 CI 临时工作区把本地引用换成 `https://assets.tomz.io` 下的正式 URL。Git 中的 Markdown 不会因此被改写。

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

## R2 内容寻址

通用媒体不再使用会被覆盖的语义对象名，也不按 commit 复制整套资源。优化后的最终字节以 SHA-256 内容寻址：

```text
tomz-io/media/8f/8f...<完整 sha256>.webp
tomz-io/media/a3/a3...<完整 sha256>.jpg
```

因此：

- 相同最终字节在整个站点只保存一个对象；
- 普通文字 push 不产生新媒体对象；
- 多个 production run 即使先后交错，也不会用不同内容覆盖同一个 R2 key；
- 图片真正变化时才产生新对象；
- 内容哈希 URL 可以安全使用 `Cache-Control: public, max-age=31536000, immutable`。

当前公开基址固定为 `https://assets.tomz.io`。历史未引用对象暂不在正常发布链里自动删除；后续 GC 只能针对 `tomz-io/media/`，并应带宽限期，避免误删仍被已发布页面引用的对象。

## GitHub Actions 凭据

媒体上传改为 Wrangler 直接访问 R2，不再需要 AWS/S3 风格的 `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`。

敏感凭据只有现有的：

```text
CLOUDFLARE_API_TOKEN
```

同时使用现有 `CLOUDFLARE_ACCOUNT_ID` 作为账号标识。`R2_BUCKET` 只是非敏感配置，优先放 GitHub Actions Variable；为兼容旧配置，workflow 也接受同名 Secret。`R2_PUBLIC_BASE_URL` 不再需要 Secret，站点默认使用 `https://assets.tomz.io`。

生产上传会先对内容哈希 URL 做 HTTP HEAD；对象存在且大小一致就跳过。缺失对象通过 Wrangler `r2 object put --remote` 上传，随后从公开域再次 HEAD 校验。Wrangler 只执行单对象操作，符合这条增量媒体链的用途。

## 不做的事

这条 pipeline 不负责：

- 把第三方外链抓回 R2；
- 重编码已有 WebP 来追求几 KB；
- 处理 SVG 内嵌 raster；
- 改写 Git 中生产内容的 canonical / URL；
- 在发布过程中激进删除 R2 历史对象；
- 替代连环画独立的 staging / manifest 发行协议。
