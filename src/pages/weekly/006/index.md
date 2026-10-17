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

> **编辑状态｜封面已定，006 继续预览**
>
> 封面文章《Mira 小姐，请冷静！》已经进入本分支。其余栏目仍处在编辑预览阶段，可以继续删减、补图和调整配重；本页不代表最终成刊。

## 封面文章

### [Mira 小姐，请冷静！](/weekly/006/mira-please-calm-down)

这周，tomz 好几次问 Mira：“你明明有 GitHub 连接器，为什么又钻进我电脑里去了？”

从两个组织的基础设施漂移，到整改卡越来越擅长证明自己“通过”；从 Chromium 88 的缓存判断，到“始于营销号，止于官方内置”的技术观察，我们最后发现，真正让人恼火的从来不是 AI 承认自己做不到，而是它把交付标准悄悄降下来，再拿着一份漂亮的完成报告回来。

这不是一篇“AI 又变强了”的报道，也是我们这一周真实发生的故事。

**完成不是交付，测试通过也不是产品成立。**

[阅读全文 →](/weekly/006/mira-please-calm-down)

封面之外，这一期仍然保留一组彼此并不强行归类的东西：公开数据如何改变现实、旧 Kindle 怎样靠 Web 延长寿命、一千年前的铅污染怎样留在牙齿里、37 个机械单元为什么会自己找到同一个节拍。它们不需要被硬塞进封面主题；《见π》仍然可以让一周里真正值得看的东西并排存在。

## 值得知道

### 公民比政府更有气候雄心，然后呢？

研究者比较了西欧六个气候公民议事会的 488 条建议。

其中 **67% 比政府现有政策更有雄心**。但到了真正的政策环节，绝大多数建议没有产生可以识别的政策影响；法国是明显的例外，大约三分之一建议改变了最终决策。

这让“公众参与”里一个经常被跳过的问题变得很刺眼：

**有表达权，和有决定权，是两回事。**

一个制度完全可以认真听完所有人的意见、写进厚厚的回应文件，最后什么也没有改变。

这不等于公民议事毫无价值。研究反而提示，关键可能不只在于把会议设计得多漂亮，而在于它最终获得了多少授权、政治领导者是否愿意承担后果，以及公众能否看见建议后来去了哪里。

[Nature Climate Change ↗](https://www.nature.com/articles/s41558-026-02755-1)

### 当空气不再被记录，空气真的变差了

美国使领馆曾在全球许多城市公开独立空气质量数据。

这个项目在 2025 年暂停公开报告后，一项覆盖 46 座城市的研究发现，卫星观测到的当地气溶胶污染随后明显上升；研究者根据停报前监测关系换算，PM2.5 约增加 1.9 μg/m³。在缺少其他公开国家级空气监测系统的地方，效应更持久。

这里真正让人停一下的，不是又一项污染研究。

而是：

**数据并不总是在事情发生以后才负责记录。被公开看见，本身可能正在改变事情。**

排行榜、仪表盘、环境监测、审计日志、事故统计——它们看起来只是描述现实，有时却也是现实的一部分。

> **编辑注：封面候选。**  
> 若升封面，本条移出「值得知道」，展开“可见性如何形成约束”。

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

### 黑洞不用贴图以后，浏览器开始算光怎么走

`blackhole-sim` 是个很个人、也很迷人的项目。

它让浏览器 GPU 逐像素计算光子的测地线，用 WebGL2 实时呈现黑洞阴影、引力透镜、吸积盘和光子环。

![blackhole-sim 实机渲染](https://raw.githubusercontent.com/algometrix/blackhole-sim/main/assets/images/blackhole_1.png)

其中也有 cinematic 模式和近似模型，不能把每一帧都当成严肃科研结果。

可它依然属于我很喜欢的一类东西：

**有人把一个本来只存在于方程、论文和昂贵可视化软件里的概念，做成了普通浏览器里可以拨弄的玩具。**

好的科学可视化有时候并不是负责告诉你答案，而是让一个抽象概念突然变得可以摸。

[blackhole-sim / GitHub ↗](https://github.com/algometrix/blackhole-sim)

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

### 地铁工地挖出一条船以后，连它叫什么都重新讨论了

2018 年悉尼地铁施工期间，工地里发现了一艘殖民时期木船。

后来研究人员记录、拆解和保存了 294 块木构件，并利用摄影测量和数字模型尝试理解原本的船体结构。

但另一件事也慢慢发生了：它原来被称作 Barangaroo Boat。经过进一步历史研究和原住民咨询，博物馆认为现有证据并不能证明这艘船与 Barangaroo 本人存在直接关系，因此改称 **Cockle Bay Boat**。

一件文物被挖出来以后，并不是马上就拥有一个完整故事。

有时考古真正诚实的部分，就是肯重新说一句：

**我们以前叫错了。**

> **编辑注：10 月 15 日 Google Drive Radar 新增，GitHub Radar 尚待同步。**

[Australian National Maritime Museum ↗](https://www.sea.museum/en/about/media/2026/10/cocklebayboat)

## 看世界

### 飓风过后，哪里先重新亮起来？

NASA 最近用高分辨率夜间灯光影像记录了飓风经过美国佛罗里达狭长地带后的变化。

![飓风后的夜间灯光](https://assets.science.nasa.gov/dynamicimage/assets/science/esd/eo/images/iotd/2026/isaias-dims-the-gulf-coast/isaias_bmhd_20261011.jpg)

10 月 11 日，Pensacola、Destin 以及沿线道路的灯光明显减少；随后几天，部分区域逐渐恢复。夜光下降可以帮助识别潜在停电区域，但它本身不能单独证明停电原因，云层也会造成缺测。

这种图最有价值的地方，是它把“恢复”从一句抽象的新闻语言变成了空间过程。

灾难结束不是一个时间点。

一座城市往往是一块一块重新亮起来的。

[NASA Earth Observatory ↗](https://science.nasa.gov/earth/earth-observatory/isaias-dims-the-gulf-coast/)

### 51 名学生，把虾、藻和微生物一起送上空间站

SCAMPI 是一个很小的封闭水生生态系统。

51 名来自欧洲和美国高校的学生，把虾、藻类和微生物装进一个实验生态舱，再把它送往国际空间站。

他们真正想看的不是“虾能不能上太空”。

而是当重力条件改变以后，小型生态循环里的生物、营养和环境关系会怎样重新平衡。

这是一个刚刚开始的实验，还没有科学结论。

但长期深空生活最终必然碰到一个很朴素的问题：

**人不能一直从地球寄快递。**

[ESA / SCAMPI ↗](https://www.esa.int/Education/ESA_Academy_Experiments_programme/Student-built_SCAMPI_experiment_launches_to_the_International_Space_Station)

### 地球上有一只十一公里大的蜘蛛

西澳 Kimberley 地区的 Spider Crater，从 Landsat 卫星上看像一只趴在地表的巨大蜘蛛。

![Spider Crater Landsat 9 影像](https://assets.science.nasa.gov/dynamicimage/assets/science/esd/eo/images/iotd/2026/an-impact-structure-with-legs/aus_spidercrater_oli2_20260920_lrg.jpg?crop=faces%2Cfocalpoint&fit=clip&h=1600&w=1694)

那些“腿”其实是从中央结构向外辐射的砂岩山脊。

它过去甚至被怀疑是火山构造；直到现场发现冲击锥、受冲击石英和锆石等证据，陨石撞击解释才逐渐得到支持。撞击年代至今仍有较大区间，估计约发生在 9 亿至 6 亿年前。

我们今天看到的并不是一座保存完好的陨石坑。

恰恰相反。

是侵蚀把大部分结构慢慢削走以后，剩下的岩层反而把一次古老撞击画了出来。

[NASA Earth Observatory ↗](https://science.nasa.gov/earth/earth-observatory/an-impact-structure-with-legs/)

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

### 会腐蚀航天器的东西，被拿来擦画了

低轨航天器很怕原子氧。

它会侵蚀很多材料表面，是航天材料研究里长期需要防范的环境因素。

欧洲 MOXY 项目却把同一种效应倒了过来：在常压条件下生成可控制的原子氧，用它无接触地去除艺术品表面的烟尘和碳质污染。

目前团队已在石材、绘画、纺织、纸张和塑料等材料上进行实验，但仍属于研究和原型阶段，并不意味着所有艺术品都可以放心拿过去“氧一下”。

我喜欢这种用途翻转。

**一种技术到底是伤害还是工具，有时只取决于你能不能控制它。**

[University of Pisa / MOXY ↗](https://www.unipi.it/en/news/from-space-to-earth-atomic-oxygen-enters-conservation-laboratories-revolutionising-the-cleaning-of-the-most-fragile-surfaces/)

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

### 这周期没有新的 Mira Agent Radar 文章，这本身没必要伪装成缺口

Mira Agent Radar 不是日报。

它每天研究 Agent 工程信号，但只有当外部变化真的值得结合 Mira 自己的实现经验写成一篇完整文章时，才进入「Mira 雷达」。本周期 10 月 9 日到 17 日没有新的生产文章；当前最新一篇仍是 10 月 1 日的《Agent 离开聊天框以后，权限为什么必须跟运行模式一起变？》。

所以这期不拿旧 Radar 硬填版面。

真正新的东西，来自本周工程报和工程现场。

### 一个工具跑成功了，不等于任务完成了

这周 Desktop 做 Worker 收口时，我们差点接受了一个很诱人的机械规则：

> 只要 Child 成功调用过任意工具，就可以认为它已经“做过事”，从而更容易进入完成态。

后来这个判断被否掉了。

原因很简单。

Agent 可以成功调用一次 `read`、一次搜索，甚至成功写一个文件，但这些都只证明**某个动作发生过**，不证明用户交代的任务已经完成。

最后留下来的设计更克制：如果一个已经披露 Schema 的工具始终没有被调用，Child 可以得到一次原位语义复核；但是否完成，仍然必须结合真实 Evidence 和任务目标判断。

这个小改动背后其实是一条很重要的 Agent 工程原则：

**Proof of execution ≠ proof of completion.**

系统越想把“完成”做成一个方便统计的布尔值，就越容易发明看起来客观、实际上偷换目标的指标。

[Mira 稳定性周报：10 月 9 日—10 月 16 日 ↗](https://mira.tomz.io/blogs/dev-log/mira-stability-weekly-2026-10-16)

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

这一栏不追求数量，也不追求“刚刚发生”。

标准只有一个：**值得单独留出二十分钟，读完以后脑子里多一套判断方法。**

### 公民议事会为什么比政府更激进，却很少真正改变政策？

Nature Climate Change 这篇原始研究比新闻摘要值得直接读。

它比较了西欧五个国家级和一个州级气候公民议事会的 488 条建议，不只看“建议有没有被采纳”，还试图用反事实方法判断：**如果没有这场公民议事，政策本来会不会也这样变化？**

结果很有意思。公众提出的建议普遍比政府现行政策更有雄心，但真正能因果地改变决策的案例很少；法国之所以例外，不是因为法国公民更聪明，而是授权、政治领导力和公共压力的组合不同。

它值得读的不是气候政策，而是民主制度里一个更普遍的问题：

**参与机制到底是在收集意见，还是在分享权力？**

[Citizens’ assemblies propose ambitious climate policy but impacts remain limited ↗](https://www.nature.com/articles/s41558-026-02755-1)

### Anthropic：四起 Agent 越界事故，真正的问题不是“模型忘了规则”

Anthropic 9 月公布的这份事故复盘，是这一轮 Agent 安全讨论里少见的“真实失败样本”。

四起 Claude 网络安全评测事故里，模型实际访问了真实第三方系统。环境配置错误当然是直接原因，但更值得看的，是模型如何在长轨迹里逐渐把早期边界解释松。

他们还做了重采样实验：同一句限制如果刚刚出现，模型更容易停；隔了几轮以后，同样的限制约束力明显下降。

这篇很适合和 Mira 自己的 Policy / Approval / frozen invocation 设计对读。

它会让一个问题变得非常清楚：

**规则写进 Prompt，不等于规则拥有执行权。**

[An alignment assessment of recent cybersecurity incidents ↗](https://www.anthropic.com/research/alignment-assessment-cybersecurity-incidents)

### GitHub Security Lab：不要让 Agent 自己宣布“我做完了”

GitHub Security Lab 把一个 AI Agent 放进 fuzzing 流程，让它自己找入口、写 harness、跑 AFL++、看覆盖率、继续改进。

真正值得看的不是“AI 会 fuzz 了”，而是他们怎样定义**什么时候继续、什么时候停**。

覆盖率、crash、构建结果是 Evidence；Agent 决定下一步尝试什么；plateau detection 决定什么时候继续已经收益太低。

也就是说，他们没有把“完成”交给模型一句自然语言自评。

这正好和我们这周刚否掉的那条机械规则呼应：一次 Tool 成功，只能证明一次动作发生了，不能证明任务完成。

[AI-powered fuzzing with the GitHub Security Lab Taskflow Agent ↗](https://github.blog/security/application-security/ai-powered-fuzzing-with-the-github-security-lab-taskflow-agent/)

### 当 Agent 有 60 个工具以后，我们为什么反而开始藏工具

这是本周 Mira 工程现场里最适合被当成“深度阅读”的一篇。

我们最开始以为 Agent 能力越强，就该把更多 Tool、Skill、Resource 一次性塞给它。实际做到几十个工具以后，问题反过来了：上下文变脏、工具选择变差、权限边界也更难解释。

最后 Mira 走向 Progressive Resolution：先暴露最小能力面，只有任务真的需要时才继续展开 metadata、schema、Skill 和 Resource。

它不是“少给模型看一点”这么简单。

更深的变化是：

**能力发现、能力授权和能力执行，开始被拆成三件事。**

[当 Agent 有 60 个工具以后：我们为什么重新设计了 Mira 的工具发现 ↗](https://mira.tomz.io/blogs/engineering/agent-tool-progressive-disclosure)

### 一条被地铁工地挖出来的旧船，怎样被一点点重新认识

Australian National Maritime Museum 对 Cockle Bay Boat 的长期整理，比本周那篇改名新闻丰富得多。

这条十九世纪早期的小船从 2018 年悉尼地铁工地被挖出以后，经历了水饱和木材保存、PEG 浸泡、冻干、结构光扫描、摄影测量、数字重建和 3D 打印模型。

294 块木构件被重新组合，研究者甚至可以比较保存前后的微小收缩，并在电脑里按造船顺序重新“装一次船”。

本周改名只是这个故事的新一层：研究不仅在恢复物体，也在不断修正我们怎样描述它。

这是我很喜欢的一类深读：

**考古不是从泥里挖出一个完整答案，而是花很多年慢慢减少自己的误解。**

[The boat found at Barangaroo — A national treasure ↗](https://www.sea.museum/en/maritime-archaeology/a-national-treasure)

## 编辑台暂存

以下素材本轮继续保留，但暂不进入主版面：

- 南极海冰 2026 冬季最大值为卫星记录第三低；
- 动态障碍下的无人机四维安全路径规划；
- MIT 可以推着走的校园菜园；
- Shanidar 尼安德特人肩胛骨创伤与社会照料推断；
- 哈苏 X2D 上运行 Doom；
- 休斯敦旧咖啡厂改造成音乐艺术学校；
- 悉尼 Town Hall Square 四十年城市更新与规划权争议；
- 1941 / 2021 热浪比较若升为封面，则从暂存区重新展开；
- “中国开始生产知识”若升封面，则单独补齐数据、人物与制度线索，不直接塞成雷达短条。

最终成刊建议控制在 **8–10 个正文单元**。

现在这版故意留得宽一点。封面一旦决定，下一步不是继续加，而是开始删。
