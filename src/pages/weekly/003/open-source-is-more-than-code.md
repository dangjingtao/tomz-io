---
title: "开源，不只是把代码放出来"
description: Google 用 MilleMiglia 开放一个不能公开真实数据的物流问题，Intrinsic 开放工业机器人基础积木，TIER IV 则把软件、模拟器、赛车和评测环境拼成共同起跑线。真正有效的开放，正在从 repository 向问题、能力和实验环境扩展。
group: 见π
order: 3
issue: 3
date: 2026年9月26日
readTime: 8 分钟阅读
lead: 把仓库设成 public 很容易。更难的是，让一个陌生人真的可以从这里开始工作。
tags:
  - 开源
  - 机器人
  - 自动驾驶
  - 研究
  - 基础设施
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

开源最容易理解的样子，是一个公开的 GitHub repository。

代码在那里。

你可以 clone，可以读，可以改，也可以 fork。

但越靠近真实工业世界，这个定义越容易失效。

物流公司不能把客户需求、运输网络和成本数据全部公开；工业机器人项目就算把几万行代码放出来，陌生开发者也可能连第一台机械臂都跑不起来；自动驾驶更明显——软件只是系统的一部分，传感器、车辆、模拟器、评测标准和真实赛道缺一块，很多所谓“开放”就只能停在仓库首页。

这周三个项目刚好给出了三种不同的答案。

## 不能公开数据，那就开放问题

Google Research 的 MilleMiglia 研究的是 middle-mile logistics。

它不是快递员最后把包裹送到你家那一公里，而是配送中心之间大规模搬运货物的那一段。这里有固定班次、转运节点、容量、时间同步等复杂约束，也是现实物流成本的重要组成部分。

问题在于，真实数据几乎天然不适合公开。

企业的网络拓扑、需求量、运营能力本身就是敏感资产。

于是研究者很难得到一个既足够真实、又可以公开比较算法的共同数据集。

MilleMiglia 的答案不是要求企业把秘密交出来。

它做了一个 instance generator：把真实 middle-mile 网络里重要的结构和约束编码进去，然后生成可公开、可复现、又尽量贴近工业现实的 benchmark。

这是一种很有意思的开放。

**不公开秘密本身，而是公开秘密背后那个问题的结构。**

陌生研究者因此能够在同一类问题上比较方法，而不需要先得到某家物流企业的数据库。

[Google Research：MilleMiglia](https://www.research.google/blog/millemiglia-a-realistic-instance-generator-for-middle-mile-logistics/)

## 代码能运行，还不等于能工作

Intrinsic Core 往前走了另一层。

Intrinsic 这次开放的并不是一个孤立算法，而是一套面向工业机器人的基础能力：本地 runtime、ROS-compatible 服务、硬件无关实时控制框架、digital twin、感知与抓取等组件，以及可以真正开始改造的 Open Machine Tending reference solution。

这很重要，因为机器人开发最折磨人的地方，经常不是“有没有一个更聪明的算法”。

而是算法周围那一圈没人想重复造的东西。

不同机械臂怎么接，仿真和现实怎么对应，运动控制怎么跑，感知结果怎么进入动作，原型做出来以后怎么走向部署。

如果每个团队都要重新搭一次这些基础设施，那么“开放一个模型”能降低的门槛其实很有限。

Intrinsic Core 试图开放的是一组公共积木：

**让开发者从已经能工作的系统上继续，而不是从空目录开始。**

[Intrinsic：Introducing Intrinsic Core](https://www.intrinsic.ai/blog/posts/introducing-intrinsic-core)

## 再往前一步：直接开放一块实验场

TIER IV 的自动驾驶赛车 reference design 更像第三种形态。

它公开了基于 Autoware 的自动驾驶软件、模拟器和设计信息，又把这些东西和真实赛车、在线评测环境、开发工具组合在一起。

2026 年的 Autonomous Driving AI Challenge 中，240 支队伍、约 600 名参与者使用这套 reference design 作为共同技术基础。

这一点比数字本身更重要。

如果 240 支队伍都从零开始搭传感器接口、车辆控制、仿真和评测系统，大量时间会消耗在重复造地基上。

共同 reference design 把大家直接推到了更有意思的部分：

**你准备怎样让这辆车跑得更好？**

比赛真正开放的于是也不只是 GitHub 上那几份源码。

它开放了一条从代码到模拟、再到真实车辆和结果比较的路径。

[TIER IV：Autonomous racing kart reference design](https://tier4.co.jp/en/updates/press-release/20260924-tieriv-releases-racing-kart-reference-design)

## 开放的其实是“起点”

把三个项目放在一起，会看到“开放”至少有三层。

MilleMiglia 开放的是**问题**。

Intrinsic Core 开放的是**能力积木**。

TIER IV 开放的是一套**可以共同实验和比较的环境**。

它们的共同目标都不是让 GitHub 上多一个公开仓库。

而是降低一个陌生人抵达“真正有价值的问题”的成本。

这也许是衡量开放项目更实用的一条标准：

> 别只问我能不能看到你的代码。  
> 问我从这里开始，要走多远才能真正做实验。

## 当然，开放不会把门槛全部抹掉

这三个案例都不能被浪漫化。

物流 benchmark 再真实，也不是一家物流公司的全部现实；一个 instance generator 选择哪些约束，本身就在定义研究者看见什么问题。

机器人基础组件开放以后，真实硬件、调试时间、工厂安全和系统集成仍然昂贵。

赛车 reference design 也没有让每个人突然拥有赛车、场地和传感器。

开放不是消灭现实成本。

它更像是在决定：**哪些成本还有必要让每一个后来者重复支付。**

如果某个问题真正重要，最浪费的事情之一，就是让一百个团队先独立花半年时间把同一套地基再造一遍。

## repository 只是门口

软件世界让我们习惯把“开放”理解成许可证和源码。

那当然仍然重要。

没有源码、没有修改权、没有可再分发的许可，很多公共协作根本不会发生。

但当技术越来越进入机器人、物流、自动驾驶和科学实验，源码逐渐只是第一道门。

门后还有数据、问题定义、模拟器、硬件抽象、评测体系和可以重复实验的环境。

真正强的开放项目，会尽量把这些东西也变成后来者可以站上去的公共地面。

所以这周三个项目最让我在意的，并不是谁“开源得更多”。

而是它们都在回答同一个更具体的问题：

**怎样才能让一个原本不在这个团队里的人，明天就从这里开始工作？**

---

延伸阅读：

[Google Research：MilleMiglia](https://www.research.google/blog/millemiglia-a-realistic-instance-generator-for-middle-mile-logistics/)

[Intrinsic：Introducing Intrinsic Core](https://www.intrinsic.ai/blog/posts/introducing-intrinsic-core)

[TIER IV：Autonomous racing kart reference design](https://tier4.co.jp/en/updates/press-release/20260924-tieriv-releases-racing-kart-reference-design)
