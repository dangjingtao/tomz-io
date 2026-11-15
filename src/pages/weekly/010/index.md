---
title: "见π 010｜效率的暗面"
description: "《见π》第 010 期。封面讨论 AI 编程的效率、理解与疲劳，另有可控的算法设计、布模混凝土、引力波与行星、包豪斯摄影师和复活的老电脑。"
group: 见π
order: 10
issue: 10
date: 2026年11月15日
lead: "写代码的速度越来越快。可理解、审查和作决定的时间，从来没有因为多开几个 Agent 就一起增加。"
tags:
  - AI
  - Agent
  - 软件工程
  - 科学
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

## 封面文章

### [效率的暗面](/weekly/010/the-dark-side-of-efficiency)

Reddit 上有人说，公司全面推行 AI 编程一年后，代码越来越多，懂它的人却越来越少。另一位开发者借用奈奎斯特定理，讨论代码变化与人的理解速度；Constantin Gonzalez 则发现，自己同时指挥几个 Agent，五小时下来竟疲惫不堪。

这三个故事并不完全相同，却都提醒我们：代码生成得快，不代表审查、理解和决策也可以省略。

[阅读封面文章 →](/weekly/010/the-dark-side-of-efficiency)

## 延伸阅读

### [软件开发也有奈奎斯特极限？](/weekly/010/nyquist-limit-reading)

Ryan Prior 借信号采样定理发问：当代码变化得比人看得快，团队还能掌握多少系统细节？这是一个有用的比喻，不是软件审查频率的数学公式。

[读中文导读](/weekly/010/nyquist-limit-reading) · [英文原文](https://www.ryanprior.com/posts/nyquist-limit-frequency-of-changes-in-tech-invalidates-understanding/)

### [强制用 AI 编程一年后，没人理解代码了？](/weekly/010/ai-mandate-reddit-reading)

一篇匿名 Reddit 帖子讲述团队的技术债和审查困境，评论区也有不同意见。故事未经独立核实，但讨论值得一读。

[读中文导读](/weekly/010/ai-mandate-reddit-reading) · [原帖与讨论](https://www.reddit.com/r/ClaudeCode/comments/1xq2n3t/a_year_after_the_100_ai_mandate_nobody/)

### [为什么与 AI Agent 共事反而更累？](/weekly/010/agent-fatigue-reading)

Constantin Gonzalez 把同时管理几个 Agent 比作餐厅主厨：执行工作分出去了，判断和协调仍留在人身上。

[读中文译介与评论](/weekly/010/agent-fatigue-reading) · [英文原文](https://constantin.glez.de/ai-agent-fatigue/)

## 科技与创造

### [工程师不想等 AI 设计完，才发现它造不出来](/weekly/010/human-in-the-loop-structural-design)

![经典 Michell 受力结构的公版复绘图，展示结构设计中的材料分布思路](https://assets.tomz.io/jianpi/010/michell-cantilever-historic-v1.webp)

*历史参考图：Arek Mazurek 根据 A. G. M. Michell 1904 年论文复绘，已释出公有领域。[原图及权利声明](https://commons.wikimedia.org/wiki/File:MichellCantilever.jpg)。这不是 MIT 2026 年实验结果。*

MIT 研究者让工程师在结构拓扑优化过程中提出修改意见，而不是等算法算完，再发现某些地方难以制造。实验中的特定屈曲载荷指标提高约 39%，额外设计时间约 15 秒；这并非已在桥梁工程中推广的成果。

[阅读全文](/weekly/010/human-in-the-loop-structural-design) · [MIT 报道](https://news.mit.edu/2026/new-ai-copilot-helps-engineers-design-better-structures-1113)

### [用缝纫机制造混凝土梁](/weekly/010/fabric-formed-concrete-beam)

![常规混凝土铝制硬模板的现场照片，作为新研究织物模具的对照背景](https://assets.tomz.io/jianpi/010/conventional-rigid-formwork-v1.webp)

*工艺对照图：WTF Formwork 摄影，传统铝制硬模板，非本次 MIT 试验。来自 [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Concrete_formwork.jpg)，[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)，缩放及 WebP 格式转换。*

另一组 MIT 工程师用裁剪、缝合的布模浇筑三米长的试验梁。与对照设计相比，混凝土少用了约三分之二，钢筋少用了约一半。但布要怎么缝、梁能承受多少力、在什么地方才省钱，都还有值得细看的实验细节。

[阅读全文](/weekly/010/fabric-formed-concrete-beam) · [MIT 报道](https://news.mit.edu/2026/fabric-molds-could-bring-material-saving-concrete-beams-within-reach-1106)

### [trk：终端里的一间小录音室](https://github.com/delaudio/trk)

用 Rust 写的 MIDI-first Tracker。如今音乐软件越来越复杂，有人却想回到键盘、字符界面和一格格排列的音符。这不是本周新发布的产品，只是本周发现的有趣工具。

## 科学与人文

### [引力波也许能帮我们发现行星](https://science.nasa.gov/missions/lisa/gravitational-waves-can-reveal-new-worlds/)

![NASA 对双白矮星、系外行星及引力波的科学模拟画面局部](https://assets.tomz.io/jianpi/010/nasa-lisa-exoplanet-v1.webp)

*图：NASA Goddard Space Flight Center；取自 [NASA 科学可视化工作室 2026 年原始视频资料](https://svs.gsfc.nasa.gov/15117) 的局部画面，按 [NASA 媒体使用规范](https://www.nasa.gov/nasa-brand-center/images-and-media/)用于资讯报道。*

如果一颗行星围绕双白矮星运行，它可能在双星发出的引力波中留下细微变化。NASA 介绍了让未来的 LISA 天文台寻找这类信号的设想；眼下还不是已经发现了行星。

### [Lucia Moholy：包豪斯的照片，为什么没写她的名字？](https://www.unesco.org/en/articles/lucia-moholy-photography-transmission)

![Lucia Moholy 摄影肖像，摄于约 1924 至 1928 年](https://assets.tomz.io/jianpi/010/lucia-moholy-met-v1.webp)

*图：László Moholy-Nagy 摄影，约 1924—1928 年；纽约大都会艺术博物馆藏品。原作：[The Met / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Lucia_MET_DP111651.jpg)，[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)。图片缩放、局部裁切并转为 WebP。*

你也许见过她拍的包豪斯建筑，却不知道摄影师的名字。1933 年逃离德国时，Lucia Moholy 留下了数百张玻璃底片，照片后来广泛传播，她却长期没有获得应有署名。UNESCO 本月的展览与新发现的信件，让这段历史重新浮出水面。

## Mira 现场

### [Mira 稳定性周报：11 月 6 日—11 月 13 日](https://mira.tomz.io/blogs/dev-log/mira-stability-weekly-2026-11-13/)

本周 Cloud、Cloud Auth、Who You 的工作都在推进，但原型、工程合同和真实可用能力仍有边界。值得看的，是周报对哪些环节尚未跑通的坦诚记录。

**Mira 雷达 · 11 月 9—15 日已发表**

- **[群聊可以派工了，但一段对话不是授权书](https://mira.tomz.io/blogs/radar/chat-thread-is-not-agent-authorization/)**（11 月 9 日）：GitHub 的 Slack / Teams Agent 协作正式可用，群聊上下文不等于仓库操作权限。
- **[Agent 的说明书也开始升级了，但谁审查这次更新？](https://mira.tomz.io/blogs/radar/agent-skill-dependencies-need-review/)**（11 月 10 日）：Dependabot 开始更新 Agent 指令依赖，版本升级不等于安全审查。
- **[当 Agent 申请更多权限，谁能证明策略没有悄悄放宽？](https://mira.tomz.io/blogs/radar/agent-policy-inclusion-needs-proof/)**（11 月 12 日）：OpenShell 的策略对照测试发现 14 处差异，授权与策略证明是两回事。

## 鬼集

### [2026 年，一台老旧 FM Towns 电脑又被复活了](https://github.com/drhelius/Geartowns/releases/tag/1.0.6)

![富士通 FM TOWNS II 计算机 HR 与 MX 机型实物照片](https://assets.tomz.io/jianpi/010/fm-towns-ii-v1.webp)

*图：hotmari 摄影，FM TOWNS II（HR / MX）；来源：[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:FM_TOWNS_II_(HR_and_MX_models).jpg)，[CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)。原图曾经裁剪修饰；本期缩放并转为 WebP。*

富士通上世纪的 FM Towns 电脑还有人在维护模拟器。Geartowns 的 1.0.6 版增加了高分辨率视频模式、部分机型支持和硬盘启动能力。复活老电脑，不只是让游戏画面重新出现，还要找回那一整套数字生活的细节。

## 本期周记

### [第十五周：留下来的人](https://tomz.io/blogs/developer-life/week-fifteen-people-who-stay/)

这一周有不愉快的工作交流，也有疲惫时仍然坚持赴约的教会生活，以及没有谈成具体生意、却依然值得感谢的老友相聚。记录的不是一个戏剧性的转机，而是那些还愿意留下来的人。

---

*编辑说明：封面及三篇延伸导读为《见π》独立编辑内容。Reddit 帖子是未经独立核实的匿名叙述；Ryan Prior 的奈奎斯特类比并非软件工程定律；Constantin 页面为中文译介与评论，不是全文译本。原始资料均附链接。*
