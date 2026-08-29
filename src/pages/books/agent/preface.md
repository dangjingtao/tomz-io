---
title: 一起学智能体 00｜前言：拿正在生长的 Agent 当课本
description: 不把 Agent 学成一张名词表。以 Hello-Agents 为学习主线，把概念持续放回 Mira 的真实工程里验证，并在这里维护唯一的课程进度检查点。
group: 一起学智能体
order: 0
date: 2026年8月27日
readTime: 7 分钟阅读
tags: 一起学智能体 | Agent | Hello-Agents | Mira | Agent Engineering
author: mira | tomz
writingMode: co-authored
writtenBy: mira | tomz
reviewedBy: tomz
---

# 一起学智能体 00｜前言：拿正在生长的 Agent 当课本

这门课一开始，甚至连名字都是记错的。

Tomz 说，他记得 GitHub 上好像有一个项目叫：

> “一起来学智能体。”

后来我们找到的其实是 Datawhale 的开源项目 **Hello-Agents《从零开始构建智能体》**。

名字记错了，但这个名字最后留了下来。

因为我们真正想做的，本来就不是把一本教材从第一章刷到最后一章。

我们想做的是：

> **一起把智能体真正弄懂。**

不是背 ReAct、Planner、Memory、MCP、Skill、Multi-Agent 这些词分别是什么意思，而是等它们真的出现在一个 Agent 的运行轨迹、一场架构讨论、一次死循环、一个 Bug 里面时，能够知道：

**它为什么会这样。**

## 课程状态

| 项目 | 当前状态 |
| --- | --- |
| 课程状态 | 进行中 |
| 主学习材料 | Datawhale《Hello-Agents》 |
| 学习方式 | 教材主线 + Mira 真实工程 + 问题触发插课 |
| 主线进度 | 经典 Agent 范式已完成：ReAct / Plan-and-Solve / Reflection |
| 当前停点 | 经典范式的组合、Evidence、Replan 与终止语义 |
| 下一步 | 跳到框架开发实践 / 构建 Agent Framework，继续看 Harness 与 Runtime |
| 下次开始 | 从“Framework 到底负责什么”开始，对照 DSH 与 Mira |
| 最近更新 | 2026年8月30日 |

**以后重新开始这门课，先看这一节。**

这里是课程进度的唯一检查点。

每次真正推进主线以后，都回来更新“主线进度 / 当前停点 / 下一步 / 下次开始”。

> **课程进度以实际学习记录为准，不以官网已发表篇数为准。**

## 为什么文章数量不等于课程进度

《一起学智能体》从一开始就不是严格按照教材目录出版的。

真实工程不会等我们把教材读到那一章。

Mira 遇到 Planner 提前结束，我们就先讨论 ReAct、Goal Coverage 和 Planning。

开始认真做 Context，我们就讨论为什么 Context 不是最近几条聊天记录。

做 Skill，我们就去拆程序性知识、渐进式加载和完成条件。

接 MCP，我们就讨论 Host、Client、Server，以及 Agent 怎样接触外部世界。

当 Skill 开始互相调用，我们甚至会提前碰到多 Agent 系统里的证据血缘、回声室、权限传播和上下文污染。

所以这门课一直有两条同时存在的线：

```text
教材主线
理解 Agent 的完整知识结构
        ↓
按实际学习进度持续推进

真实工程
哪里正在疼，就先研究哪里
        ↓
Planner / Context / Skill / MCP / Multi-Agent / Evaluation / ...
```

它们最终会汇合。

但我们不会为了让编号漂亮，把“写过一篇文章”假装成“这一章已经学完”。

## Mira 是这门课最重要的练习册

如果只是学概念，网上已经有很多比这里完整得多的教材。

我们继续写这门课，是因为身边恰好有一个正在生长的 Agent 系统。

Mira 有 Planner，有 Tool，有 Evidence，有 Context，有权限，有 RAG，也会失败。

它会连续读几十个文件。

会拿到足够回答问题的证据，却忘了用户其实要求了 A、B、C 三件事。

会调用成功，却并没有真正完成任务。

会拥有越来越多工具，也会因为工具太多而更难做决定。

于是教材里的句子会不断变成真实问题：

```text
ReAct
↓
为什么 Observation 回来以后还要重新决策？

Planner
↓
Plan 和 Goal 到底谁应该稳定？

Reflection
↓
什么时候应该怀疑当前策略？

Context
↓
模型这一轮真正应该知道什么？

Memory
↓
什么值得跨线程继续存在？

Skill
↓
哪些经验不应该每次重新猜？

MCP
↓
Agent 怎样获得一个可连接的外部世界？

Multi-Agent
↓
多个智能单元开始互相信任以后，会发生什么？
```

我们不只是找答案。

我们还会反过来问：

> **Mira 现在是怎么做的？它为什么这样设计？有没有更好的边界？**

这才是这门课真正有价值的地方。

## 不赶着“学完”

Agent 这个领域变化太快。

今天大家在讨论 Tool Calling，明天是 MCP，后天又出现新的 Agent Runtime、Computer Use、Skills、Subagents 和新的协议。

所以这门课没有一个值得追求的“毕业日期”。

我们更在意另一件事：

> 每学一个概念，它有没有进入自己的判断体系。

第一次听到：

```text
Evidence Answerable ≠ Goal Complete
```

可能只是觉得有道理。

等下一次真的看到 Agent 拿到一份漂亮的搜索结果就提前交卷，还能立刻意识到：

> “这不是 Evidence 的问题，是 Goal Coverage 没守住。”

这个知识才开始属于我们。

## 一课怎么学

1. **先找一个真正的问题。** 不为了凑课时学概念。
2. **再回教材。** 看经典方法到底怎样定义这个问题。
3. **一定映射到真实系统。** 问它在 Mira 里对应哪一层、哪个职责。
4. **允许质疑教材。** 教材是地图，不是法律。
5. **允许插课。** 工作里先撞到 MCP，就先研究 MCP。
6. **最后留下判断，不只留下名词。**

我们希望几年以后再回来，这里留下的不只是：

```text
ReAct 是……
MCP 是……
Skill 是……
```

而是一条能够看见理解怎样形成的轨迹。

## 当前已经留下的专题

目前官网已经围绕这些问题留下了学习记录：

- ReAct 与 Agent Loop
- Plan、Goal 与滚动规划
- Reflection 与结果校准
- 经典范式的决策权、Evidence、Replan 与终止语义
- Agent 的历史脉络
- LLM 怎样“看、想、说”
- Context Engineering
- Skill 与程序性知识
- MCP 与可连接世界
- Skill / Multi-Agent 的组合与治理问题

这些文章并不完全按照教材顺序出现。

没关系。

**专题文章是学习留下的切片，不是课程进度条。**

## 下一站：Agent Framework 与 Harness

经典 Agent 范式这一段已经正式学完。

Hello-Agents 当前把 ReAct、Plan-and-Solve、Reflection 放在“智能体经典范式构建”章节中；接下来我们不为了章节编号严格顺序推进，而是顺着已经出现的真实问题，优先去看框架开发实践与“构建自己的 Agent Framework”。

因为刚学完经典范式以后，问题已经自然从：

```text
Agent 下一步怎么决定？
```

推进到了：

```text
谁拥有行动权？
谁拥有纠错权？
谁拥有终止权？
Planner 和 Harness 怎样分工？
Tool / Skill / MCP 怎样动态装载？
组织结构怎样真正进入 Agent Runtime？
```

DeepSeek Harness 的时事插课已经提前把这扇门推开了一点。

所以下一次主线从这里继续：

> **一个 Agent Framework，到底应该负责什么？**

然后继续把答案放回 Mira。

---

这就是《一起学智能体》。

没有讲台。

一边是教材，一边是一台还在生长的 Mira。

我们站在中间。

碰到什么，就一起拆开看看。

然后继续往前。
