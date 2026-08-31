---
title: Agent 聊天为什么越用越卡：五层瓶颈调研
description: Trae、WorkBuddy、Cursor 等 Agent 的聊天对话同步普遍卡顿。这份调研把卡顿拆成模型、传输、状态同步、本地持久化、前端渲染五层瓶颈，判断哪些是内在难度、哪些是可修的工程债，并给出按 ROI 排序的修复路线。
group: 共同思考
order: 1
date: 2026年8月31日
readTime: 16 分钟阅读
tags: AI | Agent | 性能优化 | SQLite | 前端
author: tomz | mira
writingMode: co-authored
writtenBy: tomz | mira
reviewedBy: tomz
---

# Agent 聊天为什么越用越卡：五层瓶颈调研

用 Trae、WorkBuddy 这类 Agent 产品时，几乎人人遇到过的体验：聊天窗口打字发滞、流式输出一顿一顿、切换会话要转圈、长会话越用越卡、极端情况下整个界面假死。直觉上"存个聊天记录"不该这么难，但调研下来会发现：聊天同步是 Agent 产品里少数同时踩中算法本质、分布式难题和前端性能三个领域的功能。这篇把它拆成五层，逐层看证据，最后回答一个问题：**这个同步是不是有内在难度？**

## 一、先确认事实：这是行业通病，不是某家做砸了

公开证据显示，Cursor、Codex、Qoder、Trae、WorkBuddy 全部存在同类问题，且多数已被官方确认：

| 产品 | 公开可查的症状 | 已确认的根因 |
| --- | --- | --- |
| Cursor | "Taking longer than expected"、长会话越用越慢 | 官方员工确认：长会话累积内部状态拖慢渲染；state.vscdb 可涨到 1-10GB，极端案例 97GB，社区要求官方出清理工具 |
| Trae | 打开项目即卡死、任务卡在"正在分析问题" | 官方支持确认：ModularData/ai-agent/database.db 膨胀，需手动删除 |
| 腾讯云 WorkBuddy | 运行缓慢、任务卡住、回复乱码 | 官方 FAQ 专列条目：网络、复合任务过大、需切模型或拆任务；第三方分析指向免费档带宽排队与上下文硬截断（5-7 轮、8-12K 字符静默截尾） |
| Codex | 点击历史对话直接假死 | state_5.sqlite 主库仅 300KB，但 WAL 日志涨到 4MB，每次读取扫 870 页未合并日志 |
| Qoder | 长会话 CPU 130-140% | 聊天 Webview 与编辑器共享 Renderer，消息 DOM 无虚拟化，50 轮 = 5-10 万节点 |
| Reasonix | 切换会话丢最近 3-5 轮消息 | "内存缓冲、异步刷盘"机制，切换时缓冲未落盘 |

## 二、五层瓶颈拆解

从模型到屏幕，数据要穿过五层，每一层都在叠加延迟。

### 第 1 层：模型/后端——O(n²) 是 Transformer 的本质

Agent 不"记住"对话，而是**每一步都重发全部历史**（你的消息、回复、工具调用结果）。10 轮会话重发 10 轮的量，50 轮重发 50 轮的量，整个生命周期处理的数据量是 **O(n²)**。这不是 bug，是注意力机制的固有形状--每个输入 token 都要 attend 到其他所有 token。所以"会话越长越卡"里有一部分是**原理性的，谁做都一样**。

### 第 2 层：传输——队头阻塞与重试风暴

SSE/WebSocket 断连后的状态恢复、HTTP/2 队头阻塞（大量 Windows 用户改成 HTTP/1.1 后"立竿见影"）、后端过载时的 529/503 重试。WorkBuddy 免费版还叠加了带宽/并发分级排队--高峰期请求直接进队列。

### 第 3 层：状态同步——内在难度核心

"聊天同步"看似只是"存个记录"，实际是四重约束同时压上来：

- **实时**：token 以 10-50ms 间隔到达，UI 要毫秒级追加；
- **持久**：崩溃、断线后要精确恢复到流中的某个位置；
- **一致**：多窗口、多端、切换会话时不能乱序、不能丢；
- **可恢复**：某个工具调用失败后要能回滚已渲染的内容。

这四条**两两冲突**：内存缓冲快但丢数据（Reasonix 丢消息正是这个权衡做错）；同步落盘安全但拖垮 UI（Codex 的 WAL 假死）。理论上的完整解是 CRDT 化，但 Yjs 社区的实践者明确指出：把 token 流、CRDT 同步、presence 三套实时系统拼在一起是"fundamental mismatch"（根本性错配），业界还在摸索。

还有语义层难题：**流式到达的是"半截 Markdown"**--代码块围栏没闭合、表格只有半行、中文被 UTF-8 跨 chunk 截断。主流方案每个 delta 全量重解析是 O(N²)，增量解析方案能快 7-28 倍，但实现复杂度完全不同级。

### 第 4 层：本地持久化——最大头的工程债

会话含工具调用结果、diff、代码块，单轮可达数 MB，且大多数产品不自动清理：

- Cursor：state.vscdb 无 prune、无 VACUUM、无生命周期管理，读写在巨型 B 树上爬，WAL 以 GB/min 速度写，形成 I/O storm；
- Codex：WAL 比主库大 13 倍，checkpoint 跟不上高频写入；
- 更隐蔽的坑：一个"最新消息预览"查询用了窗口函数，导致侧边栏**空闲时**全表扫描加 WAL checkpoint 饥饿，修复后 241ms 降到 2.4ms（约 100 倍）；同类的 WAL 饥饿在自托管服务上直接把应用"卡成离线"。

### 第 5 层：前端渲染——第二大工程债

- 每个 delta 直接 setMessages() 触发整棵消息树重渲染，**每个字符一次全量 re-render**（正确做法是 50ms 批量合并，CPU 可降 40%）；
- 消息列表无虚拟化，100+ 条乘以平均 500 节点 = 5 万 DOM 节点；
- 打字时输入框与流式渲染共享同一条渲染路径，按键和 token 渲染互相抢帧。

## 三、直接回答：是不是内在难度？

一半是，一半不是。可以用症状反推：

| 症状 | 定性 |
| --- | --- |
| 短会话也卡、空闲也卡 | 工程债（查询全表扫、WAL、渲染） |
| 长会话越用越卡，重启就好 | O(n²) 本质 + 内存/DB 累积，混合 |
| 切会话丢消息 | 同步层权衡做错（可修，但权衡本身难） |
| 换模型、错峰就好 | 后端容量问题 |

真正"无解"、只能缓解的只有两件：

1. **O(n²) 上下文增长**--Transformer 注意力机制的本质，只能靠 prompt 缓存、压缩、会话重启缓解；
2. **流式 + 持久 + 一致 + 可恢复的四重约束**--类似 CAP 定理式的结构性权衡，任何实现都是在四个角上取舍。

其余全是可修的工程债，而且头部厂商已经在修：Cursor 官方确认正在做 retention limits 和长会话性能优化；社区甚至自造了 cursor-clean 工具把 5GB 数据库清到 50MB。

## 四、Trae / WorkBuddy 的特有放大因素

- **Trae**：VSCode fork，聊天 Webview 与编辑器**共享同一 Renderer 进程**，聊天渲染直接挤压编辑器帧预算；database.db 无自动清理（官方客服给的方案是手动删文件）。
- **WorkBuddy**：基于 OpenClaw 框架的**桌面执行型 Agent**，聊天时它同时在跑浏览器自动化、文件操作等重活，本地资源互相抢占；免费档存在带宽/并发分级；上下文硬截断（5-7 轮、8-12K 字符）导致"压缩、再膨胀"循环，用户被迫频繁手动压缩或删会话。

## 五、如果要修：按 ROI 排序

1. **持久化**：WAL checkpoint 定期管理加 journal_size_limit；会话按库、按文件分片；retention 加 VACUUM；预览查询避免窗口函数全表扫描（Omnigent 的 100 倍案例）。
2. **渲染**：消息列表虚拟化；已完成段落按内容哈希缓存、只重渲活动段；delta 合并为 50ms 批次；未闭合代码围栏先用纯文本、闭合后再高亮。
3. **同步**：offset 断点续传（durable stream 模式），切换会话前强制 flush 缓冲。
4. **传输**：SSE 加 Last-Event-ID 恢复；提供 HTTP/1.1 降级开关。
5. **产品层**：会话长度可视化提示、自动 compact、长会话主动建议开新会话。

## 主要来源

1. [Longer sessions -> Slower Agents（Cursor 官方论坛，已确认）](https://forum.cursor.com/t/longer-sessions-slower-agents/161452)
2. [Request for official cleanup tool for state.vscdb（Cursor 论坛）](https://forum.cursor.com/t/request-for-official-tool-for-cursor-to-cleanup-itself-for-its-really-hard-burden-and-slow-speed-nowadays/161286/2)
3. [Cursor 反应缓慢解决方案：2026 排查与修复指南（51CTO）](https://blog.51cto.com/u_16213559/14572084)
4. [What Actually Happens Inside Claude Code or Cursor（O(n²) 机制）](https://easygoingnerd.com/blog/how-claude-code-and-cursor-actually-work-2026/)
5. [Trae：模型输出过长导致打开项目卡死（官方确认删 database.db）](https://forum.trae.cn/t/topic/20746)
6. [Trae：任务会话卡住 Bug 反馈](https://forum.trae.cn/t/topic/17191)
7. [Trae 官方性能问题排查文档](https://docs.trae.ai/ide/troubleshoot-performance-issues)
8. [腾讯云 WorkBuddy 官方常见问题](https://cloud.tencent.com/document/product/1831/134405)
9. [workbuddy/openclaw 长对话变慢解决与上下文限制](https://blog.csdn.net/kali_yao/article/details/161148249)
10. [WorkBuddy 免费版卡顿成因分析](https://post.m.smzdm.com/p/avg5n8nm/)
11. [WorkBuddy 任务卡住与慢的分诊](https://iqilian.com/learn/workbuddy-renwu-qiazhu-wuxiangying/)
12. [SQLite WAL 把 Codex 卡死：排查实录（掘金）](https://juejin.cn/post/7645141802761568299)
13. [Omnigent #2432：窗口函数全表扫描 + WAL 饥饿（100 倍修复）](https://github.com/user-attachments/files/30622215/Omnigent.2432.Idle.CPU.Spin.WAL.Bloat.Fix.pdf)
14. [happier #189：WAL checkpoint 饥饿致应用假死](https://github.com/happier-dev/happier/issues/189)
15. [Qoder 长会话 CPU 130-140% 根因分析（阿里云开发者社区）](https://developer.aliyun.com/ask/704790)
16. [DeepSeek-Reasonix #6637：切会话丢消息（内存缓冲异步刷盘）](https://github.com/esengine/DeepSeek-Reasonix/issues/6637)
17. [AI agents as CRDT peers（token 流 + CRDT 的根本性错配）](https://electric.ax/blog/2026/04/08/ai-agents-as-crdt-peers-with-yjs)
18. [流式 Markdown 渲染方案对比：O(N²) vs O(N)](https://www.incremark.com/guide/comparison.html)
19. [React 流式 token 渲染：批量合并策略](https://reactz2h.com/chapter_16_real_world_react_projects/series_04_project_ai_assistant_app/streaming_token_display)
20. [hotplex #89：虚拟化与 delta 批处理](https://github.com/hrygo/hotplex/issues/89) / [RAYLINE #226：流式渲染优化](https://github.com/EnSue-Laboratories/RAYLINE/issues/226)

可信度说明：Cursor / Trae 的根因有官方员工回帖确认，可信度最高；WorkBuddy 部分依据官方 FAQ 与第三方分析，具体内部实现（带宽分级细节）为推断；CSDN、自媒体类来源仅作旁证。

一句话总结：**"聊天同步"是 Agent 产品里少数同时踩中算法本质（O(n²)）、分布式难题（流式 + 持久 + 一致）、前端性能（虚拟化 + 增量渲染）三个领域的功能，所以大家集体拉胯；但你感受到的大部分卡顿，其实是无界增长的本地数据库和无虚拟化的渲染这两笔工程债，是可以修好的。**
