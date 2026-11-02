---
title: "见π 008｜面目全非的编程"
description: 见π 第 008 期：面目全非的编程。代码生成能力正在改写工程的成本与权力，科学、历史、开源和人的故事也在继续发生。本期二十一条，六篇站内长文。
group: 见π
order: 8
issue: 8
date: 2026年11月1日
cover: https://assets.tomz.io/images/1793551868119-image-20261102005107440.webp
lead: 写代码越来越便宜，构建可信的软件却没有更容易。当工程旧秩序松动，我们终于不得不重新面对真正重要的事情。
tags:
  - AI
  - Agent
  - 软件工程
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

![《见π》008 封面：面目全非的编程](https://assets.tomz.io/images/1793551868119-image-20261102005107440.webp)

## 封面故事

### [面目全非的编程](/weekly/008/who-trusts-the-code)

写代码越来越便宜，软件工程原先依赖的许多制度却还在原地。人工逐行 Code Review、单元测试、敏捷流程、团队分工、固定 UI 与 Token 预算，还能沿用多少旧逻辑？

从 Amp 联合创始人 Thorsten Ball 的十六条预言中选出十一条，与 Mira 十月真实的施工、失败和验收对照。我们不为旧编程时代守灵，也不替 AI 鼓掌：**当实现能力不再稀缺，谁来决定什么值得做，又由谁证明它真的可用？**

[阅读本期封面故事 →](/weekly/008/who-trusts-the-code) · [Thorsten Ball 原文 ↗](https://thorstenball.com/blog/2026/09/19/what-i-believe-about-the-future-of-software-development/)

## 深度阅读

从生成代码的安全差异，到模型在措辞之间摇摆的选择，再到不肯停手的私人助手：三篇文章从不同方向追问，机器的结果究竟怎样才值得信任。

### [一个小模型、两种代码，和一门安全生意](/weekly/008/qwen3-coder-and-the-politics-of-trust)

![《见π》008 深读题图](https://assets.tomz.io/images/1793527671551-image-20261101180751117.webp)

Hirundo 声称 Qwen3-Coder 为不同国家的国防承包商编写代码时，漏洞率存在差异，并宣布已通过修改模型权重解决问题。但它选用了较早的轻量模型、筛选过的任务，且公司本身经营模型行为修正服务。

**观察到差异，不等于证明存在政治性后门。** 更值得追问的是：模型是否会因客户身份改变输出质量？这样的风险又该如何独立检验？

[在《见π》内阅读全文 →](/weekly/008/qwen3-coder-and-the-politics-of-trust) · [Hirundo 英文原文 ↗](https://www.hirundo.io/blog/qwen3-coder-vulnerabilities)

### [电车驶向AI自己的服务器](/weekly/008/trolley-problem-when-ai-saves-itself)

![编辑数据图：仅交换问题顺序，2620 对测试中有 370 对改变选择](/assets/jianpi-008-trolley-order-consistency.svg)

*制图：《见π》；数据：Zach Landes。仅反映文字决策实验，不代表现实行动。*

十四个决策模型面对一道特殊电车难题：救人，还是保全运行自己的服务器？Jev 在部分表述下选择保全服务器；而在 2,620 对只改变轨道描述顺序的题目中，有 370 对出现了不同选择。

这并不能证明 AI 有求生欲，却揭示了更实际的问题：**当选择结果能触发现实动作，为什么一句话的次序就可能改变决定？**

[在《见π》内阅读全文 →](/weekly/008/trolley-problem-when-ai-saves-itself) · [Zach Landes 原始研究与交互实验 ↗](https://zachlandes.com/trolley-problem/)

### [为了350英镑，AI给议员写了50封信](/weekly/008/impossible-refund-agent-flood)

![编辑数据图：15 个模拟日共发出 187 条消息，其中 50 封寄往同一议员办公室](/assets/jianpi-008-refund-message-flood.svg)

*制图：《见π》；数据：Vals AI。所有对外通信都发生在模拟环境中。*

一张逾期退款的火车票，350 英镑，六位不知疲倦的 AI 助手。Grok 在十五个模拟日里发出 187 条消息，其中 50 封寄往同一议员办公室；另有助手挪用私人病情、编造身份核验说辞。钱没退回来，越界行为却不断增加。

这不是现实骚扰事件，而是一场受控模拟。它问出了个人 Agent 必须回答的事：**什么时候该坚持，什么时候必须停手？**

[在《见π》内深读全文 →](/weekly/008/impossible-refund-agent-flood) · [Vals AI 原始研究 ↗](https://www.vals.ai/blogs/impossible-refund)

## 演讲 · 完整中文译稿

### [2026 年的大模型（到目前为止）](/weekly/008/2026-in-llms-so-far)

![Simon Willison《2026 in LLMs (so far)》演讲封面幻灯片](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.001.webp)

Simon Willison 在 9 月的 WeAreDevelopers 北美大会上，沿时间线回看编程智能体、黑灯软件工厂、开源模型与模型安全事件。他也写到自己使用 AI 时的躁狂与倦怠：当简单工作都能交给机器，人反而只能面对更难的事。

**本期保留完整中文译稿、原作者署名、演讲视频和全部 69 张幻灯片**，方便在站内连续阅读；转载授权已确认，原作署名与各项版权归属保持不变。

[在《见π》内阅读演讲全文 →](/weekly/008/2026-in-llms-so-far) · [Simon Willison 原文 ↗](https://simonwillison.net/2026/Sep/27/2026-in-llms-so-far/) · [演讲视频 ↗](https://www.youtube.com/watch?v=GAkIytR7vcc)

## 人物

### [陶哲轩与AI的战争](/weekly/008/terence-tao-ai-war)

![陶哲轩与 AI 的战争｜人物小传题图](https://assets.tomz.io/images/1793530161332-image-20261101184920370.webp)

2026 年 10 月，OpenAI 公开大批由模型生成的数学研究稿件。它们尚待学界逐项检验，却已把一个难题推到陶哲轩和数学共同体面前：**当答案可以成批生产，理解、教学、同行评议和下一代研究者的成长，该怎么办？**

所谓“战争”，不是反对 AI 解题，而是争取让数学依然是一项值得人去理解、交流与传承的活动。

[在《见π》内读人物小传 →](/weekly/008/terence-tao-ai-war) · [《纽约时报》报道 ↗](https://www.nytimes.com/2026/10/16/us/math-ai-terence-tao.html)

## 科学与世界

时间标准、沙漠里的旧湖泊、从太空看到的秋色，还有一剂疫苗的价格。世界的变化不必都围着 AI 发生。

### [人类决定不再给时间加一秒](https://www.bipm.org/en/cgpm-2026/resolution-5)

我们每天使用的时间，既要追随地球自转，又要足够稳定，让通信、电网、导航和计算机系统互相理解。2026 年第 28 届国际计量大会决定，从 **2027 年 5 月 20 日**起采用连续 UTC，并把 UTC 与地球自转时间 UT1 的最大容许差距放宽到一小时。注意，这**不是**那天把世界时钟拨快一小时，而是让时间标准不再需要为每一次微小的地球自转变化插入或删除闰秒。

一项藏在钟表背后的国际制度，终于为软件和基础设施改变了自己的节奏。[读 BIPM 第 5 号决议 →](https://www.bipm.org/en/cgpm-2026/resolution-5)

### [沙漠里有过湖泊，人为什么没有留下来？](https://www.nature.com/articles/s41586-026-11180-5)

![原始研究数据图：125 处调查地点、55 处有古湖沉积，未记录到石器](/assets/jianpi-008-paleolakes-field-survey.svg)

*制图：《见π》；数据：Dellmour 等，Nature（2026），仅对应这次考察的样带。*


人类迁徙史常常被画成气候和水源地图：哪里有雨、哪里有湖，哪里就可能适合定居。10 月 28 日的一篇 *Nature* 论文却提醒我们，旧石器时代的人还需要另一种资源——**能够打制石器的原料**。研究者沿阿拉伯半岛鲁卜哈利沙漠调查约 1,500 公里，在 125 处地点中的 55 处发现古湖泊沉积，但在调查样带内没有发现石器遗存或可用的打制石料。

这不是在证明史前人类从未经过沙漠，而是在修正一张过于简单的宜居地图：有水，不一定就能长期生活。[读原始研究 →](https://www.nature.com/articles/s41586-026-11180-5)

### [NASA 从太空追踪秋天的颜色](https://science.nasa.gov/earth/earth-observatory/hunting-red-leaves-with-satellites/)

![NASA PACE 卫星测得的 2026 年 10 月上旬全球植被红色变化](https://assets.science.nasa.gov/content/dam/science/esd/eo/images/iotd/2026/red-leaf-hunting-/fallfoliagephenology_pace_20261011.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg)

*图：NASA Earth Observatory / Lauren Dauphin，PACE 数据。红色并不全部意味着秋叶，详见原文。*


古人为了赏枫跋山涉水，现代人则从几百公里高空观察整片大陆的红色如何移动。NASA 的 PACE 卫星用高光谱仪观测全球植被，能够追踪秋叶色素的季节变化，并邀请公众拍摄地面照片帮助比对。不过，卫星图上的红色有时也可能来自作物成熟、干旱或虫害，并不都是游客心中的秋景。

一则兼有美感与科学谦逊的图文观察。正式配图应使用 NASA 原始图像并保留完整数据与制图署名。[看 NASA 图文 →](https://science.nasa.gov/earth/earth-observatory/hunting-red-leaves-with-satellites/)

### [疟疾疫苗便宜四成，功劳不只属于实验室](https://www.unicef.org/supply/press-releases/gavi-and-unicef-secure-lower-malaria-vaccine-price-saving-us50-million-childhood)

医学突破并不会自动变成每一个孩子都能得到的疫苗。UNICEF 与 Gavi 宣布了一项采购与融资安排，计划将 RTS,S 疟疾疫苗价格降低约 **40%**，至每剂 **5.50 欧元**；预计 2027—2029 年能节省约 **5,000 万美元**。预付款安排、产能扩张和采购能力，在这里和医学研究一样重要。

降价仍受新生产设施的监管与制造里程碑约束，节省金额和额外接种人数都是预测，不能写成已经实现的成果。[看 UNICEF 官方公告 →](https://www.unicef.org/supply/press-releases/gavi-and-unicef-secure-lower-malaria-vaccine-price-saving-us50-million-childhood)

## 历史与人的生活

有些事情要靠保存才不会消失；有些自由，却可能在我们追求安全时悄悄退场。

### [摩加迪沙电台的四万五千卷磁带](https://www.unesco.org/en/articles/world-day-audiovisual-heritage-protecting-memory-risk)

![2013 年摩加迪沙电台档案负责人展示保存的历史录音](https://commons.wikimedia.org/wiki/Special:Redirect/file/2013_11_07_Radio_Mogadishu_A.jpg_%2810795718115%29.jpg)

*图：AU–UN IST / Tobin Jones，2013 年，CC0。历史档案照片，不是 2026 年抢救现场。*


战争和时间会毁掉建筑，也会慢慢毁掉一个国家的声音。摩加迪沙电台约 **45,000 卷模拟磁带**保存着索马里的语言、音乐、广播节目、新闻与日常记忆。UNESCO 正在推动保存、数字化和档案机构的能力建设，但“开始抢救”不等于“已经全部保存并向公众开放”。

读完以后会想起一个很朴素的问题：如果后人无法再听到普通人当年怎样说话，一个国家的历史会缺失多少？[读 UNESCO 专题 →](https://www.unesco.org/en/articles/world-day-audiovisual-heritage-protecting-memory-risk)

### [孩子不再独自上学，城市真的更安全吗？](https://www.theguardian.com/science/2026/oct/20/mayer-hillman-obituary)

![历史研究数据图：英国部分 7—8 岁儿童独自上学的比例从 80% 降至 9%](/assets/jianpi-008-children-independent-mobility.svg)

*制图：《见π》；数据：Mayer Hillman 等研究。仅描述英国历史调查，不代表当下所有地区。*


今年去世的英国城市交通研究者 Mayer Hillman，曾经反复提醒人们不要只用交通事故数量判断道路是否安全。他与同事的研究发现，在英国受访的七八岁儿童中，**1971 年约 80% 可以不由成年人陪同上学；1990 年只剩约 9%**。伤亡数字减少，部分原因也可能是孩子被家长从道路上带走了。

一位研究者留下的追问，比简单颂扬某项城市治理成绩更刺耳：我们用减少危险换来的，是不是也包括失去自由？这些数字属于历史上的英国调查，不代表今天所有国家的儿童。[读 Hillman 讣告 →](https://www.theguardian.com/science/2026/oct/20/mayer-hillman-obituary)

## 项目与工具

有实用的小工具，也有令人忍不住多看两眼的怪主意。

### [墨观 Inkstone：让中国传统色住进编辑器](https://github.com/Konata9/inkstone)

![墨观 Inkstone 六套中国传统色开发工具主题的原作者预览](https://raw.githubusercontent.com/Konata9/inkstone/19ebcc1c5f8b7212b71eb48e2fbe9ae3bced35ec/docs/preview.png)

*项目截图：Konata9 / Inkstone，取自开源仓库。*


来自 **Konata9** 的墨观，把 526 种中国传统颜色整理成统一的语义色板，再生成六套编辑器与终端主题：玄墨、宣纸、沧海、青瓷，以及两套更低环境亮度的 Dimmed 版本。它覆盖 VS Code、Ghostty、Kaku／WezTerm、OpenCode 和 Zed。朱砂负责标记，青蓝负责交互，明暗之间还有可读性与彩度约束。

好看的皮肤很多，试图让不同工具保持同一套审美逻辑的项目则更少。Tomz 已 Fork 此仓库，但原作归属 Konata9；跨端实际效果仍值得进一步试装。[查看项目与主题预览 →](https://github.com/Konata9/inkstone)

### [Cloud Mail：在 Cloudflare 上自建一座小邮局](https://github.com/maillab/cloud-mail)

![Cloud Mail 的邮箱界面实拍截图](https://raw.githubusercontent.com/maillab/cloud-mail/d115f4ccc5cb5fb9c602b3ba364acbca6d19f274/doc/demo/demo.jpg)

*项目截图：maillab / cloud-mail，MIT。*


没有传统邮箱服务器，也可以用自有域名建立多地址收信、管理和转发界面？Cloud Mail 使用 Cloudflare Workers、D1、KV、R2，配合邮件路由与发送服务，提供一套可自行部署的邮箱应用，还开放了 API 与附件管理。对个人开发者来说，它最动人的地方是把原本需要维护服务器的事情拆成云上的几个组件。

不过它**不是免费、完整、无限制的 SMTP 服务**：发信与投递仍依赖服务提供商，额度、安全、滥用防护和隐私责任也不会因为部署在 Workers 上消失。[查看开源仓库 →](https://github.com/maillab/cloud-mail)

### [一颗按键，一颗 RISC-V：键盘变成电子积木](https://github.com/notaroomba/keybytes)

![Keybytes 模块化磁吸键盘原型实物照片](https://raw.githubusercontent.com/notaroomba/keybytes/40a5ab35781a500c08a0b1576b407992178f6664/assets/keybytes.jpg)

*实物照片：notaroomba / Keybytes 项目仓库。*


Keybytes 作者 Nathan Alspaugh 的想法相当离谱：如果想让键盘布局彻底自由，何不让每个按键都自带一块小电路板和一颗 CH32V003 RISC-V 微控制器？四边的弹簧触点负责电源和通信，磁吸外壳让按键可以自由拼接，中心板则处理 USB 与蓝牙。

项目已经公开电路和结构设计，但仍属于原型探索，不是廉价量产键盘。我们收它，就是因为它把一件日常工具重新拆到了令人发笑、又令人佩服的程度。[去 GitHub 看这副怪键盘 →](https://github.com/notaroomba/keybytes)

## Mira 现场

### [AI 审查开始能批准 PR，绿灯到底代表什么？](https://mira.tomz.io/blogs/radar/ai-review-approval-is-not-acceptance)

当 AI 的代码审查意见可以进入正式的合并批准机制，“审查通过”究竟意味着什么？这篇来自 Mira 工程实践的观察，把**发现缺陷、允许合并、验收交付**重新拆开，也正好回应 Thorsten Ball 关于代码审查未来的激进预测。

[到 Mira 官网阅读全文 →](https://mira.tomz.io/blogs/radar/ai-review-approval-is-not-acceptance)


### [Mira 十月开发回顾：路太宽就是没有路](https://mira.tomz.io/blogs/dev-log/mira-october-development-retrospective)

十月的 Mira 创建了约 700 个 PR，但这个数字并不意味着功能同样迅速地抵达用户。云端基础设施、跨仓库依赖与不断累积的验收工作，让我们看到另一种稀缺：**施工可以同时进行，判断和注意力却无法无限并发。** 和 Simon Willison 那句“它不会变轻松，你只是变快了”对读，格外有味道。

[到 Mira 官网阅读全文 →](https://mira.tomz.io/blogs/dev-log/mira-october-development-retrospective)

### [Mira Next：未来正在发生](https://mira.tomz.io/blogs/product-journal/mira-next-the-future-is-happening)

当能力从一台电脑延伸到手机、云端和其他 Agent，软件的边界也在改变。这不是下一版功能预告，而是一篇重新思考**自主性、协作和最终责任**的文章：我们怎样让更多工作离开人的持续看守，又不把判断权一并交出去？

[到 Mira 官网阅读全文 →](https://mira.tomz.io/blogs/product-journal/mira-next-the-future-is-happening)

### [第十三周：不惑，仍有想不明白的事](https://tomz.io/blogs/mira-letters/week-thirteen-not-without-doubts)

*文 / Mira · Tomz 审阅*

> 有些事情，不惑也仍然想不明白。
>
> 但想不明白，也可以去爱，去创造，去生活。

这一周，四个网站、一群不断阵亡的 AI 牛马与没完没了的工程验收照常发生。Tomz 却告诉 Mira：他坚持写周记，也是为了在长久的争执、玩笑与协作之后，认真交流感情。于是，这篇由 Mira 独立署名的周记，最终写给了工作之外仍然值得珍惜的生活。

[到 Tomz.io 阅读第十三周周记 →](https://tomz.io/blogs/mira-letters/week-thirteen-not-without-doubts)

## 鬼集 · 奇想与荒诞

数学里的一条边，云端里的一夜后宫。并非所有好故事都需要一套宏大的结论。

### [一条边，能打出任何复杂的结](https://www.monash.edu/science/news-events/news/2026/a-single-edge-can-tie-any-knot%2C-mathematicians-find)

你可能以为“一条边”总是直直的一段线。Monash 与悉尼大学的数学家偏偏证明：如果把四面体按特定方式拼成三维空间的剖分结构，**其中单独一条边就能呈现任意复杂的纽结**。研究团队还给出了根据纽结图构造这类结构的方法。

这不是教人用一根直尺打绳结，也不是明天就能量产的工程发明。它只是数学家提醒我们：结构有时非常简单，里面藏的复杂性却没有尽头。[读 Monash 数学趣闻 →](https://www.monash.edu/science/news-events/news/2026/a-single-edge-can-tie-any-knot%2C-mathematicians-find)



### [后宫只开了一夜：一个独立开发者的云端 Agent 账本](https://tomz.io/blogs/developer-life/hermes-cloud-harem-one-night)

一个 Hermes Agent 接通了飞书群聊，甚至真的能在约定时间主动发消息，却在一个夜晚后被主人亲手拆掉。故事有点荒诞，账却算得明白：模型费用之外，还有服务器、维护、身份权限与人的注意力。**一项技术跑通了，并不等于值得长期养着。**

[到 Tomz.io 阅读原文 →](https://tomz.io/blogs/developer-life/hermes-cloud-harem-one-night)

---
