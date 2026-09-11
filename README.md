# 见π Radar 素材库

这个分支只保存《见π》的编辑采集材料，不参与 Tomz.io 构建，也不允许合并到 `main`。

编辑定位、读者对象、写作原则与正式成刊规则见 [`EDITORIAL_PRD.md`](./EDITORIAL_PRD.md)。本文件只负责定义素材库与采集协议。

## 固定位置

- Repository: `dangjingtao/tomz-io`
- Branch: `editorial/jianpi-radar`

## 目录约定

```text
YYYY/
└── Wxx/
    ├── YYYY-MM-DD.yml
    ├── discussion.yml
    └── shortlist.yml
```

- `YYYY-MM-DD.yml`：每日 Radar 采集结果，以及当日进入候选池的现场材料。
- `discussion.yml`：Tomz 与 Mira 在聊天中讨论出的、值得进入候选池的材料。
- `shortlist.yml`：每周编辑汇总、趋势判断与建议入选项。

## 素材来源

《见π》允许同时从外部世界和真实现场收集材料：

1. **公开 Radar**：技术、产品、开源、研究、科学、硬件、设计、Web、开发工具、中国开发者现场，以及“鬼集”等异常但值得多看一眼的东西。不要让 AI / Agent 自动占满视野。
2. **Mira Agent Radar**：适合从专业 Agent 工程语境继续翻译给更广泛技术读者的信号与判断。
3. **Mira 稳定性周报**：Mira 自己真实发生的失败、回归、治理、测试、发布、跨端合同、Review、Control Room 等工程现场。
4. **Tomz 工作周报**：产品、协作、硬件、设计系统、测试、需求管理与 AI 落地等工作现场。默认视为私密材料，只允许脱敏后提炼普遍问题，不得把公司或人员可识别信息原样带入候选池。
5. **Tomz × Mira 讨论**：双方在日常讨论里形成的新判断、关联、反例、怪东西与尚未成熟但值得保留的想法。

## 候选字段

```yaml
- title:
  url:
  source:
  radar:
  topic:
  discoveredAt:
  origin: radar | discussion | field-note
  note:
  status: candidate | selected | hold | skip
```

`origin` 语义：

- `radar`：公开 Web Radar 或其他 Radar 来源。
- `discussion`：Tomz × Mira 的讨论材料。
- `field-note`：Mira 稳定性周报、Tomz 工作周报及其他真实工程 / 工作现场。

对于没有公开 URL 的 `field-note`，`url` 可以为空，但 `source` 与 `note` 必须说明素材来自哪类现场以及公开使用时需要怎样脱敏。

## 编辑规则

1. Radar 可以搜索、去重、聚类、摘要和形成候选，但不能自动发布正式《见π》。
2. 每日采集优先保存高信号项目、产品、论文、讨论、现场经验与“鬼集”候选，不为数量凑数。
3. 主动扩大观察面。AI / Agent 是重要来源，但不是整本《见π》的唯一世界。
4. 周一额外回看最近 7 天，生成或更新 `shortlist.yml`。Shortlist 要保留异质性，不因某一主题信号密集就强行把整期做成单一专题。
5. Tomz 与 Mira 在日常聊天中讨论出值得保留的新判断、项目或怪东西时，允许直接回传当前周的 `discussion.yml`。
6. `field-note` 不是内部周报转载。只有能够抽象成普遍问题、经验或反例的内容才进入候选池；工作材料必须先脱敏。
7. Radar 可以发现关联，但不能替 Tomz 与 Mira 完成最终编辑判断。候选之间是否构成一期主题、哪条值得展开成主文，由正式编辑阶段决定。
8. 正式《见π》内容必须经过 Tomz 编辑判断后，另行进入网站正式内容流程。
9. 此分支永远不作为生产代码来源，不反向覆盖 `main`。
