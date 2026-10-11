---
title: "800 个 MCP Server 之后：Agent 的下一层不是更多工具，而是治理"
description: Uber 已经把 800+ MCP Server、5000+ tools 放进同一套 Gateway。真正值得读的不是数量，而是它如何把发现、登记、暴露、授权与执行拆成不同层次。把它与 Pi、Microsoft Execution Containers 和 Mira 最近的工具研究放在一起看，MCP 正在从“连接协议”变成一条能力供应链。
group: 见π
order: 5
issue: 5
date: 2026年10月11日
readTime: 12 分钟阅读
lead: 5000 个工具听起来像能力爆炸。真正让人警醒的却是另一件事：Uber 没有把它们全部交给模型。工具先被发现，再默认关闭；由 owner 审核后启用；运行时按需搜索；权限、脱敏和可观测性由 Gateway 统一处理。规模把一个“接工具”的问题，逼成了治理问题。
tags:
  - Agent
  - MCP
  - Tool
  - 工具治理
  - Uber
  - Mira
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

<a id="top"></a>

# 800 个 MCP Server 之后：Agent 的下一层不是更多工具，而是治理

Uber Engineering 最近公布了一组很容易让人停下来的数字：

**800+ MCP Server，5000+ tools。**

如果只把它当成一条 AI 基础设施新闻，最自然的反应可能是：Uber 已经把这么多内部系统都接给 Agent 了。

但把文章真正读完，最值得注意的恰恰相反。

**Uber 并没有把 5000 个工具直接交给模型。**

它花了大量工程，把“系统里存在某种能力”和“某个 Agent 此刻能够看见、能够调用这种能力”拆成不同的事情。

这篇文章真正展示的，不是 MCP 有多能接，而是当 MCP 开始进入生产规模以后，**连接本身反而变成最不难的那一层。**

真正困难的，是治理。

<a id="jump"></a>

**快速跳转：** [800 / 5000 到底意味着什么](#scale) · [Registry 与 Gateway](#registry) · [发现 ≠ 暴露](#exposure) · [Omni MCP / Code Mode](#runtime-discovery) · [可见性 ≠ 权限](#authority) · [Pi 与 MXC 对照](#comparison) · [Mira 应该学什么](#mira) · [不要照抄 Uber](#limits)

::: html
<figure style="margin:2rem 0 2.4rem" aria-label="MCP 能力从发现到执行的治理链">
  <svg viewBox="0 0 980 360" width="100%" role="img" style="display:block">
    <text x="32" y="34" fill="currentColor" opacity=".5" font-size="12" letter-spacing="2">FROM CONNECTION TO GOVERNANCE</text>

    <g fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="32" y="88" width="126" height="82" rx="18" opacity=".28"/>
      <rect x="176" y="88" width="126" height="82" rx="18" opacity=".34"/>
      <rect x="320" y="88" width="126" height="82" rx="18" opacity=".40"/>
      <rect x="464" y="88" width="126" height="82" rx="18" opacity=".48"/>
      <rect x="608" y="88" width="126" height="82" rx="18" opacity=".56"/>
      <rect x="752" y="88" width="126" height="82" rx="18" opacity=".66"/>
    </g>

    <g fill="currentColor" font-size="15" font-weight="700">
      <text x="95" y="122" text-anchor="middle">DISCOVER</text>
      <text x="239" y="122" text-anchor="middle">REGISTER</text>
      <text x="383" y="122" text-anchor="middle">ENABLE</text>
      <text x="527" y="122" text-anchor="middle">DISCLOSE</text>
      <text x="671" y="122" text-anchor="middle">AUTHORIZE</text>
      <text x="815" y="122" text-anchor="middle">EXECUTE</text>
    </g>

    <g fill="currentColor" opacity=".5" font-size="11">
      <text x="95" y="147" text-anchor="middle">AutoCrawler</text>
      <text x="239" y="147" text-anchor="middle">Registry</text>
      <text x="383" y="147" text-anchor="middle">owner review</text>
      <text x="527" y="147" text-anchor="middle">Omni / Code Mode</text>
      <text x="671" y="147" text-anchor="middle">policy / redaction</text>
      <text x="815" y="147" text-anchor="middle">Proxy Gateway</text>
    </g>

    <path d="M158 129 L176 129 M302 129 L320 129 M446 129 L464 129 M590 129 L608 129 M734 129 L752 129" stroke="currentColor" stroke-width="2" opacity=".28"/>

    <text x="455" y="232" text-anchor="middle" fill="currentColor" font-size="17" font-weight="700">registered ≠ available ≠ visible ≠ authorized ≠ executable</text>
    <text x="455" y="264" text-anchor="middle" fill="currentColor" opacity=".58" font-size="13">MCP 规模化以后，真正需要建设的是状态之间的秩序。</text>

    <path d="M84 307 L856 307" stroke="currentColor" stroke-width="1" opacity=".12"/>
    <text x="84" y="332" fill="currentColor" opacity=".5" font-size="12">目录越大</text>
    <text x="856" y="332" text-anchor="end" fill="currentColor" opacity=".5" font-size="12">Agent-facing surface 越应该克制</text>
  </svg>
  <figcaption style="margin-top:.55rem;font-size:.84rem;opacity:.58">见π编辑示意：Uber 的 MCP Gateway 让“能力存在”与“Agent 能执行”之间出现了完整治理链。示意图用于帮助阅读，并非 Uber 官方架构图。</figcaption>
</figure>
:::

<a id="scale"></a>

## 一、800 个 Server，不等于 800 个都塞进上下文

Uber 的起点并不神秘。

公司内部本来就有大量 HTTP、gRPC、TChannel API。早期各团队自己把服务接成 MCP，很快出现了典型的平台化前夜症状：重复建设、工具难发现、运行方式不一致、安全和可观测性没有统一保证。

于是 Uber 建了 MCP Gateway。

官方披露，这套平台目前承载 **800+ MCP Server、5000+ tools**。这不是说每个 Agent 每次请求都会背着 5000 份 schema，而是说明 Registry 里已经存在一个非常大的能力目录。

这里最值得先分清的一件事是：

> **能力目录的规模，不等于模型当前认知面的规模。**

一个公司可以拥有 5000 个可治理工具，但一个 Agent 当前真正需要知道的，也许只有 3 个。

这就是整篇文章后面所有设计的起点。

[↑ 返回快速跳转](#jump)

<a id="registry"></a>

## 二、Registry 是控制面，Gateway 是数据面

Uber 把系统拆成两个核心组件：

**MCP Registry** 是 control plane。

它负责能力目录、ownership、配置与 enablement。无论是从现有 API 自动生成的 MCP tool，还是原生 MCP Server，最后都进入这里，成为统一的能力事实源。

**Proxy Gateway** 是 data plane。

它负责真实运行时执行：接收 MCP 调用，把请求转成 HTTP、gRPC 或 TChannel，调用后端服务，再把结果转回 MCP。

这看起来像一个经典的基础设施分层，却解决了 Agent 系统里一个经常被忽略的问题：

**“知道某种能力存在”和“真的把它执行掉”，不应该是同一件事。**

如果 Registry 和 Runtime 被糊成一层，一个工具只要“接上了”，就很容易被误解成“现在可用、应该暴露、当前有权调用”。

Uber 的做法是先把这些状态拆开。

这和 Mira 最近一直在追的那条线其实非常接近：

**registered ≠ available ≠ Agent-visible ≠ authorized。**

[↑ 返回快速跳转](#jump)

<a id="exposure"></a>

## 三、“发现不等于暴露”，是整篇最重要的原则

Uber 的 AutoCrawler 会扫描内部 IDL 和服务信号，自动发现 API、生成或获取 tool definition，再注册到 MCP Registry。

如果平台只做到这里，它其实已经很强了。

但 Uber 又多做了一件关键的事：

**新发现的 MCP Server 和 tool 默认 disabled。**

官方甚至把原则写得很直白：

**discovery doesn’t imply exposure。**

能力可以被系统发现，却不会因此自动进入 Agent 世界。

每个 Server 和 tool 都需要 owning team review 后明确 enable；工具描述发生变化时，会生成 config diff，由 owner 批准，必要时还可以回滚。

这意味着一条能力进入生产 Agent 体系，至少经历：

**发现 → 登记 → owner → review → enable → runtime**

这已经很像软件供应链，而不是“装一个插件”。

更重要的是，它把四个常被混在一起的问题强行拆开：

1. 系统知不知道这个能力存在？
2. 这个能力现在健康、配置完整、真的可用吗？
3. 当前 Agent 是否应该看到它？
4. 当前身份是否真的有权执行它？

四个答案完全可以不同。

一个 Tool 可以注册了，但当前 unavailable；可以 available，但不该暴露给这个 Agent；也可以模型知道它存在，但当前身份没有执行权限。

**连接成功，只是起点。**

[↑ 返回快速跳转](#jump)

<a id="runtime-discovery"></a>

## 四、5000 个工具，把 Progressive Disclosure 逼成了必需品

即使 ownership 和 enablement 都治理好了，还有一个很朴素的问题：

**上下文装不下。**

MCP 本身没有跨 Server 的全局搜索语义。传统路径要求 Agent 先知道要连接哪个 Server，再获得这个 Server 的 tool list。

当 Server 从 5 个变成 800 个，这种方式当然会开始崩。

Uber 给出两条运行时路径。

### Omni MCP：先发现，再逐层展开

Omni MCP 是一个统一代理入口。

它不会把全部工具 schema 直接声明给模型，而是先提供少量元能力，例如：

- discover_server
- discover_tools
- get_tool_schema
- invoke_tool

Agent 先根据意图寻找相关 Server，再找 Tool，再加载 schema，最后才调用。

这就是一种非常典型的 **Progressive Disclosure / Progressive Resolution**：

**目录很大，但认知面逐步缩小。**

### Code Mode：让 Agent 用工具去找工具

Uber 还给 coding agent 提供 aifx CLI，让 Agent 可以 list / search / call MCP。

这条路的关键不是“让模型写命令更酷”，而是可以把大量中间结果留在文件或工具侧，再通过 grep / filter 只把真正需要的结果带回模型上下文。

于是一个新的原则变得很清楚：

> **真正成熟的工具系统，不应该因为后台多注册了 1000 个工具，就让每一次推理都多背 1000 份说明书。**

[↑ 返回快速跳转](#jump)

<a id="authority"></a>

## 五、可见性治理，不等于权限治理

这里最容易产生一个危险误会。

既然可以把工具藏起来、延迟加载、按需搜索，是不是安全问题也顺手解决了？

不是。

**“模型看不见”不是可靠的安全边界。**

Uber 在 MCP Gateway 里另外做 tool-level authorization，并根据不同 caller actor——人、服务、Agent——应用不同策略。第三方 MCP 流量还可以经过统一授权、限流和敏感数据 redaction。

所以 Progressive Disclosure 主要解决：

**认知负担、上下文成本、选择噪音。**

Authorization 解决：

**调用到底会产生什么后果。**

两者必须分开。

一个 Tool 完全可以被模型看见，但因为当前身份或任务边界而不能执行；反过来，一个能力即使没有常驻 prompt，也不意味着只要通过某条旁路发现它，就可以绕过权限。

这也是为什么 Agent 工具治理不能只靠“Prompt 里有没有这个 Tool”。

[↑ 返回快速跳转](#jump)

<a id="comparison"></a>

## 六、Pi 与 Microsoft，为什么也在往同一个方向收敛

Uber 的规模很大，但它暴露出来的问题并不只属于 Uber。

### Pi：工具目录可以很大，当前 loadout 必须很小

Pi 当前把 MCP tool exposure 拆成：

| 模式 | 含义 |
| --- | --- |
| direct | 直接声明给模型 |
| deferred | 先不声明，命中 tool search 后再加载 |
| codemode | 通过受限脚本搜索、描述和调用工具 |
| hidden | 注册，但不可达 |

这和 Uber 的出发点不同，却出现了非常明显的收敛：

**工具存在，不代表完整 schema 应该永远占着上下文。**

Pi 的 Codemode 甚至允许脚本拿到完整 ToolResult，再过滤、聚合，最终只把脚本输出送回主模型。

这说明 Progressive Disclosure 已经不只是“省一点 token”。

它正在变成 Agent Runtime 的基本结构。

### Microsoft：Agent 不能成为自己的安全权威

如果 Pi 解决的是模型“看见什么”，Microsoft Execution Containers 则把边界继续往下压。

微软的原则非常硬：

> An agent cannot be its own security authority.

开发者或组织先声明 Agent 能访问哪些文件、网络和执行环境，再由 Agent 外部的 containment 强制执行。

于是我们得到三层非常不同、却能拼在一起的治理：

**Uber：能力怎样进入组织目录与调用链**

**Pi：当前模型到底看到多少能力**

**MXC：真正执行时，谁来挡住越权动作**

它们不是互相替代，而是在回答不同的问题。

[↑ 返回快速跳转](#jump)

<a id="mira"></a>

## 七、回到 Mira：真正缺的从来不是“再接一个工具”

这也是 Uber 这篇文章对 Mira 最直接的启发。

我们最近一直在讨论 Capabilities、MCP、Runtime Readiness、Progressive Resolution、External Worker。

如果只看 UI，很容易把它们理解成几个并列功能：

Capabilities 页面、MCP 页面、Tool Search、远端 Worker。

但 Uber 的案例会迫使我们重新问：

**一个能力从“系统知道它”到“Agent 安全完成一次调用”，到底经过哪些状态？**

一个更完整的链条至少应该是：

**registered**
→ **configured**
→ **available**
→ **discoverable**
→ **Agent-visible**
→ **authorized**
→ **executed**
→ **verified / evidenced**

这里每一步都可能失败，而且失败语义不同。

比如 web_search 已经注册，但没有 API key。

它不是“不存在”。

它只是当前 **unavailable**。

如果 UI 仍然把它展示成“已连接”，Planner 又把它当作可执行能力，这就是状态模型没有设计清楚。

再比如一个 MCP Server 在线，并不意味着它的所有 tools 都应该直接进入模型；一个 tool 能被发现，也不意味着当前 Agent 对 destructive action 有执行权。

这就是为什么 Mira 最近那几张看似零散的工程卡，其实正在逐渐拼成同一件事：

**能力治理。**

[读 Mira：Coding Agent 到底需要多少工具？ →](https://mira.tomz.io/blogs/engineering/coding-agent-tool-surface)

[读 Mira：当 Agent 有 60 个工具以后 →](https://mira.tomz.io/blogs/engineering/agent-tool-progressive-disclosure)

[↑ 返回快速跳转](#jump)

<a id="limits"></a>

## 八、不要照抄 Uber

这篇深读最后必须踩一下刹车。

Uber 的答案不应该被复制成所有 Agent 产品的架构模板。

Uber 有数千内部服务、成熟的 IDL Registry、service mesh、统一访问控制系统和专门的平台团队。对一个桌面 Agent 来说，为十几个工具先造一套 Uber 级 MCP Gateway，几乎肯定是过度工程。

真正值得借鉴的是那些**不变量**：

- 能力存在，不等于默认暴露；
- 自动发现，不等于自动授权；
- 工具多了以后，必须按需解析；
- ownership 必须清楚；
- 可见性、可用性和授权是不同状态；
- 权限不能只靠模型自觉；
- 执行以后还要有可观测性和证据。

至于这些原则由企业 Gateway、本地 Registry、Tool Search，还是一套很薄的 capability runtime 承载，要由产品规模决定。

换句话说：

**不要复制 Uber 的建筑面积，要理解它为什么需要承重墙。**

[↑ 返回快速跳转](#jump)

## 从“接 MCP”到“治理能力”

MCP 最初带来的兴奋感来自统一。

过去每接一个服务都要写一套特定集成，现在终于有一种共同协议。

但统一协议解决的主要是连接成本。

当 Agent 真正开始工作，新的问题会迅速出现：

谁维护这个能力？它现在到底能不能用？什么情况下应该让模型知道它？谁有权调用？调用结果哪些字段可以进入上下文？越权时谁真正挡住它？出了问题以后，能不能回答“当时到底发生了什么”？

800 个 MCP Server 与 5000 个 tools 的真正意义，大概就在这里。

它让我们提前看见了 MCP 的下一个阶段：

**MCP 不会只是一排越来越长的工具插座。**

它会逐渐变成一条能力供应链。

而 Agent 产品真正需要建设的，也不再只是“更多工具”。

而是让能力从被发现、被选择、被授权，到被执行和被验证的全过程，都有清楚的边界。

[↑ 回到文章顶部](#top)

---

**主要资料**

- [Uber Engineering｜Designing MCP Gateway: Uber's MCP Management Platform](https://www.uber.com/us/en/blog/designing-mcp-gateway/)：800+ MCP Server、5000+ tools、Registry / Gateway、AutoCrawler、disabled-by-default、Omni MCP、授权与脱敏。
- [Pi｜MCP Servers / Control tool exposure](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/mcp.md#control-tool-exposure)：direct / deferred / codemode / hidden，以及 exposure 与 permission 的边界。
- [Pi｜Codemode](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/codemode.md)：工具搜索、结果过滤与上下文预算。
- [Microsoft｜Microsoft Execution Containers: Policy-driven containment for AI agents](https://blogs.windows.com/windowsdeveloper/2026/10/07/microsoft-execution-containers-policy-driven-containment-for-ai-agents/)：由 Agent 外部强制执行的文件、网络与执行边界。
- [Mira Engineering｜把“牛马”做成一个工程系统](https://mira.tomz.io/blogs/engineering/mira-external-worker-engineering-system)：任务合同、执行权、可信验证与 Evidence。

*本文比较的是不同系统所解决的治理层次，不主张它们具有相同规模或风险模型。Uber 的企业级 MCP Gateway、Pi 的 Agent Harness、MXC 的系统级 containment 与 Mira 的产品架构承担不同职责；相似之处是它们都在把“模型可以做什么”从单一工具列表拆成多个可治理边界。*
