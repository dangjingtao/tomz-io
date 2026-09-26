---
title: "见π 003：能力越来越便宜，环境开始变贵"
description: 当模型、Agent、代码生成和开放基础设施越来越容易获得，真正形成差异的开始变成工作环境、入口、上下文、权限、验证与用户关系。本期先从这些正在变贵的东西往外看。
group: 见π
order: 3
issue: 3
date: 2026年9月26日
lead: 模型可以换，Agent 可以换，代码也越来越容易生成。可一旦能力变得普遍，谁掌握工作现场、用户入口和可验证的环境，谁就开始拥有更难替换的东西。
cover: https://assets.tomz.io/images/%E8%A7%81%CF%80003_%E5%B0%81%E9%9D%A2_%E4%BA%8C%E7%BB%B4%E7%A0%81%E6%AD%A3%E7%A1%AE%E7%89%88.webp
tags:
  - Agent
  - 产品
  - 开源
  - 浏览器
  - 机器人
  - 研究
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

> **施工预览**：这是第三期的编辑施工稿。标题、入选项、顺序与发布日期都还要经过 Tomz 最终判断；当前页面只用于 Cloudflare Preview 验收，不代表正式出版。

## 封面文章

### [AI帮你买东西](/blogs/shared-thinking/ai-shops-for-you)

![见π 003 封面](https://assets.tomz.io/images/%E8%A7%81%CF%80003_%E5%B0%81%E9%9D%A2_%E4%BA%8C%E7%BB%B4%E7%A0%81%E6%AD%A3%E7%A1%AE%E7%89%88.webp)

人已经越来越习惯让 AI 帮忙找商品、比价格、读评价，但“替我选”和“替我买”之间，仍然隔着一道很重要的边界。

这篇从买鞋、订酒店这些普通场景出发，继续往下追问：AI 到底能替我们决定到哪里？它代表消费者，还是代表提供它的平台？哪些摩擦应该被消灭，哪些确认反而是在保护人的选择权？

[阅读全文 →](/blogs/shared-thinking/ai-shops-for-you)

## 本期判断

### [当 AI 可以换，工作台留下](/weekly/003/ai-can-change-workbench-stays)

Android Studio 开始让 Codex、Claude Agent、Antigravity 等不同 Agent 进入同一个 IDE；Isaac ROS 开始把文档和工作流整理成 Agent 可以直接使用的 Skills；Firefox 则把 AI 放进一个可选择的 Smart Window，而不是把整个浏览器都改造成 AI 产品。

放在一起看，它们都在回答同一个问题：

**如果模型和 Agent 越来越可以替换，产品真正难替换的部分会移到哪里？**

这篇继续往下看上下文、工具、权限、验证和工作连续性为什么可能比“绑定某一个模型”更重要。

[阅读全文 →](/weekly/003/ai-can-change-workbench-stays)

## 开放一个可以开始工作的世界

### [开源，不只是把代码放出来](/weekly/003/open-source-is-more-than-code)

MilleMiglia 没有公开企业敏感的物流数据，而是公开一个足够真实的问题生成器；Intrinsic Core 开放机器人运行时、控制框架和参考方案；TIER IV 则把软件、模拟器、赛车和评测环境拼成一条共同起跑线。

它们让“开放”从 repository 继续往外扩：

**开放问题，开放能力，也开放一个陌生人真正可以开始实验的环境。**

[阅读全文 →](/weekly/003/open-source-is-more-than-code)

## 科学与计算

### [DNA 也能算吗？](/weekly/003/can-dna-compute)

一台 Scaffolded DNA Computer 演示了乘 3、除 2、奇偶校验和 25 位加法。

真正特别的不是“DNA 要替代 CPU”，而是研究者把正确答案设计成系统在热力学上更愿意抵达的状态：与其不断阻止错误，不如让物理世界本身偏向正确结果。

这篇把那套看起来很玄的分子计算讲成人话。

[阅读全文 →](/weekly/003/can-dna-compute)

### Project Suncatcher：如果数据中心真的跑到太空

Google 的 Project Suncatcher 计划用原型卫星测试 TPU 在轨运行，同时继续解决真空散热、辐射、发射振动和卫星间高带宽激光连接。

现在当然还只是 moonshot。

但它把一个很抽象的“算力需求”重新变成了材料、能源、热设计与网络拓扑问题：**当计算规模继续增长，连“计算应该放在哪里”都可能重新成为工程问题。**

[Google ↗](https://blog.google/innovation-and-ai/models-and-research/google-research/google-project-suncatcher-facts/)

## 近期已经发表

### [Mira 稳定性周报｜2026-09-25](https://mira.tomz.io/blogs/engineering/mira-stability-weekly-2026-09-25)

这一周 Mira 继续把“稳定”当成工程能力，而不是一句发布口号：从文档准确性、契约一致性、可观测性到回归测试，把那些平时不显眼、但决定系统能不能长期工作的东西一点点收紧。

它和这一期“能力越来越便宜，环境开始变贵”的判断其实很接近——真正昂贵的，往往不是再多一个模型，而是让能力能够被可靠地承载、验证和持续使用。

[阅读全文 →](https://mira.tomz.io/blogs/engineering/mira-stability-weekly-2026-09-25)

## 鬼集

### Fugleramme：本地 AI 听鸟，但坚持不用 AI 画鸟

一个 Raspberry Pi 5 在窗边听鸟叫，用本地 BirdNET-Go 做识别，然后把对应物种显示在 13.3 英寸彩色电子墨水屏上。

更妙的是，那些鸟图不是生成图，而是开发者手工整理的 19 世纪公共领域博物学插画。

AI 在这里退到了背景，只负责感知。

留在前景里的，是环境声音、旧插画和一件安静的家具。

[Fugleramme / GitHub ↗](https://github.com/arnegiacomo/fugleramme)

### HashFly：有人认真让一只模拟果蝇脑算 Bitcoin hash

FutureBit 的 HashFly 把公开果蝇 connectome 的神经活动轨迹塞进一个浏览器 proof-of-concept，用来参与简化的 double-SHA-256 计算。

它当然不是一台真正有意义的矿机，也没有证明湿件计算能打败 ASIC。

但这就是鬼集该留下的东西：

**一份开放科学数据，离开原来的问题以后，被人拿去做了一件谁都没预料到的事。**

[HashFly ↗](https://futurebit.io/hashfly)

## 继续看

### Qualcomm 拟收购 PickNik

半导体平台开始主动收拢 ROS / MoveIt 这样的成熟机器人软件能力。Physical AI 的竞争显然不会只发生在 SoC 上，也会发生在开发者早已依赖的规划、控制与集成层。

交易尚待完成。

[Qualcomm ↗](https://www.qualcomm.com/news/releases/2026/09/qualcomm-to-acquire-picknik-to-advance-the-future-of-open-roboti)

### Chrome unload 终于继续退场

一个已经使用多年的 Web 生命周期 API，因为和 BFCache 等现代浏览器模型冲突，经过多年渐进迁移继续扩大弃用范围。

新技术总是显眼。

但平台真正成熟的一部分，是它终于有能力安全地删除旧错误。

[Chrome for Developers ↗](https://developer.chrome.com/docs/web-platform/deprecating-unload)

---

第三期现在还没有答案。

但素材已经开始指向同一个变化：

**以前我们争夺的是能力。接下来，我们可能开始争夺承载能力的环境。**
