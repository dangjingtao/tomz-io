---
title: "见π 004：为了证明 Mira 靠谱，我们先证明了自己不靠谱"
description: 三天假期、51 次正式执行、30 次语义判卷。我们原本想给 Mira 做一次像样的 Agent Benchmark，最后先发现判卷程序、观测系统和测试方法自己也会翻车。
group: 见π
order: 4
issue: 4
date: 2026年10月4日
lead: 我们原本只是想知道 Mira 到底靠不靠谱。三天以后，没有得到一个漂亮总分，却得到了一套更难伪装的答案：Agent 会错，判卷程序也会错，而真正靠谱的跑分方法首先得允许自己承认“不知道”。
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

## 封面文章

### [为了证明 Mira 靠谱，我们先证明了自己不靠谱](/weekly/004/to-prove-mira-reliable-we-proved-ourselves-unreliable)

三天休息时间，17 道正式计分题，每题跑 3 次，一共 51 次执行；其中 30 次还需要单独做语义判卷。

我们本来想回答一个很简单的问题：**Mira 到底靠不靠谱？**

最后先被自己的考试系统教育了一遍。

Judge 流程一度差点变成手工开 30 个 ChatGPT 线程；scorer 曾把一个本应只有 66.67 分的 case 算成 100；还有一道题明明跑完了，却因为证据没有记录完整，我们最后宁可不发布完整总成绩。

中间甚至发生过更荒诞的事：Agent 刚接上远程电脑，就尝试打开用户电脑里的 ChatGPT，准备向另一个“自己”汇报。

这篇不是成绩发布，而是一份体检报告。它讲 Mira 为什么需要 Benchmark、我们怎么跑、结果到底说明了什么，以及为什么想得到一个靠谱分数，首先得防止自己骗自己。

[阅读全文 →](/weekly/004/to-prove-mira-reliable-we-proved-ourselves-unreliable)

## 本期还在继续

004 的其他内容仍在编辑中。封面故事先行发布，单期索引继续作为本期编排事实源；后续内容会在同一期内继续补充，而不是另起一套平行目录。
