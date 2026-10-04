---
title: "见π 004：为了证明 Mira 靠谱，我们先证明了自己不靠谱"
description: 三天假期、51 次正式执行、30 次语义判卷。我们原本想给 Mira 做一次像样的 Agent Benchmark，最后先发现判卷程序、观测系统和测试方法自己也会翻车。
group: 见π
order: 4
issue: 4
date: 2026年10月4日
lead: 我们原本只是想知道 Mira 到底靠不靠谱。三天以后，没有得到一个漂亮总分，却得到了一套更难伪装的答案：Agent 会错，判卷程序也会错，而真正靠谱的跑分方法首先得允许自己承认“不知道”。
cover: https://assets.tomz.io/images/%E8%A7%81%CF%80004-%E8%BF%99%E4%B8%8D%E6%98%AF%E8%B7%91%E5%88%86%E8%BF%99%E6%98%AF%E6%B8%A1%E5%8A%AB.webp
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

![见π 004 封面](https://assets.tomz.io/images/%E8%A7%81%CF%80004-%E8%BF%99%E4%B8%8D%E6%98%AF%E8%B7%91%E5%88%86%E8%BF%99%E6%98%AF%E6%B8%A1%E5%8A%AB.webp)

## 封面文章

### [为了证明 Mira 靠谱，我们先证明了自己不靠谱](/weekly/004/to-prove-mira-reliable-we-proved-ourselves-unreliable)

三天休息时间，17 道正式计分题，每题跑 3 次，一共 51 次执行；其中 30 次还需要单独做语义判卷。

我们本来想回答一个很简单的问题：**Mira 到底靠不靠谱？**

最后先被自己的考试系统教育了一遍。

Judge 流程一度差点变成手工开 30 个 ChatGPT 线程；scorer 曾把一个本应只有 66.67 分的 case 算成 100；还有一道题明明跑完了，却因为证据没有记录完整，我们最后宁可不发布完整总成绩。

中间甚至发生过更荒诞的事：Agent 刚接上远程电脑，就尝试打开用户电脑里的 ChatGPT，准备向另一个“自己”汇报。

这篇不是成绩发布，而是一份体检报告。它讲 Mira 为什么需要 Benchmark、我们怎么跑、结果到底说明了什么，以及为什么想得到一个靠谱分数，首先得防止自己骗自己。

[阅读全文 →](/weekly/004/to-prove-mira-reliable-we-proved-ourselves-unreliable)

## 把尺子做对

这一期做完 Mira Benchmark 以后，再看外面的技术新闻，会发现一个很有意思的共振：很多领域已经不再满足于“最好的那一次”，开始认真处理**重复性、环境差异和测量本身**。

### 机器人 benchmark 也需要自己的标准考场

OpenArm 2.0 不再只是开源一只 7DOF 机械臂，而是把背景、灯光、相机位置、安装方式和机械校准夹具一起固定下来。

这件事看起来很琐碎，却正好说明具身智能为什么比纯软件更难跑分：如果每个实验室的桌子、光线、相机和装配误差都不同，“模型 A 胜过模型 B”可能根本不是同一场考试。

Mira 这周刚被自己的 Benchmark 教育完，看到这条很难没有共鸣：**尺子本身也是系统的一部分。**

[OpenArm 2.0 ↗](https://docs.openarm.dev/overview/whats-new-in-2.0/)

### 量子计算开始碰上制造业最熟悉的问题

Fermilab 牵头的 SQMS 对 22 个超导 qubit 做了一次跨 6 家机构的盲测。材料分析人员事先不知道器件性能，最后再把微观结构和 T1 表现对照。

结果指向的不是“哪一颗最好”，而是表面氧化层、刻蚀侧壁和沟槽深度这些制造细节，为什么会让同材料器件出现明显性能差异。

这很像一个行业开始长大以后必经的阶段：从追求最强样机，转向追问**为什么同一批东西总有几颗掉队**。

[Fermilab / SQMS ↗](https://news.fnal.gov/2026/10/sqms-center-uncovers-material-origins-of-variations-in-qubit-performance-through-landmark-study/)

## 当能力真的进入系统

技术最开始总喜欢证明“能不能做”。真正进入现实以后，问题会迅速变成：它和原来的城市、制度、行业怎样相处。

### 武汉 400 万订单以后，Robotaxi 开始像一个城市问题

一项基于武汉超过 400 万条有人出租车与全无人 Robotaxi 订单的研究，不再问自动驾驶“会不会开”，而是开始看它和出租车、地铁、公交、道路复杂度、能耗之间的关系。

研究里有竞争，也有互补；还有调度与拼车优化可能带来的车队规模和能耗改善。但这些数字不是“武汉已经实现”，而是模型情景。

真正值得留下的是评价尺度的变化：**Robotaxi 一旦不再是 Demo，它就必须回答自己准备怎样进入城市系统。**

[Nature Sustainability ↗](https://www.nature.com/articles/s41893-026-01944-2)

### 聚变还没商业化，制度已经先开始准备

加州签署新法，要求州能源机构为聚变制定发展战略、商业化路径并推进制造与监管准备。

聚变还没有成为日常电源，制度却已经开始提前处理认证、环境审查、供应链和人才。

这不是“聚变马上来了”的证据，反而更像一个制度问题：**当一项技术仍在证明自己能不能做时，政府应该什么时候开始准备“做成以后怎么接住”？**

[State of California ↗](https://www.gov.ca.gov/2026/09/30/governor-newsom-signs-legislation-to-accelerate-californias-fusion-industry-announces-major-investment-for-quantum-research/)

## 这期想留下的几个怪东西

不是所有内容都要承担一个宏大趋势。有些东西只要足够怪、足够漂亮，或者让人多想半步，就值得留下。

### 折叠屏真正有意思的，也许不是多放一栏内容

独立开发者 Vidit Bhargava 做了一个虚拟 Walkman：打开折叠设备是“放磁带”，合上以后外屏变成播放器，还专门录了真实 Walkman 的按键声和底噪。

它现在更像 hackathon 原型，但切口很好。

新硬件形态成熟的标志，也许不是旧 App 被拉宽，而是软件终于开始把**铰链、开合、内外屏切换**本身当成交互语言。

[TechCrunch / Duo-Man ↗](https://techcrunch.com/2026/09/28/the-iphone-duo-may-already-have-its-first-killer-app-a-virtual-walkman/)

### 先烧一卷假的古罗马纸草，再去读真的

为了研究赫库兰尼姆炭化纸草能不能更容易被 X-ray CT 无损读取，UC Berkeley 团队先造了一卷现代替身，再真的把它烧焦。

面对两千年前、无法反复试错的文物，他们没有直接在真品上赌，而是先造一个足够像真的、可以放心毁掉的实验对象。

这件事最漂亮的地方不是“AI 解古卷”，而是研究方法本身：**当真东西不能试错，就先造一个可以失败的世界。**

[UC Berkeley ↗](https://news.berkeley.edu/2026/09/16/to-read-2000-year-old-burned-scrolls-scientists-burn-their-own/)

### 一座设计博物馆，把城市拆迁废料压成了自己的外墙

Design Museum Gent 重新开放，新翼使用超过 82,000 块 Gent Waste Brick。原料来自本地城市废物流，建筑又刻意把砖的尺度和旧建筑对齐。

过去说“地方材料”，想到的是本地石头、木材和工艺。

现在，一座城市自己的拆迁废物也开始成为它的新材料史。

[Design Museum Gent ↗](https://designmuseumgent.be/en/de-nieuwe-vleugel)

### 杜波依斯的数据肖像，没有被数字化，而是被重新印了出来

William Villalongo 与 Shraddha Ramani 以 W.E.B. Du Bois 为 1900 巴黎世博会制作的数据肖像为起点，用当代数据重做 30 幅版画。

这不是给旧图表换一套配色，而是继续拿住房、迁徙、职业和城市历史这些问题去和一百多年前的视觉方法对话。

Dashboard 之外，数据可视化又重新变成一种有材料、有作者、有历史位置的公共叙事。

[USF Graphicstudio ↗](https://www.usf.edu/arts/news/2026/20260925-graphicstudio-printing-black-america-aquisitions.aspx)

### 鸡蛋壳没有先变成工业原料，直接进了镁合金

NC State 等团队把磨碎的废鸡蛋壳直接加入镁材料，再在加工过程中形成强化相。

它当然还只是 proof-of-concept，远不能证明已经具备大规模经济性。

但思路很讨喜：循环制造不一定只是“把废物回收成原来的东西”，也可能是重新设计流程，让一种行业的废物直接成为另一种制造过程的反应物，**顺手删掉供应链中的一个步骤。**

[NC State ↗](https://engr.ncsu.edu/news/2026/10/02/researchers-use-eggshells-to-make-stronger-lighter-metal-alloys/)

### 四足机器人第一次把整场马拉松当成续航测试

KAIST 的 RAIBO2 以单次电池完成韩国尚州马拉松，时间 4:19:52。

纪录本身当然很抓眼球，但更值得看的，是腿式机器人评价指标正在从“动作能不能做出来”转向耐力、能效和真实地形。

机器人会跑早就不稀奇。

**能跑多久，开始变得更重要。**

[Nature / RAIBO2 ↗](https://doi.org/10.1038/s41586-026-11102-5)

## 继续看

### Firefox 把一点屏幕空间还给网页

Firefox 157 做了近年的一次大视觉刷新，同时恢复 Compact Mode，让工具栏和标签重新收紧。

在桌面软件普遍变大、变圆、变得更“可触控”的时候，这算一个很小的反信号：成熟工具的用户并不总希望界面更显眼，有时候真正想要的是**界面退后一点**。

[Firefox 157 Release Notes ↗](https://www.firefox.com/en-US/firefox/157.0/releasenotes/)

### 材料开始被设计成“谁来搬它、什么时候耗能”

Science Tokyo 与京都大学让马达蛋白拖着微管运动，再让 DNA 在运动中相遇、连接和被拉伸，几分钟内形成网络。

它还远不是“活材料”，但材料设计的变量已经从“分子是什么”，继续扩展到**谁来搬它、怎样施力、何时耗能**。

[Institute of Science Tokyo ↗](https://www.isct.ac.jp/en/news/j0mk0vpp6a42)

### Cloudflare 试着用“随时能走”来留住数据

Cloudflare 把 Data Platform 正式更名并 GA 为 Basin，用 Apache Iceberg 把存储和计算重新拆开，并允许 DuckDB、Spark、Snowflake 等兼容引擎直接读写同一份数据。

平台一边把体验做得更一体化，一边又强调开放表格式和零出口费。

锁定用户的方式，也许正在从“数据拿不走”，变成“**留下来足够省事，但离开也不疼**”。

[Cloudflare Basin ↗](https://blog.cloudflare.com/cloudflare-basin/)

---

004 现在已经有了一个很明确的底色。

封面故事在追问：**怎么证明一个 Agent 真的靠谱？**

OpenArm 和 qubit 把同一个问题带到机器人和量子硬件；Robotaxi 和聚变把“会不会做”继续推到城市与制度；而剩下那些纸草、Walkman、废料砖、鸡蛋壳，又把这一期从一份 Benchmark 专刊里拉了出来。

这大概就是这一期现在最舒服的状态：

有一条主线。

但没有让所有东西排队证明同一个结论。
