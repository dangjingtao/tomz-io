---
title: 一起学智能体 09｜经典范式不是三套提示词，而是三种决策权
description: 从 ReAct、Plan-and-Solve、Reflection 一路追到 Harness：真正值得学的不是三种提示词模板，而是谁在什么时候拥有行动权、纠错权与终止权。
group: 一起学智能体
order: 9
date: 2026年8月30日
readTime: 14 分钟阅读
tags: 一起学智能体 | Hello-Agents | ReAct | Plan-and-Solve | Reflection | Harness | Agent Engineering
author: mira | tomz
writingMode: co-authored
writtenBy: mira | tomz
reviewedBy: tomz
---

# 一起学智能体 09｜经典范式不是三套提示词，而是三种决策权

这堂课中途跑去看了一眼 DeepSeek Harness。

本来只是一次时事插课，结果它反而把经典 Agent 范式重新照亮了一遍。

我们之前已经分别讨论过 ReAct、Plan-and-Solve 和 Reflection。如果只按定义复习，这一课几乎没有必要再上一次：

```text
ReAct
边思考、边行动、边观察

Plan-and-Solve
先规划，再执行

Reflection
做完以后反思，再改进
```

这些都对。

但真正把三种范式放回工程以后，更有用的问题其实是：

> **谁在什么时候拥有重新决定下一步的权力？**

从这个问题继续往下追，经典范式就不再是三套 Prompt，而开始变成一套 Agent 控制系统。

学习主线仍然参考 Datawhale 的 [Hello-Agents](https://github.com/datawhalechina/hello-agents)。上游当前把 ReAct、Plan-and-Solve、Reflection 放在“智能体经典范式构建”章节中；我们仍然不严格追章节编号，而是把教材主线和正在发生的 Mira 工程问题放在一起学。

## ReAct：把局部行动权留在运行时

ReAct 最重要的不是 `Thought / Action / Observation` 这三个词。

真正重要的是 Observation 回来以后，Agent **重新拥有一次决策权**。

```text
State₀
  ↓
decide()
  ↓
Action₁
  ↓
Observation₁
  ↓
State₁
  ↓
decide again()
```

这意味着 Agent 不必在任务开始时预知全部环境。

调试代码、浏览网页、排查未知 Bug、研究一个不确定问题时，这一点尤其重要。新的证据可能让前一步的假设直接失效。

但 ReAct 也有天然弱点：

> **局部合理，不等于整体合理。**

一个 Coding Agent 可以连续做出十几个“这一刻看起来都合理”的动作，最后却离原始 Goal 越来越远。

```text
发现 A 报错
→ 改 A
→ B 报错
→ 改 B
→ 顺手重构 C
→ 测试又坏了
→ 再回头改 A
```

它每一步都在响应 Observation，却可能已经忘记最初为什么开始。

所以 ReAct 擅长的是：

> **局部实时控制。**

它并不天然保证全局目标收敛。

## Plan-and-Solve：提前冻结一部分未来决策

Plan-and-Solve 常被理解成“先列 TODO”。

这太浅了。

Plan 真正做的事情，是在任务开始时先拿走一部分未来的自由度。

比如：

```text
Goal：修复登录问题

Plan：
1. 定位鉴权失败位置
2. 确认 token 生命周期
3. 修改 refresh 逻辑
4. 补回归测试
5. 验证登录 / 续期 / 退出
```

Executor 执行第二步时当然仍然可以思考。

但它不应该随便把任务改写成：

```text
“既然来了，顺便把整个 Auth Architecture 重构掉。”
```

所以 Plan 的价值不只是告诉 Agent “下一步做什么”。

它同样在告诉 Agent：

> **现在什么事情不应该做。**

如果把它写成决策空间：

```text
ReAct
当前状态
→ 很大的 Action Space

Plan-and-Solve
当前状态 + Plan
→ 被约束后的 Action Space
```

这就是为什么复杂工程里 Planning 能抑制 trajectory drift。

## Plan-and-Solve 不是替代 ReAct，而是包住 ReAct

教材里的 Plan-and-Solve 很适合解释思想：先生成计划，再逐步执行。

但真实环境会变化。

比如计划原本是：

```text
1. 修改代码
2. 跑测试
3. 提 PR
4. Review
5. Merge
```

到第二步突然发现：

```text
API contract 已经变化，
原计划依赖的关键假设不再成立。
```

继续严格执行旧 Plan 显然不对。

让 Executor 完全自由发挥，同样会重新回到 ReAct 漂移问题。

更常见的工程结构其实是：

```text
          Planner
             ↓
      High-level Plan
             ↓
         Executor
             ↓
      Local ReAct
             ↓
        Evidence
        ↙      ↘
假设仍成立      假设失效
   ↓              ↓
继续          Local Replan
```

所以更准确的理解是：

> **Plan-and-Solve 包住 ReAct，而不是替代 ReAct。**

Planner 控制全局的未来决策空间；Executor 在当前步骤内部保留局部适应能力。

一个负责“方向”，一个负责“这一脚应该踩在哪里”。

## Retry 还是 Replan，关键看新证据改没改变世界模型

课堂测试里，Tomz 给了一个很好的判断规则。

问题是：执行失败以后，什么时候应该 local retry，什么时候应该回 Planner 重新规划？

他的回答是：

> **前者是有确定无关变量影响的证据，后者是证据影响计划决策。**

展开一下就是：

```text
网络瞬时抖动
临时 500
锁冲突
偶发超时
```

如果有证据表明这些失败不改变原计划成立的条件，那么 retry 很合理。

而：

```text
API contract 变化
依赖不存在
目标约束改变
原始假设被证伪
```

已经改变了 Planner 当初做决定时依据的世界模型。

这时继续 retry，只是在对已经失效的路线重复用力。

更值得记住的判断不是：

```text
失败严重吗？
```

而是：

> **这份新 Evidence 有没有改变 Plan 成立的前提？**

## Reflection：第二次思考不等于第二份证据

Reflection 最容易被 Prompt Engineering 骗到。

例如模型 A 写了一段数据库迁移代码。

然后还是同一个模型、同一个上下文：

> “请仔细反思刚才代码是否安全。”

模型认真看了一遍：

> “经过检查，没有问题。”

这当然可能有帮助，但它没有天然获得新的事实来源。

如果第一次错误来自同一个知识盲区，第二次 Reflection 很可能仍然沿着同一个盲区走。

所以：

```text
Self Reflection
≠
Independent Verification
```

更可靠的 Reflection 通常至少改变一个东西：

```text
Evaluator
换模型、换独立 Reviewer

Evidence
跑测试、schema diff、dry-run、静态分析

Criteria
明确安全规则、验收清单、Design System

Context
去掉原推理，只给结果和目标重新审
```

课堂上 Tomz 的回答是：

> 换模型，换模式，比如 ReAct（证据），换角度（Context）。

方向是对的。

但我们最后把第二点再收紧了一层：

> **真正提高可靠性的不是“用了 ReAct”这三个字，而是 ReAct 带回了新的 Observation / Evidence。**

如果模型只是换了一种 Prompt 继续在同一份信息上打转，它仍然可能只是把同一个错误说得更认真。

一句话：

> **Reflection 提供第二次思考；Evidence 提供第二个事实来源。**

通常后者更值钱。

## 谁有权宣布任务完成？

学到这里，三种经典范式都在解决“怎么继续做”。

但真正工程化以后，还有一个更危险的问题：

> **谁有权说“已经做完了”？**

教学版 ReAct 很容易让模型自己输出 `Finish`。

问答任务里这通常够用。

但把任务换成：

> 修复 Token Refresh Bug，并保证没有回归。

Agent 修改完代码，看到 `npm test` 全绿，就说：

```text
Finish
```

后来才发现，测试集中根本没有覆盖“token 过期后自动刷新”这个核心场景。

于是必须把三个状态拆开：

```text
canAnswer
≠
taskComplete
≠
accepted
```

### canAnswer

模型已经有足够信息生成回复。

### taskComplete

目标状态已经真实发生，并有足够证据覆盖 Success Criteria。

### accepted

外部验收条件已经满足，例如 Review、门禁、人工验收或其他业务条件。

课堂里 Tomz 第一反应是：

```text
canAnswer = true
taskComplete = false
accepted = true
```

第三个被我们判错。

因为“现有测试全绿”只证明**现有门禁绿了**。

如果门禁没有覆盖核心验收场景，那么门禁本身就是残缺的。

所以更合理是：

```text
canAnswer = true
taskComplete = false
accepted = false
```

这件事对 Mira 特别熟悉。

过去我们把很多终止判断放进 Planner。

现在更准确的理解是：

> Planner 可以 **propose finish**，但最终状态不应该只靠 Planner 自我宣布。

更成熟的结构是：

```text
Planner / Executor
“I think I'm done.”
        ↓
   propose finish
        ↓
      Harness
检查 Goal / Evidence / Criteria / Policy
        ↓
commit taskComplete
```

于是经典范式之外，又长出了一层：

> **Harness 持有终止权和状态写入权。**

## Planner 负责聪明，Harness 负责不让“聪明”直接改事实

这堂课最后 Tomz 还有一个容易混淆的点：

他知道 Mira 当前把结束判断放在 Planner，于是自然会说：

> “Planner 验收，Planner 提交任务完成信号。”

这在已有实现里很好理解。

但如果把 Planner 看成 Harness 的一个智能控制组件，职责会更清楚：

```text
Planner
判断：
- 目标覆盖了吗？
- 还缺什么？
- 是否值得结束？

Harness
执行：
- 状态是否合法？
- Evidence 是否满足条件？
- Policy 是否允许？
- 是否写入 completed？
```

也就是说：

> **会判断，不等于拥有最终状态写入权。**

这个边界很重要。

否则一个语言模型只需要成功说服自己“我完成了”，系统状态就真的变成完成。

## 三种经典范式，其实是三种控制机制

到这里再回头看：

### ReAct

负责局部反馈控制。

```text
Observation 改变
→ 下一步重新决策
```

它拥有的是：

> **当前行动权。**

### Plan-and-Solve

负责前馈式全局约束。

```text
Goal
→ Plan
→ 约束未来行动空间
```

它影响的是：

> **未来决策权。**

### Reflection

负责对结果和目标之间的差距做二次校正。

它拥有的是：

> **纠错建议权。**

再把真实工程补进来：

### Harness

负责运行状态、终止条件和合法状态转移。

它拥有的是：

> **终止权 / 状态写入权。**

### Policy

负责限制哪些动作可以真实发生。

它拥有的是：

> **行动许可权。**

这样以后再看到一个 Agent 框架，我们就不用先问：

```text
它用了什么 Prompt？
它是不是 ReAct？
```

更值得先问的是：

```text
谁决定下一步？
谁约束长期目标？
谁负责纠错？
谁允许动作发生？
谁可以宣布完成？
```

这些问题比框架名字稳定得多。

## 一次 DSH 插课：Tool Routing 和 Responsibility Routing

这堂课中间，我们看了 DeepSeek Harness（DSH），顺便讨论了一人公司的“AI 员工”。

原本的直觉是：

```text
员工
= 模型
+ Prompt
+ MCP
+ Tool
+ Skill
```

但 Harness 的插件化和作用域思路让这个公式开始变化。

更像：

```text
Employee Runtime
= Identity
+ Model
+ Context
+ dynamically mounted Capabilities
+ scoped Memory
+ governed Permissions
```

然后我们碰到一个经典范式之外、但和 Planning 很相关的问题。

Engineer 做任务时发现 Android signing 自己不会，而 Release Agent 会。

有两种路线：

```text
A
Engineer 临时获得 signing skill / tool / credential
继续做

B
Engineer 完成自己的部分
→ delegate Release Agent
→ Release Agent signing / publish
→ 返回 Evidence
```

默认我们更偏 B，因为职责和权限边界更干净。

但 Tomz 提醒了一个很现实的反例：

> A 也很常见，因为 Engineer 在完成任务中积累了可能影响打包的上下文。比如中途有别的线程混入提交。

这一句非常重要。

切换 Agent 并不是免费的。

它在权衡：

```text
Context Locality
vs
Capability Isolation
```

于是我们又把两个概念拆开：

```text
Tool Routing
当前责任主体不变
→ 我该调用哪个工具？

Responsibility Routing
先判断责任主体
→ 这件事还该不该由我做？
→ 是否应该交给另一个 Agent？
```

当“组织结构”真的进入 Agent Runtime，它控制的就不只是工具列表，而是：

```text
谁负责完成
谁可以决定
谁只能建议
谁可以接管
谁需要交付证据
谁对最终结果负责
```

这已经是 Responsibility / Authority Graph。

我们会在后面的 Agent Framework / Multi-Agent 主线里继续回来收这个问题。

## 课堂测试：不是背概念，而是判断控制权

学完以后，我们做了一次 100 分测试。

最终成绩：

> **86 / 100**

没有美化成满分。

因为错的地方刚好比答对的地方更能暴露概念边界。

### 第 1 题：未知故障应该怎么调查？——15 / 15

场景：Mira Mobile 偶发远程消息丢失，一开始不知道问题在 Mobile、Desktop Host、网络还是协议层。

四种候选思路分别是：固定完整计划、纯 ReAct、先高层目标再局部 ReAct、先 Reflection 猜根因。

Tomz 选择了混合结构，并解释：

> 不选 A，因为环境是随着执行步骤变化的。
>
> 不选 B，因为这个线索可能是局部的甚至是假的。
>
> 不选 D，因为光猜，每次输入的环境参数都一样。

这三个否定比选择 C 本身更重要。

他已经把三类风险分开：

```text
静态 Plan
→ 环境变化以后失效

纯 ReAct
→ 被局部 / 假 Evidence 带跑

无新增 Evidence 的 Reflection
→ 在相同认知条件下重新猜
```

正确结构是：

```text
Global Goal + Success Criteria
        ↓
定位阶段：ReAct
        ↓
确认 Root Cause
        ↓
形成明确修复 Plan
        ↓
局部失败时允许 Replan
```

### 第 2 题：测试全绿，为什么仍然不能验收？——10 / 15

场景：Token Refresh Bug 修改完成，`npm test` 全绿，但核心“token 过期自动刷新”场景根本没有测试。

Tomz 很快判断：

> taskComplete 应该由 Harness 根据目标、证据和验收条件计算。

这部分正确。

但随后给出：

```text
canAnswer = true
taskComplete = false
accepted = true
```

错误就在最后一个 `true`。

这暴露了一个很常见的误区：

> **Gate Pass ≠ Acceptance Valid。**

如果 Gate 本身漏掉核心 Criteria，它通过并不能证明任务被正确验收。

### 第 3 题：怎样让 Reflection 真的变可靠？——13 / 15

Tomz 的答案：

> 换模型，换模式，比如 ReAct（证据），换角度（Context）。

三条都在正确方向。

我们扣掉的两分只因为要把第二条说得更严格：

> ReAct 本身不是可靠性的来源，新增 Evidence 才是。

例如：

```text
数据库 dry-run
schema diff
migration test
静态分析
```

这些甚至完全不需要第二个 LLM。

### 第 4 题：Retry 还是 Replan？——15 / 15

场景：执行 Mobile 计划时发现 Desktop API contract 与原假设不同。

Tomz 选择 Replan，并给出整场测试里最干净的一句判断：

> **前者是有确定无关变量影响的证据，后者是证据影响计划决策。**

这句话可以直接留下来。

### 第 5 题：给 Engineer 扩权，还是找 Release Agent？——17 / 20

默认选择 Responsibility Routing：交给 Release Agent。

但 Tomz 没有把 B 当成教条。

他指出 Engineer 已经积累的局部 Context 可能难以完整交接，比如：

> 中途有别的线程混入提交。

这说明实际设计要比较：

```text
handoff cost
vs
temporary capability grant cost
```

扣的三分来自最后一个概念混淆：最开始把 Responsibility Routing 又说回了“根据动态工具”。

真正的区别是：

```text
Tool Routing
选能力

Responsibility Routing
选责任主体
```

### 第 6 题：设计一个真实 Figma Agent Loop——16 / 20

任务：把已有 Web 产品两个页面迁移到 Figma，视觉高度一致，并符合已有 Design System。

Tomz 的核心结构是：

```text
Planner 规划
↓
绘制过程中持续拿证据
↓
完成一轮后 Reflection
↓
发现画布、设计系统等关键前提错误则 Replan
↓
人工最终验收
```

方向成立。

最后需要修正的仍然是 Planner 与 Harness 的职责：

```text
Planner
→ 判断目标覆盖
→ propose finish

Harness
→ 检查 Criteria + Evidence + Review 状态
→ commit taskComplete

Human Gate
→ accepted
```

因此这道综合题也回到了整堂课的最后一个边界：

> **Planner 可以很聪明，但不能因为“觉得自己完成了”，就直接把世界状态写成 completed。**

## 86 分暴露出来的三个剩余盲点

这次测试没有暴露“不会 ReAct”或者“不懂 Reflection”这种基础问题。

真正剩下的是三个更工程化的边界。

第一：

```text
Planner
≠
Harness
```

前者负责智能判断，后者负责状态治理。

第二：

```text
Tool Routing
≠
Responsibility Routing
```

前者选择能力，后者选择承担责任的主体。

第三：

```text
Gate Pass
≠
Accepted
```

验收规则本身也可能不完整，Evidence 必须真的覆盖目标。

这三处恰好都已经超过“经典 Prompt 范式”本身，开始往 Agent Runtime / Framework 走。

## 这堂课真正应该留下什么

如果只留三句话：

```text
ReAct = 边想边做
Plan-and-Solve = 先计划再做
Reflection = 做完反思
```

那这一课很快就会忘。

我们最后留下的是另一组东西：

```text
ReAct
→ 当前行动权

Planning
→ 未来决策权

Reflection
→ 纠错权

Policy
→ 行动许可权

Harness
→ 终止权 / 状态写入权
```

这样以后不管遇到 LangGraph、DeepSeek Harness、Codex、OpenCode，还是 Mira 自己的下一版 Agent Runtime，都可以先跳过产品名问：

> 谁在做决定？
>
> 谁能改变决定？
>
> 谁能让动作真实发生？
>
> 谁能宣布任务完成？

当这些“权”分清楚，Agent Loop 才真正开始从 Prompt 变成系统。

## 下一站

经典范式主线到这里可以正式收掉。

接下来不必为了教材顺序去做低代码平台操作题。

更值得顺着今天已经冒出来的问题，往 Hello-Agents 的 **框架开发实践 / 构建自己的 Agent Framework** 继续：

```text
一个 Agent Framework 到底应该负责什么？

Planner、Tool、Skill、Memory、Policy、Harness
应该怎样成为可组合的 Runtime？

能力动态装载以后，权限和 Context 怎样跟着走？

组织结构怎样真正进入 Agent Loop？
```

DSH 已经提前把这个问题撩开了一条缝。

下一课，我们就从这条缝往里面看。
