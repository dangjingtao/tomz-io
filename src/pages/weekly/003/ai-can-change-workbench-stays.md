---
title: "当 AI 可以换，工作台留下"
description: Android Studio 开始允许 Codex、Claude Agent、Antigravity 接进同一个 IDE，Isaac ROS 开始把文档变成 Agent 可用的工作接口，Firefox 则把 AI 收进一个可选择的窗口。模型越来越可以替换以后，真正难替换的东西正在换位置。
group: 见π
order: 2
issue: 3
date: 2026年9月26日
readTime: 8 分钟阅读
lead: 当 Agent 可以换着用，产品最重要的部分就不一定还是那个模型。上下文、工具、权限、验证和工作连续性，开始重新决定谁才是真正的工作台。
tags:
  - Agent
  - AI Coding
  - IDE
  - 浏览器
  - 机器人
  - 产品
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

以前我们谈 AI 工具，很容易把问题缩成一句：

**哪个模型更强？**

代码能力更强一点，推理更稳一点，上下文更长一点，价格再便宜一点。产品之间的差异，看起来几乎等同于模型排行榜。

但这周几件事情放在一起，那个问题突然开始显得不够用了。

Android Studio 开始允许开发者把不同 Coding Agent 接进同一个 IDE。Claude Agent、Codex、Google Antigravity，以及其他兼容 ACP 的 Agent，都可以进入同一个工作环境。

真正有意思的不是“又支持了三个 AI”。

而是：**如果 Agent 可以换，什么东西不会跟着一起换？**

## Agent 换了，项目还在这里

Google 在 Android Studio Rabbit 2 Canary 里预览 Bring Your Own Agent。

按照官方说明，Android Studio 会通过 Agent Client Protocol 把项目图、构建配置和平台信息提供给 Agent；同时继续提供 build diagnostics、Jetpack Compose Preview、Android SDK 工具和模拟器控制。开发者可以在不同 Agent 之间切换，一个额度用完或者表现不合适，就换另一个接手。

换掉的，是推理与执行模型。

没有跟着换掉的，是项目本身的工作现场。

代码在哪里，怎么构建，模拟器是什么状态，哪些诊断已经出现，刚才做到哪一步，什么动作需要权限——这些东西越来越由 IDE 提供。

这会把 IDE 的角色悄悄改掉。

过去它主要是一套给人写代码的工具。

现在它开始更像一个 **Harness**：模型只是进入这个环境工作的一个执行者，真正掌握长期上下文、工具、权限和验证路径的，是环境本身。

[Android Developers：Build your way — Use any AI agent of your choice in Android Studio](https://android-developers.googleblog.com/2026/09/build-your-way-use-any-ai-agent-in-android-studio.html)

## 文档也不再只写给人看

NVIDIA Isaac ROS 5.0 做了另一件看起来很小、其实方向很明显的事。

它开始提供 agent-ready documentation 和可复用的 Isaac skills。

其中有些 skill 只是帮开发者完成 setup 和 manipulation；有些已经进一步处理 FoundationStereo fine-tuning、pick-and-place 之类更完整的机器人开发任务。

过去，文档默认面对的是一个人。

人读懂说明，理解上下文，再自己调用工具。

现在软件开始主动问：

> 如果下一个使用者是一个 Agent，我应该怎样把自己的能力交给它？

一份网页文档不够。

Agent 需要知道操作顺序，需要机器可理解的入口，需要能够验证结果，也需要知道失败以后应该停在哪里。

所以软件真正为 Agent 准备的东西，最后很可能不是一个更大的聊天框，而是一套**机器可以进入的工作环境**。

[NVIDIA：Isaac ROS 5.0 Advances Agentic, Open Source Robotics Development](https://blogs.nvidia.com/blog/isaac-ros-5-0-agentic-open-source-robotics/)

## 另一种答案：别让 AI 占满整个产品

Firefox 这周给了一个很不一样的答案。

Mozilla 没有宣布“Firefox 从此就是 AI Browser”。

它把桌面浏览器分成 Classic、Private 和 Smart 三种窗口。Smart Window 是可选的 AI 工作空间，可以在用户授权下读取当前标签页、最近浏览内容和页面上下文，也可以使用本地保存、可删除的 memories；不需要这些能力时，用户仍然可以回到普通窗口。

甚至 Smart Window 本身也允许用户选择不同 AI 模型，或者带自己的模型。

这和 Android Studio 的方向表面上差得很远。

一个是 IDE，一个是浏览器。

但底层其实很像：

**AI 被放进一个有边界的环境里，而不是把整个产品交给某个 AI。**

Firefox 仍然掌握浏览器的历史、标签页、权限和交互边界。模型负责在这个环境里帮忙完成任务，但它不是浏览器本身。

[Mozilla：Classic, Private, or Smart?](https://blog.mozilla.org/en/firefox/firefox-window-types/)

## 模型变成租客以后

这并不意味着模型不重要。

一个能力很差的 Agent 放进再好的 IDE，还是做不好工作。

但当模型能力越来越接近、供应商越来越多、协议开始允许替换时，产品差异就会从“我独占哪个模型”向别处迁移。

一些以前不起眼的东西开始变贵：

- 这个环境到底知道多少真实上下文；
- 它能调用哪些工具；
- 权限能不能被清楚限制；
- Agent 做完以后谁验证；
- 一次会话结束以后工作状态还能不能留下；
- 换一个模型以后，用户是不是必须从头再来。

这些都不是模型参数。

但它们决定一个 Agent 是在“回答问题”，还是在一个真实系统里继续工作。

## 护城河也许正在换位置

AI 产品早期有一个很自然的冲动：尽量把最聪明的模型绑在自己身上。

如果最好的能力只有少数供应者能提供，这当然合理。

但当 Android Studio 已经公开演示“这个 Agent 不行就换另一个”，Firefox 允许用户选择模型，机器人平台开始把能力整理成 Agent 可调用的 Skills，另一种产品逻辑就开始出现：

**模型可以是供应商，环境才是产品。**

这并不是说所有产品都会变成平台，也不意味着工作环境天然就有护城河。

如果上下文很差、工具不好用、权限混乱，用户一样会离开。

真正难复制的是另一件事：长期积累下来的工作状态、用户习惯、工具集成、验证方式和真实关系，逐渐聚集在同一个地方。

这时候换模型，只像换一个更适合当前任务的工人。

工地没有因此消失。

以前我们争夺的是谁拥有更强的能力。

接下来，也许会越来越多地争夺另一件东西：

**能力到底在哪里工作。**

---

延伸阅读：

[Android Developers：Use any AI agent of your choice in Android Studio](https://android-developers.googleblog.com/2026/09/build-your-way-use-any-ai-agent-in-android-studio.html)

[NVIDIA：Isaac ROS 5.0 Advances Agentic, Open Source Robotics Development](https://blogs.nvidia.com/blog/isaac-ros-5-0-agentic-open-source-robotics/)

[Mozilla：Classic, Private, or Smart? Choose the right Firefox window](https://blog.mozilla.org/en/firefox/firefox-window-types/)
