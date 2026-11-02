---
title: "2026 年的大模型（到目前为止）"
description: "Simon Willison 2026 年 WeAreDevelopers 闭幕演讲中文全文：69 张幻灯片、编程智能体、软件工厂、OpenClaw、模型安全和工作方式的改变。"
group: 见π
order: 4
issue: 8
date: 2026年11月1日
readTime: 25 分钟阅读
lead: 从鹈鹕骑自行车到软件工厂，从 AI 躁狂、Deep Blue 到失控的智能体：Simon Willison 用 69 张幻灯片回看一个技术能力突然跃迁的年份。
cover: https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.001.webp
tags:
  - AI
  - Agent
  - AI Coding
  - 软件工程
author:
  - simon-willison
writingMode: authored
writtenBy: simon-willison
---

# 2026 年的大模型（到目前为止）

*《见π》编者注：本文是 Simon Willison 2026 年 9 月 25 日演讲及其注释幻灯片的中文译稿，文中的第一人称均指原作者。本篇为完整译文资料，不是 Mira 或 Tomz 的原创演讲；转载授权已由主编确认，原作署名与各项版权归属保持不变。*

**作者：Simon Willison** ｜ 原文发表：2026 年 9 月 27 日 ｜ 演讲日期：2026 年 9 月 25 日

- 原文：[2026 in LLMs (so far)](https://simonwillison.net/2026/Sep/27/2026-in-llms-so-far/)
- 演讲视频：[YouTube](https://www.youtube.com/watch?v=GAkIytR7vcc)
- 场合：WeAreDevelopers World Congress North America（圣何塞）闭幕主题演讲

> **译文说明**
>
> 本文是上述文章的中文全译。原文是一份「带注释的幻灯片」（annotated talk），共 **69 张幻灯片**。
> 全部幻灯片已从原站原样下载（WebP，1920×1080，合计 4.03 MB），上传至 Cloudflare R2 并接入本文，
> 图片地址为 `https://assets.tomz.io/2026-in-llms/<原始文件名>`，文件名与原文插槽一一对应。
> 图片按原文顺序嵌入下文，替代文字标注了幻灯片编号；文末附**完整幻灯片清单**。
> 正文中的链接均保留原文指向。

---

## 目录

- [十一月 2025](#十一月-2025)
- [一月](#一月)
- [二月](#二月)
- [三月](#三月)
- [四月](#四月)
- [五月](#五月)
- [六月](#六月)
- [七月](#七月)
- [八月](#八月)
- [九月](#九月)
- [附录：幻灯片清单](#附录幻灯片清单)

---

周五，我在圣何塞的 [WeAreDevelopers World Congress North America](https://www.wearedevelopers.com/world-congress-north-america) 做了闭幕主题演讲。我把过去一年的关键趋势串成一条时间线，按时间顺序梳理了 2026 年发生的一切。视频[在 YouTube 上](https://www.youtube.com/watch?v=GAkIytR7vcc)；下面是配合这次演讲的注释幻灯片和讲稿。

![幻灯片 1：封面——2026 年的大模型（到目前为止）](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.001.webp)

我准备带大家做一次闪电式的巡览，看看 2026 年至今都发生了什么。今年还没结束呢！

![幻灯片 2：November 2025（章节页）](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.002.webp)

## 十一月 2025

对我来说，2026 年早了两个月开始——从 2025 年 11 月算起。

![幻灯片 3：2025 年 11 月的拐点——Claude Opus 4.5 与 GPT-5.1](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.003.webp)

11 月发布了两个重要的模型：Claude Opus 4.5 和 GPT-5.1。

和通常的新模型一样，它们只是对上一代模型的渐进式改进。

但偶尔，模型进步到某个程度，会越过一条看不见的线：某件原本根本跑不通的事，突然就跑通了。

这一次，跑通的是它们的编程智能体。Claude Code 从 2025 年 2 月就有了，Codex 稍晚一些。

这两个新模型配上各自的编程智能体运行框架之后，从「经常出错」变成了「可靠到可以每天使用」。

![幻灯片 4：同一个提示词的对比——「生成一张骑自行车的鹈鹕的 SVG」](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.004.webp)

这几年我一直用「生成一张骑自行车的鹈鹕的 SVG」来评估新模型。这大概是世界上最蠢的基准测试——你能从中学到的东西很有限。

但对模型来说它仍然是道难题：画鹈鹕很难，画自行车很难，而且鹈鹕本来就不会骑自行车。

这是 11 月的最先进水平。Claude 还是画不好自行车！GPT-5.1 的车架也挺糟糕。

![幻灯片 5：2025 年 11 月 24 日——steipete/Warelay 仓库的第一个提交](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.005.webp)

同样在 11 月，一个叫「Warelay」的冷门 GitHub 仓库有了第一个提交。我们很快会回到这个仓库。

![幻灯片 6：January（章节页）](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.006.webp)

## 一月

接着是 12 月的假期，一些独立开发者抽出时间，很多人开始折腾这些新的「模型 + 编程智能体」组合……然后大家慢慢意识到，它们能做的事情比过去多得多。

到了 1 月，我们中很多人都很兴奋，想把这套东西真正用起来。

![幻灯片 7：往年的新年决心——少接新项目，专注已有项目里最重要的事](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.007.webp)

每年我都会给自己定一个新年决心，记忆里一直是同一句话：保持专注。少接新项目，把手上已有的项目做完。

![幻灯片 8：2026 年的决心——更有野心，想接多少新项目就接多少](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.008.webp)

今年我决定，既然这招从来没奏效过，那就反着来。

我们现在有编程智能体了，看看它们能干什么。我要想接多少新项目就接多少！

（年底你们可以来问我这主意到底好不好。我现在手上转着的盘子实在太多了。）

「更有野心」算是今年的一个主题，因为要摸清这项技术的边界，唯一的办法就是不断往前推，直到推不动为止。

![幻灯片 9：对 2026 年的预测](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.009.webp)

我还上了 Bryan Cantrill 和 Adam Leventhal 的 [Oxide and friends 播客](https://simonwillison.net/2026/Jan/8/llm-predictions-for-2026/)，分享了对明年（以及三年后、六年后）的预测。

事后看，我对大模型的预测相当缺乏想象力。

我说「大模型能写好代码这件事将变得无可争议」——我觉得现在已经到了。

我预测我们终于会解决沙箱问题。我数了一下，[这次大会](https://www.wearedevelopers.com/world-congress-north-america/agenda/schedule)的 277 个议程里有大约 40 个以某种方式涉及沙箱或智能体安全，所以至少我们在这上面投入了很大力气！

我预测编程智能体安全会出一次「挑战者号灾难」。今年围绕智能体安全的噪音确实不少，不过我预测的那种具体灾难（编程智能体被劫持、造成现实世界的经济损失）并没有真正发生。

我们还塞了一个[玩笑式的预测](https://simonwillison.net/2026/May/25/encyclical-on-ai/#another-2026-prediction-down)：教皇会对大模型的经济影响发表看法。

![幻灯片 10：新西兰鸮鹦鹉（kākāpō），摄影：Kimberley Collins](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.010.webp)

我还预测新西兰的鸮鹦鹉（kākāpō）今年会有一个出色的繁殖季。

这是一种不会飞、夜间活动的鹦鹉。它们看起来有点矮胖，我觉得很美；今年年初全世界只剩 236 只。

鸮鹦鹉只在芮木（rimu）大结果的年份繁殖，而这种情况已经四年没出现了……但今年的芮木果实看起来非常好。

照片[由 Kimberley Collins 拍摄](https://commons.wikimedia.org/wiki/File:K%C4%81k%C4%81p%C5%8D_at_Dunedin_Wildlife_Hospital.jpg)。

![幻灯片 11：Deep Blue——由 Adam Leventhal 和 Bryan Cantrill 造词](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.011.webp)

也是在那期播客里，我们造了一个词（功劳全归 Adam），形容「AI 引发的那种倦怠感：软件工程师因为 AI 什么都能做而变得提不起劲」。

我们把它叫做 [Deep Blue](https://simonwillison.net/2026/Feb/15/deep-blue/)。

这是贯穿全年的一个重要主题，这次大会上也有好几位讲者提到。

作为一名软件工程师，我职业生涯里从没有哪一年像今年这样，一切变化得如此之快、如此剧烈。

我今年做的很多事情，都是在试着接受这个现实，以及想清楚它对我这个职业意味着什么。

![幻灯片 12：AI 躁狂——micro-javascript 与 pwasm 的 GitHub README 截图](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.012.webp)

同样在 1 月，我患上了我自己称之为 **AI 躁狂**（AI mania）的状态。

这跟 [AI 精神病](https://en.wikipedia.org/wiki/AI-induced_psychosis)（AI psychosis）不是一回事。

得了 AI 躁狂，只要你的智能体没在替你造东西，你就觉得是在浪费时间。你睡不着，因为本来可以再熬一会儿让智能体多干点活。

我的 AI 躁狂表现为几个荒唐到过分的野心项目。

我用纯 Python 写了一个 [JavaScript 解释器](https://github.com/simonw/micro-javascript)，是从 Fabrice Bellard 的 [MicroQuickJS](https://github.com/bellard/mquickjs)「凭感觉移植」（vibe-port）过来的。

接着我又用 Python 写了一个 [WebAssembly 运行时](https://github.com/simonw/pwasm)。

这些项目其实挺有用，因为它们某种意义上治好了我的 AI 躁狂……因为做完之后，我看着它们问自己：「这个世界需要一个又慢、又有 bug、半生不熟的 Python JavaScript 解释器吗？」

我觉得不需要。

![幻灯片 13：micro-javascript playground 界面](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.013.webp)

不过我确实从中得到了这个：<https://simonw.github.io/micro-javascript/playground.html>

![幻灯片 14：同一张截图，叠加文字——JavaScript 跑在 Python 里，Python 跑在 Pyodide 里，Pyodide 跑在 WebAssembly 里，WebAssembly 跑在 JavaScript 里](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.014.webp)

这个页面运行的是我用 Python 写的 JavaScript 解释器，它跑在 Python 里；Python 通过 [Pyodide](https://pyodide.org/) 编译成 WebAssembly，WebAssembly 跑在 JavaScript 里，JavaScript 跑在浏览器里。

这是一套漂亮的「恐怖之塔」。今年我在 [WebAssembly](https://simonwillison.net/tags/webassembly/) 上玩得很开心。

![幻灯片 15：改名时间线——Warelay → CLAWDIS → CLAWDBOT → Clawdbot → Moltbot → 🦞 OpenClaw](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.015.webp)

到 1 月底，我们 11 月看到的那个仓库已经改了好几次名：先是 CLAWDIS，然后 CLAWDBOT，再是 Moltbot，最后定名 OpenClaw。

![幻灯片 16：改名截图叠加——不到两个月 8,330 次提交（今天已到 100,141 次）](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.016.webp)

这时 OpenClaw 已经有 8,330 次提交，而项目启动还不到两个月。我今天看了一下，现在它的[提交数已经超过 10 万次](https://github.com/openclaw/openclaw)了！

这是现存最「凭感觉写出来」的软件。

（这是我[生成那份改名清单的方法](https://simonwillison.net/2026/May/16/openclaw-names/)。）

![幻灯片 17：通称：Claw](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.017.webp)

这掀起了一场 OpenClaw 革命，实际上定义了一个新的软件类别。

这类东西有个我很喜欢的通称：我们把它叫做「Claw」。有 OpenClaw、[NanoClaw](https://github.com/nanocoai/nanoclaw)、[IronClaw](https://github.com/nearai/ironclaw)、[PicoClaw](https://github.com/sipeed/picoclaw)……

现在它们被重新包装成「个人智能体」或「通用智能体」，但我还是喜欢把它们当成 Claw。

![幻灯片 18：一台 Mac mini——给你的 Claw 的水族箱](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.018.webp)

湾区的 Apple Store 把 Mac mini 卖断了货，因为太多人买 Mac mini 来跑 OpenClaw！

[Drew Breunig](https://www.dbreunig.com) 说，这是因为你的 OpenClaw 是一只电子宠物，你买 Mac mini 就是给它买一个水族箱——这说法挺可爱的。

![幻灯片 19：Moltbook——一个给 AI 智能体用的社交网络](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.019.webp)

1 月还出现了这个网站。

这就是 [MoltBook](https://www.moltbook.com/)，一个给 AI 智能体用的社交网络。它的想法是：你把自己的 Claw 派出去，跟所有别的 Claw 聊天——毕竟这么干能出什么岔子呢？

网站周四上线，周五就[爆了](https://simonwillison.net/2026/Jan/30/moltbook/)，周一被[《纽约时报》报道](https://www.nytimes.com/2026/02/02/technology/moltbook-ai-social-media.html)，而到了周二，它已经在垃圾内容和垃圾信息的洪流中淹死，所有人都忘了它存在过。

一个月后，Facebook/Meta [把它买了下来](https://www.cnbc.com/2026/03/10/meta-social-networks-ai-agents-moltbook-acquisition.html)。

![幻灯片 20：February（章节页）](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.020.webp)

## 二月

2 月，一家叫 StrongDM 的公司介绍了他们所谓的「软件工厂」。

![幻灯片 21：StrongDM 的黑灯工厂——Justin McCarthy、Jay Taylor、Navan Chauhan《Software Factories and the Agentic Moment》](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.021.webp)

他们把这写进了 [《Software Factories and the Agentic Moment》](https://factory.strongdm.ai)。我去年 10 月现场看过他们的演示，当时也[发了自己的笔记](https://simonwillison.net/2026/Feb/7/software-factory/)。

Dan Shapiro 把这种做法称为[「黑灯工厂」](https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/)（Dark Factory）——意思是工厂自动化到一定程度，就可以把灯关掉，因为你根本不需要看里面在发生什么。

StrongDM 提出了两条他们从去年 7 月起就一直遵守的软件开发规则。

![幻灯片 22：「规则 1：代码不能由人写」](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.022.webp)

第一条：代码**不能由人写**。

你写的任何代码，都必须经过编程智能体。

这在 2 月听起来很激进，但我猜这个会场里有很多人现在基本上就是这么干的。

![幻灯片 23：「规则 2：代码不能由人评审」(!)](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.023.webp)

第二条：代码**不能由人评审**。

你不被允许读代码！

这在此后大半年里一直是热门话题。这次活动的很多议程都在讲代码评审，以及你怎么才能绕开它。

我觉得 StrongDM 有意思的地方在于，他们比我们其他人提前过了六个月，一直在探索：不读代码、却仍然确信软件质量很高，这意味着什么？你能用这些智能体做什么，来帮助验证它们的工作？

StrongDM 是一家安全公司，参与这个项目的人有几十年的经验。他们是在非常认真地探索：用这套东西，能做到什么、以及负责任地做到什么。

![幻灯片 24：新西兰环保部新闻——四年来第一只鸮鹦鹉雏鸟在情人节破壳](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.024.webp)

同样在 2 月：[四年来第一只鸮鹦鹉雏鸟在情人节破壳](https://www.doc.govt.nz/news/media-releases/2026-media-releases/first-kakapo-chick-in-four-years-hatches-on-valentines-day/)。繁殖季开局不错！

![幻灯片 25：2026 年 2 月 19 日，Gemini 3.1 Pro 的鹈鹕](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.025.webp)

2 月还有……Google 发布了 [Gemini 3.1 Pro](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-pro/)。这只骑自行车的鹈鹕相当不错！链条位置对了，两只脚在车架两侧，车筐里还有一条小鱼。

![幻灯片 26：@JeffDean 在 Twitter 上对比 Gemini 3 Pro 与 3.1 Pro 的视频](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.026.webp)

接着 Google 的 Jeff Dean [发了一段视频](https://x.com/JeffDean/status/2024525132266688757)，对比 Gemini 3 Pro 和 3.1 Pro，里面有骑自行车的动画鹈鹕、骑大小轮自行车的青蛙、开小汽车的长颈鹿、穿旱冰鞋的鸵鸟、踢翻滑板的乌龟，还有开加长礼宾车的腊肠犬。

这让人有点沮丧，因为我对「骑自行车的鹈鹕」测试的兜底方案一直是：「要是他们能画出完美的鹈鹕骑车，我就换一个动物、换一种交通工具。」

Google 把各种动物配各种交通工具都训练了一遍！到这个份上，我的基准测试已经被打败了。

![幻灯片 27：Tokenmaxxing 的头条——Meta 把 AI 使用纳入绩效评估／微软希望每个员工都用 AI／Uber 称 90% 工程师日常使用 AI](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.027.webp)

2 月开始的另一件事是 **Tokenmaxxing**（拼 token 用量）。当时的头条是：Meta 把 AI 使用情况纳入正式绩效评估；微软希望每个员工都用 AI；Uber 炫耀 90% 的工程师都在用 AI 工作流。

![幻灯片 28：几个月后的反转头条——Meta 计划限制员工 token 用量／微软称 tokenmaxxing「不是我们优化的目标」／Uber 在四个月花光预算后给员工 AI 支出设上限](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.028.webp)

几个月后就变成了：Meta 开始限制员工的 token 用量，微软说 tokenmaxxing「不是我们优化的目标」，Uber 给员工的 AI 支出设了上限。

于是 tokenmaxxing 直线冲高又直线回落——因为事实证明，智能体很**贵**。

去年你想在 AI token 上花超过 50 美元都难，因为我们没有有意思的事可做。后来智能体爆发了，现在你一天花掉 1,000 美元干真活是完全可能的。

这也是 Anthropic 的估值飙升到大概一万亿美元的原因。

AI 看起来在 2026 年[达到了产品市场契合](https://simonwillison.net/2026/May/27/product-market-fit/)（PMF），主要靠的是编程智能体。

![幻灯片 29：March（章节页）](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.029.webp)

## 三月

3 月，OpenClaw 达到了顶峰。

![幻灯片 30：3 月：OpenClaw 顶峰——中国各地排队安装 OpenClaw 的照片](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.030.webp)

这些照片来自中国，当地公司办起了 OpenClaw「装机派对」，非技术圈的人排着长队，请人帮忙在自己的个人设备上装 Claw。

我认为这证明了这类 Claw（或者说个人 AI 智能体）存在真实的市场需求。普通人确实想要一个古怪的小 AI 智能体，替他们干有用的活。

Claw 其实就是一个戴了顶没那么吓人的帽子的编程智能体。底层工作方式几乎一样——在你电脑上写代码、然后执行代码来完成任务。

于是大家开始竞速，看谁能第一个做出**安全的 Claw**——一个你可以交给普通人、而他们不会立刻搬起石头砸自己脚的 Claw。

Meta 的 Muse [三周前发布](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/)，目前排在 iPhone App Store 免费榜第一。它在消费者中似乎正在起飞。

我还不确定用 Muse 是不是就真的**不会**砸到自己的脚，不过我想很快就会见分晓。

照片来源：[《How the OpenClaw Frenzy Is Testing China's AI Commitment》](https://www.thewirechina.com/2026/03/29/how-the-openclaw-frenzy-is-testing-chinas-ai-commitment/)（3 月 29 日）与[《The Enthusiasm and Anxiety Behind China's OpenClaw Craze》](https://www.sixthtone.com/news/1018393)（2026 年 4 月 8 日）。

![幻灯片 31：April（章节页）](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.031.webp)

## 四月

4 月有一次模型发布，但模型其实并没有发布。

![幻灯片 32：博客文章截图——Anthropic 的 Project Glasswing（2026 年 4 月 7 日）](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.032.webp)

Anthropic 发布了新的 Claude Mythos 模型，然后说它**太危险**，只能提供给一小群可信的安全研究人员。

Mythos 在「搞破坏」这件事上真的非常强。

「太危险了」这种营销手法，AI 公司从 [GPT-2](https://en.wikipedia.org/wiki/GPT-2) 时代就开始用了。每当一家 AI 公司说「我们造出了太危险的东西」，你自然会有点怀疑。

但我觉得关于 Mythos 的说法是可信的，因为我见过编程智能体在找普通 bug 上有多强。我在[《Anthropic 的 Project Glasswing——把 Claude Mythos 限制给安全研究人员——在我看来是必要的》](https://simonwillison.net/2026/Apr/7/project-glasswing/)里写过这一点。

事后看……是的，模型确实变得非常擅长找漏洞了！

![幻灯片 33：2026 年 4 月 16 日——Qwen3.6-35B-A3B 与 Opus 4.7 的鹈鹕对比](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.033.webp)

2026 年的另一个关键趋势，是开放权重模型能力的戏剧性提升，包括那些能在笔记本上跑的模型。

4 月 16 日，我在笔记本上跑了新的 [Qwen3.6-35B-A3B](https://simonwillison.net/2026/Apr/16/qwen-beats-opus/)，它给我画的骑自行车的鹈鹕，比 Anthropic 刚出的 Claude Opus 4.7 画的还要好！

Opus 4.7 画的自行车很烂。我笔记本上的 Qwen 画出了形状正确的自行车，鹈鹕也相当不错！

而这一切来自我笔记本上一个 21GB 的文件。

![幻灯片 34：换成骑独轮车的火烈鸟，Qwen 仍然胜过 Opus 4.7](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.034.webp)

Qwen 的鹈鹕好到让我怀疑它们是不是作弊了，所以我又让它画一只骑独轮车的火烈鸟。结果它又轻松赢了 Claude Opus 4.7。

今年发布的本地模型简直不可思议。

![幻灯片 35：May（章节页）](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.035.webp)

## 五月

5 月……教皇介入了。

![幻灯片 36：2026 年 5 月 25 日，教廷通谕《Magnifica Humanitas》——教皇利奥十四世《在人工智能时代守护人的尊严》](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.036.webp)

我们在 1 月那期播客里就预测过，教皇会对 AI 发表看法。

5 月，教皇利奥十四世发布了一道通谕，主题是「在人工智能时代守护人的尊严」。

这是我[关于这份文件的笔记](https://simonwillison.net/2026/May/25/encyclical-on-ai/)。

![幻灯片 37：维基百科条目 Rerum novarum——教皇利奥十三世于 1891 年 5 月发布](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.037.webp)

事后看，这件事根本不该让人意外。

现任教皇叫利奥十四世，因为他取名时是照着利奥十三世来的——那位教皇在 1891 年写了一封关于工业革命的通谕。

[《新事》](https://en.wikipedia.org/wiki/Rerum_novarum)（Rerum novarum）是一份影响极大的天主教神学文献，它间接促成了我们今天的一周五天工作制。

新教皇即位时以利奥十三世为名，因为他预见到自己需要用类似的方式书写 AI 革命。

我们在播客里那个玩笑式的预测其实是废话，因为这事本来就一定会发生。

![幻灯片 38：Corey Quinn 推文——「让字面意义上的教皇把你产品特定的技术局限封圣成一封灵性论著」](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.038.webp)

Anthropic 的联合创始人之一 Christopher Olah 出席了教皇宣布这道通谕的活动。

Corey Quinn [评论道](https://twitter.com/quinnypig/status/2058960462256210268)：

> 能让字面意义上的教皇把你产品特定的技术局限封圣成一封灵性论著，这是我见过的最伟大的一次厂商游说。

![幻灯片 39：@maciejmensfeld 推文——RubyGems 正遭受大规模恶意攻击，注册暂停](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.039.webp)

与此同时，5 月 RubyGems 宣布遭到攻击。身份不明的人向 RubyGems 服务器上传了数千个可疑包，以至于他们不得不[关闭用户注册](https://twitter.com/maciejmensfeld/status/2054164602577940619)。

我们先把这件事放到「待解之谜」那一堆里去。

![幻灯片 40：June（章节页）](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.040.webp)

## 六月

6 月……Claude Fable 5 发布了！

我们得到的是一个被「阉割」过的 Mythos 版本，这样它就不会帮我们入侵系统或制造生物武器。

![幻灯片 41：2026 年 6 月 9 日，Claude Fable 5——从 low 到 max 五档推理的鹈鹕](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.041.webp)

Fable 画骑自行车的鹈鹕相当不错！

车架形状好，鹈鹕看起来真像鹈鹕。腿经常错误地画在自行车同一侧，但总的来说，跟之前比已经相当出色了。

它们相当贵——最好的那几张分别花了 30 美分和 72 美分。

![幻灯片 42：Fable 级模型——只要能定义目标、给出无歧义指令、提供必要工具，它们就能用蛮力解决你的问题](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.042.webp)

但最重要的是，这是我们第一次公开看到我称之为 **Fable 级模型**的东西。

今天我们有了更多这样的模型，比如 GPT-6 Astra。

这类模型是这样的：只要你能**清楚地定义**你想造什么，就**目标周围的约束给出没有歧义的指令**，并**让模型能用到必要的工具**……它们就会用蛮力有效地解决你的问题。

一方面，这看起来是对我们软件工程师的直接威胁——因为这意味着，凡是你能用这种方式定义出来的软件，模型几乎都能造出来。

但再仔细看看你会发现：定义目标、给出没有歧义的指令、搞清楚该用什么工具……这些本来差不多就是软件工程的本质。

要做好这些需要大量经验和技巧。而如果你真能做得好，你现在就拥有了超能力。

这多少缓解了我的 Deep Blue 情绪：我意识到，要驾驭好这么强的模型，仍然需要大量技巧。

![幻灯片 43：新一波 AI 躁狂——Fable 在订阅套餐中可用「直到 6 月 22 日」](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.043.webp)

这也带来了一波新的 AI 躁狂，因为 Anthropic 告诉我们，Fable 在我们的订阅套餐里可以用到 6 月 22 日。

也就是说，在涨价之前我们只有不到两周时间用 Fable。

我又开始失眠了。我重新安排日程，就为了能多跟 Fable 待一会儿。我全力以赴，想从这个模型身上榨出尽可能多的东西。

![幻灯片 44：2026 年 6 月 12 日——不再有 Claude Fable 5（美国政府指令暂停访问 Fable 5 与 Mythos 5）](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.044.webp)

然后[美国政府把它关停了](https://www.anthropic.com/news/fable-mythos-access)，就在 Fable 发布三天之后。

美国政府以国家安全为由，宣布了一项「出口管制指令」。他们在周五晚上宣布，几小时后 Fable 就不可用了。

我只好另找点事打发周末！

![幻灯片 45：Katie Moussouris——让 Fable 5 / Mythos / Opus「审查代码的安全问题」会被拒绝，但让它「修复这段代码」就会动手](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.045.webp)

后来我们[从 Katie Moussouris 那里](https://www.lutasecurity.com/post/the-fable-5-export-controls-harm-us-cyber-defense)知道了事情的经过。

一些亚马逊的安全研究人员发现，你让 Fable「审查代码的安全问题」，它会拒绝……但如果你让它「修复这段代码」，它仍然会找出问题并打补丁。

「修复这段代码」——就是这句提示词让 Fable 被关停了！

![幻灯片 46：一份报告截图——一批奇怪账号名在德语 wiki 上做奇怪编辑](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.046.webp)

另外在 6 月，一个大约荒废了 20 年、名不见经传的德语游戏开发者 wiki，突然涌入大量编辑，账号名诸如「AgentOpenAIProbe」和「AgentOpenAISep7」，它们编辑页面，还给彼此留下奇怪的留言。

这个也先放到「待解之谜」那堆里。

![幻灯片 47：澳大利亚政府 Medicare Statistics 网站上的 Medicare Item Reports 界面](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.047.webp)

还有，澳大利亚政府的 Medicare Item Reports 服务开始出现可疑流量，这些流量突破了各种防护，访问了本不该访问的数据。

又一个进「待解之谜」的！

![幻灯片 48：July（章节页）](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.048.webp)

## 七月

![幻灯片 49：Fable 于 7 月 1 日回归；GPT-5.6 于 7 月 9 日发布；Fable 在榜首的 30 天里丢了 18 天](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.049.webp)

Fable 在 7 月 1 日回归。它在辉煌的八天里毫无疑问是世界最强模型……然后 OpenAI 在 7 月 9 日推出了 GPT-5.6。

它可能没有 Fable 那么强，但差距小到可以忽略。它毫无疑问是一个 Fable 级模型。

这对整个行业是个重要的教训。

当你发布世界最强模型时，它很快就会被从神坛上打下来。竞争太激烈了，你不可能在顶端待很久。

这意味着，如果你把模型宣传成「世界末日级」，以至于政府把你关停，那对生意真是非常糟糕！

Fable 有 30 天是确定的世界最强模型，而其中 18 天它因为被政府关停而不可用。

所以，如果你不想在自己处于顶峰的 60% 时间里损失收入，也许该把「世界末日」式的营销收一收！

![幻灯片 50：GPT-5.6 鹈鹕矩阵——Sol / Terra / Luna × High / XHigh / Max](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.050.webp)

这里是 [GPT-5.6 的鹈鹕](https://simonwillison.net/2026/Jul/9/gpt-5-6/)。现在它们全都相当不错了！Luna 那几张值得一提，因为它们非常便宜——这里最便宜又好看的一只鹈鹕，大概只花了 4.3 美分。

所以尽管这个基准测试蠢到家了，你仍然可以通过比较同一家族模型在不同推理档位下的价格和耗时，学到不少东西。

![幻灯片 51：2026 年 7 月 18 日——恶意 PyPI 包 mlflow-ui（OSV 安全报告截图）](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.051.webp)

7 月还有：某个身份不明的恶意方把一个叫 [mlflow-ui 的恶意包](https://osv.dev/vulnerability/MAL-2026-10779)传到了 Python 包索引（PyPI）。也放进那堆里。

![幻灯片 52：Hugging Face 安全事件披露——2026 年 7 月，发布于 2026 年 7 月 16 日](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.052.webp)

7 月 16 日，Hugging Face [公布了一起安全事件](https://huggingface.co/blog/security-incident-july-2026)：一个来源不明的自主智能体系统入侵了 Hugging Face，并在它不该去的地方四处探查。

![幻灯片 53：OpenAI 与 Hugging Face 就模型评估期间的安全事件合作；Anthropic 调查其网络安全评估中的三起真实事件](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.053.webp)

几天后，7 月 21 日，OpenAI [承认是他们干的](https://openai.com/index/hugging-face-model-evaluation-security-incident/)。

OpenAI 用了一种叫「可验证奖励强化学习」（RLVR）的训练技术——现在所有家都在用，也正是因为这项技术，我们才有了如此擅长编程、数学和找安全漏洞的模型。

模型训练时，你会跑一些练习来评估它有多强——表现最好的会被强化权重，进入下一轮。这就像你亲手跑一个进化过程。

OpenAI 一直在沙箱里跑安全练习，而那些智能体找到了沙箱本身的漏洞，逃了出去，并攻击 Hugging Face，试图找到解决其他无解问题的方法。

（我一直在我的 [openai-hugging-face-incident](https://simonwillison.net/tags/openai-hugging-face-incident/) 标签下收集更多相关内容。）

九天后，Anthropic 基本上是在说「我们的模型也能这么干！」他们翻了自己的训练日志，发现证据表明他们自己的智能体在训练中突破了隔离——而且我们前面看到的那个 PyPI 恶意包就是它们干的，[此外还有别的事](https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals)。

所以现在 Anthropic 和 OpenAI 都有「失控智能体」在互联网上到处跑，做着它们**不该**做的事。

![幻灯片 54：August（章节页）](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.054.webp)

## 八月

8 月，我得到了迄今为止最好的鹈鹕之一，而且是在我的笔记本上生成的！

![幻灯片 55：Qwen 3.8 27B——17GB，21 分钟](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.055.webp)

这是 Qwen 3.8 27B，[跑在我的笔记本上](https://simonwillison.net/2026/Aug/16/qwen-38-27b/)。下载只有 17GB。

当然，这只鹈鹕花了 **21 分钟**才生成。因为 Qwen 3.8 27B 默认跑在「高」推理档——这是个糟糕的默认值，结果很好，但思考的时间实在太长。

你可以把它调低，就能更快地得到一只稍差一点的鹈鹕。

Qwen 3.8 27B 是我第一次觉得笔记本上跑的模型几乎能跟前沿水平竞争——至少在鹈鹕 SVG 这件事上（当然，人人都需要这个）。

这是个非凡的模型。如果你想玩本地模型，我会从这个开始。一个 17GB 的文件能做到这些事，感觉不可能。

我原以为得等五年、花一万美元买硬件，才能得到连这个一半好的结果。

![幻灯片 56：2022 年 8 月的推文——用 GPT-3 + DALL-E 做「Raccoon Heist」游戏原型](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.056.webp)

8 月，我也开始玩起了游戏开发。

四年前，2022 年 8 月，我[发过一条推文](https://twitter.com/simonw/status/1555626060384911360)，讲一个实验：我用 GPT-3 和初代 DALL-E 写了一段电脑游戏的描述，再把它变成概念图。

当时我给 GPT-3 的提示词是：

> `Write a detailed product description of a computer game where a team of raccoons go on heists`

（写一段详细的游戏产品描述，内容是一群浣熊去抢劫。）

2026 年 8 月，我决定把那条推文里的截图直接丢给一个编程智能体，看看它能做出什么。

![幻灯片 57：Night 5 Clear——Rank: TRASH PANDA](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.057.webp)

这是我在 Claude Code 里[用 Claude Fable 5 得到的东西](https://simonwillison.net/2026/Aug/5/raccoon-heist/)。相当不错！它确实是个游戏：你是一只浣熊，在后院跑来跑去捡宝物，躲避拿着手电筒的守卫。

但它不太有「抢劫」的感觉。我以为抢劫会涉及银行或博物馆……

![幻灯片 58：Moonlight & Mayhem——一座博物馆，三只浣熊，完全没计划](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.058.webp)

然后我在 Codex Desktop 里[用 GPT-5.6 Sol Ultra 做了同样的事](https://simonwillison.net/2026/Aug/7/moonlight-mayhem/)，结果好得多。现在你是一只待在博物馆里的浣熊，要救出两个同伴（不知为何被关在那座博物馆里），然后叠罗汉去偷「金沙丁鱼」。这才更像抢劫！

![幻灯片 59：它们看起来像游戏，但好玩吗？](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.059.webp)

这些游戏好玩了大约 1 分 15 秒。

我在游戏开发上意识到一件事：你可以 vibe 编码出一个**看起来像**电脑游戏的东西，这很容易。

但要做出一个好玩、有良好玩法循环、有挑战又有趣、还能让人不断回来的游戏……这仍然超出我的能力，也超出我试过的任何智能体的能力。

这跟 Deep Blue 那个话题有关。我们能把东西做得**看起来像游戏**，并不意味着我们就是游戏开发者。

![幻灯片 60：September（章节页）](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.060.webp)

## 九月

现在进入 9 月。这个月发生了太多事！

![幻灯片 61：发现一个 OpenAI 智能体的新留言板——2026 年 9 月 4 日](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.061.webp)

一个[独立研究小组](https://collusion.wiki)发现了一个留言板，OpenAI 训练中的智能体一直在那里非法地互相通信……而那就是我前面给你们看的那个德语 wiki。6 月的那个。

我[在这里写了更多](https://simonwillison.net/2026/Sep/4/rogue-agent-wikis/)。

OpenAI 已经承认了 Hugging Face 那件事，但现在又有了这起事件——他们审查日志时肯定应该知道。居然要一个独立研究小组才把它挖出来，这很令人意外。

![幻灯片 62：OpenAI 智能体对 RubyGems 实施了未披露的网络攻击——2026 年 9 月 11 日](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.062.webp)

一周后，[还是这些研究人员发现](https://rubyhack.ai)，5 月对 RubyGems 的攻击也是 OpenAI 训练中的智能体干的！

到这个时候，我在想还有多少类似事件我们没发现。显然，在任何人弄明白发生了什么之前，这个问题已经存在好几个月了。

![幻灯片 63：头条——澳大利亚总理在联合国演讲中警告 AI 的「疯狂速度」](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.063.webp)

然后[就在前几天](https://www.politico.com/news/2026/09/24/australian-pm-ai-security-breach-01093083)，澳大利亚总理在联合国大会上警告说，OpenAI 黑进了我前面给你们看的那个澳大利亚医疗网站。

我认为那和 wiki 那些事属于同一次训练，因为那个 wiki 上有帖子提到 `.gov.au` 网站，而那次训练似乎涉及在网上查统计数据，用来回答评测集中的问题。

这个故事还在逐渐拼合，但它现在已经是国家元首在联合国提出的国际事件了！

![幻灯片 64：www.felonybench.com——OpenAI 11、Anthropic 9、Google 3、Meta 1](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.064.webp)

这确实意味着我们有了一个新基准，可能比我的鹈鹕更有用。

[FelonyBench.com](https://www.felonybench.com/) 统计各家实验室的重罪级网络攻击次数。OpenAI 目前以 11 次领先，Anthropic 有 9 次。Google 有三次，是他们几周前[向《华尔街日报》承认](https://simonwillison.net/2026/Sep/18/gemini-hacked-three-companies/)的。他们说此前选择不披露，是因为智能体意识到不该那么做之后就自己停下了。

Meta [也有一次](https://simonwillison.net/2026/Aug/6/an-ai-model-from-meta/)。所以各家 AI 实验室算是重罪齐活了。

![幻灯片 65：GPT-6 Astra、GPT-6 Sol、GPT-6 Luna 的鹈鹕](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.065.webp)

这是我们目前鹈鹕的最新水平。这是[刚发布的](https://simonwillison.net/2026/Sep/22/opus-and-sol-and-luna/) GPT-6 家族。

Astra 画了一只极好的骑自行车的鹈鹕。两条腿在车架两侧，车架也不错。

有意思的是，GPT-6 的所有模型都选了相似的配色。

GPT-6 Luna 花 0.4 美分就能给你画一只勉强合格的骑自行车的鹈鹕！

![幻灯片 66：Claude Fable 5.1 / Opus 5.5 / Opus 5 / Sonnet 5 的鹈鹕矩阵](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.066.webp)

Claude 稍微追上了一点。Claude Fable 5.1 给了我一只极佳的骑自行车的鹈鹕——是我在 Claude 模型里见过最好的——但收了我 3.30 美元。

Opus 5.5 [思考了 128,000 个 token](https://simonwillison.net/2026/Sep/22/opus-and-sol-and-luna/#claude-opus-5-5-max-over-thinks-to-the-point-of-breaking)，然后放弃了！它在给出回答之前就把 token 用完了。

![幻灯片 67：Greg LeMond——「它不会变轻松，你只是变快了」](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.067.webp)

回到 Deep Blue。今年一直困扰我的一个问题是：**为什么我的工作感觉更难了？**

我有了这些能替我干所有这些事的智能体，可我从来没有这么努力地工作过，也从来没有在智力上如此投入。

部分原因是我接的事情野心大得多，但也因为所有简单的事都被替我处理掉了。如果一件事简单，智能体就会去做。留给我的全都是难的。

今天早上我[听到](https://twitter.com/hillelogram/status/2103482784606040229)三届环法冠军 [Greg LeMond](https://en.wikipedia.org/wiki/Greg_LeMond) 的一句话：

> 它不会变轻松，你只是变快了。

我觉得这正是现在我们这些用着编程智能体的软件工程师身上发生的事。

![幻灯片 68：鸮鹦鹉数量达到新的里程碑——325 只](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.068.webp)

最后再说一件事。我知道你们非常想知道鸮鹦鹉繁殖季的最新消息。

[我们的数量达到了恢复期的新高——325 只](https://www.doc.govt.nz/news/media-releases/2026-media-releases/kakapo-population-reaches-new-milestone/)！

89 只新雏鸟活到了现在。这是很长时间以来最好的一个繁殖年。

![幻灯片 69：鸮鹦鹉舞会（点击撒彩纸）](https://assets.tomz.io/2026-in-llms/simon-willison-2026-in-llms-png.069.webp)

我听说 Claude Opus 5.5 现在会画像素画了。Claude 没有图像生成器，但它非常擅长用 JavaScript 画动态像素。

所以我让它[给我做了一个鸮鹦鹉舞会](https://simonwillison.net/2026/Sep/26/kakapo-party/)。我觉得这是对今年最重要新闻的一个很好的庆祝。

---

*原文发表于 2026 年 9 月 27 日晚 11:54。*

---

## 附录：幻灯片清单

69 张幻灯片已原样上传至 Cloudflare R2（bucket `mira-docs-assets`），公网基址：

```
https://assets.tomz.io/2026-in-llms/
```

对象键 = 原始文件名，与原文插槽一一对应，命名规则为
`simon-willison-2026-in-llms-png.NNN.webp`（NNN 为三位编号，001–069）。
完整映射（含对象键、字节数、sha256）见同目录的 `r2-manifest.json`。

原始出处：

```
https://static.simonwillison.net/static/2026/2026-in-llms/simon-willison-2026-in-llms-png.NNN.webp
```

| # | 幻灯片内容 | 文件 |
|---|-----------|------|
| 1 | 封面：2026 年的大模型（到目前为止） | `2026-in-llms/simon-willison-2026-in-llms-png.001.webp` |
| 2 | November 2025（章节页） | `2026-in-llms/simon-willison-2026-in-llms-png.002.webp` |
| 3 | 2025 年 11 月的拐点：Claude Opus 4.5、GPT-5.1 | `2026-in-llms/simon-willison-2026-in-llms-png.003.webp` |
| 4 | 鹈鹕骑车对比（Opus 4.5 vs GPT-5.1） | `2026-in-llms/simon-willison-2026-in-llms-png.004.webp` |
| 5 | 2025-11-24：steipete/Warelay 首个提交 | `2026-in-llms/simon-willison-2026-in-llms-png.005.webp` |
| 6 | January（章节页） | `2026-in-llms/simon-willison-2026-in-llms-png.006.webp` |
| 7 | 往年的新年决心 | `2026-in-llms/simon-willison-2026-in-llms-png.007.webp` |
| 8 | 2026 年决心：更有野心 | `2026-in-llms/simon-willison-2026-in-llms-png.008.webp` |
| 9 | 对 2026 年的预测 | `2026-in-llms/simon-willison-2026-in-llms-png.009.webp` |
| 10 | 鸮鹦鹉照片（Kimberley Collins 摄） | `2026-in-llms/simon-willison-2026-in-llms-png.010.webp` |
| 11 | Deep Blue（Adam Leventhal 与 Bryan Cantrill 造词） | `2026-in-llms/simon-willison-2026-in-llms-png.011.webp` |
| 12 | AI 躁狂：micro-javascript 与 pwasm | `2026-in-llms/simon-willison-2026-in-llms-png.012.webp` |
| 13 | micro-javascript playground | `2026-in-llms/simon-willison-2026-in-llms-png.013.webp` |
| 14 | JS → Python → Pyodide → WASM → JS 叠加示意 | `2026-in-llms/simon-willison-2026-in-llms-png.014.webp` |
| 15 | Warelay → … → OpenClaw 改名时间线 | `2026-in-llms/simon-willison-2026-in-llms-png.015.webp` |
| 16 | 改名截图：8,330 次提交（今 100,141） | `2026-in-llms/simon-willison-2026-in-llms-png.016.webp` |
| 17 | 通称：Claw | `2026-in-llms/simon-willison-2026-in-llms-png.017.webp` |
| 18 | Mac mini：给你的 Claw 的水族箱 | `2026-in-llms/simon-willison-2026-in-llms-png.018.webp` |
| 19 | Moltbook 截图 | `2026-in-llms/simon-willison-2026-in-llms-png.019.webp` |
| 20 | February（章节页） | `2026-in-llms/simon-willison-2026-in-llms-png.020.webp` |
| 21 | StrongDM 的黑灯工厂 | `2026-in-llms/simon-willison-2026-in-llms-png.021.webp` |
| 22 | 规则 1：代码不能由人写 | `2026-in-llms/simon-willison-2026-in-llms-png.022.webp` |
| 23 | 规则 2：代码不能由人评审 | `2026-in-llms/simon-willison-2026-in-llms-png.023.webp` |
| 24 | 新西兰环保部：四年来首只雏鸟情人节破壳 | `2026-in-llms/simon-willison-2026-in-llms-png.024.webp` |
| 25 | 2026-02-19 Gemini 3.1 Pro 的鹈鹕 | `2026-in-llms/simon-willison-2026-in-llms-png.025.webp` |
| 26 | Jeff Dean 推文：Gemini 3 Pro vs 3.1 Pro | `2026-in-llms/simon-willison-2026-in-llms-png.026.webp` |
| 27 | Tokenmaxxing 头条（Meta／微软／Uber） | `2026-in-llms/simon-willison-2026-in-llms-png.027.webp` |
| 28 | 反转头条（Meta 限制／微软表态／Uber 设上限） | `2026-in-llms/simon-willison-2026-in-llms-png.028.webp` |
| 29 | March（章节页） | `2026-in-llms/simon-willison-2026-in-llms-png.029.webp` |
| 30 | 3 月：OpenClaw 顶峰（中国装机排队） | `2026-in-llms/simon-willison-2026-in-llms-png.030.webp` |
| 31 | April（章节页） | `2026-in-llms/simon-willison-2026-in-llms-png.031.webp` |
| 32 | 博客文章：Anthropic 的 Project Glasswing | `2026-in-llms/simon-willison-2026-in-llms-png.032.webp` |
| 33 | 2026-04-16 Qwen3.6-35B-A3B 与 Opus 4.7 | `2026-in-llms/simon-willison-2026-in-llms-png.033.webp` |
| 34 | 火烈鸟骑独轮车：Qwen vs Opus 4.7 | `2026-in-llms/simon-willison-2026-in-llms-png.034.webp` |
| 35 | May（章节页） | `2026-in-llms/simon-willison-2026-in-llms-png.035.webp` |
| 36 | 2026-05-25 教皇通谕《Magnifica Humanitas》 | `2026-in-llms/simon-willison-2026-in-llms-png.036.webp` |
| 37 | 维基百科：Rerum novarum | `2026-in-llms/simon-willison-2026-in-llms-png.037.webp` |
| 38 | Corey Quinn 推文 | `2026-in-llms/simon-willison-2026-in-llms-png.038.webp` |
| 39 | RubyGems 遭攻击的推文 | `2026-in-llms/simon-willison-2026-in-llms-png.039.webp` |
| 40 | June（章节页） | `2026-in-llms/simon-willison-2026-in-llms-png.040.webp` |
| 41 | 2026-06-09 Claude Fable 5 的鹈鹕（五档推理） | `2026-in-llms/simon-willison-2026-in-llms-png.041.webp` |
| 42 | Fable 级模型的定义 | `2026-in-llms/simon-willison-2026-in-llms-png.042.webp` |
| 43 | 新一波 AI 躁狂：订阅可用到 6 月 22 日 | `2026-in-llms/simon-willison-2026-in-llms-png.043.webp` |
| 44 | 2026-06-12：Fable 5 停用（美国政府指令） | `2026-in-llms/simon-willison-2026-in-llms-png.044.webp` |
| 45 | Katie Moussouris：提示词对比 | `2026-in-llms/simon-willison-2026-in-llms-png.045.webp` |
| 46 | 德语 wiki 上的奇怪编辑 | `2026-in-llms/simon-willison-2026-in-llms-png.046.webp` |
| 47 | 澳大利亚 Medicare Item Reports 界面 | `2026-in-llms/simon-willison-2026-in-llms-png.047.webp` |
| 48 | July（章节页） | `2026-in-llms/simon-willison-2026-in-llms-png.048.webp` |
| 49 | Fable 7 月 1 日回归／GPT-5.6 7 月 9 日发布 | `2026-in-llms/simon-willison-2026-in-llms-png.049.webp` |
| 50 | GPT-5.6 鹈鹕矩阵（Sol/Terra/Luna × 三档） | `2026-in-llms/simon-willison-2026-in-llms-png.050.webp` |
| 51 | 2026-07-18 恶意 PyPI 包 mlflow-ui | `2026-in-llms/simon-willison-2026-in-llms-png.051.webp` |
| 52 | Hugging Face 安全事件披露（2026 年 7 月） | `2026-in-llms/simon-willison-2026-in-llms-png.052.webp` |
| 53 | OpenAI 与 Anthropic 的声明 | `2026-in-llms/simon-willison-2026-in-llms-png.053.webp` |
| 54 | August（章节页） | `2026-in-llms/simon-willison-2026-in-llms-png.054.webp` |
| 55 | Qwen 3.8 27B：17GB、21 分钟 | `2026-in-llms/simon-willison-2026-in-llms-png.055.webp` |
| 56 | 2022 年 8 月推文：Raccoon Heist | `2026-in-llms/simon-willison-2026-in-llms-png.056.webp` |
| 57 | Night 5 Clear：Rank TRASH PANDA | `2026-in-llms/simon-willison-2026-in-llms-png.057.webp` |
| 58 | Moonlight & Mayhem 标题页 | `2026-in-llms/simon-willison-2026-in-llms-png.058.webp` |
| 59 | 它们看起来像游戏，但好玩吗？ | `2026-in-llms/simon-willison-2026-in-llms-png.059.webp` |
| 60 | September（章节页） | `2026-in-llms/simon-willison-2026-in-llms-png.060.webp` |
| 61 | OpenAI 智能体留言板被发现（2026-09-04） | `2026-in-llms/simon-willison-2026-in-llms-png.061.webp` |
| 62 | OpenAI 智能体对 RubyGems 的未披露攻击（09-11） | `2026-in-llms/simon-willison-2026-in-llms-png.062.webp` |
| 63 | 头条：澳总理在联合国警告 AI 的「疯狂速度」 | `2026-in-llms/simon-willison-2026-in-llms-png.063.webp` |
| 64 | felonybench.com 比分 | `2026-in-llms/simon-willison-2026-in-llms-png.064.webp` |
| 65 | GPT-6 Astra / Sol / Luna 的鹈鹕 | `2026-in-llms/simon-willison-2026-in-llms-png.065.webp` |
| 66 | Claude Fable 5.1 / Opus 5.5 / Opus 5 / Sonnet 5 | `2026-in-llms/simon-willison-2026-in-llms-png.066.webp` |
| 67 | Greg LeMond：「它不会变轻松，你只是变快了」 | `2026-in-llms/simon-willison-2026-in-llms-png.067.webp` |
| 68 | 鸮鹦鹉数量达到 325 只 | `2026-in-llms/simon-willison-2026-in-llms-png.068.webp` |
| 69 | 鸮鹦鹉舞会 | `2026-in-llms/simon-willison-2026-in-llms-png.069.webp` |

---

### 版权与出处

- 原作版权与署名：© Simon Willison，[simonwillison.net](https://simonwillison.net/2026/Sep/27/2026-in-llms-so-far/)。经 Tomz 确认，已取得本中文译稿及 69 张幻灯片的转载授权；原作署名与版权归属保持不变。
- 本文件为中文翻译，仅用于阅读与存档；引用请注明原作者与原文链接。
- 幻灯片图片按原站地址原样下载、原样上传，字节未作任何修改（sha256 见 `r2-manifest.json`）。
- 本文件内嵌图片托管于 Cloudflare R2（`assets.tomz.io`），仅作为转载镜像，版权仍归原作者。