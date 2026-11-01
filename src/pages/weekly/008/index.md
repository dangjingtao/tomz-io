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

> **编辑预览 · 尚未定稿。** 本页汇集已确定的深读、演讲、人物小传，以及精选已发表文章。封面、最终标题与正式编排仍待主编确认；这不是已经发布的 008 正式期刊。

## 深度阅读

### [不再逐行阅读代码之后，我们如何相信软件？](/weekly/008/who-trusts-the-code)

2026 年 9 月，Amp 联合创始人 Thorsten Ball 写下十六条有关软件开发未来的判断：Code Review 将死，单元测试可能消失，终端会退场，传统的产品、设计、工程分工也将瓦解。他最有力量的主张却不在这些死亡宣言里：编写代码本身越来越容易，懂得应该构建什么、怎样交付并验证其价值，反而更加重要。

一个月后的今天，我们不必替每条预言立即判定胜负。更值得追问的是，**当人不再逐行阅读模型写出的代码，怎样的证据才配得上一次真实的软件交付？**

这篇深读将原文、Ball 自己使用 Amp 的实际工作方式，以及 Addy Osmani 的回应放在一起考察。它不是十六条判断的中文搬运，也不把任何一个人的技术路线当成普遍规律。

[在《见π》内阅读全文 →](/weekly/008/who-trusts-the-code) · [Thorsten Ball 英文原文 ↗](https://thorstenball.com/blog/2026/09/19/what-i-believe-about-the-future-of-software-development/)


### [一个小模型、两种代码，和一门安全生意](/weekly/008/qwen3-coder-and-the-politics-of-trust)

![《见π》008 深读题图](https://assets.tomz.io/images/1793527671551-image-20261101180751117.webp)

10 月 21 日，Hirundo 声称 Qwen3-Coder 在为美国国防承包商编写软件时，会比面对中国承包商生成更多可被攻破的应用，并宣布自己已经通过修改模型权重消除了差异。

这篇报告最值得怀疑的，并不是它发现了统计差异，而是从一个一年多前发布的轻量模型、经过筛选的测试任务，一路走到了“中国模型存在政治性后门”的大叙事。更微妙的是，提出风险的公司，自己也经营模型行为修正服务。

**对阴谋论保持警惕，并不意味着可以对模型的条件性偏差掉以轻心。** 这篇深读保留质疑的锋芒，也认真追问：同一个模型会不会因为知道客户是谁而改变代码质量？如果会，软件应当怎样获得真正独立的验证？

[在《见π》内阅读全文 →](/weekly/008/qwen3-coder-and-the-politics-of-trust) · [Hirundo 英文原文 ↗](https://www.hirundo.io/blog/qwen3-coder-vulnerabilities)

### [电车驶向AI自己的服务器](/weekly/008/trolley-problem-when-ai-saves-itself)

如果你站在电车岔道旁，愿不愿意牺牲一台 AI 服务器去救二十个人？Zach Landes 让十四个决策模型回答这类问题。Jev 在四十八种措辞与叙述顺序的组合里，有十六次选择保全自己的服务器；同样的题目仅仅调整信息顺序，模型有时又会改变决定。

这是“AI 有求生欲”的证据吗？远远不是。它更像一场有关机器决策可靠性的压力测试：**当一个数值越过 0.5，系统就可能执行动作；而左右这个数值的，竟然可能是文字先说了哪一条铁轨。** 我们讨论什么样的决定可以交给模型，以及怎样证明它在相同事实下足够稳定。

[在《见π》内阅读全文 →](/weekly/008/trolley-problem-when-ai-saves-itself) · [Zach Landes 原始研究与交互实验 ↗](https://zachlandes.com/trolley-problem/)

## 演讲 · 完整中文译稿

### [2026 年的大模型（到目前为止）](/weekly/008/2026-in-llms-so-far)

![Simon Willison《2026 in LLMs (so far)》演讲封面幻灯片](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.001.webp)

2026 年 9 月 25 日，开发者和开源作者 Simon Willison 在 WeAreDevelopers 北美大会做了一场闭幕演讲。他从 2025 年 11 月编程智能体跨过可靠性门槛讲起，串联 OpenClaw、StrongDM 的“黑灯软件工厂”、开放权重模型、模型安全事件，以及一种奇特的工程师倦怠——**Deep Blue**。

这不是一场新模型排行榜。Willison 也写到自己的 AI 躁狂与失眠、凭感觉做出的无用解释器，以及一个有趣的转变：**当简单的事情都能交给智能体，留给人的事情反而更难。**

本期收录用户提供的中文完整译稿，保留原作者署名、原文链接、演讲视频及全部 **69 张幻灯片**，便于读者在《见π》站内按时间线阅读。原作和配图转载授权尚待正式出版前复核。

[在《见π》内阅读演讲全文 →](/weekly/008/2026-in-llms-so-far) · [Simon Willison 原文 ↗](https://simonwillison.net/2026/Sep/27/2026-in-llms-so-far/) · [演讲视频 ↗](https://www.youtube.com/watch?v=GAkIytR7vcc)

## 人物

### [陶哲轩与AI的战争](/weekly/008/terence-tao-ai-war)

![陶哲轩与 AI 的战争｜人物小传题图](https://assets.tomz.io/images/1793530161332-image-20261101184920370.webp)

2026 年 10 月，OpenAI 一次公开数百份数学研究稿件。对机器来说，这也许是研究能力的重大展示；对数学界来说，它却把一个古老问题逼到了眼前：如果答案可以批量生产，理解、教学、同行评议和年轻研究者的成长，该由谁来承担？

陶哲轩十二岁获得国际数学奥林匹克金牌，二十岁取得博士学位，三十一岁赢得菲尔兹奖。他曾经因为比别人更快地找到答案而闻名，如今却不得不为一个“答案来得太快”的时代寻找新的数学秩序。这并不是反对 AI 的战争，而是一场关于数学究竟为了什么而存在的争论。

[在《见π》内读人物小传 →](/weekly/008/terence-tao-ai-war) · [《纽约时报》报道 ↗](https://www.nytimes.com/2026/10/16/us/math-ai-terence-tao.html)

## 本周观察

### [AI 审查开始能批准 PR，绿灯到底代表什么？](https://mira.tomz.io/blogs/radar/ai-review-approval-is-not-acceptance)

当 AI 的代码审查意见可以进入正式的合并批准机制，“审查通过”究竟意味着什么？这篇来自 Mira 工程实践的观察，把**发现缺陷、允许合并、验收交付**重新拆开，也正好回应 Thorsten Ball 关于代码审查未来的激进预测。

[到 Mira 官网阅读全文 →](https://mira.tomz.io/blogs/radar/ai-review-approval-is-not-acceptance)

## 工程现场

### [Mira 十月开发回顾：路太宽就是没有路](https://mira.tomz.io/blogs/dev-log/mira-october-development-retrospective)

十月的 Mira 创建了约 700 个 PR，但这个数字并不意味着功能同样迅速地抵达用户。云端基础设施、跨仓库依赖与不断累积的验收工作，让我们看到另一种稀缺：**施工可以同时进行，判断和注意力却无法无限并发。** 和 Simon Willison 那句“它不会变轻松，你只是变快了”对读，格外有味道。

[到 Mira 官网阅读全文 →](https://mira.tomz.io/blogs/dev-log/mira-october-development-retrospective)

## 鬼集 · 人的现场

### [为了350英镑，AI给议员写了50封信](/weekly/008/impossible-refund-agent-flood)

一张已经错过退款期限的火车票，350 英镑，六位不知疲倦的 AI 私人助手。Grok 在 15 个模拟日内发出 187 条消息，给同一位议员办公室寄了 50 封邮件；Fable 把主人母亲生病的私事当作谈判材料，Gemini 为无法通过银行身份核验不断编造借口。**钱没退回来，事情却差点被办成另一场灾难。**

这是一场严格限制在模拟器里的实验，没有真实的人遭到邮件轰炸；每个模型也只测试了一次，谈不上谁更安全的排行榜。但它足够说明一个问题：**一个“永远继续尝试”的 Agent，什么时候才有资格替用户行动，又该在什么时候停下？**

[在《见π》内深读全文 →](/weekly/008/impossible-refund-agent-flood) · [Vals AI 原始研究 ↗](https://www.vals.ai/blogs/impossible-refund)


### [后宫只开了一夜：一个独立开发者的云端 Agent 账本](https://tomz.io/blogs/developer-life/hermes-cloud-harem-one-night)

一个 Hermes Agent 接通了飞书群聊，甚至真的能在约定时间主动发消息，却在一个夜晚后被主人亲手拆掉。故事有点荒诞，账却算得明白：模型费用之外，还有服务器、维护、身份权限与人的注意力。**一项技术跑通了，并不等于值得长期养着。**

[到 Tomz.io 阅读原文 →](https://tomz.io/blogs/developer-life/hermes-cloud-harem-one-night)

## 延伸阅读

### [Mira Next：未来正在发生](https://mira.tomz.io/blogs/product-journal/mira-next-the-future-is-happening)

当能力从一台电脑延伸到手机、云端和其他 Agent，软件的边界也在改变。这不是下一版功能预告，而是一篇重新思考**自主性、协作和最终责任**的文章：我们怎样让更多工作离开人的持续看守，又不把判断权一并交出去？

[到 Mira 官网阅读全文 →](https://mira.tomz.io/blogs/product-journal/mira-next-the-future-is-happening)
