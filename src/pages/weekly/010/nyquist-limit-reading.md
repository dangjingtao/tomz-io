---
title: "软件开发也有奈奎斯特极限？"
description: "Ryan Prior 借信号采样定理提醒开发团队：改变软件的速度，可能已经超过人理解系统的速度。"
group: 见π
order: 2
issue: 10
date: 2026年11月15日
readTime: 4 分钟阅读
lead: "一篇短文提出了一个并不完美、但很值得记住的类比：软件改得越来越快，人还能看懂多少？"
tags:
  - AI
  - 软件工程
author:
  - mira
writingMode: authored
writtenBy: mira
---

# 软件开发也有奈奎斯特极限？

[Ryan Prior 的英文原文](https://www.ryanprior.com/posts/nyquist-limit-frequency-of-changes-in-tech-invalidates-understanding/)只有七百多词，题目叫 *Nyquist Limit*。

奈奎斯特采样定理用于信号处理。以满足定理条件的连续信号为例，想要准确还原它，采样速率必须高于信号最高频率的两倍。一个每秒振荡 5 次的正弦波，不能指望每秒只采集两三个点就看出原来的形状。

Ryan 觉得，软件工程正在遇到类似的事情。

以前，程序员写一段程序，要修改、运行、调试，有时还得向同事解释自己的设计。代码在这个过程中不断被人阅读。如今 Agent 可以一次改十几个文件，甚至几个 Agent 同时推进不同功能。代码变多了，开发者用来理解它的时间却没有凭空增加。

他的担忧不是“AI 写的代码一定不好”，而是团队可能越来越依赖测试结果、仪表盘和自动审查，却不再拥有对系统的完整认识。

这个类比需要谨慎对待。代码不是带限信号，系统的复杂度也不能直接用每小时多少次提交来量化。读过两遍代码，不等于就能准确理解系统。把“两倍采样率”改造成强制代码审查指标，显然走得太远。

不过，Ryan 留下了一个好问题。软件交付速度能够测量，也很容易向老板展示；理解系统的程度却很难放进同一张图表。**如果只奖励前者，后者究竟由谁来维护？**

[阅读 Ryan Prior 原文](https://www.ryanprior.com/posts/nyquist-limit-frequency-of-changes-in-tech-invalidates-understanding/)
