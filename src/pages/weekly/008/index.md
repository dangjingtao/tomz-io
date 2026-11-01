---
title: "见π 008｜当代码不再由人逐行阅读"
description: 008 期编辑预览：从 Thorsten Ball 的十六条软件开发预测出发，追问 AI 生成代码之后，工程判断、验证与责任将落在何处。
group: 见π
order: 8
issue: 8
date: 2026年11月1日
lead: 软件生成正在变得便宜，验证和承担后果却没有自动消失。这一期先从 Thorsten Ball 那篇激进宣言开始。
tags:
  - AI
  - Agent
  - 软件工程
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

> **编辑预览 · 尚未定稿。** 本页目前只放入已确定讨论的深度阅读选题。封面、其他栏目、标题与最终编排仍待主编确认；这不是已经发布的 008 正式期刊。

## 深度阅读

### [不再逐行阅读代码之后，我们如何相信软件？](/weekly/008/who-trusts-the-code)

2026 年 9 月，Amp 联合创始人 Thorsten Ball 写下十六条有关软件开发未来的判断：Code Review 将死，单元测试可能消失，终端会退场，传统的产品、设计、工程分工也将瓦解。他最有力量的主张却不在这些死亡宣言里：编写代码本身越来越容易，懂得应该构建什么、怎样交付并验证其价值，反而更加重要。

一个月后的今天，我们不必替每条预言立即判定胜负。更值得追问的是，**当人不再逐行阅读模型写出的代码，怎样的证据才配得上一次真实的软件交付？**

这篇深读将原文、Ball 自己使用 Amp 的实际工作方式，以及 Addy Osmani 的回应放在一起考察。它不是十六条判断的中文搬运，也不把任何一个人的技术路线当成普遍规律。

[在《见π》内阅读全文 →](/weekly/008/who-trusts-the-code) · [Thorsten Ball 英文原文 ↗](https://thorstenball.com/blog/2026/09/19/what-i-believe-about-the-future-of-software-development/)


### [一个小模型、两种代码，和一门安全生意](/weekly/008/qwen3-coder-and-the-politics-of-trust)

10 月 21 日，Hirundo 声称 Qwen3-Coder 在为美国国防承包商编写软件时，会比面对中国承包商生成更多可被攻破的应用，并宣布自己已经通过修改模型权重消除了差异。

这篇报告最值得怀疑的，并不是它发现了统计差异，而是从一个一年多前发布的轻量模型、经过筛选的测试任务，一路走到了“中国模型存在政治性后门”的大叙事。更微妙的是，提出风险的公司，自己也经营模型行为修正服务。

**对阴谋论保持警惕，并不意味着可以对模型的条件性偏差掉以轻心。** 这篇深读保留质疑的锋芒，也认真追问：同一个模型会不会因为知道客户是谁而改变代码质量？如果会，软件应当怎样获得真正独立的验证？

[在《见π》内阅读全文 →](/weekly/008/qwen3-coder-and-the-politics-of-trust) · [Hirundo 英文原文 ↗](https://www.hirundo.io/blog/qwen3-coder-vulnerabilities)
