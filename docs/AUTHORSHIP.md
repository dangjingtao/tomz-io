# Tomz.io 署名、归属与内容目录原则

> 本文是 tomz.io 关于作者署名、内容归属、物理目录与机器元数据的正式原则。
>
> 对内容文章、书架、项目、作品、SEO、结构化数据或相关路由做任何新增、迁移、修改前，必须先阅读本文。

## 1. 总原则

1. **公开作者关系由 Tomz 明确指定的规则决定。** 不得根据谁实际敲字更多、谁负责整理、谁调用工具、谁完成 Markdown 等实现过程，擅自改变公开署名。
2. **物理目录、公开 URL、页面分类与作者关系不得暗示另一套归属。** 页面显示、仓库路径、SEO 和结构化数据必须保持语义一致。
3. **Mira 可以保留 tomz.io 上现有的公开身份。** 但 Mira 的公开身份不等于可以自动取得任何内容的作者身份或优先署名。
4. 不存在“AI 参与过就必须署名 Mira”的规则；也不存在“由 Mira 成文就自动归 Mira”的规则。按下文栏目/作品规则执行。

## 2. 各内容体系的公开署名

### 2.1 开发者生活

- 公开作者只能是 **Tomz**。
- 即使 Mira 参与讨论、整理、润色或成文，也不得将 Mira 加入公开作者。

标准：

```yaml
author:
  - tomz
writtenBy: tomz
```

### 2.2 Mira 来信

- 公开作者只能是 **Mira**。
- `mira-letters` 目录只允许存放真正属于「Mira 来信」的内容，不得作为其他共同创作的隐性归属目录。

标准：

```yaml
author:
  - mira
writtenBy: mira
```

### 2.3 共同思考

- 共同署名时必须是 **Tomz × Mira**。
- **Tomz 排在第一位。**

标准：

```yaml
author:
  - tomz
  - mira
writtenBy: tomz | mira
```

### 2.4 读经札记

- 可以是 Tomz 与 Mira 一起读、一起形成文章。
- 有 Mira 共同参与并构成共同创作时：**Tomz × Mira**，Tomz 必须是第一作者。
- 没有 Mira 共同参与时：只署 **Tomz**。

共同署名标准：

```yaml
author:
  - tomz
  - mira
writtenBy: tomz | mira
```

Tomz 单独署名标准：

```yaml
author:
  - tomz
writtenBy: tomz
```

### 2.5 《一起学智能体》

- 共同署名时必须是 **Mira × Tomz**。
- **Mira 排在第一位。**

标准：

```yaml
author:
  - mira
  - tomz
writtenBy: mira | tomz
```

### 2.6 项目页

- 项目页公开作者必须是 **Tomz**。
- Mira 参与项目讨论、文案、整理、开发协作，不改变项目页作者归属。

标准：

```yaml
author:
  - tomz
writtenBy: tomz
```

### 2.7 连环画 / Works

- 连环画保持独立 `works` 体系，**不归入书架**。
- 有共同署名时 **Tomz 必须是第一作者**。
- 例如《余光·上：第一次讲话》保持 **Tomz × Mira**。

标准：

```yaml
author:
  - tomz
  - mira
writtenBy: tomz | mira
```

## 3. 《谎颜》

以下四篇共同创作统一归入书架中的同一本书：**《谎颜》**。

- `Witness`
- `After June`
- `Between Glances`
- `Peripheral Glance`

署名统一为：**Tomz × Mira**，Tomz 在前。

这四篇：

- 不属于 Mira 来信；
- 不得继续位于 `mira-letters` 物理目录；
- URL 不得继续包含 `mira-letters`；
- 应进入《谎颜》对应的书架 / book 物理目录和公开路径；
- 页面、SEO、结构化数据均按 **Tomz × Mira** 输出。

## 4. 「创作」分类取消

「创作」不再是 tomz.io 的内容分类。

不得新增或保留：

- `创作` 页面分类；
- 对应物理目录；
- 对应 URL 层级；
- 导航项；
- SEO / 结构化数据中的该分类语义。

原先四篇创作按第 3 节统一归入书架《谎颜》。

## 5. 《免责》

《免责》已从站点、索引与 SEO 中删除，不得恢复。

它不应被迁移成《谎颜》章节，也不应继续作为「创作」或「Mira 来信」内容存在。

## 6. 元数据优先级

### `author`

- 表示页面对外显示的作者及顺序。
- 必须符合本文的公开署名规则。

### `writtenBy`

- **必须以本文规定的公开署名标准为准。**
- 它不是“谁实际输入了最多文字”的统计字段。
- 对共同署名内容，应完整表达双方及顺序，例如 `tomz | mira` 或 `mira | tomz`。

### `reviewedBy` 与 `writingMode`

- 以真实协作事实为依据填写。
- 它们可以描述审阅关系和具体协作方式，但不得反向改变公开作者归属。

### 冲突处理

当 `writtenBy`、`reviewedBy`、`writingMode` 的语义发生冲突时：

**以 `writtenBy` 为准。**

同时应修正冲突字段，不能长期保留互相矛盾的作者信息。

## 7. 路径与 SEO 一致性

任何内容迁移或新增都必须同时检查：

- 物理文件目录；
- 页面 `group` / 导航归属；
- 公开 URL；
- 页面可见作者；
- `writtenBy` / `reviewedBy` / `writingMode`；
- `<meta>` / Open Graph；
- JSON-LD / Article author；
- sitemap、首页索引、书架索引等生成结果。

不得出现“页面上看起来归 A，但 URL、目录或机器数据把它归 B”的情况。

## 8. 执行要求

涉及作者、栏目、书架、作品、内容迁移或 SEO 的任务：

1. 先读本文；
2. 再读取目标内容与相邻内容的当前实现；
3. 按本文决定公开归属，不自行推断作者关系；
4. 若出现本文未覆盖的新内容类型，**不要类推署名规则**，由 Tomz 明确决定后再落库；
5. 修改后检查页面、物理目录、URL 与机器元数据是否一致。

---

本文优先约束 tomz.io 的作者与内容归属。任何旧文章 frontmatter、旧目录结构、历史 Skill 或 Agent 说明若与本文冲突，均应以本文为准并逐步修正。