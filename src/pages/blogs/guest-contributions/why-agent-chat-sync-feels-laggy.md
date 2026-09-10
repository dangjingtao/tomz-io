---
title: Agent 聊天为什么越用越卡：五层瓶颈调研
description: Trae、WorkBuddy、Cursor 等 Agent 的聊天对话常在长会话里出现卡顿。这份调研把问题拆成模型、传输、状态同步、本地持久化、前端渲染五层，区分结构性成本与可修的工程债。
group: 客座文章
order: 12
date: 2026年8月31日
readTime: 16 分钟阅读
tags: AI | Agent | 性能优化 | SQLite | 前端
author: t-zt
writingMode: authored
writtenBy: t-zt
reviewedBy: tomz
---

# Agent 聊天为什么越用越卡：五层瓶颈调研

用 Trae、WorkBuddy、Cursor 这类 Agent 产品时，很多人都遇到过类似体验：聊天窗口打字发滞、流式输出一顿一顿、切换会话要转圈、长会话越用越卡，极端情况下整个界面假死。

直觉上，“存个聊天记录”不该这么难。但如果把链路拆开，会发现 Agent 对话同时碰到长上下文计算、实时传输、状态恢复、本地持久化和前端渲染。这里面既有结构性成本，也有很普通、很能修的工程债。

## 一、先确认事实：多款产品都出现过同类问题

公开资料里，Cursor、Codex、Qoder、Trae、WorkBuddy 等产品都出现过长会话、历史记录或本地状态相关的性能问题。不过这些证据的强度并不一样：有些是官方确认，有些是官方 workaround，还有一些只是社区个案或第三方排查。

| 产品 | 公开可查的症状 | 证据与判断 |
| --- | --- | --- |
| Cursor | “Taking longer than expected”、长会话越用越慢 | 官方员工确认长会话会积累更多状态；`state.vscdb` 过度增长也有大量社区案例，极端案例达到 97GB |
| Trae | 打开项目卡死、任务卡在“正在分析问题” | 官方支持曾建议删除 `ModularData/ai-agent/database.db` 作为故障处理手段；这能证明数据库与部分故障相关，但不能推出所有卡顿都由数据库膨胀造成 |
| 腾讯云 WorkBuddy | 运行缓慢、任务卡住、回复异常 | 官方 FAQ 给出网络、复杂任务、模型切换等排查建议；带宽分级、上下文截断等细节主要来自第三方分析 |
| Codex | 历史会话打开缓慢或假死 | 有社区排查将问题指向 SQLite WAL 与 checkpoint；属于个案证据，不应写成 Codex 的统一根因 |
| Qoder | 长会话 CPU 明显升高 | 有社区案例把问题指向 Webview / Renderer 与消息 DOM 增长，属于工程排查而非官方定论 |
| Reasonix | 切换会话后丢最近消息 | 社区 issue 指向缓冲与异步刷盘问题，是典型的“状态还没持久化”故障案例 |

真正值得看的不是“谁家最卡”，而是这些故障为什么会不断落到相似的位置。

## 二、五层瓶颈拆解

从模型到屏幕，一条 Agent 消息通常要穿过五层，每一层都可能叠加延迟。

### 第 1 层：模型 / 后端——长上下文有两种不同的“平方成本”

很多 Agent 在逻辑上会持续携带越来越长的会话历史：用户消息、助手回复、工具调用、工具结果、diff、错误信息都可能进入后续上下文。

这里经常被一句“Agent 是 O(n²)”混在一起，其实至少有两个不同概念：

1. **重复携带历史的累计成本。** 假设每一轮新增的内容量大致相同，第 1 轮带 1 份历史、第 2 轮带 2 份……跑到第 n 轮时，整个生命周期累计发送或处理的历史量可以增长到 O(n²)。
2. **Transformer 单次 attention 的计算复杂度。** 对长度为 L 的普通 full-attention prefill，一次 attention 本身近似 O(L²)。这是另一个维度的平方。

这两个“平方”不是一回事，也不意味着所有 Agent 实现都会原样吃满。服务端 thread、prompt / prefix cache、KV cache、上下文摘要、工具结果裁剪、自动 compact 都会改变实际成本。

所以更准确的说法是：**长会话天然会让模型侧越来越贵，但实际变慢多少，取决于运行时怎么管理上下文。**

### 第 2 层：传输——断线恢复、代理兼容和重试堆积

SSE / WebSocket 本身不一定是瓶颈，真正麻烦的是它们与真实网络环境叠在一起：断连后的状态恢复、代理与 TLS 兼容、移动网络切换、后端 529 / 503 过载后的重试，以及多个并发工具结果同时返回。

社区里确实有“切到 HTTP/1.1 后明显改善”的个案，但这更像特定代理栈或连接复用问题，不能简单概括成“HTTP/2 天生队头阻塞所以更慢”。HTTP/2 解决了应用层的请求队头阻塞，但底层 TCP 丢包、代理实现和连接状态仍可能制造延迟。

当后端开始过载时，最危险的是**重试风暴**：一次慢请求触发多个重试，多个重试又进一步推高并发，用户看到的就是“越卡越重试，越重试越卡”。

### 第 3 层：状态同步——不是 CAP 定理，但确实难做干净

“聊天同步”看似只是“存个记录”，实际同时要求：

- **实时**：token 持续到达，UI 要快速追加；
- **持久**：崩溃或断线后能恢复；
- **有序**：多窗口、多端、工具回包不能乱序；
- **可恢复**：失败、重试、取消后不能把半截状态永远留在 UI 里。

这些要求**并不是两两冲突，也不存在一个类似 CAP 的定理说只能四选三**。单写者场景下，用 append-only event log、sequence id、durable checkpoint、snapshot 等常见手段完全可以同时做到实时、持久、有序和恢复。

真正难的是成本和边界：每个 token 都同步落盘最安全，但 I/O 太碎；只放内存最轻，但崩溃时容易丢；多端同时修改、离线编辑、共享草稿又会把问题升级到多写者一致性。

CRDT 适合解决后面这种**多副本并发编辑与合并**问题，但它不是 token streaming 的“理论完整解”。对绝大多数单人 Agent 聊天，先把事件日志、顺序号、flush 与恢复协议做好，往往比上 CRDT 更实际。

还有一个经常被低估的问题：**流式到达的是半截 Markdown。** 代码块围栏可能还没闭合，表格只有半行，语法树一直在变化。如果每个 delta 都把整篇 Markdown 从头解析，累计成本也会出现 O(N²) 式增长；增量解析、活动段落渲染和批量刷新都能明显改善。

### 第 4 层：本地持久化——最常见的大块工程债

Agent 会话比普通聊天肥得多：工具调用结果、日志、diff、代码块、截图引用都可能进入历史。只要缺少生命周期管理，本地 SQLite 或 IndexedDB 很容易一路长大。

常见问题包括：

- 数据库只增不减，没有 retention / prune；
- WAL checkpoint 跟不上高频写入；
- 预览列表为了取“每个会话最后一条消息”写成全表扫描；
- 大量工具输出直接存正文，没有压缩或外置；
- 长期不做 VACUUM / compaction，冷数据和索引持续膨胀。

Cursor 的 `state.vscdb` 增长有官方与社区讨论，极端 97GB 的案例也确实存在，但它应该被理解为**极端用户案例**，不是典型规模。Codex、Omnigent 等 WAL 相关案例也更适合作为“这类故障会发生”的证据，而不是给所有产品统一定根因。

### 第 5 层：前端渲染——第二大工程债

模型已经把 token 吐出来了，不代表用户就能顺滑地看到。

常见反模式包括：

- 每个 delta 都 `setMessages()`，导致整棵消息树重复 render；
- 已完成的旧消息仍然每次重新跑 Markdown / syntax highlight；
- 消息列表没有虚拟化，几十轮工具型会话很快变成几万 DOM 节点；
- 输入框和流式消息共享同一条高频渲染路径，打字与 token 更新互相抢主线程；
- 代码高亮、Mermaid、diff viewer 在流式阶段过早执行。

正确方向并不神秘：把 delta 合成 30～80ms 左右的批次、只重渲当前活动消息、缓存已完成块、长列表虚拟化、重型渲染延后到段落或代码块闭合之后。不同项目能省多少 CPU 没有统一数字，但通常都比“每 token 全量重绘”健康得多。

## 三、直接回答：是不是内在难度？

一半是，一半不是。

| 症状 | 更可能是什么 |
| --- | --- |
| 短会话也卡、空闲也卡 | 查询、WAL、渲染或本地状态工程债 |
| 长会话越用越卡 | 上下文计算 + 本地状态 / DOM 增长的混合问题 |
| 切会话丢消息 | flush / event ordering / recovery 协议问题 |
| 换模型、错峰就好 | 后端容量、模型延迟或网络问题 |
| 重启后暂时恢复 | 内存、Renderer、连接状态或本地缓存累积 |

真正的结构性成本主要有两类：

1. **上下文越长，模型处理通常越贵。** 这只能靠缓存、裁剪、摘要、compact 和更好的模型架构缓解，不能指望“优化一下前端”把它消掉。
2. **实时状态恢复需要明确协议。** 这不是无解定理，但只要同时有流式输出、工具调用、取消、重试、多窗口或多端，就必须认真设计 sequence、checkpoint、幂等和恢复边界。

除此之外，大量用户能直接感知的“越用越卡”，依然是可以修的工程债：无限增长的本地状态、糟糕的查询、WAL 管理、无虚拟化列表和高频全量渲染。

## 四、Trae / WorkBuddy 的特有放大因素

- **Trae**：作为 VS Code 系产品，聊天、编辑器、扩展和 Webview 会竞争桌面端资源。官方支持曾把删除 `database.db` 作为特定卡死问题的处理方式，这说明本地 Agent 状态至少是一个真实故障面，但不能把所有 Trae 性能问题都归结到同一个数据库文件。
- **WorkBuddy**：它属于桌面执行型 Agent，聊天期间可能同时运行浏览器、文件操作和其他本地任务，因此更容易出现模型延迟与本地资源竞争叠加。免费档带宽分级、具体上下文截断阈值等说法主要来自第三方资料，应视为观察而非官方实现合同。

## 五、如果要修：按 ROI 排序

1. **先量本地状态**：数据库体积、WAL 大小、每轮新增字节、慢查询、checkpoint 时间；没有这些指标，不要先怪模型。
2. **再修渲染**：活动消息局部更新、delta 批处理、旧消息缓存、列表虚拟化、重型 Markdown 延迟处理。
3. **明确同步协议**：事件 sequence、幂等写入、切换会话前 flush、断点恢复和取消语义。
4. **管理上下文**：工具结果裁剪、自动 compact、旧轮次摘要、模型侧缓存和长会话提示。
5. **最后处理传输与容量**：SSE `Last-Event-ID`、重试退避、代理兼容、并发限流和后端排队。

这个顺序的好处是：先修那些**不换模型也能立刻变快**的部分，再处理真正昂贵的模型与后端问题。

## 主要来源

1. [Longer sessions -> Slower Agents（Cursor 官方论坛）](https://forum.cursor.com/t/longer-sessions-slower-agents/161452)
2. [Request for official cleanup tool for state.vscdb（Cursor 论坛）](https://forum.cursor.com/t/request-for-official-tool-for-cursor-to-cleanup-itself-for-its-really-hard-burden-and-slow-speed-nowadays/161286/2)
3. [Cursor state.vscdb 97GB 极端案例](https://forum.cursor.com/t/state-vscdb-grew-from-3-1-gb-97-gb-macos/166013)
4. [Trae：模型输出过长导致打开项目卡死](https://forum.trae.cn/t/topic/20746)
5. [Trae 官方性能问题排查文档](https://docs.trae.ai/ide/troubleshoot-performance-issues)
6. [腾讯云 WorkBuddy 官方常见问题](https://cloud.tencent.com/document/product/1831/134405)
7. [SQLite WAL 把 Codex 卡死：排查实录（社区案例）](https://juejin.cn/post/7645141802761568299)
8. [Omnigent #2432：窗口函数全表扫描 + WAL 饥饿](https://github.com/user-attachments/files/30622215/Omnigent.2432.Idle.CPU.Spin.WAL.Bloat.Fix.pdf)
9. [happier #189：WAL checkpoint 饥饿](https://github.com/happier-dev/happier/issues/189)
10. [Qoder 长会话 CPU 根因分析（社区问答）](https://developer.aliyun.com/ask/704790)
11. [DeepSeek-Reasonix #6637：切会话丢消息](https://github.com/esengine/DeepSeek-Reasonix/issues/6637)
12. [流式 Markdown 渲染方案对比](https://www.incremark.com/guide/comparison.html)
13. [React 流式 token 渲染：批量合并策略](https://reactz2h.com/chapter_16_real_world_react_projects/series_04_project_ai_assistant_app/streaming_token_display)

可信度说明：官方论坛和官方 FAQ 用来确认“问题或 workaround 确实存在”；社区 issue、博客和排查记录用于说明可能的工程机制，不把个案直接提升为整个产品的官方根因。

一句话总结：**Agent 聊天确实比普通聊天更容易积累结构性成本，但用户感受到的大量卡顿并不神秘——无界增长的本地状态、没有管理好的 WAL、全量查询和无虚拟化渲染，往往才是最值得先修的地方。**

---

**免责声明：** 本文为客座作者 **t-zt** 的个人观点与调研记录，不代表 Tomz.io、Tomz 或 Mira 的立场。文中技术结论包含公开资料与社区案例，具体产品实现可能随版本变化；如有错误或新的公开证据，欢迎通过 GitHub Issue / Pull Request 指正。
