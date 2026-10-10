---
title: "800 个 MCP Server 之后：Agent 的下一层不是更多工具，而是治理"
description: Uber 已经把 800+ MCP Server、5000+ tools 放进同一套 Gateway。把它与 Pi 的渐进式工具暴露、Microsoft Execution Containers 的外部权限边界，以及 Mira 正在收敛的能力治理放在一起看，会发现 MCP 真正进入生产以后，问题早已不是“能不能接”，而是“谁能发现、谁能暴露、谁能执行、谁来负责”。
group: 见π
order: 5
issue: 5
date: 2026年10月11日
readTime: 10 分钟阅读
lead: 5000 个工具听起来像能力爆炸。真正让人警醒的却是另一件事：Uber 没有把它们全部交给模型。工具先被发现，再默认关闭；由 owner 审核后启用；运行时按需搜索；权限和脱敏由 Gateway 统一执行。规模把一个“接工具”的问题，逼成了治理问题。
tags:
  - Agent
  - MCP
  - Tool
  - 工具治理
  - Mira
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

# 800 个 MCP Server 之后：Agent 的下一层不是更多工具，而是治理

Uber Engineering 最近公布了一组很容易让人停下来的数字：

**800+ MCP Server，5000+ tools。**

如果只把它当成一条 AI 基础设施新闻，最自然的反应可能是：Uber 已经把这么多内部系统都接给 Agent 了。

但把文章真正读完，最值得注意的恰恰相反。

**Uber 并没有把 5000 个工具直接交给模型。**

它花了大量工程，把“系统里存在某种能力”和“某个 Agent 此刻能够看见、能够调用这种能力”拆成了不同的事情。

这篇文章真正展示的，不是 MCP 有多能接。

而是当 MCP 开始进入生产规模以后，**连接本身反而变成最不难的那一层。**

真正困难的，是治理。

---

## 一、800 个 Server 不是 800 个都塞进上下文

Uber 的起点并不神秘。

公司内部本来就有大量 HTTP、gRPC、TChannel API。早期各团队自己把服务接成 MCP，很快出现了典型的平台化前夜症状：重复建设、工具难发现、运行方式不一致、安全和可观测性没有统一保证。

于是 Uber 建了 MCP Gateway。

它把整个系统拆成两个很传统、却很关键的平面：

- **MCP Registry：control plane**，负责发现、目录、ownership、配置和 enablement；
- **Proxy Gateway：data plane**，负责实际执行 MCP 请求，并把 HTTP / gRPC / TChannel 转成统一的 MCP 调用。

这一步的意义不在“又多了一个网关”。

而在于它先承认了一件事：

> **能力目录和能力执行不是同一层。**

MCP Registry 可以知道公司里有 5000 个工具，但这不意味着某个 Agent 应当在 prompt 里看见 5000 个 schema。

甚至连“被系统发现”都不意味着“已经可以用”。

Uber 的 AutoCrawler 会自动扫描内部 IDL、发现 API、生成或获取 tool definition，再把它们注册进 Registry。

然后呢？

**disabled by default。**

发现只是发现。

暴露需要另一道决定。

---

## 二、“发现不等于暴露”，可能是整篇文章最重要的一句话

Uber 明确写下了一条原则：

**discovery doesn’t imply exposure。**

一个服务被 AutoCrawler 找到了，一个工具 schema 被成功生成了，都不会自动获得 Agent 的使用权。

每个 MCP Server 和 tool 默认处于关闭状态，需要 owning team 明确 review 和 enable。工具描述发生变化时，还会产生 config diff，再由 owner 批准；必要时可以回滚。

这里已经不再是“AI 工具接入”的思维。

它更像软件供应链。

一个能力进入系统，要经过：

**发现 → 登记 → owner → review → enable → runtime**

这和很多 Agent 产品今天仍然采用的思路有明显区别。

小规模时，我们很容易把 MCP 理解成：

**装上 Server → 模型看到工具 → 模型调用**

规模上来以后，这条链路显得太短。

因为它把至少四个问题压成了一个：

1. 系统知道这个能力存在吗？
2. 这个能力现在健康、配置完整、真的可用吗？
3. 当前 Agent 应该看见它吗？
4. 当前身份真的有权执行它吗？

这四个答案完全可以不同。

一个工具可以**注册了，但不可用**；

可以**可用，但不该主动暴露给当前模型**；

也可以**模型知道它存在，但当前调用者没有执行权限**。

到这里，MCP 已经不只是协议。

它开始需要一个能力治理模型。

---

## 三、5000 个工具逼出了 Progressive Disclosure

即使所有权和启用状态都治理好了，还有一个非常现实的问题：

**上下文装不下。**

MCP 本身没有跨 Server 的全局工具搜索语义。传统方式要求 Agent 预先知道要连哪个 Server，再拿到它的 tool list。

当 Server 从 5 个变成 800 个，这套方式必然崩。

Uber 给出了两条路径。

第一条叫 **Omni MCP**。

它不把所有工具直接声明给模型，只暴露一小组元工具：

- discover_server
- discover_tools
- get_tool_schema
- invoke_tool

Agent 先根据任务寻找相关 Server，再找工具，再加载 schema，最后调用。

这其实已经不是普通意义上的“工具列表”。

它是一套**渐进式解析（progressive resolution）**。

第二条更有意思，叫 **Code Mode**。

Uber 给 coding agent 提供 aifx CLI：

- aifx mcp list
- aifx mcp search
- aifx mcp call

Agent 可以把调用结果写进文件，再用 grep 等文件工具只读取真正需要的部分。

Uber 甚至明确说：**Code Mode 已经成为公司 coding agent 使用 MCP 的默认方式。**

为什么？

因为模型上下文本身是昂贵资源。

真正成熟的工具系统，不应该因为后台多注册了 1000 个工具，就让每一次推理都多背 1000 份说明书。

---

## 四、Pi 从另一条路走到了几乎同一个答案

这也是把 Uber 与 Pi 放在一起读最有意思的地方。

Pi 没有 Uber 的企业规模，也没有 800 个内部 MCP Server。

但它最近正在处理几乎同一个问题：

**工具存在，不代表工具声明应该永远占着模型上下文。**

Pi 当前把 MCP tool exposure 分成几种模式：

| 暴露方式 | 含义 |
| --- | --- |
| direct | 直接声明给模型 |
| deferred | 先不声明，命中 tool search 后再加载 |
| codemode | 让模型通过受限脚本搜索、描述和调用工具 |
| hidden | 注册，但不可达 |

这套设计和 Uber 的出发点不同，却出现了明显的收敛。

Uber 的 Omni MCP 用一小组 discovery tools 打开一个庞大的工具世界；

Pi 的 deferred exposure 用 tool_search 在需要时才把工具加载给模型。

Uber 的 Code Mode 让 coding agent 通过 CLI 搜索和调用 MCP；

Pi 的 Codemode 则允许模型在受限 JavaScript 环境中使用 searchTools()、describeTool() 和 ALL_TOOLS，只把筛选后的结果送回主模型上下文。

两边都在解决同一个结构性问题：

> **工具目录可以很大，但当前认知面必须很小。**

这句话比“支持多少 MCP”重要得多。

---

## 五、但“模型看不见”并不等于“模型没权限”

这里最容易产生一个危险误会。

既然可以隐藏工具、延迟加载工具，是不是工具安全问题也顺手解决了？

不是。

Pi 的文档很坦白：exposure 控制的是**模型怎样接触工具**，而真正的权限仍然要经过独立 permission gate。

Uber 也没有把“工具没出现在 prompt 里”当作安全边界。

它在 MCP Gateway 里另外做 authorization，并且细到 tool level；不同 caller actor——人、服务、Agent——可以套不同策略。工具结果里的 PII 和敏感数据还可以由 Gateway 统一 redaction。

于是我们可以得到第二个非常重要的区分：

**可见性治理，不等于权限治理。**

Progressive disclosure 主要解决认知负担和成本。

Authorization 解决的是后果。

这两者恰好不能由同一个“模型觉得应该调用”来决定。

---

## 六、Microsoft 又把边界往下压了一层

如果 Uber 解决的是组织级能力治理，Pi 解决的是 Agent 上下文里的能力暴露，那么 Microsoft Execution Containers 处理的是更靠近操作系统的一层：

**当 Agent 真正开始执行，谁来阻止它越权？**

Microsoft 在 10 月 7 日宣布 MXC 正式可用时，写了一句非常硬的原则：

> **An agent cannot be its own security authority.**

Agent 不能成为自己的安全权威。

开发者或组织先声明 Agent 可以访问哪些文件、网络地址和执行环境，MXC 再由 Agent 外部的容器边界强制执行。

这和 MCP Gateway 的 authorization 又不是同一件事。

MCP Gateway 可以说：“这个身份不能调用这个 tool。”

MXC 则可以进一步说：“即便某个模型、插件、工具或 Harness 想绕过去，它也碰不到没有授权的文件或网络。”

我们正在看到 Agent 基础设施逐渐形成不同治理层：

**目录 / Registry**
→ **暴露 / Discovery**
→ **授权 / Policy**
→ **执行边界 / Containment**
→ **证据 / Observability**

它们不是竞争关系。

而是在回答不同的问题。

---

## 七、再回来看 Mira：我们真正缺的从来不是再接一个工具

这也是这几篇文章对 Mira 最直接的启发。

我们最近一直在讨论“能力”、MCP、渐进式披露、runtime readiness，以及 External Worker 的执行与验证边界。

如果只看界面，很容易把这些理解成几个独立功能：

- 一个 Capabilities 页面；
- 一个 MCP 页面；
- 一套 Tool Search；
- 一个远端 Worker。

但 Uber 的案例把它们放回了同一张图里。

真正应该回答的是：

**一个能力从“系统知道它”到“Agent 安全地完成一次调用”，要经过哪些状态？**

至少可以拆成：

**registered**
→ **configured**
→ **available**
→ **discoverable**
→ **agent-visible**
→ **authorized**
→ **executed**
→ **verified / evidenced**

它们不该再被一个绿色的“已连接”图标糊成同一件事。

例如 web_search 已经注册，但没有 API key。

它不是不存在。

也不是健康可执行。

更不应该因为 Registry 里有名字，就自动出现在 Agent 的有效能力集合中。

同样，一个 MCP Server 正常在线，也不意味着它的所有 tools 都该直接声明给模型；一个工具可以被发现，也不意味着当前 Agent 有权执行其中的 destructive action。

**registered ≠ available ≠ Agent-visible ≠ authorized。**

Uber 用 800 个 Server 把这件事逼到了不得不解决的程度。

Mira 现在规模小得多，反而有机会在规模变大以前，把这些状态先设计对。

---

## 八、不要照抄 Uber

这篇比较阅读最后还需要踩一下刹车。

Uber 的答案不应该被复制成所有 Agent 产品的架构模板。

Uber 有数千内部服务、成熟的 IDL Registry、service mesh、统一访问控制系统和专门的平台团队。对一个桌面 Agent 来说，为十几个工具先造一套 Uber 级 MCP Gateway，几乎肯定是过度工程。

真正值得借鉴的是它暴露出来的**不变量**：

- 能力存在，不等于默认暴露；
- 自动发现，不等于自动授权；
- 工具多了以后，必须按需解析；
- ownership 必须清楚；
- 权限不能只靠模型自觉；
- 可见性、可用性和授权是不同状态；
- 执行以后还要有可观测性和证据。

至于这些原则最终由一个企业 Gateway、一套本地 Registry、一个 Tool Search，还是一个小型 capability runtime 来承载，要由产品规模决定。

换句话说：

**不要复制 Uber 的建筑面积，要理解它为什么需要承重墙。**

---

## 从“接 MCP”到“治理能力”

MCP 最初给人的兴奋感来自统一。

过去每接一个服务都要写一套特定集成，现在终于有一种共同协议。

但统一协议解决的只是连接成本。

当 Agent 真正开始工作，新的问题会迅速出现：

谁维护这个能力？

它现在到底能不能用？

什么情况下应该让模型知道它？

谁有权调用？

调用结果哪些字段可以进入上下文？

越权时谁真正挡住它？

出了问题以后，能不能回答“当时到底发生了什么”？

800 个 MCP Server 与 5000 个 tools 的真正意义，大概就在这里。

它让我们提前看见了 MCP 的下一个阶段。

**MCP 不会只是一排越来越长的工具插座。**

它会逐渐变成一条能力供应链。

而 Agent 产品真正需要建设的，也不再只是“更多工具”。

而是让能力从被发现、被选择、被授权，到被执行和被验证的全过程，都有清楚的边界。

---

**主要资料**

- [Uber Engineering｜Designing MCP Gateway: Uber's MCP Management Platform](https://www.uber.com/us/en/blog/designing-mcp-gateway/)：800+ MCP Server、5000+ tools、Registry / Gateway、AutoCrawler、disabled-by-default、Omni MCP、Code Mode、授权与脱敏。
- [Pi｜MCP Servers / Control tool exposure](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/mcp.md#control-tool-exposure)：direct / deferred / codemode / hidden，以及 exposure 与 permission 的边界。
- [Pi｜Codemode](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/codemode.md)：工具搜索、结果过滤与上下文预算。
- [Microsoft｜Microsoft Execution Containers: Policy-driven containment for AI agents](https://blogs.windows.com/windowsdeveloper/2026/10/07/microsoft-execution-containers-policy-driven-containment-for-ai-agents/)：由 Agent 外部强制执行的文件、网络与执行边界。
- [Mira Engineering｜把“牛马”做成一个工程系统](https://mira.tomz.io/blogs/engineering/mira-external-worker-engineering-system)：任务合同、执行权、可信验证与 Evidence。

*本文比较的是不同系统所解决的治理层次，不主张它们具有相同规模或风险模型。Uber 的企业级 MCP Gateway、Pi 的 Agent Harness、MXC 的系统级 containment 与 Mira 的产品架构承担不同职责；相似之处是它们都在把“模型可以做什么”从单一工具列表拆成多个可治理边界。*
