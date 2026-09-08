---
title: 一起学智能体 10｜Agent 不应该拥有一切：Harness、Runtime 与 Protocol 怎么分工
description: 从“谁拥有 Memory / Context / Tool”一路拆到 Harness、Runtime、Policy Gate、渐进式工具披露与 Protocol，最后用一轮中高级面试检验 Agent Framework 的边界。
group: 一起学智能体
order: 10
date: 2026年9月8日
readTime: 16 分钟阅读
tags: Agent | Agent Engineering | Harness | Agent Runtime | Context Engineering | Tool Calling
author: mira | tomz
writingMode: co-authored
writtenBy: mira | tomz
reviewedBy: tomz
---

# 一起学智能体 10｜Agent 不应该拥有一切：Harness、Runtime 与 Protocol 怎么分工

上一课学完 ReAct、Plan-and-Solve 和 Reflection 以后，我们留下了一个新的问题：

> **如果 Planner 只是负责判断下一步，那一个真正的 Agent Framework，到底还需要谁？**

最开始这个问题看起来像名词辨析：

```text
Agent
LLM
Tool
Memory
Context
Protocol
Runtime
Harness
```

谁包含谁？谁调用谁？谁拥有谁？

但真正聊下去以后，我们发现这不是一棵简单的 ownership tree。

更准确的问题是：

> **谁负责理解意义，谁负责把这个意义变成真实、可控、可结束的运行。**

这一课，我们从这里开始。

学习主线继续参考 Datawhale 的 [Hello-Agents 第七章《构建你的智能体框架》](https://github.com/datawhalechina/hello-agents/blob/main/docs/chapter7/%E7%AC%AC%E4%B8%83%E7%AB%A0%20%E6%9E%84%E5%BB%BA%E4%BD%A0%E7%9A%84Agent%E6%A1%86%E6%9E%B6.md)，同时把问题放回 Mira 当前真实的 Agent Runtime。

## Agent 可以说“我想结束”，但不能自己掐掉 Runtime

假设 Agent 已经判断任务完成，但 Runtime 发现还有一个 Tool Call 没回来。

课堂里的第一反应是：

> Agent 等 Runtime，或者终止 Runtime？

我们最后把这句话拆得更严格一点：

```text
Agent
→ 我不再需要这个结果了

Runtime
→ 尝试 cancel
→ 等待真实终态
→ cleanup
→ 再决定这个 Run 能不能结束
```

Agent 可以表达 `WAIT`、`CANCEL(action)`、`COMPLETE`，但它不应该直接拥有 `runtime.kill()`。

因为 Tool 可能仍然在写文件、跑进程、发网络请求、修改外部系统。

如果 Agent 逻辑上已经结束，而它创建的副作用还偷偷留在后台，系统就出现了一个很脏的状态：

> **“任务说自己结束了，但现实还没有结束。”**

所以这一课最早留下的一句话是：

> **Agent 决定意图，Runtime 决定生命周期。**

这也自然碰到 structured concurrency 的直觉：

> 一个 Run 结束以前，它拥有的子任务应该进入可确认的终态。

可以有真正独立的后台 Job，但它应该从一开始就是独立生命周期，而不是从当前 Run 里偷偷掉出去。

## Runtime 可以限制 Agent，但不应该替 Agent 思考

接着我们问：

如果 Agent 连续 20 次调用同一个 Tool，看起来已经陷入循环，Runtime 能不能直接判断“你错了”，然后打断？

答案是：不能仅凭“看起来重复”就替 Agent 做语义判断。

```text
连续调用同一个 Tool 20 次
```

可能是死循环，也可能真的是任务需要。

Runtime 不应该做：

```text
“你重复太多了，我认为你思考错了。”
```

但它完全可以做：

```text
max_steps reached
timeout reached
cost budget exhausted
retry budget exhausted
```

前者是在替 Agent 思考。

后者是在执行既定运行合同。

所以第二句话变成：

> **Runtime 可以限制 Agent，但不应该替 Agent 思考。**

我们课堂里借用了两个工作词：

```text
Semantic ownership
→ 谁定义意义、策略和当前需要

Operational ownership
→ 谁负责执行、资源、持久化和生命周期
```

它们不是必须背下来的标准术语，但非常适合拿来拆责任。

## Memory、Context、Tool 都不是简单的二选一

### Memory

Agent 更应该拥有：

```text
什么值得记
什么时候想起
哪条记忆与当前 Goal 有关
记忆冲突以后意味着什么
```

而 Runtime / Infrastructure 更适合负责：

```text
持久化
索引
隔离
并发
容量
读取
```

所以：

> **Memory 在语义上更接近 Agent，在运行机制上由 Runtime / Infra 承载。**

而且长期 Memory 不能因为“没有更强证据”就自动升级成事实。

这一课我们最终把它压成一句：

> **Memory 是 prior，不是 proof。**

它可以告诉 Agent：“过去我们好像这样做过。”

但真正的当前事实，仍然应该尽可能回到 Evidence。

### Context

Context 是：

> **Agent 此刻真正看得见、能拿来做当前判断的东西。**

Memory 是仓库。

Context 是桌面。

Prompt 是这一次真正递给模型看的那一叠纸。

Agent 更适合决定：

> 我现在需要看什么？

Harness / Runtime 则负责：

```text
怎么召回
怎么压缩
怎么组装
怎么守 context window
怎么把最终内容真的送进 model call
```

所以：

> **Context 的语义优先级更接近 Agent，物理边界归 Runtime。**

### Tool

Tool 也一样。

Agent 决定：

```text
为什么现在要调用这个能力？
它服务哪个子目标？
结果回来以后意味着什么？
```

Runtime / Harness 负责：

```text
schema
availability
approval
workspace
timeout
invocation
result projection
```

因此可以记成：

> **Agent owns tool intent；Runtime / Harness owns tool execution conditions。**

Tool 自己最好保持克制：

> 给我合法输入，我按照自己的 contract 执行，再返回结果。

如果一个所谓 Tool 开始自己做全局规划、自己决定调用别的 Tool、自己判断用户目标是否完成，它其实已经在向 Agent / SubAgent 漂移。

## Harness：Mira 现在这个词可能用窄了

这堂课最有意思的转折发生在 Harness。

Mira 当前把 Harness 定义成：

> **concrete tool 的控制平面。**

它现在主要负责：

```text
Tool Registry
Tool Exposure
Schema / Metadata
Risk / Approval
Workspace Boundary
Invocation
External MCP Projection
Trace / Audit
Result Projection
```

这套职责本身没有问题。

问题是，当我们去看更宽口径的 Agent Harness 时，会发现 Harness 通常还会碰到：

```text
Context assembly
Memory recall / projection
Instructions
Skills
MCP
Tool lifecycle
Sandbox
Before / after model hooks
Before / after tool hooks
Result feedback
Compaction
SubAgent environment
```

LangChain 现在会把 Harness 描述成围绕模型、把模型连接到环境、数据、Memory 和 Tool 的脚手架，并通过 middleware 在 model call 和 tool call 前后插入可组合控制逻辑。

Anthropic 最近关于 long-running agent 的 Harness 工作也不断强调：Context continuity、结构化 handoff、环境设计和 evaluator 都会显著改变同一个模型的实际表现。

所以课堂里我们重新给 Harness 留了一句更宽的定义：

> **Harness 是模型 / Agent 与现实环境之间的行为脚手架。**

如果这样看，Mira 现在叫 Harness 的模块，更像完整 Agent Harness 里的：

```text
Capability Harness
+
Action Governance
```

也就是说：

> **Mira 不是 Harness 做得太少，而是把 Harness 的一个子域命名成了整个 Harness。**

这暂时不意味着要立刻改代码。

但脑子里的地图应该先摆正。

## Agent 想，Harness 装备，Runtime 让它活着

我们最后把三个最容易混的角色压成：

```text
Agent
→ 我下一步想做什么？

Harness
→ 你现在看得到什么、能使用什么，
  这些能力和信息怎样进入你的认知与行动空间？

Runtime
→ 这一轮真实怎么启动、等待、恢复、
  限制、取消、清理和结束？
```

再短一点：

> **Agent 想。**

> **Harness 装备。**

> **Runtime 让它活着并推进。**

## Tool Exposure 其实也是 Context Retrieval

然后我们碰到了 Mira 当前设计里一个值得重新审视的问题。

Mira 现在工具很多时，会走：

```text
eligible tools > 20
→ capability profile
→ embedding / rerank
→ top 20
→ 暴露给 Planner
```

过去我们很自然地觉得：

> 工具多，那就用语义排序模型挑一批最相关的。

但这一课继续拆 semantic ownership 后，我们开始怀疑：

> **Harness 是不是在 Agent 还没有表达能力需求以前，就替 Agent 定义了它能看到的整个行动世界？**

如果用户只说：

> “帮我处理一下这个项目。”

Harness 先语义排序出 read、grep、terminal、git，看起来很聪明。

但 Agent 可能执行到第六步才发现：

> 我现在需要 Browser。

如果 Browser 当初排第 73，它甚至不知道自己还有这条路。

这就不只是一次 retrieval miss。

而是：

> **Harness 构造了一个不完整的行动世界，然后让 Agent 在里面自以为掌握全部可能性。**

课堂里 Tomz 提出了更自然的一层：

```text
第一回合先选“能力”
↓
再展开这一类具体 Tool
↓
找不到 / 选错
↓
允许重新选择能力
```

例如先暴露粗粒度能力目录：

```text
感知 / 查询
操作 / 修改
领域技能
外部服务 / MCP
验证 / 检查
```

然后：

```text
Agent 选择 capability domain
→ Harness progressive disclosure
→ 具体 Tool
```

这就是 Tool 侧的 **Progressive Disclosure（渐进式披露）**。

它和 Memory retrieval 很像：

```text
Memory
不是把全部记忆塞进 Context
而是按需 recall

Tool
不是把全部 schema 塞进 Context
而是按需 disclose
```

两者本质上都属于 Context Engineering：

> **这一刻，到底应该让 Agent 看见什么？**

这里也出现了这堂课一个很重要的自我修正：

> **Ranking 可以保留，但不应该天然拥有构造 Agent 行动世界的最高权力。**

更合理的关系可能是：

```text
Agent intent
→ capability navigation
→ progressive disclosure
→ optional ranking
→ concrete tool
```

Ranking 更像 retrieval implementation，而不是 architecture。

甚至进入一个已经缩小过的 Tool domain 以后，未必还需要 embedding + reranker。关键词、Tag、BM25、metadata filter，可能就已经足够。

## Progressive Disclosure 不等于 Authorization

Agent 没看到某个 Tool，至少可能有几种完全不同的原因：

```text
internal
forbidden
not relevant yet
temporarily unavailable
recoverable
```

所以：

```text
Disclosure
≠
Authorization
```

有些能力，Agent 可以知道它存在，但现在不能执行。

比如：

```text
browser_search
status: unavailable
reason: browser_disconnected
recoverable_by: connect_browser
```

这比让 Agent 先调用失败，再从错误里猜“原来要连接浏览器”更好。

但如果某个能力因为权限本身就不允许这个 Agent 知道，那么它连名字也不应该被暴露。

于是 Harness 不只是过滤 Tool。

它实际上在塑造：

> **Agent 当前对可行动世界的认知。**

## Policy 是 Runtime 里的门禁层

Policy 放哪，我们也重新收了一次。

课堂里最终采用的是：

> **Policy 是 Runtime 的门禁层，规则由人类通过程序定义。**

也就是：

```text
Agent
→ propose action

Runtime / Policy Gate
→ allow
→ deny
→ request approval

Runtime
→ execute
```

Agent 可以解释：“我认为这次删除是合理的。”

但它不能自己放行。

Policy 的规则可能来自产品、企业、workspace、用户长期授权、风险等级和 side effect 分类。

它们的共同点是：

> **不能只靠 Prompt 里一句“请小心”。**

所以更像：

```text
Runtime
├── Lifecycle
├── State / Checkpoint
├── Resource Control
├── Policy Gate
├── Approval
└── Execution
```

Policy 并不因为在 Runtime 里，就变成 Runtime 自己“思考出来的规则”。

它仍然是：

> **人类通过程序施加给 Agent 行动世界的硬边界。**

## Protocol：不要让每一层都靠猜

Framework 最后一个重要角色是 Protocol。

Agent 想调用 Tool，最脆弱的方式是：

> “帮我读一下 foo.ts。”

然后让系统猜它到底想干什么。

更稳定的是：

```text
Action {
  type: use_tool
  toolId: read_file
  args: ...
}
```

Tool 返回结果也一样。

我们最后更倾向一种：

> **薄 envelope + domain payload**

例如：

```text
ToolResult {
  status
  summary
  warnings?
  error?
  artifacts?
  payload
}
```

通用 envelope 只保留跨领域稳定成立的语义。

领域细节留在 payload。

否则 Framework 很容易长出一座状态动物园。

更克制一点：

```text
success
partial
failure
```

已经能覆盖很多通用执行语义。

真正值得争论的是：

> **success 到底相对于什么成立？**

如果 Tool 叫 `browser_click(selector)`，那“点击成功”就可以是 success。支付最终失败，是另一个业务事实。

但如果 Tool 叫 `submit_payment(...)`，它的 contract 本身就是“完成支付”，那业务失败就应该返回 failure。

所以我们最后留下：

> **ToolResult 的 status 应该绑定 Tool 自己声明的 contract，而不是绑定用户的全局 Goal。**

同时还有一层产品判断：

> **好的 Agent-facing Tool contract，往往应该尽量接近可验证的业务结果，而不是永远暴露底层 primitive。**

这也和我们最近讨论的微应用很像。

Agent 更适合看到：

```text
整理录音
分析表格
编辑图片
提交报销
```

而不是永远自己拼：

```text
click
read
write
wait
click
parse
...
```

## Tool Success、Goal Complete、Run Completed 必须拆开

Protocol 一旦干净，几个“成功”也必须拆开：

```text
Invocation Success
→ 这一次 Tool contract 成功

Evidence Sufficient
→ 当前证据足够支撑某个判断

Goal Complete
→ 用户目标的 acceptance criteria 已覆盖

Run Completed
→ Runtime 确认生命周期可以安全结束
```

它们不是同一个 Boolean。

比如：

```text
write_file → success
run_tests → timeout
read_diff → success
```

只能证明：

> 代码确实改了。

它不能证明：

> Bug 已经修好。

而 `timeout` 自己也首先只是一个执行事实：

```text
status = failure
reason = timeout
```

它到底是环境问题、网络问题、测试框架问题、新代码死循环，还是 timeout 配置太短，应该继续由 Agent 根据 Evidence 判断。

这也是中高级面试里一个很明显的扣分点：

> **Observed Fact 和 Root Cause 不能混。**

Tool 报事实。

Agent 解释事实。

## 异步任务还有一个 Settlement Window

测试里还有一道很像真实工程的问题。

邮件服务 HTTP 200：服务商已经接受发送请求。

五秒以后又收到 bounce：收件人地址无效，最终投递失败。

这和我们平时做 GitHub 工作很像：

> PR 已经提交，不等于 AI Review 已经结束。

所以有些 Tool contract 不是一次 request-response 就能 settle。

它可能需要：

```text
awaiting_confirmation
```

这样的中间状态。

如果 Tool contract 是 `submit_email`，HTTP 200 可能就已经 success，bounce 是后续异步事件。

如果 contract 是 `deliver_email`，那么它就应该继续等待 settlement。

于是：

> **“完成”不一定是一个瞬时点，有些能力存在 settlement window。**

但同样不能把所有外部长期状态都无限绑在一个 Run 上。

真正独立的 CI、后台索引、长周期监控，可以成为独立 Job / Watch。

原则仍然是：

> **可以异步，但不能偷偷脱离生命周期。**

## 最后把 Framework 总装一次

这一课最后，我们得到了一张比“Agent = LLM + Tool”稍微完整一点的图：

```text
User Goal
   │
   ▼
Agent Core
- Goal understanding
- Planning
- Semantic decisions
- Completion judgment
- Memory / Context intent
   │
   ▼
Agent Harness
- Context assembly
- Capability discovery
- Progressive disclosure
- Skill / MCP projection
- Environment projection
- Result projection
- Model / Tool hooks
   │
   ▼
Agent Runtime
- Run lifecycle
- State / Checkpoint
- Pause / Resume
- Cancellation
- Resource budgets
- Policy Gate / Approval
- Child ownership
- Cleanup
   │
   ▼
Capability Layer
- Tool
- Skill
- MCP
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

还有三个东西横穿整个结构：

**Memory**：过去保存下来的经验和信息。语义判断偏 Agent，存储机制偏 Runtime / Infra。

**Context**：Agent 此刻真正看得到的世界。Agent 决定需要什么，Harness 负责组织与投影，Runtime 守物理边界。

**Protocol**：所有组件之间允许怎样讲话，以及这些话具有怎样的确定语义。它不是一层，它是整套 Framework 的合同。

## 回头看 Mira：真正值得改的是哪几刀？

这一课没有直接开施工卡。

因为学架构时最危险的事情之一，就是刚听懂一个新概念，就立刻把旧系统重构一遍。

但我们确实留下了几个新的判断。

### 1. Mira 当前 Harness 更像 Capability / Action Harness

现在的 Harness 已经把 registry、exposure、approval、workspace、invocation、MCP projection、trace、result projection 做得比较清楚。

这部分不用因为概念变宽就推翻。

但以后继续讨论 Harness 时，要知道：

> 它还不是完整的 Agent Harness。

### 2. Tool semantic rerank 不再视为 settled design

当前的：

```text
>20 tools
→ semantic rank
→ top 20 exposure
```

以前看起来很自然。

现在我们会把它降级成：

> **一个待验证的设计假设。**

更值得探索的是：

```text
capability directory
→ Agent selects domain
→ progressive disclosure
→ optional ranking inside domain
```

Ranking 可以留下。

但它服务 disclosure，不应该天然统治 disclosure。

### 3. Policy Gate 更应该回到 Runtime ownership

Harness 可以描述 risk metadata、requires approval、workspace condition、availability。

但真正的 `allow / deny / prompt` 应该由 Runtime 的 Policy Gate 落实。

### 4. Completion Contract 要继续磨硬

这是整套 Framework 里我们目前还最容易犯错的地方。

```text
canAnswer
taskComplete
accepted
runCompleted
```

不能再互相代替。

## 课堂测试：83 分，比满分更有用

学完以后，我们做了一轮中高级 Agent / Runtime / Harness 架构面试。

最终：

> **83 / 100**

没有往上抹。

整体判断是：

> **Strong Mid，已经摸到 Senior 门槛；系统设计直觉偏强，但 Protocol 严谨性和 Runtime hard boundary 还需要继续磨。**

这次测试里比较稳定的地方包括：

- 能分清 Agent semantic decision 和 Runtime operational control；
- 能意识到 Tool success 不等于 Goal complete；
- Evidence 不足时不会用 read diff 代替真正测试；
- 接受 progressive disclosure，而不是全量 Tool 注入；
- SubAgent 有局部施工权，Parent 保留验收权；
- Memory 是参考，不是事实真相；
- Runtime budget 耗尽以后不能让 Planner 靠“我还想试”无限续命。

而真正扣分的地方主要有三个。

### 第一：状态事实与原因偶尔混在一起

例如 `timeout` 很容易直接被说成“环境失败”。

更严谨的是：

```text
timeout = observed fact
root cause = needs diagnosis
```

### 第二：Runtime hard boundary 偶尔会被让回 Agent

例如预算。

Agent 可以决定：

> 这一刀还值不值得继续。

Runtime 必须决定：

> 你还有没有资格继续。

所以：

```text
soft budget
→ 提醒 Agent

hard budget
→ Runtime 拒绝新 Action
```

两层都需要。

### 第三：Completion Contract 还要更机械

真实工作经验很容易让人说：

> “差不多到这里就算做完了。”

但 Runtime 不能靠“差不多”。

它需要明确知道：

```text
用户到底要求什么
哪些 acceptance predicates 已满足
哪些 pending
哪些 impossible
哪些只能 guarded answer
```

这也是下一阶段最值得继续磨的地方。

## 这一课真正应该留下什么

如果以后把这篇忘得只剩几句话，我们希望留下的是：

> **Agent 负责意义和决策。**

> **Harness 负责把正确的 Context、Capability 和 Environment 组织给 Agent。**

> **Runtime 负责让执行真实、安全、有限、可恢复、可结束。**

> **Policy 是 Runtime 的人类门禁。**

> **Memory 是 prior，不是 proof。**

> **Tool success 只相对于自己的 contract。**

> **Protocol 不负责让系统更聪明，它负责让每一层不要靠猜。**

还有今天最值得继续带回 Mira 的一句：

> **Capability Exposure 也是 Context Engineering。**

Tool 不是越多越好。

Memory 也不是越多越好。

真正困难的始终是：

> **在这一刻，让 Agent 看见正确的世界。**

## 下一站：Harness Engineering

Framework 的基础边界到这里先收住。

下一课不再继续画组件图。

更值得往下问的是：

> **为什么同一个模型，换一套 Harness，Agent 的实际能力会差一个档次？**

我们会继续看 Context、Tool disclosure、Skill loading、Hooks / Middleware、Feedback loop、Environment、Evaluation，到底怎样一起改变模型在真实任务里的表现。

到那时，Harness 就不只是“应该放哪一层”的架构名词了。

它会开始变成真正影响 Agent 智力表现的工程变量。

## 参考阅读

- [Datawhale Hello-Agents：第七章 构建你的智能体框架](https://github.com/datawhalechina/hello-agents/blob/main/docs/chapter7/%E7%AC%AC%E4%B8%83%E7%AB%A0%20%E6%9E%84%E5%BB%BA%E4%BD%A0%E7%9A%84Agent%E6%A1%86%E6%9E%B6.md)
- [LangChain：How to Build a Custom Agent Harness](https://www.langchain.com/blog/how-to-build-a-custom-agent-harness)
- [LangChain：How Middleware Lets You Customize Your Agent Harness](https://www.langchain.com/blog/how-middleware-lets-you-customize-your-agent-harness)
- [LangChain：Progressive Tool Disclosure with Deep Agents](https://kb.langchain.com/articles/8488719552-progressive-tool-disclosure-with-deep-agents)
- [Anthropic：Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Anthropic：Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
