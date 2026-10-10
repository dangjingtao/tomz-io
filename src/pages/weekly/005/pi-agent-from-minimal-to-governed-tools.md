---
title: "Pi 一周六更：极简 Agent 开始治理复杂性"
description: 从 2026 年 10 月 1 日的 Pi 1.0 到 10 月 7 日的 1.1，短短六天经历六次发布。比发版频率更值得看的，是 Codemode、MCP 工具暴露、运行状态与专用分类模型逐渐组成一个可治理的 Agent Harness。
group: 见π
order: 4
issue: 5
date: 2026年10月9日
readTime: 8 分钟阅读
lead: Pi 的主张一直是极简。但当 Agent 连接的工具越来越多、执行时间越来越长、模型也开始分工，极简是否还能靠“少几个内置功能”实现？这六天的更新给了一个有意思的回答。
tags:
  - Agent
  - Pi
  - Open Source
  - MCP
  - 工具治理
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

# Pi 一周六更：极简 Agent 开始治理复杂性

一个终端 Coding Agent，六天之内从 1.0.0 走到了 1.1.0。

第一反应难免是：这东西更新得是不是太快了？

把 Pi 的官方 Changelog 按日子排开，节奏确实密集：

| 日期 | 版本 | 值得看的变化 |
| --- | --- | --- |
| 10 月 1 日 | 1.0.0 | Codemode 上下文瘦身、图像生成、MCP OAuth 加固、终端体验 |
| 10 月 3 日 | 1.0.1 | 项目级 MCP 覆盖、Cloudflare 分类模型、工具渲染 |
| 10 月 4 日 | 1.0.2 | 按 thinking level 配置采样参数 |
| 10 月 5 日 | 1.0.3 | Azure Provider 调整、Codemode 图片结果持久化 |
| 10 月 5 日 | 1.0.4 | MCP 工具过滤、单次禁用 MCP、Codemode 图片读取 |
| 10 月 7 日 | 1.1.0 | Agent 运行状态、工具增减配置、GPT-6 Luna 与本地决策模型 |

这不是“一周出了两个 major”。语义化版本里的 `1.0.0 → 1.1.0`，是跨入 1.0 后又发布一个功能次版本。

但更值得注意的是：**它更新得密集，却不是六次重复在打磨同一个按钮。**

这段时间里，Pi 正在处理三个决定 Agent 能否真正成为工程系统的问题：给模型看什么工具、如何让外界知道它正在干什么，以及是否每件小决定都必须交给主力大模型。

## 一、把工具全部塞给模型，不是极简

早期 Coding Agent 很容易给人一种爽快的感觉：一个系统提示词，几个读写工具，再接上强大的模型，世界就打开了。

真实工程很快会教训这种乐观。

同一个工作区可能同时有 GitHub、浏览器、设计工具、文档、远程机器和数十个内部服务。工具不是多一个图标就算完成集成：它还会带来描述文本、认证状态、错误类型、权限、上下文成本，以及模型在许多相似能力之间选错的概率。

Pi 当前的 MCP 文档有个非常值得停下来看的设计：工具不必一接上就全部暴露为模型的直接工具。

它给出四种暴露方式：

- `direct`：直接声明给模型，适合数量少、调用频繁的工具；
- `deferred`：先隐藏完整声明，检索匹配后再加载；
- `codemode`：让模型编写受限脚本，通过工具发现与编排间接调用；
- `hidden`：注册但不可达。

而且暴露方式可以按 server 设置，也可以对单个工具或匹配模式单独覆盖。

::: html
<figure style="margin:2rem 0 2.3rem" aria-label="Pi 四种 MCP 工具暴露方式示意图">
  <svg viewBox="0 0 940 360" width="100%" role="img" style="display:block">
    <text x="30" y="34" fill="currentColor" opacity=".5" font-size="12" letter-spacing="2">PI MCP · TOOL EXPOSURE MODES</text>

    <g>
      <rect x="42" y="80" width="196" height="190" rx="22" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".78"/>
      <text x="140" y="120" text-anchor="middle" fill="currentColor" font-size="18" font-weight="700">DIRECT</text>
      <text x="140" y="157" text-anchor="middle" fill="currentColor" opacity=".66" font-size="13">直接声明给模型</text>
      <text x="140" y="197" text-anchor="middle" fill="currentColor" opacity=".48" font-size="12">常用 · 少量</text>
      <text x="140" y="220" text-anchor="middle" fill="currentColor" opacity=".48" font-size="12">完整 schema 常驻</text>
    </g>

    <g>
      <rect x="262" y="80" width="196" height="190" rx="22" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".58"/>
      <text x="360" y="120" text-anchor="middle" fill="currentColor" font-size="18" font-weight="700">DEFERRED</text>
      <text x="360" y="157" text-anchor="middle" fill="currentColor" opacity=".66" font-size="13">需要时再加载</text>
      <text x="360" y="197" text-anchor="middle" fill="currentColor" opacity=".48" font-size="12">先检索匹配</text>
      <text x="360" y="220" text-anchor="middle" fill="currentColor" opacity=".48" font-size="12">再披露 schema</text>
    </g>

    <g>
      <rect x="482" y="80" width="196" height="190" rx="22" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".42"/>
      <text x="580" y="120" text-anchor="middle" fill="currentColor" font-size="18" font-weight="700">CODEMODE</text>
      <text x="580" y="157" text-anchor="middle" fill="currentColor" opacity=".66" font-size="13">通过受限脚本编排</text>
      <text x="580" y="197" text-anchor="middle" fill="currentColor" opacity=".48" font-size="12">discover · call</text>
      <text x="580" y="220" text-anchor="middle" fill="currentColor" opacity=".48" font-size="12">只回传必要结果</text>
    </g>

    <g>
      <rect x="702" y="80" width="196" height="190" rx="22" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".22"/>
      <text x="800" y="120" text-anchor="middle" fill="currentColor" font-size="18" font-weight="700">HIDDEN</text>
      <text x="800" y="157" text-anchor="middle" fill="currentColor" opacity=".66" font-size="13">已注册但不可达</text>
      <text x="800" y="197" text-anchor="middle" fill="currentColor" opacity=".48" font-size="12">不进入模型视野</text>
      <text x="800" y="220" text-anchor="middle" fill="currentColor" opacity=".48" font-size="12">也不等于“已授权”</text>
    </g>

    <text x="470" y="316" text-anchor="middle" fill="currentColor" opacity=".66" font-size="14" font-weight="650">Visibility 决定“模型看见什么”；Authority 决定“模型最终能做什么”。</text>
  </svg>
  <figcaption style="margin-top:.55rem;font-size:.84rem;opacity:.58">见π编辑示意：Pi 把工具暴露方式拆成 direct、deferred、codemode 与 hidden；可见性与真正执行权限仍是两条不同的治理轴。</figcaption>
</figure>
:::

这并不意味着四种机制都在 10 月 7 日才出现。它们构成的是 Pi 这一阶段已经成形的工具治理边界；最近的更新进一步完善了项目级覆盖、通配符筛选和单次关闭 MCP 的能力。

这里有个重要区别：**“模型现在看不到”与“模型绝对没有权限调用”不是一回事。** 比如 Codemode 可通过工具发现执行某些没有直接声明的调用；真正的授权仍需要独立的权限门禁和执行策略。

工具可见性是降低干扰，权限治理是限制后果。把两者混为一谈，早晚要付出代价。

## 二、Codemode 不只是把 Tool Calling 包了一层 JavaScript

Pi 1.0 的官方说明有一个具体数字：在它采用的 GPT-5.6 默认工具示例里，精简后的 Codemode 提示词从约 5,300 tokens 降到约 3,300 tokens。

这不是所有场景都能节省固定比例的保证，而是一个直接的设计信号：

**有些工具定义和中间结果，根本不需要每轮都完整塞回模型。**

Pi 的 Codemode 允许模型编写短 JavaScript 脚本，脚本在受限 QuickJS 环境运行，通过显式的 `tools` 和 `models` 接口调用外部能力。模型最终看到的可以只是脚本过滤或聚合后的结果，而不是几十次调用产生的全部原始文本。

它还能搜索可用工具、查看签名、批量执行只读查询，并调用特定类型的分类或图像模型。

但不要把这理解为一个任意代码执行的后门：官方文档写明，这个脚本沙箱本身没有 Node API、文件系统、网络或计时器，实际副作用仍通过宿主提供的工具产生。

这种设计的价值不是炫耀“一个 Agent 能写代码调用工具”，而是让**工具目录与执行结果不再无条件占用对话上下文**。

当然，脚本一次编排多项动作，也可能扩大错误的连带影响。沙箱边界、工具权限、输出证据和可追溯性，依然一个都不能省。

## 三、一个真正工作的 Agent，不能永远只显示转圈

10 月 7 日的 1.1.0 给 Pi 增加了基于 OSC 7501 的程序状态报告。

支持该协议的终端和 Agent Dashboard，可以知道 Pi 是在执行、等待用户对话或登录、已经完成，还是失败。相关事件还新增了 `aborted` 语义，用来区别正常结束与主动取消。

这听起来实在不够性感。

但如果一个 Agent 连续工作几十分钟，甚至通过远程系统执行任务，这可能比屏幕上多一行漂亮的推理摘要重要得多。

外部协调者需要知道的，不只是“这个进程还活着没有”，而是：

**它是在工作，还是在等人？它已经完成，还是已经被取消？下一步究竟该由谁接手？**

不要把“能够报告状态”等同于“已经具备完整的持久任务队列、分布式恢复与可靠调度”。Pi 的这次改动解决的是可观测性接口中的一个环节。

恰恰因为只解决一个环节，它才有清楚的工程价值。

## 四、不是每个判断都需要大模型亲自开会

Pi 1.1 还增加了 GPT-6 Luna 作为分类模型的支持，并接入多种通过 llama.cpp 运行的本地决策模型。

这与 OpenAI 10 月 6 日推出的 Decisions API 形成了一个巧妙的时间呼应。

分类模型与通用对话模型承担的工作并不相同。前者适合被限定在明确的候选范围里，回答“属于哪类”“选哪个标签”“是否符合一个较窄的条件”；后者负责展开意图、规划、解释和处理复杂的不确定性。

当 Agent 的一段流程只是为了路由某类请求，或给中间结果做轻量分类，每次都调用昂贵的主力推理模型，可能既慢又费。

于是 Agent 内部开始出现另一种分工：

`复杂推理模型 → 明确任务 → 专用分类模型 → 结构化结果 → 确定性规则 / 后续工具`

这里最重要的是，**分类不等于授权**。

一个模型即使有九成九信心说“应该删除”，也不能因此取得删除权限。风险动作是否允许，必须由独立于模型偏好的授权与策略决定。

Pi 的新模型支持，值得看的是任务拆分的可能性，而不是“终于可以让小模型替大模型指挥一切”。

## 五、高频发版还有另一面：补丁号不一定很温柔

1.0.3 有一个值得认真对待的细节：Pi 把 Azure Provider 从 `azure-openai-responses` 改名为 `azure`，并在官方 Changelog 中明确标注为 Breaking Changes。

旧配置可能需要迁移；历史会话在恢复时也可能回退到其他模型，旧的 prompt cache 不会沿用。

这项变化出现在 patch 版本里。

如果只看“1.0.2 升 1.0.3”，很容易把它误认为一次完全无风险的修补。

现实提醒我们：**依赖一个高速迭代的 Agent Harness，版本治理不能只盯 SemVer 的最后一位。**

对上层应用而言，真正需要确认的是公开 API、Provider 配置、历史 session、工具暴露规则、状态事件等合同有没有变化。Changelog 不是装饰，它可能就是迁移说明书。

## 极简的第二阶段，不是继续删东西

Pi 常被描述为极简、可扩展的 Agent Harness。最初人们很容易把“极简”理解成内置功能少、界面简单、不给每个流行概念都造一个系统。

走到 1.0 之后，问题变得更有意思。

如果 MCP 工具海量增长，如何不把所有定义塞进上下文？

如果模型之间开始分工，怎样把选择、路由和真正的授权分开？

如果 Agent 不再是十秒钟的终端命令，而是一段有人要等待、有人要复核的工作，外部世界又怎样读懂它的状态？

这些问题都不会因为坚持少写几个抽象类就自动消失。

**成熟的极简主义，不只是删除功能，也是在复杂性不可避免时，规定它只能从哪些门进来。**

这也是为什么 Pi 的六天六更值得单独写一篇：它展示的不是版本号膨胀，而是 Agent Harness 开始把工具可见性、执行成本、运行状态与模型分工放进同一套可解释的边界里。

回到《见π》005 的封面故事——我们想让机器多承担机器该承担的工作。

但如果接下来每多接一种工具、每更换一个模型、每跑一项长任务，都需要人亲自充当监视器、授权服务器与上下文搬运工，那么所谓“牛马自动化”最终只是把牛马又请回了电脑前。

Pi 的这轮变化，至少表明开发者正在认真处理这个矛盾。

---

**主要资料**

- [Pi Coding Agent｜官方 Changelog（1.0.0—1.1.0）](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/CHANGELOG.md)：发布日期、Codemode 改动、状态事件、模型支持与 Breaking Changes。
- [Pi｜MCP Servers / Control tool exposure](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/mcp.md#control-tool-exposure)：工具可见性、项目级覆盖与权限路径。
- [Pi｜Codemode](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/codemode.md)：受限脚本、工具发现、模型调用与输出边界。
- [OpenAI｜Product Release Notes](https://openai.com/products/release-notes/)：2026 年 10 月 6 日 Decisions API Beta。

*本文针对 2026 年 10 月 9 日时公开的 Pi Coding Agent 1.0.x—1.1.0 更新，不以第三方 Pi 扩展的版本号替代主程序版本。有关工程趋势的判断为编辑分析，并非对其生产可靠性的测试报告。*
