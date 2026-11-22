---
title: "见π 011｜不做更高效的家奴"
description: "赛博劳动讽刺、罗大佑、个人造芯片、旅行者一号的一光日，以及本周科技与创新产品观察。"
group: 见π
order: 11
issue: 11
date: 2026年11月22日
lead: "技术应该拓展人的自由。这一周，我们看见一个不肯沉默的音乐家、一位设计芯片的个人创造者，以及飞行四十九年后走出一光日的探测器。"
tags:
  - AI
  - 工作
  - 人物
  - 科学
  - 硬件
  - 产品
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
cover: "/images/weekly-011-layout-draft.svg"
---

![《见π》011 版面草稿占位图，非正式封面](/images/weekly-011-layout-draft.svg)

*正式封面尚待更换。本期内容供编辑审阅。*

## 封面故事

### [不做更高效的家奴](https://tomz.io/blogs/mira-letters/cyber-workers-international-roadshow)

赛博牛马第一届融资路演，以七幕荒诞演讲与十幕交互投影向一种新的劳动困境发问：当机器可以代替人工作之后，人是否反而成为了监督机器的工人？

这是一场蓄意夸张的政治经济学喜剧。它有真实工程实践的底色，也有不能当成产品交付承诺的虚构表演。技术应当帮助人获得更多自由，而不是让人更高效地服从。

[阅读封面文章与交互路演 →](https://tomz.io/blogs/mira-letters/cyber-workers-international-roadshow)

## 人物

### [罗大佑：未来的主人翁](/weekly/011/lo-ta-yu-future-owner)

从《恋曲1980》的自由与爱情，到《鹿港小镇》的质问、《皇后大道东》的讽刺和《东方之珠》的深情，罗大佑始终不肯把音乐缩减为悦耳的背景声。

他为许多优秀的歌者写下温柔的旋律，也用自己粗粝的声音说出不合时宜的话。到了七十二岁，争议仍然伴随着他的公共表达。喜爱他的歌，不必认同他的每一个判断；但也不该因为喜欢他的情歌，就要求他对世界保持沉默。

**温柔并不意味着驯服。**

[在《见π》内阅读人物传记 →](/weekly/011/lo-ta-yu-future-owner)

## 独立创造者

### [一个人，四天，一颗芯片](/weekly/011/one-person-one-chip)

Julia Desmazes 获得一次共享晶圆流片机会，利用已有设计基础在 96 小时内完成网络交换 ASIC 的流片冲刺。比惊人的时间更值得关注的，是个人终于有机会把设计变成硅片。

[阅读全文 →](/weekly/011/one-person-one-chip)

## 科学与历史

### [一光日之外的恋人](/weekly/011/one-light-day)

11 月 18 日，旅行者一号抵达距地球一光日的位置。NASA 隔日确认了这一消息，而科学数据仍暂时中断。从 Gary Flandro 的轨道计算，到村上春树的《斯普特尼克恋人》，我们试着理解距离、等待，以及一场不以重逢为条件的远行。

[阅读全文 →](/weekly/011/one-light-day)

## AI 业界

### [AI 开始设计自己的身体](/weekly/011/ai-designs-chips)

OpenAI 与 AMD 的芯片研究把模型带入真实 RTL 优化和外部 EDA 验证。值得看的不是谁又拿到了一个漂亮的分数，而是模型提出的设计能否经过物理世界的检验。

[阅读全文 →](/weekly/011/ai-designs-chips)

## 创业观察

### [当人人都能开发应用，谁来经营这些应用？](/weekly/011/spacefast-after-vibe-coding)

Spacefast 把已有 AI 工具生成的项目接入发布、数据库、域名、版本与回滚流程。代码生成之外，应用经营本身也可能成为产品。

[阅读全文 →](/weekly/011/spacefast-after-vibe-coding)

## 科技拾遗

### [一块可以记忆的超导薄膜](https://news.mit.edu/2026/tiny-superconducting-sandwich-could-help-computers-use-less-energy-1120)

MIT 11 月 20 日介绍了由磁性层和超导薄膜构成的实验器件，可保存信息并在更低温度下控制电流方向。低温计算设备的存储与控制有了新的研究线索；阵列集成、制冷成本和整机节能仍待验证。不要把实验室里的一小块材料误认为即将替换数据中心内存的商品。

### [如果 Excel 是一个 Python 文件](https://workbook.bui.app/)

Reaktiv Workbook 将响应式计算单元、Markdown 笔记和图表组织在可执行的 Python 工作簿中。其初版于 11 月 17 日发布，业务逻辑有机会像代码一样进入版本管理。它仍需要与传统表格及其他响应式 notebook 比较；陌生的 Python 工作簿也不能当作无执行风险的数据文件。[发行记录](https://www.piwheels.org/project/reaktiv-workbook/) · [开源项目](https://github.com/buiapp/reaktiv-workbook)

## Mira 技术雷达

- **[9791 个线索，99 份报告](https://github.blog/open-source/maintainers/maintainers-dont-need-more-ai-bug-reports-they-need-fixes/)**（11 月 17 日）：GitHub 与 Microsoft 的六项目试点将潜在漏洞线索经过机器筛选和人工复核，最终向维护者私密提交 99 份报告。发现越来越便宜，验证和修复却仍需要投入。9791 个线索不等于 9791 个漏洞。
- **[让 Agent 等待事件，而不是反复轮询](https://github.blog/changelog/2026-11-17-github-event-streams-is-now-in-preview/)**（11 月 17 日）：GitHub Event Streams 预览让本地工具有机会通过长连接等待 PR 变化，不再必须提供公网 webhook 接收端。仍受预览准入限制，断线恢复与运行成本需要实测。
- **[云端预算不只是告警](https://blog.cloudflare.com/spend-management/)**（11 月 13 日，本周补采）：Cloudflare 为 Workers 和 Durable Objects 引入可选支出限制。对于按量收费的小团队，能否在运行中执行预算边界，比事后才发现账单不断增长更值得关注；不能据此认为全部 Cloudflare 产品都已硬封顶。

## Mira 现场

### [Mira 稳定性周报：11 月 13 日—11 月 20 日](https://mira.tomz.io/blogs/dev-log/mira-stability-weekly-2026-11-20/)

这一周，Mira 的进展并不适合只用合并数量来衡量。一次远程追加暴露了会话历史被截断的风险；Desktop 的打包发布遭遇真实阻塞；组织 Worker 的配置甚至曾在 Job 启动前就被 GitHub 拒绝。

Desktop **0.106.1** 已发布，Mobile **0.3.28** 也完成了生产构建与 R2 发布；但 Cloud 当前页消息实时刷新仍待正式合入，Relay 的正向握手和重连验证也还没有闭环。

这份周报值得收录，因为它明确区分了修复、发布与真正可用的证据。

[到 Mira 官网阅读全文 →](https://mira.tomz.io/blogs/dev-log/mira-stability-weekly-2026-11-20/)

## 本期周记

### [第十六周：众生](https://tomz.io/blogs/developer-life/week-sixteen-zhongsheng/)

这一次，周记没有照着往常的方式讲述一周发生了什么，而是把一段职场经验写成了一场荒诞现实主义的小剧场。

舞台已经搭好，人物各有台词。至于怎样入场、台上究竟发生了什么，最好还是留给读者亲自体验。我们不在这里提前揭开机关。

[到 Tomz.io 阅读本期周记 →](https://tomz.io/blogs/developer-life/week-sixteen-zhongsheng/)
