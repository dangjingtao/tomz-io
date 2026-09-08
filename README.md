# 见π Radar 素材库

这个分支只保存《见π》的编辑采集材料，不参与 Tomz.io 构建，也不允许合并到 `main`。

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

- `YYYY-MM-DD.yml`：每日雷达采集结果。
- `discussion.yml`：Tomz 与 Mira 在聊天中讨论出的、值得进入候选池的材料。
- `shortlist.yml`：每周编辑汇总、趋势判断与建议入选项。

## 候选字段

```yaml
- title:
  url:
  source:
  radar:
  topic:
  discoveredAt:
  origin: radar | discussion
  note:
  status: candidate | selected | hold | skip
```

## 编辑规则

1. Radar 可以搜索、去重、聚类、摘要和形成候选，但不能自动发布。
2. 每日采集优先保存高信号项目、产品、论文、讨论与“鬼集”候选，不为数量凑数。
3. 周一额外回看最近 7 天，生成或更新 `shortlist.yml`。
4. Tomz 与 Mira 在日常聊天中讨论出值得保留的新判断、项目或怪东西时，允许直接回传当前周的 `discussion.yml`。
5. 正式《见π》内容必须经过 Tomz 编辑判断后，另行进入网站正式内容流程。
6. 此分支永远不作为生产代码来源，不反向覆盖 `main`。
