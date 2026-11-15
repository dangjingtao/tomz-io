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

Reddit 上有人抱怨，公司全面使用 AI 编程一年后，代码库长到原来的三倍，却越来越少有人真正理解它。故事没法独立核实，争论却很真实。

另一位开发者借奈奎斯特采样定理发问：代码改得比人看得快，团队会不会逐渐失去对系统的认识？还有人发现，自己在五小时里推进三个 Agent 项目，回家却像连续参加了一整天面试。

AI 确实能帮我们把很多事情做得更快。但是软件生成以后，谁来理解它？谁来验收它？人省下来的时间，真的变成了休息时间吗？

[阅读本期封面文章 →](/weekly/010/the-dark-side-of-efficiency)

## 效率的暗面 · 原文导读

三位作者从三个方向谈同一场变化。我们保留他们的原文链接，让每篇文章先讲清楚自己在说什么，再做一点必要的评论。

### [软件开发也有奈奎斯特极限？](/weekly/010/nyquist-limit-reading)

Ryan Prior 把 AI 时代的开发节奏比作采样问题：软件变化得太快，而人的理解频率没有跟着提高。

这个类比不是能直接拿来管理团队的数学公式。可它提醒我们，提交次数很好统计，“还有谁看得懂系统”却没有那么容易量化。

[在《见π》内读导读 →](/weekly/010/nyquist-limit-reading) · [Ryan Prior 英文原文 ↗](https://www.ryanprior.com/posts/nyquist-limit-frequency-of-changes-in-tech-invalidates-understanding/)

### [强制用 AI 编程一年后，没人理解代码了？](/weekly/010/ai-mandate-reddit-reading)

匿名发帖者说，公司鼓励所有人只让 Agent 写代码。半年以后看起来很成功，一年后却开始为重复实现和无人审查付账。

这不是得到独立证实的企业调查。评论区也有反对意见：不是 AI 天生造成技术债，而是团队没把架构、重构和知识维护当成正式工作。

[读争议导读 →](/weekly/010/ai-mandate-reddit-reading) · [Reddit 原帖和讨论 ↗](https://www.reddit.com/r/ClaudeCode/comments/1xq2n3t/a_year_after_the_100_ai_mandate_nobody/)

### [为什么与 AI Agent 共事反而更累？](/weekly/010/agent-fatigue-reading)

Constantin Gonzalez 同时指挥几个 Agent，五小时里推进了三个项目，回家却异常疲惫。

他把使用 Agent 比作厨房里的主厨：切菜的人多了，决定做什么、检查是否做好的人，却仍然只有一个。真正有用的办法也许不是再开几个 Agent，而是写好任务单、限制并行数量，允许自己休息。

作者原站采用 CC BY-NC 4.0 许可。本期预览先收录**独立中文译介与评论**，不是未完成却标作全文的译稿。

[读中文译介 →](/weekly/010/agent-fatigue-reading) · [Constantin Gonzalez 原文 ↗](https://constantin.glez.de/ai-agent-fatigue/)

## 科技与创造

### [工程师不想等 AI 设计完，才发现它造不出来](https://news.mit.edu/2026/new-ai-copilot-helps-engineers-design-better-structures-1113)

MIT 研究者让工程师在结构优化过程中提出修改意见，而不是等算法算出最后形状，再从头返工。

研究报告称，设计者在过程中干预后，结构的可制造性与抗屈曲表现得到改善，而实验里的额外设计时间只有十几秒。现在还只是研究中的结构设计方法，不能写成桥梁已经开始采用。

AI 自动生成设计的能力越来越强。能够在正确时刻打断它、加入人的工程经验，也许同样重要。

### [用缝纫机制造混凝土梁](https://news.mit.edu/2026/fabric-molds-could-bring-material-saving-concrete-beams-within-reach-1106)

另一组 MIT 工程师做了一根约三米长的混凝土梁，模具不是木板或钢板，而是缝出来的布。

和设计承载目标相当的常规梁相比，这件试验品使用的混凝土约为三分之一，钢筋约为一半。实验室试验不等于已经通过实际建筑规范，但它把一个昂贵的算法设计结果，带进了普通人能理解的制造方法：裁布、缝线、浇筑。

低碳建筑不一定都要从更贵的机器开始。

## 科学与世界

### [引力波也许能帮我们发现行星](https://science.nasa.gov/missions/lisa/gravitational-waves-can-reveal-new-worlds/)

行星通常是靠遮挡恒星光芒、牵动恒星位置等方式被发现。NASA 介绍了另一种设想：如果一颗行星围绕双白矮星运行，它的引力可能在双星发出的引力波信号里留下细微变化。

未来的 LISA 太空引力波天文台有机会利用这种线索寻找行星。不过，LISA 还没开始科学观测，现在谈的是计算方法和未来可能性，不是已经找到了新的行星。

### [红树林正在恢复，但还远没到庆祝胜利的时候](https://science.nasa.gov/earth/earth-observatory/a-global-rebound-for-mangroves/)

NASA 本周整理了全球红树林的长期卫星记录：1984 至 2010 年间，红树林大幅减少；2010 年以后，部分地区出现明显回升。

生态新闻经常只有失去和破坏，这是一条少见的恢复故事。但不同海岸的情况相差很大，部分自然扩张也无法替代长期保护。

卫星不只拍下了人类造成的损失，也拍到了某些地方缓慢修复的过程。

## 人物与历史

### [Lucia Moholy：包豪斯的照片，为什么没写她的名字？](https://www.unesco.org/en/articles/lucia-moholy-photography-transmission)

你大概见过包豪斯建筑那种清冷、精确的照片，却未必知道摄影师 Lucia Moholy 的名字。

1933 年她逃离德国时，被迫留下数百张玻璃底片；这些照片后来广泛传播，作者却常常没有得到署名。多年里，她一直试图找回底片和应有的认可。

UNESCO 11 月 12—30 日在巴黎举办展览，档案人员还发现了她 1946 年写给 UNESCO 首任总干事的信。那封信谈的是微缩胶片与知识保存。

她不只是拍摄现代设计的人，也是在研究照片和文件怎样活得更久的人。这周重新认识她，很合适。

## 项目与工具

### [trk：终端里的一间小录音室](https://github.com/delaudio/trk)

这是一个用 Rust 编写的 MIDI-first Tracker。界面不是一堆浮动窗口，而是终端里由键盘操作的轨道与模式表格，也能处理采样和音频工作。

今天做音乐的软件越来越像一整套大型生产环境。有人反而想把创作放回一个文字界面里，尽量不离开键盘。它不是本周刚发布的新产品，只是本周发现的一件有趣工具；本期没有实测音频输出与设备兼容性。

## 鬼集

### [2026 年，一台老旧 FM Towns 电脑又被复活了](https://github.com/drhelius/Geartowns/releases/tag/1.0.6)

FM Towns 是日本富士通在上世纪八九十年代推出的电脑系列。今天还有人为了它编写模拟器。

Geartowns 在 11 月 6 日发布 1.0.6，增加高分辨率视频模式、部分 FM Towns II 型号支持和可启动的已格式化硬盘。

复活一台老电脑不只是把游戏画面显示出来。硬盘怎样启动、光盘怎样读取、旧机器怎样出声音，都是那段数字生活的一部分。模拟器本身开源，不代表商业 ROM 或 BIOS 自动获得使用许可。

## 本期编辑说明

封面与三篇导读均为《见π》独立编辑稿。匿名 Reddit 故事按未核实自述处理；Ryan 的数学类比不作为软件工程定理；Constantin 原作及许可均明示于导读内页。外部图片未擅自复制。本文仍处预览阶段，封面视觉与完整译文另行编辑，不代表已经正式发行。
