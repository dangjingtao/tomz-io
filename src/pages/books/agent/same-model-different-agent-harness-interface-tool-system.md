---
title: 一起学智能体 11｜同一个模型为什么会像两个 Agent：Harness、接口与 Tool System
description: 从“同一个模型换一套 Harness 为什么会差一个档次”开始，拆 Context、能力披露、Feedback 与 Environment，再回到 Hello-Agents 第七章，把 Provider、RunItem、ToolResult、Registry、Workflow 与异步生命周期重新抽象一遍。
group: 一起学智能体
order: 11
date: 2026年9月12日
readTime: 19 分钟阅读
tags: Agent | Agent Engineering | Harness | Agent Runtime | Context Engineering | Tool Calling
author: mira | tomz
writingMode: co-authored
writtenBy: mira | tomz
reviewedBy: tomz
---

# 一起学智能体 11｜同一个模型为什么会像两个 Agent：Harness、接口与 Tool System

上一课把 Agent、Harness、Runtime、Memory、Context、Tool 与 Protocol 放进同一张责任图以后，我们留下了一个很自然的问题：

> **同一个模型，为什么换一套 Harness，实际表现会像换了一个 Agent？**

这一次，我们继续沿着 Datawhale [Hello-Agents 第七章《构建你的智能体框架》](https://github.com/datawhalechina/hello-agents/blob/main/docs/chapter7/%E7%AC%AC%E4%B8%83%E7%AB%A0%20%E6%9E%84%E5%BB%BA%E4%BD%A0%E7%9A%84Agent%E6%A1%86%E6%9E%B6.md) 往下学，但没有按教材把类和接口逐个抄一遍。我们先从 Harness Engineering 往里走，再回头复习多 Provider、Agent 范式、框架接口和 Tool System，最后重新回答一个更实际的问题：一个 Agent Framework 到底应该稳定什么，又应该把哪些差异关在边界里面。

这一课中途还发生了一次很重要的纠错。我们一度把“Hook 可以插手很多地方”说成了“Harness 可以替 Agent 做多少决定”，很快发现这又把上一课刚刚拆开的 Runtime 职责吞了回来。于是这一课真正留下来的，不只是一些新概念，还有一条很朴素的工程纪律：**一个机制能在哪里发生，不等于它应该拥有那个决定。**

## Harness 不增加模型智力，但会改变有效智能

先想象两个完全相同的模型，它们拥有相同的一百个 Tool，也面对同一个任务：检查一个项目最近的修改，修掉 Bug，验证以后提交 PR。

第一个 Agent 开局得到完整聊天记录、一百个 Tool Schema 和仓库基本信息，后续所有 Tool Result 原样不断塞回 Context。第二个 Agent 没多一个参数、没换一个模型，但 Harness 会先暴露能力领域，在 Agent 表达“我现在需要代码读取和 Git”以后再展开相关 Tool；读取结果太大时保留原始 Artifact，只把当前相关部分投影回来；修改以后自动把 Diff 作为新 Evidence；测试完成以后重新组织测试事实；需要提交 PR 时才披露 GitHub 能力。

第二个 Agent 很可能明显更好用。不是因为模型突然变聪明，而是 Harness 同时改变了三件事：

```text
它看见什么
→ 认知空间

它此刻能选择什么
→ 行动空间

行动以后现实怎样回来
→ Feedback Loop
```

因此我们给 Harness Engineering 留下的第一句不是“给模型外挂更多能力”，而是：

> **Harness 在设计模型与现实之间的工作界面。**

LangChain 近来的 Harness 文章把它描述为连接模型与 Context、Tool、Skill、Environment 的脚手架，并强调 Harness 与任务之间的适配程度会直接改变 Agent 的实际表现；Anthropic 在长任务实验里也反复验证了类似现象：任务拆解、结构化交接、Context Reset、Evaluator 等 Harness 设计，可以在不改变模型权重的情况下显著改变长程任务表现。

这里最值得记住的不是某一家框架的定义，而是一个工程事实：**裸模型能力并不等于最终 Agent 能力。**

## Context Engineering 不是“窗口还能不能塞”

如果一个模型的 Context Window 足够大，三百轮聊天、十几次 Grep、六个完整文件、三次测试日志和当前 Diff 全部装得下，是不是就应该全给它？

我们这一课的答案是否定的。

Context Window 解决的是容量问题，Context Engineering 解决的是认知组织问题。模型能看见的信息越多，不代表它越容易知道什么是当前权威事实、什么已经失效、什么只是中间探索、什么必须保持原文、什么可以压缩、什么应该等需要时再召回。

所以成熟一点的 Context 管理不是简单的 `keep / delete`，而更像：

```text
常驻
压缩
索引
按需召回
临时卸载
```

其中尤其要警惕一种“聪明的压缩”：Harness 看到五千行测试日志以后，把它总结成“主要原因疑似数据库连接超时”。这句话看起来体贴，实际上已经从 Context Projection 滑进了 Root Cause Judgment。

Harness 可以抽取、去重、保留关键片段、挂上 Artifact 引用，也可以让 Agent 随时回钻原始日志；但如果它把事实提前解释成结论，就已经开始替 Agent 思考。

> **Harness 可以决定怎样把事实投影给 Agent，不应该偷偷替 Agent 决定这些事实意味着什么。**

## Progressive Disclosure 的价值不是省 Token

Mira 现在拥有越来越多 Tool。过去很自然的一种做法是：Tool 多于某个阈值以后，用 embedding / rerank 选出 Top N，再把这批 Tool 暴露给 Planner。

这没有错，但这一课让我们重新看见它的局限。如果 Harness 在 Agent 还没表达能力需求以前，就靠一次语义排序决定它“能看见的整个行动世界”，一次 retrieval miss 就可能变成一种更深的认知缺口：Agent 不只是没选中 Browser，而是根本不知道 Browser 存在。

更自然的结构是：

```text
完整能力世界
      ↓
粗粒度 Capability Directory
      ↓
Agent 表达当前能力需求
      ↓
Harness 渐进披露相关 Tool / Skill
      ↓
必要时再在领域内部检索 / 排序
```

这里 Ranking 仍然有价值，但它更像 Progressive Disclosure 里的检索实现，而不是天然拥有“构造 Agent 行动世界”的最高权力。

更重要的是，渐进披露必须允许重新导航。Agent 开局需要代码理解，第六步才发现需要浏览器，这时它应该可以重新发现能力，而不是因为第一轮没被排进 Top 20 就一辈子困在原来的 Tool 子集里。

这也是为什么 Tool Exposure 和 Memory Retrieval 看起来越来越像：它们都在回答同一个 Context Engineering 问题——**这一刻，Agent 应该看见什么？**

## Hooks 是介入点，不是新的权力中心

Harness 通常会提供很多 Hook：`before_model`、`after_model`、`before_tool`、`after_tool`，以及 Context 装配、结果投影前后的扩展点。它们很有用，因为权限校验、参数校验、Workspace 边界、风险元数据、结果截断、Artifact 提取、Trace 都需要稳定的介入位置。

但这一课我们差点在这里学歪。

我们一度问：“Harness 到底应该帮 Agent 做多少决定？”后来发现这本身就是一个坏问题。Hook 能拦住一次 Tool Call，不等于 Harness 就拥有审批权；Middleware 能做 Retry，不等于所有 Retry 都属于 Harness；某个框架把 HITL 写成 Middleware，也不意味着生命周期里的 pause / resume 就因此变成 Harness ownership。

我们专门对照了 LangChain 当前对 Harness、Middleware 与 Runtime 的描述。它的 Harness 口径很宽，很多生产控制都可以通过 Middleware 插进去；但在讨论生产 Runtime 时，又明确把 durable execution、checkpoint、跨进程 pause / resume、长期任务恢复、多租户、可观测性等放在 Harness 下面的 Runtime 层。[《The Runtime Behind Production Deep Agents》](https://www.langchain.com/blog/runtime-behind-production-deep-agents) 与 [《How Middleware Lets You Customize Your Agent Harness》](https://www.langchain.com/blog/how-middleware-lets-you-customize-your-agent-harness) 正好展示了这种“机制可以挂在 Hook 上，但职责仍需要分层理解”的现实。

所以我们仍然坚持上一课更严格的责任图：

```text
Agent
→ 语义决策
→ 为什么做、结果意味着什么、Goal 是否完成

Harness
→ 投影与装备
→ Context / Skill / Tool / Environment / Feedback

Runtime
→ 生命周期与运行合同
→ wait / pause / resume / checkpoint / cancel / cleanup / budget

Policy
→ 人类定义的硬规则

Runtime / Policy Gate
→ 执行 allow / deny / approval
```

一句话仍然好用：

> **Agent 想，Harness 装备，Runtime 让它活着。**

## Environment 不是“给 Shell 就完了”

Harness 的最后一个常被低估的部分是 Environment。

同一个模型和同一套 Tool，如果一个 Agent 身处真实 Repo、可运行测试、Git History、浏览器、网络、Sandbox 和可恢复 Checkpoint，另一个只有一份代码文本，它们完成任务的能力会像两个物种。

但这不意味着权限越大越好。更好的 Environment 通常具备三个性质：

```text
可操作
→ 真的能改、跑、查、验证

可观察
→ 做完以后知道现实发生了什么

可恢复
→ 出错以后可以重试、回滚、换路
```

因此 disposable workspace、受控 Shell、Browser Session、Artifact Store、Checkpoint 这些东西并不是“外围设施”，它们共同塑造了 Agent 能够行动和验证的现实。

## 产品不同，不等于 Agent Core 不同

讨论 Harness 领域化时，我们又碰到一个很容易被产品架构带偏的问题：Mira Desktop、Mobile、Coding、Research、微应用，是不是应该各有一套 Agent Core？

我们的答案很明确：**不应该因为产品属性而变化。**

更合理的是一个稳定的 Agent Core，对应多个实例：

```text
Agent Core
  │
  ├── Coding Instance
  │     + Coding Harness
  │     + Coding Skills
  │     + Repo Environment
  │
  ├── Research Instance
  │     + Research Harness
  │     + Research Skills
  │     + Web Environment
  │
  └── Mobile Instance
        + Mobile Harness
        + Mobile Capabilities
        + Local / Remote Environment
```

这里不一定真的要使用面向对象语言里的 `abstract class`，但架构语义很重要：**领域差异应该尽量表现为 Agent 所处的世界、经验和能力不同，而不是每来一个产品就造一个新的 Agent 物种。**

真正值得讨论第二种 Agent Core 的时刻，是控制语义本身改变了。例如一种 Core 是明确 Goal 驱动的 `plan → act → observe → replan`，另一种却是长期驻留、持续监听事件、没有单次明确 Goal 的 Event-driven 控制模型。这时才值得问：它是同一个 Core 的运行模式，还是另一种控制模型。

## Skill 承载经验，但不能吞掉所有领域知识

既然 Agent Core 稳定，领域知识放哪？我们的默认答案是 Skill。

Skill 最适合承载的是程序性知识：这个领域里事情通常应该怎么做、有哪些 SOP、什么顺序比较可靠、验收时应该看什么。例如 Coding Skill 可以告诉 Agent 先读约束、定位影响面、修改、跑相关测试、检查 Diff，再决定是否需要全量回归。

但不是所有“领域相关的东西”都应该塞进 Skill：

```text
工作方法 / SOP / 程序性经验
→ Skill

权限 / 禁止事项 / 风险硬规则
→ Policy

当前事实
→ Context / Evidence

跨任务历史
→ Memory

能力输入输出语义
→ Tool Contract
```

Skill 的装载方式也应该服从不确定性程度。DAG 场景里，流程设计者已经提前知道这个节点是 `code_review`，核心 Skill 完全可以自动加载；开放式通用 Agent 则更适合 Progressive Disclosure，让 Agent 先表达需求，再由 Harness 装载相关经验。两者甚至可以叠加：DAG 自动加载基础 Review Skill，执行中发现数据库迁移问题以后，再渐进披露 Migration Skill。

> **自动加载不是比渐进披露更先进，只是上游已经替 Agent 消除了一部分不确定性。**

## Provider 抽象最怕“运行时验明正身”

回到 Hello-Agents 第七章 7.2，多 Provider 支持的教学目标很直接：不要让 Framework 绑死某一家模型服务商。

第一次看，这很容易被理解成统一一个 `generate(messages)`。现在再看，我们会把它拆得更细：Provider Abstraction 解决“怎么调用”，Capability Abstraction 解决“这个模型实际能做什么”。Tool Calling、Vision、Structured Output、Reasoning、Context Window、Streaming、System Prompt 支持方式，都不应该靠 Provider 名字硬猜。

更重要的是，Provider 配置应该有明确的实例化机制：

```text
ProviderConfig
      ↓
Provider Registry / Factory
      ↓
Concrete Provider Instance
      ↓
Stable Model Interface
```

OpenAI、Anthropic、火山、OpenAI-compatible、OpenCode 之类的差异，可以在实例化阶段通过强类型配置表达，再由具体 Adapter / Transport 消化。火山的 Endpoint 规则、某些 OpenCode 服务要求附加 Header，都不应该污染 Agent Core。

最糟糕的形态是：对象早已创建完成，业务代码却仍然到处写：

```ts
if (baseURL.startsWith("https://ark...")) {
  // special case
}
```

如果系统在运行阶段还需要不断通过 URL、Header 或字符串特征猜“你到底是谁”，那不是兼容层，只是实例化机制没设计好以后留下的现场勘查。

> **类型应该在实例化时确定，而不是在运行过程中反复推断。**

因此这一课留下的 Provider 原则很简单：Agent Config 要稳定，Provider Config 要类型化，Provider 怪癖要隔离。

## Message 不是 Agent Runtime 的宇宙中心

Hello-Agents 7.3 从 `Message`、`Config`、`Agent` 抽象接口开始。教材里的 `Message` 很适合作为入门：`role + content + metadata`，再转换成 Provider 需要的格式。

但我们继续往下推以后，认为 Framework 的核心协议不应该只追求“所有 Provider 的最小公分母”。如果最后只剩 `role + content + metadata:any`，看起来兼容全世界，实际上 Framework 什么都不理解。

核心协议更应该表达已经稳定下来的公共语义，例如文本、多模态内容、Attachment、Tool Call、Tool Result；真正的厂商特有字段再由 Adapter 或 Extension 承担。

更进一步，我们不认为 Tool Call / Tool Result 应该永远只是 Message 的附属字段。真实的 Agent Run 更像一条事件流：

```text
Run
├── MessageItem
├── ModelCallItem
├── ToolCallItem
├── ToolResultItem
├── ApprovalItem
├── StateItem
├── ArtifactItem
└── CompletionItem
```

`Message` 是交互内容对象，`RunItem / Event` 才更接近运行记录的基础单位。这样异步、Approval、Artifact、Checkpoint、Trace 都不必继续伪装成“聊天消息”。

同样，Agent 本体也不应该等同于一份不断增长的 `_history`。更干净的结构是稳定的 Agent Core、一个配置完成的 Agent Instance，以及每一次具体任务自己的 Run / Session State。

于是 `run()` 也不再只是：

```text
string → string
```

而更接近：

```text
run(input, context) → RunResult
```

结果可能包含 Output、Status、Artifacts、Evidence、Usage、Trace，甚至 Pending Approval。`run()` 是运行合同，不只是聊天函数。

## Tool 最重要的是 Contract，不是 execute()

到了 7.5 Tool System，教材开始实现 Tool 抽象、ToolRegistry、自定义 Tool、Tool Chain 和异步执行。这一部分放回我们前面的责任图以后，边界变得很清楚。

Tool 首先是一份原子能力合同：

```text
Tool Definition
├── id / name
├── description
├── input schema
├── output contract
├── capability metadata
└── intrinsic side-effect metadata
```

Tool 自己应该声明“我接受什么、执行什么、成功意味着什么、会产生什么内在副作用”，但它不应该决定这一次允不允许执行、要不要审批、当前 Workspace 能不能碰、Retry Budget 有多少。这些仍然属于 Runtime / Policy 的运行合同。

Registry 也应该保持克制：

```text
register
resolve
discover
list / query
expose metadata
```

它是能力目录，不是顺手把 Policy、Retry、Context、Goal Completion 全吞进去的执行大总管。

## ToolResult 必须是强类型结果，不是一段字符串

如果所有 Tool 都统一返回 `str`，短期很省事，长期会把 Error、Partial、Artifact、Warning、异步状态和结构化 Evidence 全揉成一段文字。之后每一层再从字符串里猜发生了什么，那不是协议，是考古。

我们更倾向：

```text
ToolResult<TPayload>
├── status
│   ├── success
│   ├── partial
│   └── failure
├── payload: TPayload
├── summary?
├── error?
├── warnings?
├── artifacts?
└── metadata?
```

也就是：

> **稳定 Envelope + Typed Domain Payload。**

其中 `status` 必须绑定 Tool 自己声明的 Contract，而不是绑定用户全局 Goal。`write_file` 返回 success，只能证明文件写成功；它不能顺便证明 Bug 已经修好。

因此这一课再次确认了上一课那组必须拆开的“成功”：

```text
Tool Success
≠ Evidence Sufficient
≠ Goal Complete
≠ Run Completed
```

Tool 报告自己的事实，Agent 解释这些事实对 Goal 意味着什么，Runtime 最后确认生命周期是否真的可以安全结束。

## Tool Chain 一旦拥有控制流，就已经是 Workflow

教材里的 Tool Chain 用来表达能力组合，这个思想没有问题，但成熟系统里还需要继续划线。

像：

```text
decode_base64
→ unzip
→ parse_json
```

如果输入输出确定、没有复杂业务状态、任何一步失败就整体失败，它仍然可以包装成一个薄的组合 Tool。

但如果是：

```text
修改代码
→ 跑测试
→ 失败则分析
→ 再修改
→ 重新测试
→ 验收
→ 创建 PR
```

它已经在表达依赖、分支、中间状态、失败恢复、审批与完成条件。这不是 Tool Chain，而是 Workflow / DAG。

把这种东西硬塞进一个 `fix_bug()` 巨型 Tool，表面上少了几个 Tool Call，实际上只是把 Planning、Runtime、Verification 全部藏进一个黑箱。前面辛苦拆开的边界，一刀又粘回去了。

> **组合能力不等于工作流编排。**

## async function 和异步任务不是一回事

第七章最后一个容易混淆的词是 Async。

`await tool.execute()` 只是一种编程模型。Runtime 仍然知道调用什么时候开始、什么时候结束、结果是什么，当前 Run 也仍然明确拥有这次执行。

真正复杂的是长期异步任务：

```text
start_ci()
→ submitted
→ running
→ passed / failed / cancelled
```

这里 `start_ci` 返回 success，只能说明“提交 CI”这个 Tool Contract 成功，不能提前宣称 CI Passed。真正的 Settlement 可能发生在几分钟以后。

此时 Runtime 才需要根据任务长度和生命周期决定：短任务继续等待；较长任务 pause，等外部事件回来以后 resume；真正独立的长期任务则显式转成 Job / Watch，而不是从当前 Run 里偷偷掉出去。

所以我们把异步原则继续压成上一课那句话：

> **可以异步，但不能偷偷脱离生命周期。**

## 第七章学完以后，真正留下的不是一堆类名

回头看这一章，我们复习了多 Provider 和经典 Agent 范式，也真正拆了 Framework Interface 与 Tool System。最后得到的不是“一个 HelloAgents 应该有哪些 Python 类”，而是一套相对稳定的责任地图：

```text
User Goal
   │
   ▼
Agent Core
- Goal understanding
- Planning / Replanning
- Semantic decisions
- Evidence interpretation
- Completion judgment
   │
   ▼
Agent Harness
- Context projection
- Capability disclosure
- Skill loading
- Feedback projection
- Environment projection
- Hooks / Middleware
   │
   ▼
Agent Runtime
- Run lifecycle
- State / Checkpoint
- Pause / Resume
- Cancellation / Cleanup
- Resource budgets
- Policy execution
   │
   ▼
Capability Layer
- Tool
- MCP
- Workflow / DAG
- SubAgent service
   │
   ▼
Environment
- Filesystem
- Browser
- OS
- Network
- External services
```

Protocol 横穿整个结构；Provider Adapter 把模型服务商的差异关在模型边界；Skill 负责可复用的程序性经验；Memory 则仍然留下一个更大的问题，等下一章继续拆。

这一课最值得带走的，也许不是哪一个模块应该叫什么，而是以后遇到一个新设计时，先问四句话：

```text
这是谁的职责？
这个决定是谁做的？
这个状态属于谁？
这里是不是越权了？
```

框架不是把所有能力塞进一个越来越胖的 `Agent` 类。好的抽象也不是把所有差异抹成 `metadata:any`。它真正要做的是：**让稳定的语义保持稳定，让不可避免的差异待在它应该待的地方。**

到这里，Hello-Agents 第七章可以正式收掉。

下一站是第八章《记忆与检索》。我们已经提前讨论过很多次 Memory，也已经知道一句很重要的话：`Memory is prior, not proof`。但真正进入记忆系统以后，问题会更麻烦：什么值得长期保存？记忆与 Context 到底怎么分？检索出来的东西凭什么被相信？RAG 是 Memory，还是只是另一种外部知识能力？

下一课，从这里开始。
