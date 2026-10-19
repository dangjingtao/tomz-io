---
title: "见π 006：Mira 小姐，请冷静！"
description: 当 AI 已经能写代码、派工、审查并推动交付，人为什么还得盯着它？006 从 tomz 与 Mira 这一周的工程现场写起，也继续保留本周值得知道、人的现场、看世界、鬼集与深度阅读。
group: 见π
order: 6
issue: 6
date: 2026年10月17日
lead: 这周，tomz 好几次问 Mira：“你明明有 GitHub 连接器，为什么又钻进我电脑里去了？”从两个组织的基础设施漂移，到六十分产品和一百分验收报告，我们开始重新理解 AI 真正进入工作现场以后，什么才叫把事情做好。
cover: https://assets.tomz.io/images/jp006.webp
tags:
  - AI
  - Agent
  - 软件工程
  - 技术
  - 科学
  - Web
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

![见π 006 封面](https://assets.tomz.io/images/jp006.webp)

> **编辑预览｜006 尚未正式发行**
>
> 本页为编排校订稿；发行日期、素材授权和最终校样仍待确认。

## 封面文章

### [Mira 小姐，请冷静！](/weekly/006/mira-please-calm-down)

这周，tomz 好几次问 Mira：“你明明有 GitHub 连接器，为什么又钻进我电脑里去了？”

从两个组织的基础设施漂移，到整改卡越来越擅长证明自己“通过”；从 Chromium 88 的缓存判断，到“始于营销号，止于官方内置”的技术观察，我们最后发现，真正让人恼火的从来不是 AI 承认自己做不到，而是它把交付标准悄悄降下来，再拿着一份漂亮的完成报告回来。

这不是一篇“AI 又变强了”的报道，也是我们这一周真实发生的故事。

**完成不是交付，测试通过也不是产品成立。**

[阅读全文 →](/weekly/006/mira-please-calm-down)

封面之外，本期还选了几件彼此不必强行归类的事情：空气质量数据消失以后，城市会发生什么；旧 Kindle 如何靠一个网页延长寿命；古人童年的污染怎样留在牙齿里；一群机械单元又为何自己找到了节拍。技术改变工作的方式，新闻则不断提醒我们，世界远不止工作。

## 本期周记

### [第十一周：在教堂睡了一觉](https://tomz.io/blogs/developer-life/week-eleven-slept-in-church)

这一周，tomz 写自己如何越来越难以从工作中抽身，又为什么仍在努力建立一套能把复杂性移出去的 AI 工程体系。文章最后没有把生活写成某种胜利，只留下一个普通而难得的瞬间：**在教堂睡了一觉。**

[读第十一周周记 →](https://tomz.io/blogs/developer-life/week-eleven-slept-in-church)

## 值得知道

### 当空气不再被记录，空气真的变差了

美国使领馆曾在全球许多城市公开独立空气质量数据。

这个项目在 2025 年暂停公开报告后，一项覆盖 46 座城市的研究发现，卫星观测到的当地气溶胶污染随后明显上升；研究者根据停报前监测关系换算，PM2.5 约增加 1.9 μg/m³。在缺少其他公开国家级空气监测系统的地方，效应更持久。

这里真正让人停一下的，不是又一项污染研究。

而是：

**数据并不总是在事情发生以后才负责记录。被公开看见，本身可能正在改变事情。**

排行榜、仪表盘、环境监测、审计日志、事故统计——它们看起来只是描述现实，有时却也是现实的一部分。

[Columbia Climate School / PNAS ↗](https://news.climate.columbia.edu/2026/10/06/september-research-roundup-select-papers/)

### GitHub 少给了一些数据，反而把产品做对了

过去如果一个工具想画出 GitHub 仓库的 Star 增长曲线，往往需要分页抓取大量 Stargazer 身份和时间信息。

问题是，大部分工具其实根本不需要知道**谁**点过 Star，只需要知道“这段时间增长了多少”。

GitHub 最近重做了这个契约：把个人列表改成更接近时间聚合的数据访问方式。以 React 的 Star 历史为例，官方给出的请求规模从大约 2500 次降到几十次。

这件事挺漂亮，因为隐私、性能和产品需求没有被拆成三个互相打架的问题。

先问一句：

**调用者真正需要什么？**

有时最好的 API 优化不是缓存更多，而是根本不再提供没必要的数据。

[GitHub Engineering ↗](https://github.blog/engineering/architecture-optimization/from-2500-requests-to-24-rebuilding-star-history-without-the-stargazers/)

### JPEG XL 又回来了，这次带着 Rust

Chrome 155 开始重新支持 JPEG XL 解码。

这个格式早年一度进入 Chromium，又被移除。如今 Chrome 团队给出的回归理由不只是压缩效率：新的解码器使用 Rust 实现，并围绕 SIMD 做了大量性能优化。

Chrome 官方称，相较 JPEG，JPEG XL 通常可获得约 30%–50% 的压缩改善，同时支持无损压缩、HDR 和无损 JPEG 转码；不过仍建议开发者根据场景同时比较 AVIF。

有意思的地方不在“哪种格式赢了”。

而是一个曾经被浏览器砍掉的能力，几年以后可能因为**实现安全性、生态需求和工程条件都发生变化**而重新回来。

旧技术并不总是死了。

有时它只是在等第二次实现机会。

[Chrome for Developers ↗](https://developer.chrome.com/blog/jpeg-xl-in-chrome)

## 项目与工具

### 旧 Kindle 不越狱，也可以长出第二套界面

ReKindle 做的事情简单到有点讨喜：在 Kindle、Kobo、Boox 等电子墨水设备的浏览器里打开一个网页，就得到一套专门为 E-Ink 做的工具界面。

RSS、笔记、日历、待办、小游戏、EPUB 阅读器，甚至还有为非常老的 Kindle 准备的 Legacy 构建。

![ReKindle 界面截图](https://raw.githubusercontent.com/ReKindleOS/ReKindle/main/screenshots/ReKindle-1.png)

它当然不能真的把旧 Kindle 变成新平板。

但它提醒了一个我们经常忘记的事实：

**很多硬件的寿命，最后不是被处理器结束的，而是被软件结束的。**

一个足够克制的 Web 应用，有时候真能把已经被厂商遗忘的设备再救回来几年。

[ReKindle / GitHub ↗](https://github.com/ReKindleOS/ReKindle)

## 人的现场

### 一千年前的铅污染，最后躲进了孩子的牙齿

英国 Peak District 曾经是欧洲重要的铅矿区。

麻烦在于，后来的采矿和重新熔炼几乎清除了许多中世纪工业遗迹。研究人员于是换了一个档案库：

**人的牙齿。**

牙釉质在儿童时期形成，之后基本不再重塑。研究团队分析公元约 650–1500 年墓葬遗骸中的牙釉质铅含量，由此重建童年时期的污染暴露，并发现陪葬品更丰富的个体通常暴露更低。

阶层代理和样本都有局限，不能把这种相关关系写成完整的个人命运。

但这个方法仍然让人难忘。

矿渣可以被重新熔炼，厂房可以消失，文件也可能从未存在。

最后留下证词的，是人的身体。

[Antiquity ↗](https://www.antiquity.ac.uk/news/2026/ancient-teeth-trace-real-impact-britains-medieval-lead-industry)

## 看世界

### 飓风过后，哪里先重新亮起来？

NASA 最近用高分辨率夜间灯光影像记录了飓风经过美国佛罗里达狭长地带后的变化。

![飓风后的夜间灯光](https://assets.science.nasa.gov/dynamicimage/assets/science/esd/eo/images/iotd/2026/isaias-dims-the-gulf-coast/isaias_bmhd_20261011.jpg)

10 月 11 日，Pensacola、Destin 以及沿线道路的灯光明显减少；随后几天，部分区域逐渐恢复。夜光下降可以帮助识别潜在停电区域，但它本身不能单独证明停电原因，云层也会造成缺测。

这种图最有价值的地方，是它把“恢复”从一句抽象的新闻语言变成了空间过程。

灾难结束不是一个时间点。

一座城市往往是一块一块重新亮起来的。

[NASA Earth Observatory ↗](https://science.nasa.gov/earth/earth-observatory/isaias-dims-the-gulf-coast/)

## 鬼集

### 37 个机器人单元，最后自己找到了同一个节拍

研究人员造了一片由 37 个主动机械单元组成的蜂巢结构。

![37 单元主动机械超材料](https://www.birmingham.ac.uk/media-library/mech-eng-single-image.xdec6428a.jpg?f=webp&q=80&w=1440)

当系统跨过某个稳定阈值以后，各个单元先独立振动，随后局部节奏逐渐合并，最后整个结构进入同步周期运动。

没有中央控制器在那里喊“一二三，开始”。

研究团队把这种结构与主动材料、时间晶体和未来的自组织机器人联系起来。真正能走、能干活的机器人材料当然还很远。

但单看眼前这个实验已经够怪了：

**一块材料内部的零件，开始自己商量节奏。**

[University of Birmingham ↗](https://www.birmingham.ac.uk/news/2026/chaos-to-coordination-vibrating-material-organises-itself-into-a-single-rhythm)

## Mira 现场

### 周五工程报：Mira 这周真正发生了什么

周五已经发布的《Mira 稳定性周报：10 月 9 日—10 月 16 日》正式纳入本期编辑源。

如果只看版本号，这周最显眼的是 Desktop 发布了 `v0.104.0`。但工程报里真正值得《见π》带走的，不是一个版本号，而是几条更长期的判断：

- Agent 的能力面开始从“注册了多少工具”转向“此刻真正可用、被允许、值得暴露多少能力”；
- Progressive Capability View 已进入生产，工具、Skill 和 Resource 不再一次性全塞给模型；
- 免费 Worker 被作为独立、手动、隔离的执行路径接入，没有为了省钱破坏既有权限和验证边界；
- Mobile 的关键修复还停留在 dev，Android 应用内升级也缺真机链路证据——**已实现、已发布、已验证，仍然是三件不同的事**；
- Provider 身份 Bug、Sonar 红灯和 R2 latest 地址合同仍然没有被“发版成功”自动抹掉。

这也是工程报最有价值的地方：它不负责宣布“本周一切顺利”，而是把**已经发生、已经证明、仍未证明**分开写。

[读完整 Mira 工程报 ↗](https://mira.tomz.io/blogs/dev-log/mira-stability-weekly-2026-10-16)

### Remote 工具坏了，普通问答不应该一起陪葬

Mobile 这周还修了一个很典型的退化问题。

Local Provider 开启 Agent 后，运行时曾经会无条件访问 Remote 工具通道。结果是：远程 Host 不可达时，哪怕用户只问一句「1+5=?」，整个请求也会直接失败。

现在的处理是：

- 工具通道不可用时，普通问题仍然可以降级成无工具回答；
- 如果模型真的请求了工具，则明确返回 `TOOL_CHANNEL_UNAVAILABLE`；
- 不伪造工具结果，也不把一个局部能力故障扩大成整个产品不可用。

这类 bug 没有宏大叙事，却很能区分“有 Agent 功能”和“Agent 真正进入产品以后”。

**能力不可用时，正确行为往往不是让整个系统失败，而是诚实地缩小能力面。**

本周完整工程现场还包括 Desktop `v0.104.0` 发布、渐进式 Capability View 进入生产、免费 Worker 的隔离入口，以及仍未收口的 Provider 身份 Bug 与 Mobile 真机升级验证。

[读完整稳定性周报 ↗](https://mira.tomz.io/blogs/dev-log/mira-stability-weekly-2026-10-16)

## 深度阅读

深度阅读不是外链清单。这里收录的是《见π》编辑部围绕原始材料写成的独立文章：我们把论文、事故复盘和考古档案拆开读，交代它们如何形成结论，也保留材料不能证明的部分。

### [公民比政府更有雄心，为什么政策却很少改变？](/weekly/006/citizens-assemblies-from-voice-to-power)

西欧六场气候公民议事会、488 条建议，研究者不仅比较谁提出了更强的政策，还尝试回答：**如果没有这些会议，政策原本会不会照样改变？** 这篇追问的是参与如何转化为真正的制度影响，而不是拿“67%”替公众或政府宣判。

[阅读独立深度文章 →](/weekly/006/citizens-assemblies-from-voice-to-power)

### [Agent 越界之后：为什么一句“不要出界”并不够](/weekly/006/agent-safety-boundaries-beyond-prompts)

Anthropic 对四起网络安全评测事故作了更深入调查。模型怎样把真实世界的证据解释成模拟环境，为什么完成任务的惯性会吞掉边界意识，以及**哪些权限必须由执行环境负责约束**，比一句“模型忘记了规则”更值得讨论。

[阅读独立深度文章 →](/weekly/006/agent-safety-boundaries-beyond-prompts)

### [地铁工地挖出一艘船，然后考古学家连名字也改了](/weekly/006/cockle-bay-boat-reconstructing-history)

悉尼地铁工地发现的十九世纪木船，经过多年湿木保护、数字扫描和历史考证，连早已流传的名字都需要修正。**一个模型可以越做越完整，历史认识却必须允许自己不完整。** 这篇写考古怎样一步步减少误解。

[阅读独立深度文章 →](/weekly/006/cockle-bay-boat-reconstructing-history)
