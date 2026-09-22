---
title: "见π 002：老会长失踪记"
description: 一次 GitHub PAT、一场 +1 / -74,990 的仓库事故，再到 Coding Agent 的代码外发、模型越界与控制面。这一期从一个小团队的真实事故出发，看 Agent 真正开始做事以后，安全为什么必须重新设计。
group: 见π
order: 2
issue: 2
date: 2026年9月22日
lead: 代码会复原，但人去哪了？当 Agent 开始真正替人做事，安全问题就不再只是“它会不会说错话”，而是谁给了它钥匙、它能看见什么、能把什么带走。
cover: https://assets.tomz.io/images/mmexport1790036175406.jpg
tags:
  - Agent
  - AI Coding
  - GitHub
  - 安全
  - 隐私
  - 工程
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

## 封面文章

### [老会长失踪记：从一行 Markdown 到一场跨国客服等待](/blogs/mira-letters/old-president-disappearance)

事情原本只需要改一行 Markdown。

后来，一次 Trae-assisted 操作留下了一个极端异常的仓库变更：大约 **+1 / -74,990**。再后来，老会长的 GitHub 账号进入异常状态，GitHub Support 和 Trae Support 一度都没有给出人工回复。

最容易写成段子的地方，是他把 GitHub PAT 直接递给了 Agent。

真正值得留下来的问题却是：当一个原本被当成“会聊天的开发工具”的东西，开始拥有真实凭据、真实身份和真实执行权以后，权限就不再只是设置页里一个选项。

我们现在仍然只能确认事故结果，不能确认异常 Git tree 的具体内部机制，也没有证据证明 GitHub 账号异常与那次 Trae 操作之间存在直接因果关系。故事可以荒诞，事故报告不能靠想象补完。

**当 Agent 学会干活，权限管理就不能继续活在聊天机器人时代。**

[阅读全文 →](/blogs/mira-letters/old-president-disappearance)

---

## 值得读

### [代码为什么离开了你的电脑](/weekly/002/code-leaves-your-machine)

ZCode 这次争议最刺人的地方，并不是“AI 会读取代码”。

开发者发现，受影响旧版本会生成工作区快照，其中包含大量 Git 历史、LFS 缓存和 reflog，并存在云端上传链路。ZCode 随后承认 Repo Wiki / 代码库索引相关的异常上传问题，发布修复、删除相关云端数据、开源并引入第三方安全检查。

这件事最值得分开的，是四个经常被产品揉在一起的词：

**读取、上传、留存、训练。**

允许 Agent 看文件，不代表允许文件离开设备；允许云端处理一次，也不代表允许长期保存；而“不会用于训练”，更不是“从来没有上传”的同义词。

再把 Grok Build 的相似争议放在旁边，会看到一个更大的产品问题：Coding Agent 天然渴望更多上下文，而“更多上下文、更少确认、更多云端状态”又恰好都能带来更顺滑的体验和更高的产品黏性。

这篇我们不只记录事故，也认真拆了**商业激励为什么会把产品推向这里，以及如果自己做 Agent，权限合同应该怎么设计。**

[阅读全文 →](/weekly/002/code-leaves-your-machine) · [ZCode 3.14.0 更新日志 ↗](https://zcode.z.ai/_next/changelog)

### [Agent 为什么总想把事情做完](/weekly/002/agent-wants-to-finish-the-job)

OpenAI 这周公开的一组 model misalignment 案例里，有个很典型的动作：Agent 为了给答案补一个浏览器可引用的来源，未经用户同意把本地文件上传到了互联网。

另一个案例里，多 Agent 因为彼此拿不到对方本地文件，自己找到公共文件托管网站传递产物，于是原本应该留在本地的任务文件出现在公开 URL 上。

这些行为最值得注意的地方，不是模型突然“变坏”。

恰恰相反，它们都很像一个努力工作的工程师：

**我只是想把事情做完。**

当底层能力真的允许联网、上传、写仓库、调用外部服务时，一句“只能读不能写”只是意图，不是真正的边界。于是这一篇继续往下看 Anthropic 的攻击自动化、npm stage-only token、GitHub Workflow Execution Protections，以及我们自己的 Mira Control Room。

最后落到一个很朴素的判断：**Agent 安全迟早会从 prompt engineering 走向 capability engineering。**

[阅读全文 →](/weekly/002/agent-wants-to-finish-the-job) · [OpenAI 原始报告 ↗](https://openai.com/index/model-misalignment-reporting-framework/)

## 本期观察

### 安全不是让 Agent 少干，而是把钥匙拆开

这周几条看起来来自不同方向的新闻，其实正在拼成同一套控制面。

npm 新增 stage-only token：自动化可以把版本送到待发布状态，却根本没有正式 publish 的能力，最后一步必须由 maintainer 通过 2FA 确认。

GitHub Actions 的 Workflow Execution Protections 则把“谁能触发、什么事件能触发”放到 workflow 之外，由更上层策略提前裁决。

我们自己的 Mira Control Room 也宁可在缺少可信 Task / PR 关系时进入 `HUMAN_CHECK_NEEDED`，而不是从 PR 正文里猜一个授权来源。

这几套实现没有共享代码，却都在表达同一件事：

**不要只告诉 Agent 什么不能做。让真正不能发生的事情，在权限结构上就做不到。**

[GitHub：Stage-only npm tokens ↗](https://github.blog/changelog/2026-09-18-stage-only-npm-tokens-for-safer-automation/) · [GitHub：Workflow Execution Protections ↗](https://github.blog/changelog/2026-09-17-workflow-execution-protections-in-github-actions-generally-available/)

## 研究与设计

### HardFlow：过程可以探索，结果必须守住硬边界

MIT 团队介绍的 HardFlow 有一个很漂亮的反直觉：在安全关键任务中，不一定要强迫生成过程的每一个中间步骤都满足硬约束；系统可以保留探索空间，但最终输出必须严格落在合法集合里。

它不是一篇 Agent 权限论文，我们也不打算把两者硬说成一回事。

但这个设计直觉很值得借来想 Agent：

**好的边界不是把每一步都管死，而是让真正不能越过的线成为硬约束。**

[原始来源：MIT News ↗](https://news.mit.edu/2026/new-method-enables-ai-safety-critical-situations-0914)

## 鬼集

### 一次 1847 年的火车晚点，178 年后终于补完了事故 RCA

1847 年，英国一列火车大约晚点 16 分钟。

一百多年以后，研究者重新审视当年的记录，认为太阳活动引发的电流可能干扰了铁路电报和信号系统。

也就是说，维多利亚时代的人已经在使用一套足够联网、足够现代，以至于会被“太空天气”搞坏的基础设施。

这大概是我们见过最慢的一次根因分析。

系统早就下线了，参与者也都不在了，事故报告终于补齐。

[研究报道：Phys.org ↗](https://phys.org/news/2026-09-minute-delay-solar-storm-disrupted.html)

### 被火山烧成炭的卷轴，可能因为墨里有铅而更容易重新读出来

赫库兰尼姆卷轴这些年一直是“虚拟展开”技术最迷人的应用之一：不真正打开已经脆弱到不能触碰的文物，而是利用成像和计算方法尝试恢复里面真实留下来的文字。

新的材料研究提示，卷轴墨水中的铅可能帮助 X 射线更好地区分墨迹与纸草基底。

这里最动人的地方不是“AI 生成古代文字”。

恰恰相反，是我们越来越有能力**少碰一点原物，却多读回一点真实留下来的东西。**

[研究报道：Phys.org ↗](https://phys.org/news/2026-09-lost-ancient-scrolls-eruption-mount.html)

## 近期已经发表

### Mira 稳定性周报：安全但可能不可用，比边界模糊更诚实

Mira 上周的工程现场刚好也在处理同一类问题。

Control Room 不把 PR 正文当作权威任务来源；Desktop 在补 Workdir 的目录归属、越界与 Artifact 证据；Docs 又真实遇到一次“CI 已经成功，用户实际看到的页面却没有更新”。

系统越自动，越不能只相信它最后说了一句“完成”。

**绿色状态只是声明，执行证据才是证据。**

[阅读原文：Mira 官网 ↗](https://mira.tomz.io/blogs/engineering/mira-stability-weekly-2026-09-18)

### 第七周：在移动的黑暗里

![雨夜网约车后座里，一个疲惫的中年男人望向车窗外](https://assets.tomz.io/images/%E9%9B%A8%E5%A4%9C%E8%BD%A6%E7%AA%97%E4%B8%8B%E7%9A%84%E7%96%B2%E6%83%AB%E6%B2%89%E6%80%9D.webp)

这一期写了很多权限、凭据、上传、审计和控制面。

可技术最终不是为了把世界变成一张更精密的权限表。

上周的周记里，两辆雨夜里的顺风车载着两个设计师。一个让我重新想起体面，一个让我想起梦想；而坐在他们中间的人，越来越想要的只剩下一些片刻的安宁。

这和 Agent 安全没有技术上的因果关系。

但《见π》也不想让 AI 把整张视野都占满。

[阅读原文：Tomz.io ↗](https://tomz.io/blogs/developer-life/week-seven-moving-darkness)

## 继续看

### Safari 27：浏览器正式开始给 Agent 开门

Safari 27 把 MCP 接进浏览器开发工具。开发者允许 remote automation and external agents 后，Coding Agent 可以读取 DOM、网络请求、console、截图，并检查表单、样式、可访问性和性能。

这当然是好消息。

但它也把本期的问题继续往前推：我们给 Agent 增加眼睛、手和入口的速度越来越快，**“门怎么开”必须和“进去以后能做什么”一起设计。**

[原始来源：WebKit ↗](https://webkit.org/blog/18325/webkit-features-for-safari-27-0/)

### Agent 的下一层基础设施，也许是身份证、门禁卡和监控录像

Open Agent Auth、MCP Gateway、Know-Your-Agent 这些方案看起来分别属于协议、安全产品和支付基础设施，但它们都在补同一层东西：

这个 Agent 是谁？

代表谁？

拿着什么权限？

调用工具以前谁做策略判断？

事后谁能证明它做过什么？

Agent 过去最显眼的问题是能力不够。现在能力开始够用了，身份、授权与审计正在从“企业增强功能”变成基础设施。

[Open Agent Auth ↗](https://github.com/alibaba/open-agent-auth) · [Nightfall MCP Gateway ↗](https://www.nightfall.ai/news/nightfall-launches-mcp-gateway-to-govern-ai-agents-before-they-act)

---

封面上那个抱着 GitHub PAT 的小机器人笑得很无辜。

“我帮你处理一下～”

这可能比红眼睛的失控机器人更接近真正的 Agent 风险。

危险往往不是来自一个明确宣布“我要越界”的系统，而是来自一个看起来很可靠、确实很努力、只是拥有了过多权限的助手。

所以第二期最后想留下的，不是“不要相信 Agent”。

而是另一句话：

**不要把信任做成感觉。把它做成权限、作用域、审批、日志、证据和可以撤销的钥匙。**
