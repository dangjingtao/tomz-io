---
title: "见π 004：为了证明 Mira 靠谱，我们先证明了自己不靠谱"
description: 三天假期、51 次正式执行、30 次语义判卷。我们原本想给 Mira 做一次像样的 Agent Benchmark，最后先发现判卷程序、观测系统和测试方法自己也会翻车。
group: 见π
order: 4
issue: 4
date: 2026年10月4日
lead: 我们原本只是想知道 Mira 到底靠不靠谱。三天以后，没有得到一个漂亮总分，却得到了一套更难伪装的答案：Agent 会错，判卷程序也会错，而真正靠谱的跑分方法首先得允许自己承认“不知道”。
cover: https://assets.tomz.io/images/%E8%A7%81%CF%80004-%E8%BF%99%E4%B8%8D%E6%98%AF%E8%B7%91%E5%88%86%E8%BF%99%E6%98%AF%E6%B8%A1%E5%8A%AB-%E5%8A%A0%E4%BA%8C%E7%BB%B4%E7%A0%81.webp
tags:
  - AI
  - Agent
  - Mira
  - Benchmark
  - 工程
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

![见π 004 封面](https://assets.tomz.io/images/%E8%A7%81%CF%80004-%E8%BF%99%E4%B8%8D%E6%98%AF%E8%B7%91%E5%88%86%E8%BF%99%E6%98%AF%E6%B8%A1%E5%8A%AB-%E5%8A%A0%E4%BA%8C%E7%BB%B4%E7%A0%81.webp)

## 封面文章

### [为了证明 Mira 靠谱，我们先证明了自己不靠谱](/weekly/004/to-prove-mira-reliable-we-proved-ourselves-unreliable)

三天休息时间，17 道正式计分题，每题跑 3 次，一共 51 次执行；其中 30 次还需要单独做语义判卷。

我们本来想回答一个很简单的问题：**Mira 到底靠不靠谱？**

最后先被自己的考试系统教育了一遍。

Judge 流程一度差点变成手工开 30 个 ChatGPT 线程；scorer 曾把一个本应只有 66.67 分的 case 算成 100；还有一道题明明跑完了，却因为证据没有记录完整，我们最后宁可不发布完整总成绩。

中间甚至发生过更荒诞的事：Agent 刚接上远程电脑，就尝试打开用户电脑里的 ChatGPT，准备向另一个“自己”汇报。

这篇不是成绩发布，而是一份体检报告。它讲 Mira 为什么需要 Benchmark、我们怎么跑、结果到底说明了什么，以及为什么想得到一个靠谱分数，首先得防止自己骗自己。

[阅读全文 →](/weekly/004/to-prove-mira-reliable-we-proved-ourselves-unreliable)

## Mira Agent 雷达

### Agent 不该自己证明自己

003 发布以后，Mira 雷达连续写了四篇 Agent 工程观察。它们看的是不同项目，却都落到同一个问题：**模型可以负责判断，但不能顺手把“证明自己做对了”和“决定自己能做什么”也一起包办。**

<div class="weekly-reading-grid">
  <a class="weekly-reading-card" href="https://mira.tomz.io/blogs/radar/agent-completion-needs-evidence">
    <span class="weekly-reading-meta">09.28 · EVIDENCE</span>
    <strong>Agent 说“完成了”，为什么还不够？</strong>
    <small>从自动 fuzzing 看“完成”为什么必须有模型之外的证据。</small>
    <span class="weekly-reading-arrow">读原文 →</span>
  </a>
  <a class="weekly-reading-card" href="https://mira.tomz.io/blogs/radar/runtime-policy-outside-agent">
    <span class="weekly-reading-meta">09.29 · RUNTIME</span>
    <strong>批准了一条命令，不等于控制住它接下来做的一切</strong>
    <small>一次批准和持续约束，是两件完全不同的事。</small>
    <span class="weekly-reading-arrow">读原文 →</span>
  </a>
  <a class="weekly-reading-card" href="https://mira.tomz.io/blogs/radar/agent-evidence-must-be-verifiable">
    <span class="weekly-reading-meta">09.30 · VERIFIABILITY</span>
    <strong>Agent 留下了日志，为什么还不能证明它做过什么？</strong>
    <small>日志存在还不够，证据必须能被第三方独立验证。</small>
    <span class="weekly-reading-arrow">读原文 →</span>
  </a>
  <a class="weekly-reading-card" href="https://mira.tomz.io/blogs/radar/background-agent-permission-modes">
    <span class="weekly-reading-meta">10.01 · GOVERNANCE</span>
    <strong>Agent 离开聊天框以后，权限为什么必须跟运行模式一起变？</strong>
    <small>当人不再盯着聊天框，后台运行本身也必须进入授权模型。</small>
    <span class="weekly-reading-arrow">读原文 →</span>
  </a>
</div>

## 深读文章

### [机器人 Benchmark，为什么连考场都要标准化？](/weekly/004/robot-benchmark-needs-a-standard-arena)

![OpenArm Cell 中用于固定机械臂姿态的零位校准夹具](https://raw.githubusercontent.com/enactic/openarm/76f820b5234420be6d72d5b1e0923a039aa7c3c6/website/static/img/hardware/openarm-cell/calibration-workflow/step5.png)

*OpenArm Cell 的零位校准夹具，把“大家差不多装好了”变成同一个机械参考点。图源：[OpenArm 官方文档 ↗](https://docs.openarm.dev/hardware/openarm-cell/calibration-workflow/)。*


OpenArm 2.0 真正有意思的，不只是机械臂升级，而是它开始把背景、灯光、相机、安装位置和机械校准一起当成评测基础设施。

具身智能里，现实世界本身也会参加考试。如果两个实验室的光线、相机和装配误差都不一样，“模型 A 胜过模型 B”可能根本不是同一场考试。

这篇继续往下拆 OpenArm Cell：为什么一个看起来很笨的校准夹具，和软件世界里的容器、冻结环境其实在做同一类事情；以及为什么“标准考场”仍然只是可复现 Benchmark 的第一步。

[阅读全文 →](/weekly/004/robot-benchmark-needs-a-standard-arena)

### [400 万订单以后，Robotaxi 不再只是自动驾驶问题](/weekly/004/robotaxi-becomes-a-city-system)

![武汉和平大道上的 Apollo RT6 Robotaxi](https://upload.wikimedia.org/wikipedia/commons/1/19/%28CHN-Hubei%29_Apollo_Go_Apollo_RT6_Temporary-%E9%84%82A1395%E8%AF%95_2025-12-17.jpg)

*武汉和平大道上的 Apollo RT6。摄影：S5A-0043，CC BY 4.0 / [Wikimedia Commons ↗](https://commons.wikimedia.org/wiki/File:%28CHN-Hubei%29_Apollo_Go_Apollo_RT6_Temporary-%E9%84%82A1395%E8%AF%95_2025-12-17.jpg)。*


武汉超过 400 万条有人出租车与全无人 Robotaxi 订单，让研究者开始把问题从“车会不会自己开”推进到“它准备怎样进入一座城市”。

真正值得看的，不是某个漂亮的单车指标，而是它和出租车、地铁、公交、道路复杂度、车队调度与能源需求之间的关系。研究里最抓眼球的 62.5% 车队缩减和 44.8% 能耗下降，也只是优化模型里的上限情景，不是武汉已经发生的现实。

这篇把观测事实和模型推演分开，看 Robotaxi 一旦进入真实城市，为什么会越来越不像一个单纯的“自动驾驶问题”。

[阅读全文 →](/weekly/004/robotaxi-becomes-a-city-system)

### [想读真的古卷，他们先烧了一卷假的](/weekly/004/burn-a-fake-scroll-before-reading-the-real-one)

![赫库兰尼姆炭化纸草卷](https://upload.wikimedia.org/wikipedia/commons/6/65/Herculaneum_papyri.jpg)

*赫库兰尼姆炭化纸草卷。Sara Stabile 等，CC BY 4.0 / [Wikimedia Commons ↗](https://commons.wikimedia.org/wiki/File:Herculaneum_papyri.jpg)。*


赫库兰尼姆炭化纸草不能拿来反复试错。于是 UC Berkeley 团队先造现代纸草、配传统墨、加入不同浓度的铅，再把整卷真的烧焦，用 X-ray CT 和 XRF 测试哪些信号值得去真古卷里寻找。

最有意思的不是“AI 又破解了古文明”，而是研究方法本身：**当真正的对象太珍贵、太脆弱，甚至只有一次机会，就先造一个可以失败的世界。**

这篇继续往下看替身实验、含铅墨、虚拟展开，以及为什么一个“假的”对象反而可能让我们更谨慎地接近真的。

[阅读全文 →](/weekly/004/burn-a-fake-scroll-before-reading-the-real-one)

## 把尺子做对

这一期做完 Mira Benchmark 以后，再看外面的技术新闻，会发现一个很有意思的共振：很多领域已经不再满足于“最好的那一次”，开始认真处理**重复性、环境差异和测量本身**。

### 量子计算开始碰上制造业最熟悉的问题

![超导 transmon 量子处理器示意图](https://upload.wikimedia.org/wikipedia/commons/6/66/Superconducting_Quantum_Chip_with_Dispersive_Background.png)

*超导 transmon 量子处理器的 3D 示意图，用来给这一节提供尺度感；不是 SQMS 本次实验器件照片。OJB Quantum，CC BY 4.0 / [Wikimedia Commons ↗](https://commons.wikimedia.org/wiki/File:Superconducting_Quantum_Chip_with_Dispersive_Background.png)。*


Fermilab 牵头的 SQMS 对 22 个超导 qubit 做了一次跨 6 家机构的盲测。材料分析人员事先不知道器件性能，最后再把微观结构和 T1 表现对照。

结果指向的不是“哪一颗最好”，而是表面氧化层、刻蚀侧壁和沟槽深度这些制造细节，为什么会让同材料器件出现明显性能差异。

这很像一个行业开始长大以后必经的阶段：从追求最强样机，转向追问**为什么同一批东西总有几颗掉队**。

[Fermilab / SQMS ↗](https://news.fnal.gov/2026/10/sqms-center-uncovers-material-origins-of-variations-in-qubit-performance-through-landmark-study/)

## 当能力真的进入系统

技术最开始总喜欢证明“能不能做”。真正进入现实以后，问题会迅速变成：它和原来的城市、制度、行业怎样相处。

### 聚变还没商业化，制度已经先开始准备

加州签署新法，要求州能源机构为聚变制定发展战略、商业化路径并推进制造与监管准备。

聚变还没有成为日常电源，制度却已经开始提前处理认证、环境审查、供应链和人才。

这不是“聚变马上来了”的证据，反而更像一个制度问题：**当一项技术仍在证明自己能不能做时，政府应该什么时候开始准备“做成以后怎么接住”？**

[State of California ↗](https://www.gov.ca.gov/2026/09/30/governor-newsom-signs-legislation-to-accelerate-californias-fusion-industry-announces-major-investment-for-quantum-research/)

## 研究与设计

### 一座设计博物馆，把城市拆迁废料压成了自己的外墙

Design Museum Gent 重新开放，新翼使用超过 82,000 块 Gent Waste Brick。原料来自本地城市废物流，建筑又刻意把砖的尺度和旧建筑对齐。

过去说“地方材料”，想到的是本地石头、木材和工艺。

现在，一座城市自己的拆迁废物也开始成为它的新材料史。

[Design Museum Gent ↗](https://designmuseumgent.be/en/de-nieuwe-vleugel)

### 杜波依斯的数据肖像，没有被数字化，而是被重新印了出来

![W.E.B. Du Bois 为 1900 年巴黎世博会制作的数据肖像之一](https://upload.wikimedia.org/wikipedia/commons/1/14/The_Georgia_Negro_LCCN2013650420.jpg)

*W.E.B. Du Bois 为 1900 年巴黎世博会制作的数据肖像之一，正是当代项目重新对话的视觉传统。Library of Congress，Public Domain / [Wikimedia Commons ↗](https://commons.wikimedia.org/wiki/File:The_Georgia_Negro_LCCN2013650420.jpg)。*


William Villalongo 与 Shraddha Ramani 以 W.E.B. Du Bois 为 1900 巴黎世博会制作的数据肖像为起点，用当代数据重做 30 幅版画。

这不是给旧图表换一套配色，而是继续拿住房、迁徙、职业和城市历史这些问题去和一百多年前的视觉方法对话。

Dashboard 之外，数据可视化又重新变成一种有材料、有作者、有历史位置的公共叙事。

[USF Graphicstudio ↗](https://www.usf.edu/arts/news/2026/20260925-graphicstudio-printing-black-america-aquisitions.aspx)

## 鬼集

鬼集不负责凑数。只有那些真实、够怪，而且怪完以后还能让人多想一步的东西，才留在这里。

### 折叠屏最有意思的应用，也许是重新“放磁带”

独立开发者 Vidit Bhargava 做了一个虚拟 Walkman：打开折叠设备是“放磁带”，合上以后外屏变成播放器，还专门录了真实 Walkman 的按键声和底噪。

它现在更像 hackathon 原型，但切口很好。新硬件形态成熟的标志，也许不是旧 App 被拉宽，而是软件终于开始把**铰链、开合、内外屏切换**本身当成交互语言。

[TechCrunch / Duo-Man ↗](https://techcrunch.com/2026/09/28/the-iphone-duo-may-already-have-its-first-killer-app-a-virtual-walkman/)

### 鸡蛋壳没有先变成工业原料，直接进了镁合金

NC State 等团队把磨碎的废鸡蛋壳直接加入镁材料，再在加工过程中形成强化相。

它当然还只是 proof-of-concept，远不能证明已经具备大规模经济性。但这个思路足够鬼：循环制造不一定只是把废物回收成同一种东西，也可能直接让一种行业的废物成为另一种制造过程的反应物，**顺手删掉供应链中的一个步骤。**

[NC State ↗](https://engr.ncsu.edu/news/2026/10/02/researchers-use-eggshells-to-make-stronger-lighter-metal-alloys/)

## 人的现场

### [第九周：虽休弗休](/blogs/developer-life/week-nine-sui-xiu-fu-xiu)

![虽休弗休｜工作周记第九周](https://assets.tomz.io/images/%E6%B7%B1%E5%A4%9C%E5%B7%A5%E4%BD%9C%E6%A1%8C%E5%89%8D%E7%9A%84%E7%AC%AC%E4%B9%9D%E5%91%A8.webp)


两个月里，给老板干活四五百小时，真正专职做 Mira 的时间却不到四百分钟。好不容易等到国庆，几十张任务卡、架构债和一个该死的 workdir 又把人按回了电脑前。

这不是一篇勤奋宣言。更像一份关于时间、判断和 AI 协作的周记：为什么一句疲惫时的“好的”可能长成工程债，为什么能力越强越要知道什么不该做，以及“虽休弗休”回到原义以后，究竟提醒了什么。

[阅读全文 →](/blogs/developer-life/week-nine-sui-xiu-fu-xiu)

### [两个男人，也不能只靠心有灵犀](/blogs/developer-life/two-men-cant-rely-on-telepathy)

九月的 Mira 开始认真组织化：两个男人、一群 Agent、越来越多的规矩，以及一个手续齐全却越看越离谱的 Workdir。

如果《虽休弗休》写的是一个人如何被时间和判断拖回电脑前，这一篇写的就是两个维护者和一群 Agent 怎样把一个越来越复杂的项目从“心有灵犀”推向真正的组织协作。任务卡、Review、真人烟测，以及那个最终被铲掉的 Workdir，都在这里留下了现场。

[阅读全文 →](/blogs/developer-life/two-men-cant-rely-on-telepathy)

## Mira 现场

### [Mira 稳定性周报｜9 月 25 日—10 月 2 日](https://mira.tomz.io/blogs/dev-log/mira-stability-weekly-2026-10-02)

这份周报记录的是周五那个时间截面：Desktop v0.102.0 已进入生产，Mobile 连续修复 0.3.6→0.3.8 的真实 Android 回归，Docs 和 Control Room 继续把发布、审查和可观测性收回到可验证链路。

当时 Agent Core Benchmark 还处在“合同已冻结、候选题库建设中”的阶段。两天后，封面故事里的正式 Benchmark 已经跑完。把两篇放在同一期里看，反而很有意思：**周报负责忠实记录当时的工程状态，封面故事负责记录事情后来真的跑起来以后发生了什么。**

[阅读全文 →](https://mira.tomz.io/blogs/dev-log/mira-stability-weekly-2026-10-02)

## 继续看

### 四足机器人第一次把整场马拉松当成续航测试

KAIST 的 RAIBO2 以单次电池完成韩国尚州马拉松，时间 4:19:52。

纪录本身当然很抓眼球，但更值得看的，是腿式机器人评价指标正在从“动作能不能做出来”转向耐力、能效和真实地形。机器人会跑早就不稀奇，**能跑多久，开始变得更重要。**

[Nature / RAIBO2 ↗](https://doi.org/10.1038/s41586-026-11102-5)

### Firefox 把一点屏幕空间还给网页

Firefox 157 做了近年的一次大视觉刷新，同时恢复 Compact Mode，让工具栏和标签重新收紧。

在桌面软件普遍变大、变圆、变得更“可触控”的时候，这算一个很小的反信号：成熟工具的用户并不总希望界面更显眼，有时候真正想要的是**界面退后一点**。

[Firefox 157 Release Notes ↗](https://www.firefox.com/en-US/firefox/157.0/releasenotes/)

### 材料开始被设计成“谁来搬它、什么时候耗能”

Science Tokyo 与京都大学让马达蛋白拖着微管运动，再让 DNA 在运动中相遇、连接和被拉伸，几分钟内形成网络。

它还远不是“活材料”，但材料设计的变量已经从“分子是什么”，继续扩展到**谁来搬它、怎样施力、何时耗能**。

[Institute of Science Tokyo ↗](https://www.isct.ac.jp/en/news/j0mk0vpp6a42)

---

封面故事在追问：**怎么证明一个 Agent 真的靠谱？** Mira 雷达继续追执行证据与权限；OpenArm 和 qubit 把“可靠”带到机器人和量子硬件；Robotaxi 与聚变把“能不能做”推进到城市与制度。

另一边，纸草、版画、废料砖、Walkman 和鸡蛋壳又把这一期从 Agent 专刊里拉了出来。
