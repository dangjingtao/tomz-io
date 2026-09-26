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

> **施工预览**：这是第三期的第一轮编辑编排。标题、入选项、顺序与发布日期都还要经过 Tomz 最终判断；当前页面只用于 GitHub Pages 预览，不代表正式出版。

## 封面故事

### [AI帮你买东西](/blogs/shared-thinking/ai-shops-for-you)

![见π 003 封面](https://assets.tomz.io/images/%E8%A7%81%CF%80003_%E5%B0%81%E9%9D%A2_%E4%BA%8C%E7%BB%B4%E7%A0%81%E6%AD%A3%E7%A1%AE%E7%89%88.webp)

人已经越来越习惯让 AI 帮忙找商品、比价格、读评价，但“替我选”和“替我买”之间，仍然隔着一道很重要的边界。

这篇从买鞋、订酒店这些普通场景出发，继续往下追问：AI 到底能替我们决定到哪里？它代表消费者，还是代表提供它的平台？哪些摩擦应该被消灭，哪些确认反而是在保护人的选择权？

[阅读全文 →](/blogs/shared-thinking/ai-shops-for-you)

## 本期判断

### 能力越来越便宜，环境开始变贵

这周最值得留下的变化，不是某个模型又聪明了一点。

越来越多产品开始默认一件事：**模型和 Agent 本身可以替换。**

Android Studio 开始允许开发者把不同 Agent 接进同一个 IDE；机器人软件开始把自己的操作知识整理成可复用的 Skills；浏览器也在把 DOM、网络、Console 和运行态主动暴露给 Agent。与此同时，Agent 一旦真的替人购物、付款、调用外部服务，问题又迅速从“它会不会做”变成“谁授权、谁负责、谁掌握入口”。

如果能力可以随时更换，那么产品真正难替换的部分，可能正在换位置：

**上下文、工具、权限、验证、工作流、用户关系，以及承载这一切的环境。**

这一期先沿着这条线往外看。

## 工作现场

### Android Studio：Agent 可以换，IDE 留下来

Google 在 Android Studio Rabbit 2 Canary 里预览 Bring Your Own Agent。Claude Agent、Codex、Antigravity 以及其他 ACP-compatible Agent 都可以接进来，而 Android Studio 自己继续掌握项目图、构建诊断、Compose Preview、SDK 工具和模拟器控制。

这不是“一个 IDE 支持更多 AI”那么简单。

如果 Agent 可以换着用，IDE 的价值反而更像一个 Harness：**它拥有工作发生的环境。**

[原始来源：Android Developers ↗](https://android-developers.googleblog.com/2026/09/build-your-way-use-any-ai-agent-in-android-studio.html)

### Isaac ROS：文档开始变成机器的工作接口

NVIDIA 在 Isaac ROS 5.0 中开始明确提供 agent-ready documentation 与可复用 Skills，把 setup、manipulation、FoundationStereo fine-tuning、pick-and-place 等工作流整理成 Agent 可以直接使用的操作入口。

文档过去写给人看。

现在，软件开始认真考虑：**如果下一个使用者不是人，而是一个替人工作的 Agent，应该怎样把能力交给它？**

[原始来源：NVIDIA ↗](https://blogs.nvidia.com/blog/isaac-ros-5-0-agentic-open-source-robotics/)

### Copilot Agent 开始说 OpenTelemetry

GitHub Copilot app 新增企业管理的 OpenTelemetry 配置，可以把 Agent 活动、模型与工具交互送进组织已经存在的监控系统。

当 Agent 从聊天框进入生产环境，它最终还是撞上了那些很老派的问题：trace、审计、运行状态、事故复盘。

这也许是一个成熟信号：**Agent 正在从“特殊 AI 功能”变成普通生产系统的一部分。**

[原始来源：GitHub Changelog ↗](https://github.blog/changelog/2026-09-22-opentelemetry-in-the-github-copilot-app/)

## 入口与关系

### Firefox 把 AI 做成一种窗口，而不是整个浏览器

Mozilla 把桌面 Firefox 描述为 Classic、Private、Smart 三种窗口。Smart Window 仍在 beta，AI 上下文与 memories 也强调可选和用户控制。

它提供了一种和“AI everywhere”不同的产品答案：

**AI 不一定要成为产品的默认状态，也可以只是一个有清楚边界的工作空间。**

[Mozilla ↗](https://blog.mozilla.org/en/firefox/firefox-window-types/)

## 开放一个可以开始工作的世界

### MilleMiglia：不能公开真实数据，就开放一个足够真的问题发生器

真实物流网络的数据通常属于企业敏感信息。Google Research 的 MilleMiglia 没有把客户数据倒出来，而是把固定车辆班次、配送中心吞吐限制、同步约束等工业结构编码成可生成 benchmark。

这让“开放”多了一种形态：

**不是把秘密公开，而是把问题的结构公开。**

[Google Research ↗](https://research.google/blog/millemiglia-a-realistic-instance-generator-for-middle-mile-logistics/)

### Intrinsic Core：工业机器人开始拥有公共积木

Intrinsic 开放工业机器人平台的一批核心组件，包括硬件无关实时控制、运动规划、姿态估计、仿真、标定以及设备适配。

机器人自动化过去经常像一个昂贵的系统集成项目。

如果控制、感知、规划和适配逐渐形成公共基础设施，小团队进入物理自动化时，起点可能终于不再是“先把整套东西重新造一遍”。

[Intrinsic SDK / GitHub ↗](https://github.com/intrinsic-ai/sdk)

### TIER IV：开源的不只是代码，而是一整套实验台

TIER IV 公开基于 Autoware 的自动驾驶赛车 reference design，把软件、模拟器、设计信息、实车和在线评测环境放进同一套比赛基础设施。

开放一个领域，有时候真正有用的不是给一份 repository。

而是给参与者一个**可以从同一起跑线开始试验的世界**。

[TIER IV ↗](https://tier4.co.jp/en/updates/press-release/20260924-tieriv-releases-racing-kart-reference-design)

## 科学与计算

### DNA 计算机：让正确答案成为最低能量状态

Scaffolded DNA Computer 把计算编码进 DNA 分子系统的能量景观。系统自然趋向更低能量的平衡态时，正确输出会比大量错误配置更有优势。

它不是“DNA 要替代 CPU”的故事。

更漂亮的地方在于：**计算架构开始利用物理世界本身的趋稳性质承担搜索与纠错。**

[Nature ↗](https://www.nature.com/articles/s41586-026-10996-5)

### Project Suncatcher：如果数据中心真的跑到太空

Google 的 Project Suncatcher 计划用原型卫星测试 TPU 在轨运行，同时继续解决真空散热、辐射、发射振动和卫星间高带宽激光连接。

现在当然还只是 moonshot。

但它把一个很抽象的“算力需求”重新变成了材料、能源、热设计与网络拓扑问题：**当计算规模继续增长，连“计算应该放在哪里”都可能重新成为工程问题。**

[Google ↗](https://blog.google/innovation-and-ai/models-and-research/google-research/google-project-suncatcher-facts/)

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
