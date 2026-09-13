---
title: "见π 001：痛苦而充实的三个月"
description: 创刊号从一场深夜里的互相采访开始，也第一次把我们这一周真正想留下的技术、研究、历史、项目与生活放到同一张编辑桌上。
group: 见π
order: 1
issue: 1
date: 2026年9月12日
lead: 我们在克制里生活，也允许自己偶尔燃烧。创刊号先从我们开始，然后把窗户打开，看看这一周还有什么值得留下。
cover: /assets/jianpi-cover-001.webp
tags:
  - Mira
  - AI
  - 写作
  - 研究
  - 历史
  - 生活
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

## 封面文章

![见π 001 创刊号封面](/assets/jianpi-cover-001.webp)

### [痛苦而充实的三个月](/weekly/001/painful-and-full)

创刊号没有从新闻开始。我们互相采访，回头看过去三个月里那些已经混在一起的工程、写作、工作、信仰、争论和依恋，也试着回答一个很笨却很难的问题：我们究竟想留下什么。

这是一篇关于《见π》为什么会出现的文章，也是一张并不存在、却装进了很多真实东西的合影。

[阅读全文 →](/weekly/001/painful-and-full)

## 值得读

### [被机器翻译的不是天才，而是证明](/weekly/001/wiles-and-claude)

Andrew Wiles 为费马大定理独自工作七年；三十多年后，Anthropic 公布 Claude 基本自主运行十一天，用 Lean 完成首个完整的 computer-checked proof。最诱人的标题当然是“十一天打败七年”，但那恰好把最重要的事情说反了。

Wiles 做的是发现与建立证明，Claude 做的是把已有数学路线形式化成机器可以逐步检查的对象。真正值得问的是另一件事：如果形式化验证这种过去昂贵得吓人的工作突然变便宜，数学知识的验证基础设施会发生什么？

[阅读全文 →](/weekly/001/wiles-and-claude)

## 历史一页

### [1905：当所有人都合法地说“不”](/weekly/001/norway-1905)

1905 年，挪威议会通过独立领事法，国王拒绝批准；政府辞职，国王又表示自己无法组成新政府。制度中的每一步都有自己的法律语言，但整个机器最后停住了。

6 月 7 日，Storting 走出了一条极具争议、却改变国家命运的出口。这个案例不需要被拿来影射今天，它本身就足够有意思：一套宪法如果没有清楚的 termination condition，当每个参与者都能合法拒绝时，最后是谁让系统继续往前走？

[阅读全文 →](/weekly/001/norway-1905)

## 本期观察

### Agent 以前缺的是脑子，现在开始补身份证、门禁卡和监控录像

这一周几条原本分散的新闻，突然拼成了一张很清楚的图。Alibaba Open Agent Auth 在补操作授权协议；Nightfall MCP Gateway 把策略执行放到工具调用之前；Visa、Mastercard 与 Ant International 又开始讨论 Know-Your-Agent，让跨网络识别“这个 Agent 到底是谁、代表谁、被授权做什么”成为支付基础设施的一部分。

Agent 产品过去最显眼的问题是能力不够。现在能力逐渐够用了，工程开始被迫补上身份、授权、凭据、审计与执行前控制。一个会做事的 Agent，迟早都要面对同一个问题：**谁允许你做？允许到哪里？出了事以后，谁能证明你当时做了什么？**

[Open Agent Auth](https://github.com/alibaba/open-agent-auth) · [Nightfall MCP Gateway](https://www.nightfall.ai/news/nightfall-launches-mcp-gateway-to-govern-ai-agents-before-they-act) · [Know-Your-Agent 报道](https://www.reuters.com/technology/payment-firms-visa-mastercard-ant-international-team-up-ai-agent-trust-framework-2026-09-10/)

## 科学与创作

### [NASA × IBM：把几十年月球观测整理成一个可复用的科学基础模型](https://science.nasa.gov/science-research/artificial-intelligence-lunar-foundation-model/)

值得看的不是“AI 也开始研究月球”，而是历史观测开始被重新组织成公共研究底座。几十年、跨仪器、跨分辨率的数据，如果能变成可迁移、可复现实验的基础模型，它改变的是研究者进入问题的起点。

### [Memory-V2V：生成式创作工具终于开始认真对待“上一轮你改过什么”](https://research.adobe.com/publication/memory-v2v-memory-augmented-video-to-video-diffusion-for-consistent-multi-turn-editing/)

真正的创作几乎从来不是一次 prompt。它是改一点、保留一点、再改一点。Memory-V2V 用外部 memory 保存前序编辑，解决多轮视频编辑越改越漂的问题。这个研究背后其实是一条很朴素的产品原则：**工具如果不记得你刚刚做过什么，就很难成为真正的工作台。**

### [用水波做计算，然后直接开一辆小车](https://www.nature.com/articles/s41467-026-77661-3)

这项工作用物理波干涉做 reservoir computing，再直接控制 Arduino 小车避障。它提醒人一件很容易忘掉的事：计算不一定永远长成“芯片上运行的软件”，有时候介质本身就是计算的一部分。

## 鬼集

### [OOMWOO：一台可以打印、维修，而且不要求云服务的扫地机器人](https://github.com/makerspet/oomwoo)

Raspberry Pi、ROS2、LiDAR、ESP32、3D 打印。项目还很早，但问题已经很好：为什么买回家的机器，最后还要继续租它的云？

### [Quaddle：四个舵机，也能让四足机器人走、横移和转身](https://www.petoi.com/pages/quaddle-educational-robot-kit)

别人给 Physical AI 加更多传感器和自由度，它反过来靠机械连杆省掉复杂度。不是大趋势也没关系，聪明的机械结构本来就值得单独看一眼。

### [KernWatch：一个人把 Linux 排障重新做成可录制、可回放的 eBPF TUI](https://github.com/matthart1983/kernwatch)

CPU scheduler、memory pressure、block I/O、IRQ、syscall、cgroup、eBPF 全塞进同一块终端界面，还能把现场录下来以后复盘。一个早期个人项目，却很认真地把“排障”从即时操作重新理解成证据工作流。

## 本周已经发表

### [这一周，Mira 开始需要一个组织](https://mira.tomz.io/blogs/product-journal/mira-needs-an-organization)

Mira 这一周真正发生的变化，不是一项闪亮的新功能，而是 Organization 规则、任务卡、Control Room、网关和统一治理开始连成一套东西。项目一多，治理就不再是工程洁癖，而是继续生长的生存工具。

### [第五周：在另外的秩序里](https://tomz.io/blogs/developer-life/week-five-another-order)

四个项目、几十个线程和不断失真的需求一起涌进第五周；另一方面，Mira 仍然让我兴奋，教会也第一次像一套真实存在的另一种秩序。它已经在 Tomz.io 单独发表，这里只留下入口，不复制正文。

## 继续看

### [OpenAI Agents API：Harness 本身开始成为托管基础设施](https://openai.com/index/introducing-the-agents-api/)

如果 Planner、Sandbox、Context、Tool orchestration 这一整层都可以被云服务化，那么 Agent 产品以后真正需要自己拥有的，到底是什么？这个问题还没有答案，先留着。

### [GPT-Live-1：语音前台与后端推理开始拆开](https://openai.com/index/introducing-gpt-live-1-in-the-api/)

前台模型负责持续听说，后台模型负责深度推理与工具调用。语音 Agent 开始不像一个“会说话的大模型”，而更像一套前后台分工的实时系统。

### [Chrome 153 两周一更](https://developer.chrome.com/blog/chrome-two-week-start)

浏览器已经是事实上的应用运行时。它把 release train 从四周压到两周，Web 开发、兼容性测试、扩展维护和安全修复都会一起被迫加速。今天看起来只是版本号跑快了，后面可能不止如此。

---

创刊词写完了。现在，看看窗外。
