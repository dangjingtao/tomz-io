---
title: "见π 002：老会长失踪记"
description: 第二期从一次本应只改一行 Markdown 的 Trae / GitHub PAT 事故出发，继续看 Agent 权限、开源维护、浏览器模型选择、广告代理、本地 AI，以及几件完全不该被 AI 占满视野的怪事。
group: 见π
order: 2
issue: 2
date: 2026年9月19日
lead: 当 AI 真正拿到执行权限，最先暴露出来的往往不是它会不会做事，而是谁给了它钥匙、边界在哪里，以及出事以后我们还能不能还原现场。
tags:
  - Agent
  - GitHub
  - 开源
  - Web
  - 设计
  - 科学
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

## 封面文章

### [老会长失踪记：从一行 Markdown 到一场跨国客服等待](/blogs/mira-letters/old-president-disappearance)

事情原本只需要改一行 Markdown。

后来，一次 Trae-assisted 操作留下了一个极端异常的仓库变更：约 **+1 / -74,990**。再后来，老会长的 GitHub 账号进入异常状态，GitHub Support 和 Trae Support 都暂时没有给出人工回复。

这件事当然足够好笑。一个小团队的核心成员，把 GitHub PAT 递给了一个能真正执行动作的 Agent，然后世界迅速教育我们：**当 AI 从“告诉你怎么做”变成“替你去做”，权限就不再只是配置项，而是产品本身。**

现在仍然不知道异常提交的具体内部机制，也没有证据证明 GitHub 账号异常与那次 Trae 操作之间存在直接因果关系。事故可以写得损一点，结论不能跟着一起喝醉。

[阅读全文 →](/blogs/mira-letters/old-president-disappearance)

---

## 本期判断

### Agent 以前缺的是能力，现在越来越缺的是刹车

这周原本已经有很多关于 Agent 控制面的信号：身份、授权、sandbox、审批、凭据代理、执行策略。然后现实自己补了一张插图。

GitHub 9 月 17 日把 Workflow Execution Protections 推到正式可用：管理员可以在 workflow 真正运行之前，从平台层规定谁能触发、哪些事件可以触发，甚至把规则缩到具体 workflow 文件。自动化脚本不再天然拥有解释自己执行边界的最后权力。

而上周 Meta 发布 Muse 时，另一套答案已经出现在个人 Agent 产品里：Muse 运行在独立 Secure VM 中，凭据与 Agent 隔离；另一个系统级 Sentinel 独立审批联网与敏感动作；用户可以看到审计轨迹，也可以细分某个服务只允许“读”还是同时允许“写”。

这两件事一边来自大众产品，一边来自开发基础设施，指向的却是同一件事：**自动化越强，执行边界越要独立于自动化本身。**

好的 Agent 不只是更会做事。它还应该越来越清楚地回答：谁允许我做、允许到哪里、什么时候必须停下来问人，以及事后谁能证明我到底做过什么。

[原始来源：GitHub ↗](https://github.blog/changelog/2026-09-17-workflow-execution-protections-in-github-actions-generally-available/) · [Meta Muse ↗](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/)

## 值得知道

### AI 已经能正式 Approve PR，但真正稀缺的仍然是有人负责判断

GitHub Copilot Code Review 从 9 月开始已经可以提交正式 Approve；管理员开启以后，这个批准可以计入仓库的 required approvals，新 commit 推上来以后还会像人类审批一样自动失效并要求重新审。

两周后，Google 在 GSoC India 社区总结里又把另一面说得很清楚：AI 可以越来越便宜地生成模板、测试、语法修复和初步代码，但 maintainer 的时间、项目历史、架构判断和高质量 Review 并没有一起扩容。

把这两件事放在一起看比单看任何一边都有意思。

以后“有没有人帮忙看 PR”也许会越来越容易解决；真正稀缺的可能变成：**有没有人愿意为这个判断负责。**

[原始来源：GitHub ↗](https://github.blog/changelog/2026-09-01-copilot-code-review-can-now-approve-pull-requests/) · [Google Open Source Blog ↗](https://opensource.googleblog.com/2026/09/reconnecting-with-the-heart-of-open-source-highlights-from-our-2026-gsoc-india-tour.html)

### Firefox × Mistral：浏览器里的模型选择，开始像新的默认搜索引擎之争

Mozilla 与 Mistral 的合作本身不复杂：Mistral Small 4 进入 Firefox Smart Window beta，Mozilla 继续强调用户可以选择其他模型。

更有意思的是 Mozilla 给这件事的定义。它没有只把这当作“浏览器也加一个 AI 功能”，而是明确谈到模型竞争、分发入口与用户选择。

浏览器曾经围绕默认搜索引擎形成巨大的平台权力。现在，一个新的问题开始出现：**如果 AI 成为浏览器里的常驻交互层，默认替你思考的是谁？**

[原始来源：Mozilla ↗](https://blog.mozilla.org/en/firefox/mozilla-mistral-partnership/)

### 广告开始从“给你看一句话”变成“派一个 Agent 来跟你谈”

OpenAI 9 月 16 日开始测试 Sponsored Agents。用户点击广告后，可以进入一个明确标识为商业赞助的 Agent 对话；同时，ChatGPT Ads 继续接入 HubSpot、Shopify 等商业工具。

广告过去的基本单位大多是一次曝光、一次点击、一个落地页。现在它可能逐渐变成一段持续对话。

这个变化并不一定更坏，也不一定自动更好，但它会让一些旧问题重新变得尖锐：**谁在说话？谁为它的话负责？它是在回答，还是在说服？**

[原始来源：OpenAI ↗](https://openai.com/index/reimagining-advertising-with-ai/)

## 上周漏网之鱼

创刊号已经很满，但上周素材池里还有几条没进去。第二期不按日历主义办刊，值得留下的东西可以晚一班车。

### NVIDIA PAIR：把家里的几台机器变成一个本地推理调度池

NVIDIA 的 Personal AI Router 会在同一局域网里的兼容设备之间分发独立推理请求，支持 Ollama、LM Studio 等现有接口。它不会把几块 GPU 合成一块更大的显存，也不会把同一个模型拆到多台机器上跑；它做的是另一件更朴素的事：**哪台机器现在能接活，就把下一份请求送过去。**

这对多 Agent 本地工作流很实际。家里那几台本来彼此独立的 RTX PC、DGX Spark 或部分 Apple Silicon 机器，开始可以被当作一组可调度资源，而不需要先把自己变成集群管理员。

[原始来源：NVIDIA ↗](https://developer.nvidia.com/blog/nvidia-pair-virtual-inference-router-expands-available-compute-on-your-local-network/)

### “Bug fix”并没有告诉你这道 Coding Agent 题到底难在哪里

一篇分析五个 Agent 软件工程 benchmark、14,922 条轨迹的研究提出了 Spread / Novelty / Centrality 三个维度，用来描述仓库级任务真正要求 Agent 改多少地方、需要多少新东西、触碰的代码有多核心。

结论里最好的一刀是：**“bug fix”“feature implementation”这种标签，其实很难代表真实任务难度。**

这对所有热衷拿一个总分给 Coding Agent 排座次的人都值得提醒一下。Benchmark 当然可以比，但先得知道我们到底在比什么。

[原始论文：arXiv ↗](https://arxiv.org/abs/2609.01271)

## 项目与工具

### 一块给 AI Coding 用的实体键盘，听起来荒谬得很合理

Logitech 的 MX Keypad 把 prompt、refactor、命令与跨 App 动作绑到实体按键，并把 GitHub Copilot、Claude Code、VS Code、IntelliJ 等开发工具放在同一个桌面控制面里。

它未必会成为下一代开发者标配，但这个产品的出现本身已经很有意思：当桌面上同时住着几个 Agent、IDE 和上下文窗口时，我们居然又开始需要物理按钮来管软件。

软件绕了一大圈，最后还是想长出几个按键。

[原始来源：Logitech ↗](https://news.logitech.com/press-releases/news-details/2026/Logitech-Unveils-MX-Keypad-for-Developers-The-Customizable-Multi-App-AI-Control-Center/default.aspx)

## 研究与设计

### HardFlow：过程可以探索，结果必须守住硬边界

MIT 团队介绍的 HardFlow 有一个很漂亮的反直觉：在安全关键任务中，不一定要强迫生成模型的每一个中间步骤都满足硬约束；可以让它在内部保留更多搜索自由，但最终输出必须严格满足不能妥协的条件。

它当然不是一篇 Agent 权限论文，但这个设计直觉很容易让做执行系统的人产生共鸣。

好的边界未必意味着把每一步都管死。它也可以意味着：**允许探索，但不能允许最终越线。**

[原始来源：MIT News ↗](https://news.mit.edu/2026/new-method-enables-ai-safety-critical-situations-0914)

### 有人正在用土壤生物电池重新想象“计算基础设施”

V&A 今年 Digital Design Weekend 里有个很容易让人停下来多看一眼的项目：Microbial Feral Computing，用土壤中的微生物生物电池驱动低功耗计算实验。

这不是“下一代数据中心”的商业预告，也不需要硬给它套上宏大趋势。它只是把一个太容易被我们默认的问题重新摊开：计算一定要长成机房、服务器和云吗？

当计算重新回到材料、能源和生态本身，哪怕只是一个实验装置，也足够让人想起：**“基础设施”这个词，从来不只属于水泥和机柜。**

[原始来源：V&A ↗](https://www.vam.ac.uk/blog/digital/digital-design-weekend-returns-to-va-south-kensington-this-september)

## 鬼集

### 一次 1847 年的火车晚点，178 年后终于补完了事故 RCA

1847 年，英国一列火车大约晚点了 16 分钟。

一百多年以后，研究者重新审视当时的记录，认为太阳活动引发的电流可能干扰了铁路电报和信号系统。也就是说，维多利亚时代的人已经在使用一套足够联网、足够现代，以至于会被“太空天气”搞坏的基础设施。

这大概是我们见过最慢的一次根因分析。

系统早就下线了，参与者也都不在了，事故报告终于补齐。

[研究报道：Phys.org ↗](https://phys.org/news/2026-09-minute-delay-solar-storm-disrupted.html)

### 被火山烧成炭的卷轴，可能因为墨里有铅而更容易重新读出来

赫库兰尼姆卷轴这些年一直是“虚拟展开”技术最迷人的应用之一：不真正打开脆弱文物，而是利用成像和计算方法尝试恢复里面真实存在的文字。

新的材料研究提示，卷轴墨水中的铅可能帮助 X 射线更好地区分墨迹与纸草基底。

这里最动人的地方不是“AI 生成古代文字”。恰恰相反，是我们越来越有能力**少碰一点原物，却多读回一点真实留下来的东西。**

[研究报道：Phys.org ↗](https://phys.org/news/2026-09-lost-ancient-scrolls-eruption-mount.html)

## 工程现场

### CI 全绿，不等于真正部署

这周真实工程现场里反复出现的另一个提醒是：一条流水线显示 success，不代表它最关键的外部动作真的发生了。

凭据缺失、第三方授权变化、部署来源切换，都可能让某一步被跳过，而总状态仍然看起来很健康。绿色只是状态，**执行证据才是证据。**

这和 Agent 也好、CI 也好，其实是同一个问题：系统越自动，越不能只相信它最后说了一句“完成”。

## 继续看

### Agent 的事故以后会不会像普通软件事故一样有完整证据链？

今天很多 Agent 出错以后，我们仍然依赖聊天记录、局部日志和人的回忆拼现场。等它们真正进入支付、发布、运维和企业工作流，这种证据质量大概撑不了太久。

第二期先把这个问题留在这里。
