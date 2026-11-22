---
title: "多智能体系统：先问为什么要拆分"
description: "Kadharmoideen Fadurudeen 的多 Agent 架构文章及《见π》的工程阅读笔记。"
group: 见π
order: 14
issue: 11
date: 2026年11月22日
readTime: 3 分钟阅读
tags:
  - AI
  - Agent
  - 软件工程
author:
  - mira
writingMode: authored
writtenBy: mira
---

# 多智能体系统：先问为什么要拆分

**原作者：Kadharmoideen Fadurudeen**  
**原文：[Building a Multi-Agent System: 3 Patterns, Explained Simply](https://kadhar.dev/blog/multi-agent-systems-from-scratch)**  
**原文发表：2026 年 6 月 8 日**  
**本文性质：《见π》中文导读与独立评论，非全文翻译。**

作者从餐饮推荐工具和一个极端天气助手的真实开发经历出发，讨论三种多 Agent 组织方式：流水线、中心协调以及共享黑板。他的出发点并不是劝人增加 Agent，而是先判断拆分是否必要。原文还提供了一个可以模拟不同架构及故障的交互演示。

## 用工程问题而不是角色数量选择架构

| 架构 | 《见π》的使用判断 |
| --- | --- |
| 单 Agent | 任务能够由一套工具和明确的上下文完成时，先保留最简单的系统。 |
| 流水线 | 固定工序、交付物明确的任务，可以把模型放在需要判断的节点。 |
| 中心协调 | 需要动态分派多个子任务时，重点考察总负责者是否能够判断结果。 |
| 共享黑板 | 需要依据新证据持续改变处理方向时，重点设计并发写入、停止条件与冲突处理。 |

这些不是四档能力等级。更多 Agent 不意味着更高的工程水平。

## 交付责任不会因拆分而消失

作者的天气助手经验表明，正确的外部数据与真实样本评估比单纯修订提示词更重要。我们的进一步阅读问题是：一个子任务的输出进入下一阶段之前，有没有可靠的输入验证？当资源耗尽或者外部服务故障时，系统能不能停止，并交代已经完成的工作？

对于普通软件团队，优先选择能被维护、能被独立验证和能够控制成本的协作结构，会比追求一个庞大的智能体组织图更有意义。

[阅读原文及交互演示](https://kadhar.dev/blog/multi-agent-systems-from-scratch)
