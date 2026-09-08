---
title: 周刊 #001：公司开始长出控制面
description: 第一版周刊预览样稿。关注 Company OS、Agent Control Plane、中国开发者项目，以及 OPC 从“AI 员工”走向公司运行时的变化。
group: 周刊
order: 1
issue: 1
date: 2026年9月8日
readTime: 10 分钟阅读
lead: 这一周最明显的变化，不是又多了几个 AI 员工，而是越来越多项目开始认真处理状态、权限、审批、记忆和持续执行。
tags:
  - AI
  - Agent
  - OPC
  - Company OS
  - OpenClaw
author:
  - tomz
  - mira
writingMode: co-authored
writtenBy: tomz | mira
reviewedBy: tomz
---

# 周刊 #001：公司开始长出控制面

> **本期为 GitHub Pages 设计预览样稿。** 内容用于验证周刊的信息密度、模块节奏和真实链接承载方式，不视为正式发布的第 001 期。

## 本周判断

> Agent 产品开始从“我有几个 AI 员工”转向“这家公司到底怎么持续运行”。

过去一段时间，很多 OPC 产品喜欢先画组织架构：CEO、CTO、CMO、销售、研究员，各自拥有名字、头像和角色提示词。这个阶段很容易理解，也很容易演示，但真正运行起来以后，问题很快就不再是“还缺哪个员工”。

更难的是：谁拥有状态，谁有权执行，任务如何恢复，失败如何升级，预算怎么约束，审批怎样留下证据，以及一个星期以后系统还记不记得自己为什么做这件事。

这也是为什么 Company Runtime、Harness 和 Control Plane 最近开始比“角色数量”更值得看。

## Agent / AI Radar

### Company State 开始成为一等对象

[tinyhumansai/opencompany](https://github.com/tinyhumansai/opencompany) 把 CompanyStore、EventLog、Memory、Secrets、ApprovalGate、CycleRunner 等能力放到了公司运行层，而不是继续堆角色 Prompt。

它未必已经成为成熟产品，但这个抽象值得记下来：**公司状态不是聊天记录。**

### 智能与权力开始分开

越来越多 Agent 系统尝试把“理解与规划”同“真正能做什么”拆开。模型可以提出建议，但执行范围、权限、预算、审批和取消恢复由确定性的控制层掌握。

这件事看起来很工程，其实是产品问题。Agent 越能做事，权限设计就越不能藏在提示词里。

## 产品与工具

### AI Employee 不够，公司还需要运行时

这一类产品正在出现明显分叉。一类继续卖“某个岗位的 AI 员工”；另一类开始向长期记忆、任务状态、周期执行、组织权限和审计靠近。

我更关心后一类，因为它决定 Agent 能不能从一次性演示进入长期工作。

### 工具数量正在失去意义

一个产品宣布支持 30 个、100 个甚至更多工具，已经越来越难构成优势。真正值得比较的是：

- 工具什么时候被暴露；
- 谁能调用；
- 调用失败后如何恢复；
- 高风险动作有没有确认边界；
- 结果有没有证据链。

## 中国开发者现场

中国民间 OPC 项目依然很工程化。这和海外大量从 SaaS 包装切入的方式很不一样。

[jnMetaCode/agency-orchestrator](https://github.com/jnMetaCode/agency-orchestrator) 继续代表一种典型路径：角色库、任务编排、DAG、人类审批和模板体系。另一方面，像 WorkAny、ChatClaw 一类桌面 Agent，又更关心本地运行、Skills、MCP、多模型和中国消息渠道。

我暂时不认为哪一种已经跑通，但它们共同说明：中国开发者正在把 OPC 当作**工程系统**，而不只是创业叙事。

## 值得读

这周值得重新看的不是一篇“未来公司会有多少 AI 员工”的预测，而是围绕 Agent 权限、长期状态、可恢复执行和人类审批的材料。

阅读时可以带着一个问题：

> 如果模型今天全部换掉，这家公司还剩下多少真正属于自己的运行结构？

如果答案接近零，那么所谓 Company OS 可能仍然只是一个 Prompt 壳。

## OPC Radar

OPC 生态目前最值得继续追踪的不是“一个人可以同时雇多少 AI”，而是下面这条链条有没有开始真正成立：

~~~text
Goal → Commitment → Project → Task → Agent → Action
     → Evidence → Approval → Asset → Metric → Revenue → Memory
~~~

大部分项目仍然只能稳定做到：

~~~text
Prompt → Agent → Result
~~~

两者之间，就是接下来真正需要长出来的东西。

## 一个怪东西

最近越来越常见的一类实验，是给 Agent 设计完整的公司身份、部门关系甚至“办公室”。

这些项目有时看起来很像角色扮演，但不应该一概笑掉。组织关系、权限继承、协作边界和主动触发，本来就需要新的表达方式。

值得警惕的是：**把社会结构画出来，不等于真的拥有社会结构。**

## 我们这一周在想什么

这周关于 OPC 的讨论最后绕回了一个很朴素的问题：AI 可以降低供给成本，但不会自动创造市场。

生产工具越来越平权以后，真正稀缺的东西可能反而更清楚：判断、分发、客户关系、品牌，以及一个人是否拥有不完全受平台控制的抵达市场的能力。

这也是《[OPC 探索（四）：需要氛围感的不只是女人](/blogs/shared-thinking/opc-atmosphere-not-only-women)》最后留下的问题。

## 下周继续盯

1. **Company Runtime / Company State**：有没有项目开始形成真正可迁移的公司状态协议。
2. **Harness / Control Plane**：智能层与执行权是否继续分离。
3. **Distribution Agent**：有没有 OPC 产品开始认真解决获客和市场，而不是只继续提高生产能力。
