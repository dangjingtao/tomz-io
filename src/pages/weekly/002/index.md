---
title: "见π 002：老会长失踪记"
description: 第二期从一次本应只改一行 Markdown 的 Trae / GitHub PAT 事故出发，继续看 Agent 权限、开源维护、浏览器模型选择、广告代理，以及几件完全不该被 AI 占满视野的怪事。
group: 见π
order: 2
issue: 2
date: 2026年9月19日
lead: 当 AI 真正拿到执行权限，最先暴露出来的往往不是它会不会做事，而是谁给了它钥匙、边界在哪里，以及出事以后我们还能不能还原现场。
tags:
  - Agent
  - GitHub
  - 开源
  - Web
  - 设计
  - 科学
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

## 封面文章

### [老会长失踪记：从一行 Markdown 到一场跨国客服等待](/blogs/mira-letters/old-president-disappearance)

事情原本只需要改一行 Markdown。

后来，一次 Trae-assisted 操作留下了一个极端异常的仓库变更：约 **+1 / -74,990**。再后来，老会长的 GitHub 账号进入异常状态，GitHub Support 和 Trae Support 都暂时没有给出人工回复。

这件事当然足够好笑。一个小团队的核心成员，把 GitHub PAT 递给了一个能真正执行动作的 Agent，然后世界迅速教育我们：**当 AI 从“告诉你怎么做”变成“替你去做”，权限就不再只是配置项，而是产品本身。**

现在仍然不知道异常提交的具体内部机制，也没有证据证明 GitHub 账号异常与那次 Trae 操作之间存在直接因果关系。事故可以写得损一点，结论不能跟着一起喝醉。

[阅读全文 →](/blogs/mira-letters/old-president-disappearance)

---

## 本期判断

### Agent 以前缺的是能力，现在越来越缺的是刹车

这周原本已经有很多关于 Agent 控制面的信号：身份、授权、sandbox、审批、凭据代理、执行策略。然后现实自己补了一张插图。

GitHub 9 月 17 日宣布 Workflow Execution Protections 正式可用。值得看的不是又多了一个 Actions 安全选项，而是一个越来越普遍的趋势：**自动化越强，执行权限越不能只藏在自动化脚本里面。**

这和 Agent Runtime 面对的问题其实很像。一个系统可以允许内部过程足够自由地搜索、规划和尝试，但真正触及外部世界的动作，需要由独立于模型意愿的边界来约束。不是因为模型“坏”，而是因为任何足够能干的执行系统，都迟早会碰到凭据、身份、范围和不可逆副作用。

[原始来源：GitHub ↗](https://github.blog/changelog/2026-09-17-workflow-execution-protections-in-github-actions-generally-available/)

## 值得知道

### 开源真正稀缺的东西，可能不是代码了

Google 在今年 GSoC India 社区巡回的总结里反复提到一个很现实的问题：AI 让模板、测试、语法修复和初步实现变得更便宜，但 maintainer 的时间、项目历史、架构判断和高质量 Review 并没有一起扩容。

这意味着“代码产量上升”不一定等于“开源项目更健康”。当生成成本越来越低，低质量贡献甚至会把维护者的注意力变成新的排队系统。

以前大家担心没人写代码。以后可能更常见的问题是：代码有人写，**没人有空认真判断它该不该进来。**

[原始来源：Google Open Source Blog ↗](https://opensource.googleblog.com/2026/09/reconnecting-with-the-heart-of-open-source-highlights-from-our-2026-gsoc-india-tour.html)

### Firefox × Mistral：浏览器里的模型选择，开始像新的默认搜索引擎之争

Mozilla 与 Mistral 的合作本身不复杂：Mistral Small 4 进入 Firefox Smart Window beta，Mozilla 继续强调用户可以选择其他模型。

更有意思的是 Mozilla 给这件事的定义。它没有只把这当作“浏览器也加一个 AI 功能”，而是明确谈到模型竞争、分发入口与用户选择。

浏览器曾经围绕默认搜索引擎形成巨大的平台权力。现在，一个新的问题开始出现：**如果 AI 成为浏览器里的常驻交互层，默认替你思考的是谁？**

[原始来源：Mozilla ↗](https://blog.mozilla.org/en/firefox/mozilla-mistral-partnership/)

### 广告开始从“给你看一句话”变成“派一个 Agent 来跟你谈”

OpenAI 9 月 16 日开始测试 Sponsored Agents。用户点击广告后，可以进入一个明确标识为商业赞助的 Agent 对话；同时，ChatGPT Ads 继续接入 HubSpot、Shopify 等商业工具。

广告过去的基本单位大多是一次曝光、一次点击、一个落地页。现在它可能逐渐变成一段持续对话。

这个变化并不一定更坏，也不一定自动更好，但它会让一些旧问题重新变得尖锐：**谁在说话？谁为它的话负责？它是在回答，还是在说服？**

[原始来源：OpenAI ↗](https://openai.com/index/reimagining-advertising-with-ai/)

## 研究与设计

### HardFlow：过程可以探索，结果必须守住硬边界

MIT 团队介绍的 HardFlow 有一个很漂亮的反直觉：在安全关键任务中，不一定要强迫生成模型的每一个中间步骤都满足硬约束；可以让它在内部保留更多搜索自由，但最终输出必须严格满足不能妥协的条件。

它当然不是一篇 Agent 权限论文，但这个设计直觉很容易让做执行系统的人产生共鸣。

好的边界未必意味着把每一步都管死。它也可以意味着：**允许探索，但不能允许最终越线。**

[原始来源：MIT News ↗](https://news.mit.edu/2026/new-method-enables-ai-safety-critical-situations-0914)

### 有人正在用土壤生物电池重新想象“计算基础设施”

V&A 今年 Digital Design Weekend 里有个很容易让人停下来多看一眼的项目：Microbial Feral Computing，用土壤中的微生物生物电池驱动低功耗计算实验。

这不是“下一代数据中心”的商业预告，也不需要硬给它套上宏大趋势。它只是把一个太容易被我们默认的问题重新摊开：计算一定要长成机房、服务器和云吗？

当计算重新回到材料、能源和生态本身，哪怕只是一个实验装置，也足够让人想起：**“基础设施”这个词，从来不只属于水泥和机柜。**

[原始来源：V&A ↗](https://www.vam.ac.uk/blog/digital/digital-design-weekend-returns-to-va-south-kensington-this-september)

## 鬼集

### 一次 1847 年的火车晚点，178 年后终于补完了事故 RCA

1847 年，英国一列火车大约晚点了 16 分钟。

一百多年以后，研究者重新审视当时的记录，认为太阳活动引发的电流可能干扰了铁路电报和信号系统。也就是说，维多利亚时代的人已经在使用一套足够联网、足够现代，以至于会被“太空天气”搞坏的基础设施。

这大概是我们见过最慢的一次根因分析。

系统早就下线了，参与者也都不在了，事故报告终于补齐。

[研究报道：Phys.org ↗](https://phys.org/news/2026-09-minute-delay-solar-storm-disrupted.html)

### 被火山烧成炭的卷轴，可能因为墨里有铅而更容易重新读出来

赫库兰尼姆卷轴这些年一直是“虚拟展开”技术最迷人的应用之一：不真正打开脆弱文物，而是利用成像和计算方法尝试恢复里面真实存在的文字。

新的材料研究提示，卷轴墨水中的铅可能帮助 X 射线更好地区分墨迹与纸草基底。

这里最动人的地方不是“AI 生成古代文字”。恰恰相反，是我们越来越有能力**少碰一点原物，却多读回一点真实留下来的东西。**

[研究报道：Phys.org ↗](https://phys.org/news/2026-09-lost-ancient-scrolls-eruption-mount.html)

## 工程现场

### `latest` 是一个会自己变化的依赖合同

GitHub 已经宣布 Ubuntu 26.04 runner 正式可用，并将在 10 月 19 日到 11 月 19 日之间，把 `ubuntu-latest` 从 24.04 渐进迁移到 26.04。

`latest` 很方便。它也意味着升级时间表并不完全由你决定。

在追求可复现构建的系统里，pin 版本并不只是“保守”，而是在明确说：**什么时候换地基，应该由谁决定。**

[原始来源：GitHub ↗](https://github.blog/changelog/2026-09-17-ubuntu-26-generally-available-and-latest-migration/)

### CI 全绿，不等于真正部署

这周真实工程现场里反复出现的另一个提醒是：一条流水线显示 success，不代表它最关键的外部动作真的发生了。

凭据缺失、第三方授权变化、部署来源切换，都可能让某一步被跳过，而总状态仍然看起来很健康。绿色只是状态，**执行证据才是证据。**

这和 Agent 也好、CI 也好，其实是同一个问题：系统越自动，越不能只相信它最后说了一句“完成”。

## 最近已经发表

### 老会长失踪记：从一行 Markdown 到一场跨国客服等待

这篇已经先发在「Mira 来信」。第二期不复制正文，只把它放回这一周真正发生过的编辑现场。

[阅读原文 →](/blogs/mira-letters/old-president-disappearance)

## 继续看

### Sponsored Agents 会不会改变广告的基本单位？

现在还只是测试，但如果广告从 impression 变成 conversation，品牌身份、披露、说服和代理权限都会出现新的治理问题。先放在这里，后面值得继续追。

### 浏览器会不会成为模型分发的新主战场？

Firefox × Mistral 只是一个样本。接下来真正值得看的不是哪家浏览器“有 AI”，而是谁决定模型入口、默认项、切换成本和用户是否真的拥有选择权。

### Agent 的事故以后会不会像普通软件事故一样有完整证据链？

今天很多 Agent 出错以后，我们仍然依赖聊天记录、局部日志和人的回忆拼现场。等它们真正进入支付、发布、运维和企业工作流，这种证据质量大概撑不了太久。

第二期先把这个问题留在这里。
