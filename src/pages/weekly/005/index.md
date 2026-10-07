---
title: "见π 005：牛马，起来干活了"
description: 凌晨四点，一条从手机、ChatGPT、GitHub 到远端 Worker 的链路第一次真正活了。第五期从“人不是基础设施”出发，继续看道路、污水厂、MCP、端侧检索与那些正在获得第二职业的基础设施。
group: 见π
order: 5
issue: 5
date: 2026年10月8日
lead: 凌晨四点，我对 Mira 说：“调 DS，把测试分支 README 改成——牛马，起来干活了。”几分钟后，GitHub 真的回应了。机器开始多承担一点机器该承担的工作，而这一期也顺着这个现场继续追问：谁应该成为基础设施，谁绝不应该。
cover: https://assets.tomz.io/images/jp005.webp
tags:
  - AI
  - Agent
  - Mira
  - External Worker
  - 基础设施
  - 工程
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

![见π 005 封面](https://assets.tomz.io/images/jp005.webp)

## 封面文章

### [牛马，起来干活了](/weekly/005/mira-external-worker-hello-world)

凌晨四点，我拿着手机，对 Mira 说：“调 DS，把测试分支 README 改成——牛马，起来干活了。”

几分钟后，GitHub 上真的多了一个由远端 Worker 完成、独立验证并写回 Git 的提交。那句话没有业务价值，却像极了程序员第一次写下的 `Hello, World!`：重要的不是那几个字，而是**你的世界回应了**。

这篇文章不重复已经上线的 External Worker 工程长文，而是讲另一面：为什么我们想把耗时执行从 Mira 身上拆出去，为什么模型必须被放进明确的工程岗位，以及为什么自动化最终不应该把人变成 Agent 之间的基础设施。

**People are not infrastructure. 人不是基础设施。**

[阅读全文 →](/weekly/005/mira-external-worker-hello-world)

## 基础设施开始兼职

这一期的封面故事说，人不应该被当成基础设施。

有意思的是，同一个星期，真正的基础设施却正在不断获得第二份工作：污水厂开始被重新想象成材料节点，道路开始被做成供能界面。过去那些只负责“处理”“通行”的东西，正在一点点变成会生产、会回收、会供能的系统。

### 污水处理后的藻类，能不能再变成制造材料？

UNSW、Sydney Water 与 Pacific Bio 正在尝试把污水处理末端吸收氮磷的原生绿藻继续往下利用：做天然 binder / resin，再与废弃纺织纤维结合成制造材料。

现在仍然只是早期原型，离成熟循环经济方案还很远。真正值得看的，是基础设施角色的变化：**污水厂不再只是废物处理的终点，也可能同时成为回收水、营养、能源和材料的资源节点。**

[UNSW Sydney ↗](https://www.unsw.edu.au/newsroom/news/2026/10/could-wastewater-algae-become-a-new-material-for-manufacturing)

### 道路不只是让车跑，也开始准备给车供电

Honda R&D、Taisei 与 Taisei Rotec 公布了面向大型商用 EV 的动态无线供电道路技术，并计划从日本 2027 财年开始在公共道路做示范。

它还远没有走到“边跑边充已经普及”的阶段。但这个方向很有意思：**道路本身开始从通行基础设施，变成持续供能界面。**

[Honda Global ↗](https://global.honda/en/topics/2026/c_2026-10-05beng.html)

## Mira 雷达

### 当公司有 800 个 MCP Server、5000 个工具，问题就不再是“接不接 MCP”

Uber Engineering 披露的内部 MCP Gateway 已经承载 800+ MCP servers 和 5000+ tools。

到了这个规模，工具治理不可能继续靠“把所有工具塞给模型”：Registry、ownership、owner review、默认 disabled、统一 observability / security，以及 control plane 与 runtime proxy 的拆分，都开始变成组织基础设施。

这和 Mira 最近正在做的事情有一种很直接的互照：**Agent 的问题越来越不是缺工具，而是谁有权发现、暴露、选择和调用这些能力。**

[Uber Engineering ↗](https://www.uber.com/us/en/blog/designing-mcp-gateway/)

### 搜索自己的东西，正在重新变成本地能力

Google 10 月 6 日发布 EmbeddingGemma 2：740M 参数，把 text / code / image / video / audio 映射进统一 embedding space，并把重点放在端侧多模态检索与 RAG。

比又一个模型榜单更值得看的，是产品方向本身：语音备忘录、照片、视频和本地文件之间的搜索，不一定要先把私人资料送进云端。

**“搜索我的东西”这件事，正在重新变成设备自己会做的事。**

[Google / Google DeepMind ↗](https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2/)

## 看世界

### 第一次从太空看见完整的白昼极光环

ESA 与中国科学院联合的 SMILE 探测器，用紫外成像从高空看到了完整的极光椭圆，包括地面肉眼无法看到的白昼侧。

地面上的人看到的是天空里一块一块的极光；换到轨道视角以后，它突然变成一个环绕磁极、会随太阳风变化的行星尺度系统。

有时候新的科学仪器没有“发现一个新东西”，只是把原本零碎的现象第一次放进了同一张图里。**而系统，往往就是从能看见全貌的那一刻才真正出现。**

[NASA Science / SMILE ↗](https://science.nasa.gov/image-article/apod-2026-october-6-a-complete-auroral-oval-from-smile/)

## 鬼集

鬼集不负责凑数。要够怪，还得怪完以后让人多想一步。

### 让键盘自己来找手

Google Japan 的 Gboard 团队今年又认真做了一件神经病的事：把四组键盘装上四条传送带。

几十年来，人习惯了把手伸向键盘、寻找按键。他们把这个默认前提翻过来：**为什么不能让按键自己流到手边？**

它当然不是下一代主流键盘，但 Google 甚至给出了可以真正制造的开源设计。好的荒诞原型就是这样——先把一个习以为常的假设倒过来，然后一本正经地把笑话做到能运行。

[Google Japan / Gboard ↗](https://blog.google/intl/ja-jp/products/android-chrome-play/gboard-2026/)

## Mira 现场

### [当 ChatGPT 终于摸到我的电脑：Remote Desktop Commander 与本地执行平面](https://mira.tomz.io/blogs/engineering/remote-desktop-commander-local-execution-plane)

10 月 4 日，我们第一次把 ChatGPT 到真实本地电脑的 Remote MCP 链路跑进日常工程现场。

这件事解决的是“云端智能怎样碰到本地真实环境”。几天以后，External Worker 又把问题往前推了一步：**Mira 不必所有活都亲自碰电脑，也可以把耗时执行交给一个受限、可替换、可验证的 Worker。**

把这两篇连起来看，正好是这几天 Mira 工程角色变化的一前一后。

[阅读全文 →](https://mira.tomz.io/blogs/engineering/remote-desktop-commander-local-execution-plane)

### [把“牛马”做成一个工程系统：Mira External Worker 的设计、边界与证据链](https://mira.tomz.io/blogs/engineering/mira-external-worker-engineering-system)

封面故事负责凌晨四点、人的疲惫、组织角色和那句“人不是基础设施”。

如果想继续往工程里钻，这篇才是原卷：任务合同、冻结起点、权限边界、GitHub Actions、OpenCode、Provider / Model 解耦、独立验证与结构化 Evidence 都在这里。

**封面讲为什么要做；工程文讲它凭什么敢真的跑。**

[阅读全文 →](https://mira.tomz.io/blogs/engineering/mira-external-worker-engineering-system)

---

005 还没有收刊。

Radar 会继续往素材池里落东西。现在先把这一期的骨架立起来：机器开始承担更多机器该承担的工作；真正的基础设施则开始生产、供能、治理和感知。

至于人——**别再拿来垫系统。**
