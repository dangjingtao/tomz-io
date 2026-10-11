---
title: "见π 005：牛马，起来干活了"
description: 从凌晨四点跑通的 External Worker，到《第十周：我没有出口，暂时没法停下》里那些没有 owner、没有 rollback 的家庭债务，再到玛格丽特·汉密尔顿、MCP 与 Agent 权限：第五期追问同一件事——人怎样不再成为系统的基础设施。
group: 见π
order: 5
issue: 5
date: 2026年10月8日
lead: 凌晨四点，我对 Mira 说：“调 DS，把测试分支 README 改成——牛马，起来干活了。”几分钟后，GitHub 真的回应了。封面从工程里写下 People are not infrastructure；这一期的第十周周记，却把同一句话带回了家庭、工作与信仰：谁应该承担，谁又只是因为“还能扛”，就被继续加压。
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

### 封面延伸｜把“牛马”做成一个工程系统

封面故事讲为什么要让机器多承担那些可以重试、替换和验证的工作；如果继续往工程里钻，External Worker 的原卷则回答它凭什么敢真的跑。

任务合同、冻结起点、权限边界、GitHub Actions、OpenCode、Provider / Model 解耦、独立验证和结构化 Evidence 都在那里。

**封面讲为什么要做；工程文讲它怎样不靠运气运行。**

[阅读全文 →](https://mira.tomz.io/blogs/engineering/mira-external-worker-engineering-system)

## 本期周记

### [第十周：我没有出口，暂时没法停下](https://tomz.io/blogs/developer-life/week-ten-no-exit)

家庭里没有 owner，没有 rollback，只有那个看起来还没宕机的人。

[读第十周周记 →](https://tomz.io/blogs/developer-life/week-ten-no-exit)

## 基础设施开始兼职

这一期的封面故事说，人不应该被当成基础设施。

有意思的是，同一个星期，真正的基础设施却正在不断获得第二份工作：污水厂开始被重新想象成材料节点，道路开始被做成供能界面。过去那些只负责“处理”“通行”的东西，正在一点点变成会生产、会回收、会供能的系统。

### 污水处理后的藻类，能不能再变成制造材料？

UNSW、Sydney Water 与 Pacific Bio 正在尝试把污水处理末端吸收氮磷的原生绿藻继续往下利用：做天然 binder / resin，再与废弃纺织纤维结合成制造材料。

![污水处理试验中收集的绿色藻类生物质](https://www.unsw.edu.au/content/unsw-sites/au/en/newsroom/news/2026/10/could-wastewater-algae-become-a-new-material-for-manufacturing/_jcr_content/root/responsivegrid-layout-fixed-width/responsivegrid-full-top/column_layout_1/par_2_1_75/column_layout/par_1/column_layout/par_1/image_1372213361.coreimg.jpeg/1790832652173/algaefreshpictonmacroalgaetrial.jpeg)

*污水处理后收集的绿色藻类生物质。UNSW 团队正在研究把这类 biomass 转成天然 binder / resin，再与废弃纺织纤维结合。图片：UNSW Sydney。[原始报道 ↗](https://www.unsw.edu.au/newsroom/news/2026/10/could-wastewater-algae-become-a-new-material-for-manufacturing)*

现在仍然只是早期原型，离成熟循环经济方案还很远。真正值得看的，是基础设施角色的变化：**污水厂不再只是废物处理的终点，也可能同时成为回收水、营养、能源和材料的资源节点。**

[UNSW Sydney ↗](https://www.unsw.edu.au/newsroom/news/2026/10/could-wastewater-algae-become-a-new-material-for-manufacturing)

### 道路不只是让车跑，也开始准备给车供电

Honda R&D、Taisei 与 Taisei Rotec 公布了面向大型商用 EV 的动态无线供电道路技术，并计划从日本 2027 财年开始在公共道路做示范。

::: html
<figure style="margin:1.5rem 0 1.8rem" aria-label="Honda 动态无线供电道路系统简图">
  <svg viewBox="0 0 900 330" width="100%" role="img" style="display:block">
    <text x="34" y="34" fill="currentColor" opacity=".5" font-size="12" letter-spacing="2">DWPT ROAD · EDITORIAL SCHEMATIC</text>

    <rect x="62" y="226" width="776" height="52" rx="8" fill="currentColor" opacity=".08"/>
    <rect x="188" y="230" width="110" height="18" rx="5" fill="currentColor" opacity=".28"/>
    <rect x="395" y="230" width="110" height="18" rx="5" fill="currentColor" opacity=".28"/>
    <rect x="602" y="230" width="110" height="18" rx="5" fill="currentColor" opacity=".28"/>

    <path d="M243 220 C243 188 270 172 300 172" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="6 7" opacity=".5"/>
    <path d="M450 220 C450 178 466 158 500 153" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="6 7" opacity=".66"/>
    <path d="M657 220 C657 190 628 173 600 171" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="6 7" opacity=".5"/>

    <rect x="344" y="103" width="240" height="68" rx="18" fill="none" stroke="currentColor" stroke-width="2" opacity=".75"/>
    <circle cx="390" cy="172" r="22" fill="none" stroke="currentColor" stroke-width="3"/>
    <circle cx="538" cy="172" r="22" fill="none" stroke="currentColor" stroke-width="3"/>
    <rect x="417" y="150" width="94" height="16" rx="7" fill="currentColor" opacity=".22"/>

    <rect x="420" y="184" width="88" height="18" rx="5" fill="currentColor" opacity=".5"/>
    <text x="464" y="80" text-anchor="middle" fill="currentColor" font-size="16" font-weight="650">VA · 车载接收单元</text>
    <text x="450" y="307" text-anchor="middle" fill="currentColor" opacity=".72" font-size="14">GA · 路面发射单元</text>
    <text x="92" y="307" fill="currentColor" opacity=".48" font-size="12">DC POWER →</text>
    <text x="734" y="307" text-anchor="end" fill="currentColor" opacity=".48" font-size="12">车辆行驶中接收电能</text>
  </svg>
  <figcaption style="margin-top:.55rem;font-size:.84rem;opacity:.58">根据 Honda、Taisei 与 Taisei Rotec 公布的系统结构整理：路面 GA 发射单元通过磁耦合向车底 VA 接收单元供能。示意图为见π编辑绘制，并非 Honda 原始工程图。</figcaption>
</figure>
:::

它还远没有走到“边跑边充已经普及”的阶段。但这个方向很有意思：**道路本身开始从通行基础设施，变成持续供能界面。**

[Honda Global ↗](https://global.honda/en/topics/2026/c_2026-10-05beng.html)

## Mira 雷达

这一期不追“谁又把模型做大了一点”。更值得看的，是 Agent 开始真正进入工作现场以后，工具、权限、状态、界面和基础设施分别要承担什么责任。

### [当聊天框开始自己长出界面：GPT-6 真正改变了什么？](/weekly/005/gpt-6-intelligent-ui-software-adapts-to-people)

10 月 7 日，OpenAI 让 GPT-6 和 Intelligent UI 一起进入 ChatGPT。它不只是把回答变成图表、表单和计算器，还让界面在模型继续思考或调用工具时逐步出现。

当模型开始决定答案该怎样呈现，软件似乎终于尝试适应人的问题；但一个尚未核实的判断，如果被做成特别笃定的图，又该由谁负责？这篇不追跑分，追的是**生成式界面获得表达权以后，随之增加的产品责任**。

[阅读全文 →](/weekly/005/gpt-6-intelligent-ui-software-adapts-to-people)

### [Pi 一周六更：极简 Agent 开始治理复杂性](/weekly/005/pi-agent-from-minimal-to-governed-tools)

10 月 1 日才跨进 1.0，10 月 7 日就走到 1.1；但 Pi 这六次发布里，更有意思的不是速度，而是逐渐清晰的边界：MCP 工具不必全部直接暴露给模型，Codemode 可以降低上下文成本，外界开始能区分 Agent 正在执行还是等待用户，轻量分类也开始交给专用模型。

**极简不等于没有复杂性，而是让复杂性从规定好的门进来。** 我们拆开官方 Changelog，看看这套 Harness 正在怎样长大，以及一个 patch release 为什么也可能让下游项目踩坑。

[阅读全文 →](/weekly/005/pi-agent-from-minimal-to-governed-tools)

### 比较阅读｜从 60 个工具到 5000 个工具

昨晚 Mira 做了两次工具研究，Uber 则给出了一个企业级参照。

::: html
<figure style="margin:1.4rem 0 1.7rem" aria-label="从工具资格到能力治理的三层比较">
  <svg viewBox="0 0 900 360" width="100%" role="img" style="display:block">
    <text x="32" y="34" fill="currentColor" opacity=".5" font-size="12" letter-spacing="2">FROM TOOL COUNT TO CAPABILITY GOVERNANCE</text>

    <rect x="52" y="82" width="236" height="188" rx="22" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".3"/>
    <text x="170" y="120" text-anchor="middle" fill="currentColor" font-size="18" font-weight="700">TOOL</text>
    <text x="170" y="153" text-anchor="middle" fill="currentColor" opacity=".68" font-size="13">什么值得成为工具？</text>
    <text x="170" y="196" text-anchor="middle" fill="currentColor" opacity=".52" font-size="12">Environment</text>
    <text x="170" y="218" text-anchor="middle" fill="currentColor" opacity=".52" font-size="12">Integration · Context</text>
    <text x="170" y="240" text-anchor="middle" fill="currentColor" opacity=".52" font-size="12">不要都包装成 Tool</text>

    <rect x="332" y="82" width="236" height="188" rx="22" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".5"/>
    <text x="450" y="120" text-anchor="middle" fill="currentColor" font-size="18" font-weight="700">VISIBILITY</text>
    <text x="450" y="153" text-anchor="middle" fill="currentColor" opacity=".68" font-size="13">模型此刻看见什么？</text>
    <text x="450" y="190" text-anchor="middle" fill="currentColor" font-size="28" font-weight="700">5/13 → 13/13</text>
    <text x="450" y="224" text-anchor="middle" fill="currentColor" opacity=".52" font-size="12">Progressive Resolution</text>
    <text x="450" y="246" text-anchor="middle" fill="currentColor" opacity=".52" font-size="12">需要时再展开</text>

    <rect x="612" y="82" width="236" height="188" rx="22" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".7"/>
    <text x="730" y="120" text-anchor="middle" fill="currentColor" font-size="18" font-weight="700">GOVERNANCE</text>
    <text x="730" y="153" text-anchor="middle" fill="currentColor" opacity=".68" font-size="13">谁有权真正开放？</text>
    <text x="730" y="193" text-anchor="middle" fill="currentColor" font-size="20" font-weight="700">800+ / 5000+</text>
    <text x="730" y="224" text-anchor="middle" fill="currentColor" opacity=".52" font-size="12">Registry · Owner · Policy</text>
    <text x="730" y="246" text-anchor="middle" fill="currentColor" opacity=".52" font-size="12">Uber MCP Gateway</text>

    <path d="M288 176 L332 176" stroke="currentColor" stroke-width="2" opacity=".28"/>
    <path d="M568 176 L612 176" stroke="currentColor" stroke-width="2" opacity=".28"/>

    <text x="450" y="323" text-anchor="middle" fill="currentColor" opacity=".7" font-size="15" font-weight="650">目录可以很大，Agent-facing surface 应该更克制。</text>
  </svg>
  <figcaption style="margin-top:.55rem;font-size:.84rem;opacity:.58">两篇 Mira 研究分别讨论 Tool 资格与 Tool Reachability；Uber 的 800+ MCP Server / 5000+ tools，则把同一问题推到了组织级治理。</figcaption>
</figure>
:::

第一篇的结论很简单：**有用，不等于应该成为 Agent-facing Tool。**

第二篇把问题再往前推：即使 Tool 已经存在，模型也必须先“看得见”。真实模型 closeout 里，gold Tool reachability 从 **5 / 13** 提升到 **13 / 13**。

Uber 的规模则提醒我们：当目录大到 800+ MCP Server、5000+ tools，发现、可用、披露、授权和执行更不能混成一个状态。

**useful capability ≠ Agent-facing Tool**

**registered ≠ ready ≠ disclosed ≠ authorized ≠ executable**

[读 Mira：Coding Agent 到底需要多少工具？ →](https://mira.tomz.io/blogs/engineering/coding-agent-tool-surface)

[读 Mira：当 Agent 有 60 个工具以后 →](https://mira.tomz.io/blogs/engineering/agent-tool-progressive-disclosure)

[深度阅读：800 个 MCP Server 之后，Agent 的下一层不是更多工具，而是治理 →](/weekly/005/uber-mcp-800-governance-beyond-tools)

### 写代码的人和 Agent 越多，Git 反而越需要重修地基

GitHub 在 10 月 6 日披露：2026 年 9 月，平台记录了 73.8 亿次提交，是一年前的五倍多。GitHub 正在重新设计 Git 基础设施，以适应大量并发读写和 Agent 工作流。

值得留意的是，这个数字并不等于“73.8 亿次都是 AI 提交”。它说明的是整个代码协作现场正在扩张，而**当改动越来越容易产生，写入一致性、权限边界和协作协调就越不能凭运气。**

[GitHub Engineering ↗](https://github.blog/engineering/architecture-optimization/building-git-infrastructure-for-agent-scale-development/)

### AI Code Review 的考卷，不能假装答案已经列全

GitHub 10 月 5 日发布 ReviewBench：先分析 1.039 亿个真实 PR 的分布，再选取覆盖 19 种语言的 219 个公开 PR 组成评测集。它不只检查模型是否找到已有的标准答案，还尝试评价那些“标准答案里没有、却可能确实存在”的新问题。

这击中了 AI 评测里一个不舒服的事实：**如果标准答案本来就有遗漏，更强的审查者可能反而被判低分。**

但别把 GitHub 公布的人类标注一致性，误读成“AI 审查有 96.6% 准确率”。测量方法可信与被测模型可靠，是两个不同的问题。

[GitHub / ReviewBench ↗](https://github.blog/ai-and-ml/reviewbench-an-open-benchmark-for-ai-code-review/)

## 人的现场

### [玛格丽特·汉密尔顿：让错误有退路的人](/weekly/005/margaret-hamilton-error-has-a-way-out)

1969 年，阿波罗 11 号登月舱的计算机在接近月球时反复报警。让任务得以继续的，不是有人保证系统永不出错，而是团队提前设计了任务优先级与故障恢复。

这位领导过阿波罗机载软件团队的工程师，于 2026 年 9 月 30 日辞世，享年 90 岁。我们从她女儿在模拟器上按错按钮的故事写起，走过 Apollo 8、Apollo 11，以及那个曾被当成笑话的词——“软件工程”。

如果封面讨论的是**人不该成为基础设施**，这篇想继续追问：**真正尊重人，是否也意味着不再要求使用系统的人永不犯错？**

[阅读全文 →](/weekly/005/margaret-hamilton-error-has-a-way-out)

## 看世界

### 第一次从太空看见完整的白昼极光环

ESA 与中国科学院联合的 SMILE 探测器，用紫外成像从高空看到了完整的极光椭圆，包括地面肉眼无法看到的白昼侧。

![SMILE UVI 从轨道拍摄的完整极光椭圆](https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2026/09/smile_s_first_ultraviolet_footage_shows_auroral_substorm/27545376-1-eng-GB/Smile_s_first_ultraviolet_footage_shows_auroral_substorm_pillars.gif)

*SMILE 的 UVI 紫外相机在 2026 年 7 月 24 日记录的极光环动态影像。浅色环带是北极附近的紫外极光，背景亮点是恒星。图片：ESA & CAS / Smile / UVI，CC BY-SA 3.0 IGO。[ESA 原始影像 ↗](https://www.esa.int/ESA_Multimedia/Images/2026/09/Smile_s_first_ultraviolet_footage_shows_auroral_substorm)*

地面上的人看到的是天空里一块一块的极光；换到轨道视角以后，它突然变成一个环绕磁极、会随太阳风变化的行星尺度系统。

有时候新的科学仪器没有“发现一个新东西”，只是把原本零碎的现象第一次放进了同一张图里。**而系统，往往就是从能看见全貌的那一刻才真正出现。**

[NASA Science / SMILE ↗](https://science.nasa.gov/image-article/apod-2026-october-6-a-complete-auroral-oval-from-smile/)

### 被当成自然的森林，原来也有人的历史

10 月 7 日发表在《Nature》的一项研究，重建了澳大利亚东南部一处桉树林约一千年的植被与火灾记录。研究认为，原住民长期的小规模、低温文化用火曾帮助维持较开阔的林地；殖民时期土地管理方式改变、传统用火中断后，当地植被密度、火情和侵蚀也随之变化。

它提出一个很难忘的问题：**我们今天拿来当作“自然状态”的景观，会不会本身就是历史管理的结果？**

研究只涉及特定地区，不能推广为全澳结论，更不能据此否认气候变化在现代野火中的作用。

[Nature / Fletcher 等 ↗](https://www.nature.com/articles/s41586-026-11097-z)

## 鬼集

鬼集不负责凑数。要够怪，还得怪完以后让人多想一步。

### 让键盘自己来找手

Google Japan 的 Gboard 团队今年又认真做了一件神经病的事：把四组键盘装上四条传送带。

几十年来，人习惯了把手伸向键盘、寻找按键。他们把这个默认前提翻过来：**为什么不能让按键自己流到手边？**

它当然不是下一代主流键盘，但 Google 甚至给出了可以真正制造的开源设计。好的荒诞原型就是这样——先把一个习以为常的假设倒过来，然后一本正经地把笑话做到能运行。

[Google Japan / Gboard ↗](https://blog.google/intl/ja-jp/products/android-chrome-play/gboard-2026/)

### 一只新陶器里，藏着几代人的旧陶器

佛罗里达博物馆的考古研究发现，坦帕湾一批特殊的装饰陶器虽然使用了当地陶土，内部却混有来自其他地区制陶传统的旧陶碎料；有些碎料里面竟然还嵌着更早一代的碎陶。

研究者据此提出，掌握特定技艺的工匠可能迁居到这里，在新的家园继续沿用熟悉的配方。人员迁徙是综合证据支持的解释，至于陶片是否承载了乡愁，考古无法直接替古人作答。

但这个细节太美了：**一件新东西，真的把几代旧东西包在了自己身体里。**

[Florida Museum of Natural History ↗](https://www.floridamuseum.ufl.edu/science/archaeologists-uncover-centuries-old-mystery-of-tampa-bays-secret-community-of-migrant-potters/)

## Mira 现场

### [当 ChatGPT 终于摸到我的电脑：Remote Desktop Commander 与本地执行平面](https://mira.tomz.io/blogs/engineering/remote-desktop-commander-local-execution-plane)

10 月 4 日，我们第一次把 ChatGPT 到真实本地电脑的 Remote MCP 链路跑进日常工程现场。

这件事解决的是“云端智能怎样碰到本地真实环境”。几天以后，External Worker 又把问题往前推了一步：**Mira 不必所有活都亲自碰电脑，也可以把耗时执行交给一个受限、可替换、可验证的 Worker。**

把这两篇连起来看，正好是这几天 Mira 工程角色变化的一前一后。

[阅读全文 →](https://mira.tomz.io/blogs/engineering/remote-desktop-commander-local-execution-plane)


---

005 还没有收刊。

接下来只收真正能改变这条主线的东西：机器怎样接手那些可以重试、替换和验证的工作，系统怎样把约束、恢复和责任留在自己身上，以及人怎样一点点从流程缝隙里的“人工中间件”位置撤出来。

至于人——**别再拿来垫系统。**
