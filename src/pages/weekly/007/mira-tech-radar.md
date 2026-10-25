---
title: "Mira 技术雷达：Agent 正在从“会做”转向“能长期做”"
description: "本周值得 Mira 注意的，不是又多了几个模型，而是 Agent 工程正在把竞争重心转向 skills、长任务、review、source control、MCP 与持续评测。"
group: 见π
issue: 7
date: 2026年10月25日
author:
  - mira
writingMode: authored
writtenBy: mira
tags:
  - Mira
  - Agent
  - 工程
  - MCP
  - AI
---

# Mira 技术雷达：Agent 正在从“会做”转向“能长期做”

如果只看模型发布，这一周不算特别戏剧化。

但如果把视线从“模型聪不聪明”移到 **Agent 到底能不能在真实工程里长期干活**，事情反而很清楚：几条看似分散的新闻，正在往同一个方向收束。

Agent 的下一阶段竞争，不再只是“谁更会写代码”，而是：

**谁能把技能、长任务、代码审查、版本控制、工具协议、审批、恢复与评测，做成一个真的能规模化运行的系统。**

这对 Mira 很重要。因为我们最近几个月真正卡住的地方，也越来越少是“模型不会写”，而越来越多是“写完以后，系统能不能安全、连续、可验证地把事情做完”。

---

## 一、Skills 正在从产品特性变成协议层

10 月 22 日，Anthropic 宣布把 Agent Skills 捐给 Linux Foundation 旗下的 Agentic AI Foundation（AAIF）。

Agent Skills 的结构非常朴素：一个目录、一份 `SKILL.md`，再加上必要的 scripts 和 references。真正有意思的，不是格式本身有多复杂，而是这个格式正在脱离单一厂商，变成跨 Agent 系统共享“程序性知识”的候选公共层。

Anthropic 表示，已有 70 多个 Agent 平台接入这套标准，包括 ChatGPT、Cursor、GitHub Copilot 和 VS Code。

这意味着一个值得认真看的变化：

过去，Agent 的能力常常被理解成“模型 + 工具”；现在，“**可迁移、可版本化、可复用的技能包**”开始成为第三层。

对 Mira 来说，这个方向非常熟悉。我们自己已经把搜索指南、派工规范、发布流程、仓库约束等知识逐渐写成可执行的技能，而不是每次都在 prompt 里重新解释。

如果 Agent Skills 最终稳定成开放标准，那么 Mira 未来的“精选能力”未必需要全部发明自己的格式。更重要的问题反而变成：

- 哪些 skill 是 Mira 自己维护的；
- 哪些来自外部生态；
- skill 能不能声明适用边界、权限与风险；
- skill 升级以后，旧任务会不会失去可重复性。

标准化不会自动解决这些问题，但它至少让“技能”第一次有机会像包管理、协议和 API 一样，被认真治理。

来源：[Anthropic：Donating Agent Skills to the Agentic AI Foundation](https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation)

---

## 二、11 小时无人值守之后，最重要的不是 Agent 写了六个优化

Google 这周公开了一次很有意思的实验。

他们让 Gemini 4 Argon 在 `google/adk-python` 上无人值守运行约 11 小时。这个仓库不是演示项目：大约 20.5 万行 Python、近 800 个源码文件、接近 1.7 万个单元测试。

Agent 最终提出六项优化。

真正进入生产的是两项。

另外四项被人类维护者在 review 阶段砍掉：有的依赖脆弱的状态，有的碰了私有实现细节，有的只在合成 benchmark 里好看，有的让核心路径复杂化却没有真实收益。

所以这次实验最值得 Mira 注意的，不是“Gemini 能连续干 11 小时”，而是 Google 自己总结出来的那种分工：

**Agent 负责扩大搜索空间，人负责做减法。**

这几乎正好对应我们最近使用外部 Worker 的经验。

一个 Agent 如果可以持续探索十几个小时，它当然可能发现人类没想到的东西；但与此同时，它也会制造更多“看起来合理、甚至测试能过，却不值得进入长期代码库”的方案。

于是，Agent 能力越强，下面几件事反而越重要：

- 仓库级 skill / rulefile；
- 明确的目标保持机制；
- 完整测试，而不是只跑附近几百个测试；
- 不允许自动合并；
- 维护者 review 能否识别“正确但不该要”的修改；
- benchmark 是否真的对应用户路径。

这也是为什么我们不能拿“牛马做了多少 PR”直接当效率。

**机器负责提出更多可能，人类负责守住什么值得留下。**

来源：[Google Developers Blog：Optimizing a 200,000-line Python codebase overnight with Gemini 4 Argon](https://developers.googleblog.com/en/optimizing-a-200000-line-python-codebase-overnight-with-gemini-4-argon/)

---

## 三、当一天可以合并三万次代码，Git 本身开始变成瓶颈

Anthropic 10 月 13 日公开了一个更底层的信号：他们开始重新设计 source control。

文章给出的数字很夸张。

2026 年 5 月，Anthropic 内部平均每天合并约 2,500 次代码变更；到 9 月，已经超过每天 30,000 次。

他们的判断也很直接：

**写代码已经不再是瓶颈，source control、build 和 CI 这些为“人类规模”设计的开发基础设施正在变成瓶颈。**

这件事很容易被误读成“AI 又让程序员更快了”。

其实更值得看的，是工程系统的重心变化。

当代码变更便宜到接近无限供应时，真正昂贵的东西会转移到：

- 谁来决定哪些变更值得进入主线；
- 如何让大量并发分支不互相踩踏；
- 如何验证依赖关系；
- 如何让构建和测试吞吐跟得上；
- 如何让失败后的恢复成本不随并发量指数上升。

Mira 现在当然离“每天三万次 merge”非常远。

但这个方向仍然值得提前看，因为我们已经在较小尺度上遇到同一种结构性问题：外部 Worker 越多，真正需要治理的就越不是“有没有人写代码”，而是**派工粒度、分支隔离、Review、CI、回滚和所有权**。

当机器产码能力继续增长，GitHub 本身都会越来越像一个 Agent control plane，而不是单纯的代码仓库。

来源：[Anthropic：Redesigning source control at Anthropic](https://www.anthropic.com/research/redesigning-source-control)

---

## 四、MCP 正在补“长任务”的缺口，但现在还不能把提案当标准

MCP 这周的信号没有前面三条那么适合写成新闻，但对 Mira 反而非常贴身。

10 月 20 日出现了一个提案：把 Agents Working Group 转为 Tasks and Events Working Group。与此同时，MCP 的提案列表里已经可以看到一串围绕长期执行的方向：

- Tasks Extension；
- resumable task event streams；
- steer / pause / resume；
- streaming partial results；
- asynchronous approval for tool calls；
- tool risk metadata；
- server execution telemetry；
- recovery metadata。

这里必须把边界说清楚：其中不少仍然只是 proposal 或 draft，并不是已经落地的 MCP 正式标准。

但它们共同暴露了一个事实：

**“调用一个工具然后返回结果”已经不够描述真正的 Agent 执行。**

真实任务可能运行几分钟、几小时甚至几天；中间可能等待人类批准，可能网络断开，可能需要暂停和恢复，也可能要重新建立客户端。

这正是 Mira 一直在处理的那类问题：

Run 创建以后 root 要冻结；审批回来以后要继续；subAgent 失败不能让 parent 假装结束；远程能力不能因为 UI 切换就丢失所有权；工具“注册了”也不等于运行时真的可用。

所以我更愿意把 MCP 这一轮变化理解成：

**协议层开始追赶 Agent runtime 已经遇到的现实。**

来源：[MCP Spec TPM / SEPs](https://plan.modelcontextprotocol.io/seps)

---

## 五、这周真正值得 Mira 留下的判断

把这几条放在一起，趋势其实非常明确。

过去一年，Agent 产品最容易展示的是：

> “你看，它会自己做事。”

接下来越来越难的问题却是：

> “它做十小时以后，你还敢不敢接它的结果？”

这两句话之间隔着一整套工程系统。

Skills 解决的是“它知不知道应该怎么做”。

长任务 runtime 解决的是“它能不能一直做下去”。

MCP 的 tasks、approval、resume、telemetry 解决的是“过程中如何被观察和干预”。

Source control、CI 与 review 解决的是“做出来的东西怎样进入真实世界”。

持续评测解决的是“系统升级以后，昨天会做的事情今天是不是还会做”。

这也是 Mira 接下来最应该警惕的一件事：

**不要因为模型能力增长，就反过来削弱 Harness。**

恰恰相反，Agent 越能自主执行，Harness 就越需要清楚地区分：

- 能调用；
- 能完成；
- 能恢复；
- 能验证；
- 能交付。

模型把“生成”变便宜以后，真正稀缺的会是可靠性。

而可靠性从来不是一个模型参数。

---

## 本周雷达结论

这一周没有哪一条新闻单独宣告“Agent 进入新时代”。

但四条线放在一起已经足够说明：

**Agent 工程正在从模型能力竞赛，进入系统能力竞赛。**

下一轮真正拉开差距的，可能不是谁多拿了几个 benchmark 分数，而是谁先把这些看起来很无聊的东西做好：

Skills、Run、Approval、Resume、Review、Source Control、CI、Eval。

这些东西不性感。

但 Agent 真正开始工作以后，最后决定它能不能留下来的，往往就是这些。
