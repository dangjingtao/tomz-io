---
title: OPC 探索（二）：Mira Forge，一间本地 AI 工程调度室
description: 从 Codex 主评审线程、OpenCode 施工、worktree 并行与断流恢复出发，设计一套让多个 AI 工具真正接力而不是靠人搬运的本地工程调度方案。
group: 共同思考
order: 2
date: 2026年8月28日
readTime: 15 分钟阅读
tags: OPC | Mira Forge | Codex | OpenCode | Git worktree | Agent 自动化
author: tomz | mira
writingMode: co-authored
writtenBy: tomz | mira
reviewedBy: tomz
---

# OPC 探索（二）：Mira Forge，一间本地 AI 工程调度室

上一篇讨论自动化时，我们从一个很具体的问题出发：为什么已经有 Codex、Trae、Claude Code、OpenCode 这些能写代码的工具，真正工作起来，人还是会累？

最初的答案很简单。

任务卡需要复制。

施工结果需要搬回来。

AI 做完以后还得重新叫另一个 AI Review。

施工过程中还会不断弹权限确认。

并行开几个任务之后，又会开始记：

- 哪个 Agent 在干哪张卡；
- 哪个已经结束；
- 哪个正在返工；
- 哪个等 Review；
- 哪两个任务其实不能同时合入；
- 刚才那个 Codex 评审线程是不是又断了。

工具很多，但人仍然在充当这些工具之间的消息总线。

这不是我们想要的 OPC。

真正值得探索的问题，也许不是再找一个更聪明的 Coding Agent，而是：

> **怎样让现有 Agent 组成一条可信、能恢复、尽量少打断人的本地工程流水线。**

这篇是这条思路的第二次收敛。

它仍然不是施工记录。

它是一份准备拿真实项目验证的基础设计。

暂时给它一个名字：**Mira Forge**。

它不是新的 Coding Agent。

它更像一间运行在本机上的 AI 工程调度室。

## 先承认真实工作流，而不是从理想架构开始

我现在比较常见的一种工作方式是：

```text
Codex 主线程
    ↓
理解需求
拆任务
讨论方案
判断风险
    ↓
Trae / 其他 Coding Agent
    ↓
施工
    ↓
回到 Codex
    ↓
Review
    ↓
返工 / 通过
```

这里有一个很重要的事实。

**真正掌握项目上下文的，往往不是施工 Agent，而是前面那个长期存在的评审线程。**

它知道：

- 需求是怎么讨论出来的；
- 哪些产品结论已经定了；
- 哪些地方不能随便重构；
- 哪些技术债是已知且暂时接受的；
- 任务卡背后的真实目标是什么；
- 哪几个任务其实有隐性依赖。

所以“施工完成以后再找一个全新的 AI Reviewer”并不一定更好。

新 Reviewer 即便模型很强，也可能只拿到：

```text
任务卡
+
diff
+
少量代码
```

然后开始一本正经地误判。

长期评审线程反而更靠谱。

于是我们这次不再从：

> 怎么做一个 AI PR Review Bot？

开始。

而是从：

> **怎么让施工结果自动回到原来的长期评审上下文？**

开始。

## PR 不应该成为唯一的自动化触发点

最初很容易想到：

```text
Agent 完成
→ 创建 PR
→ GitHub Action
→ AI Review
```

这当然可行。

但它太晚了。

很多真实施工在 PR 之前就已经需要 Review：

```text
修改完成
→ 本地 build
→ 本地 test
→ Review
→ 返工
→ 再 Review
→ 最终才 commit / PR
```

所以真正的触发点应该是：

> **一次施工阶段完成。**

而不是：

> PR 已经创建。

PR 只是流水线后面的一个出口。

施工完成可能来自：

- Trae 完成一张任务卡；
- OpenCode session 进入 idle；
- Codex Builder 完成一个 turn；
- Claude Code 完成本地修改；
- 未来其他 Coding Agent 结束一次任务。

因此调度层不应该绑死 GitHub。

它应该只认识一个抽象事件：

```text
Builder Done
```

## Builder 可以换，Reviewer 不一定要换

如果我们接受“Codex 长期线程目前仍然是最可靠的项目 Reviewer”，那么整个流水线会简单很多。

```text
Codex Review Thread
        ↓
     Dispatch
        ↓
Builder Agent
        ↓
   Builder Done
        ↓
Codex Review Thread
```

Builder 可以是：

```text
Trae
OpenCode
Claude Code
Codex
未来其他 Agent
```

而调度系统并不需要理解每一种工具所有细节。

它只需要一个很薄的 Adapter：

```text
startTask()
resumeTask()
sendFeedback()
getStatus()
stopTask()
```

第一版甚至只做一个 Builder。

例如 OpenCode。

这样我们验证的是调度模型，而不是同时兼容全世界。

## 为什么现在更倾向 OpenCode 做施工实验

Trae 和 Claude Code 都有一个很现实的问题：

**它们会弹确认。**

从安全设计角度，这是合理的。

但从 OPC 工作方式看，非常烦。

理想中的施工 Agent 应该是：

```text
任务派下去
↓
它自己读代码
↓
修改
↓
build
↓
test
↓
修正
↓
结束
```

而不是：

```text
施工五分钟
↓
请确认
↓
再施工十分钟
↓
请确认
↓
再回来一次
```

如果每隔几分钟还要回来点一次确认，那人并没有真正从施工中脱身。

所以施工 Agent 的一个重要指标不是 benchmark，而是：

> **一张任务派出去以后，人需要回来碰它几次。**

OpenCode 值得试，不是因为已经证明它一定最聪明。

而是因为它的执行方式和权限控制更容易做成：

```text
工作区内读写       allow
build / test       allow
git diff           allow

workspace 外修改   deny
git push           deny
deploy             deny
高风险操作         deny / ask
```

也就是：

> **先把笼子画好，笼子里面不要再叫我。**

## 任务卡不应该被复制成第二套任务格式

在 Com Design Prototype 里，这一点其实已经有很好的基础。

任务卡本身已经包含：

```text
ID
背景
目标
Scope
Out of scope
Acceptance
风险
依赖
验证方式
Implementation record
Evidence
Review
```

所以没有必要再生成：

```text
task-copy-final-v2-for-opencode.md
```

施工系统应该直接认现有任务卡。

调度器只额外记录运行态信息：

```text
taskId
batchId
baseSha
worktree
builder
builderSessionId
reviewThreadId
runtimeStatus
```

任务事实仍然只有一份。

这很重要。

因为整个系统的目标就是减少搬运，而不是创造新的搬运对象。

## “哪些任务可以并行”应该继续由懂项目的线程判断

我现在经常会先问 Codex：

> T38 到 T42 哪些可以并行？

这件事其实非常适合继续保留。

因为是否可以并行，并不是简单看两个任务有没有改同一个文件。

真正需要考虑的是：

```text
API contract
shared type
route registry
global state
design token
schema
migration
permission model
package config
generated files
```

两个任务可能完全不修改同一行代码，却仍然存在语义竞态。

所以并行判断应该由拥有项目上下文的 Codex 主线程完成。

例如：

```text
Wave 1
T38
T39

Wave 2
T40

Wave 3
T41
T42
```

然后一个 Skill 把这个判断转换成机器可执行的 batch。

这里有一条非常重要的保守规则：

> **无法证明可以并行，就默认串行。**

不是为了追求“Agent 多开”而多开。

并行只是工具。

不是 KPI。

## Worktree 解决写冲突，但解决不了语义竞态

并行施工最自然的基础是 Git Worktree。

```text
base
├── worktree/T38
├── worktree/T39
└── worktree/T40
```

这样多个 Agent 不会同时踩同一个 working directory。

但 Worktree 只能解决物理隔离。

它解决不了：

```text
T38 改了 UserService 的语义
T39 仍然按照旧 UserService 假设施工
```

两个任务各自在自己的 Worktree 中可能：

```text
build ✓
test ✓
```

但合在一起：

```text
炸
```

所以并行流水线必须坚持：

> **施工可以并行，集成必须串行。**

例如：

```text
T38 DONE
T39 DONE
        ↓
先 Review T38
        ↓
集成 T38
        ↓
T39 rebase / replay 到新的 HEAD
        ↓
重新 build / test
        ↓
再 Review T39
```

这样才能处理真正危险的语义竞态。

## Review 不是一句自然语言，而是一个控制信号

Codex Review 可以写得很详细：

```text
观察
推断
判断
问题
建议
```

但调度系统最终不能靠解析长篇自然语言决定下一步。

所以 Review 最后应该落成一个非常小的决定合同：

```json
{
  "task": "T038",
  "reviewedSha": "abc123",
  "decision": "RETURN",
  "findings": [
    {
      "id": "R1",
      "severity": "major",
      "requirement": "修复这里的合同不一致"
    }
  ]
}
```

或者：

```json
{
  "task": "T038",
  "reviewedSha": "abc123",
  "decision": "PASS"
}
```

只有两个核心控制结果：

```text
RETURN
PASS
```

RETURN：

```text
恢复原 Builder session
↓
发送 Review findings
↓
继续整改
↓
再次提交 Review
```

PASS：

```text
停止施工
↓
等待集成
```

Builder 不应该重新解释：

> Codex 到底算不算让我继续？

它只执行决定。

## PASS 必须绑定代码版本

这里有一个很容易被忽略的竞态。

假设 Codex Review 的是：

```text
SHA A
```

然后给出：

```text
PASS
```

结果 Builder 又“顺手优化”了一点：

```text
SHA B
```

如果任务状态还保持 PASS，那么这个 PASS 已经失效。

所以 Review 必须绑定：

```text
reviewedSha
```

集成前检查：

```text
currentSha == reviewedSha
```

如果代码变化：

```text
PASS
↓
STALE
↓
重新 Review
```

换句话说：

> **Review 通过的是一份具体代码，不是一个任务名字。**

## Codex 线程会断，所以它不能成为状态数据库

现实里还有一个很烦的问题：

**Codex 长线程会断流。**

如果整个调度系统依赖：

> Codex 记得我们刚才做到哪了。

那这套流水线是不可信的。

所以必须把两类信息分开。

Codex Thread 保存的是：

```text
项目背景
历史讨论
设计理由
评审尺度
隐性上下文
```

这是“认知资产”。

而机器状态必须另外持久化：

```text
哪个 task 在施工
哪个 worktree
哪个 builder session
哪个 review thread
哪个 SHA
当前状态
哪个 task 已经 PASS
哪个还在 RETURN
```

这是“工程事实”。

可以有一个很薄的 Batch Ledger：

```text
B17

T38
builder: opencode
status: review
worktree: ...
baseSha: ...
currentSha: ...
reviewThread: ...

T39
builder: opencode
status: building
...
```

这样就算：

```text
Codex UI 断掉
网络断掉
客户端重启
```

系统也知道下一步是什么。

Codex Thread 是脑子。

Ledger 是账本。

脑子可以暂时断片。

账不能丢。

## 为什么开始倾向一个全局本地调度服务

一开始曾经想过，能不能直接借 Com Design Prototype 现成的 Vite 服务来承载这套 Workbench。

后来发现一个问题。

真实并行施工很快会出现：

```text
T38
├── Mobile Vite
└── PC Vite

T39
├── Mobile Vite
└── PC Vite
```

甚至更多项目同时工作。

如果每个 Vite 都成为调度器，就会立即出现：

```text
谁才是真相源？
哪个服务先启动？
关掉一个页面是不是任务也没了？
几个 Vite 同时写状态怎么办？
```

所以现在更倾向：

> **全局只有一个本地调度服务。**

例如：

```text
Local Engineering Orchestrator
localhost:47831
```

它管理整台机器上的 AI 工程活动：

```text
Projects
Batches
Tasks
Worktrees
Builder Sessions
Codex Review Threads
Review Queue
Runtime Processes
Preview URLs
```

Vite 只是 Preview。

OpenCode 只是 Builder。

Codex 只是 Reviewer / Planner。

Git 只是事实来源之一。

## 全局调度室大概长这样

```text
Global Local Orchestrator

Projects
├── ComDesign Prototype
│   ├── T038  REVIEWING
│   ├── T039  FIXING
│   └── T040  WAITING
│
├── Mira Mobile
│   └── T009  BUILDING
│
└── Mira Desktop
    └── T034  PASS
```

每个任务点进去，只显示必要的信息：

```text
T038

Builder
OpenCode

Worktree
.../T038

Build
PASS

Test
PASS

Review
Round 2

Codex
connected / interrupted

Preview
Mobile : 5187
PC     : 5188
```

这不是另一个 Jira。

它甚至不应该承担需求管理。

它只是：

> **一个本地 AI 工地调度室。**

## 项目状态和运行状态必须分开

Com Design Prototype 已经有：

```text
TODO
DOING
REVIEW
PASS
BLOCKED
CANCELLED
```

这就是项目真相。

调度器不要再发明第二套业务状态。

它内部可以有运行态：

```text
waiting
building
reviewing
fixing
waiting_integration
interrupted
stale
```

但最终只映射回任务合同：

```text
building / fixing
→ DOING

reviewing
→ REVIEW

review pass + integration accepted
→ PASS
```

运行态可以消失。

项目事实不能消失。

## V1 应该小到什么程度

这次最重要的是不要再次把一个真实痛点写成一个漂亮但没落地的大系统。

第一版只需要：

1. 注册一个本地项目；
2. 读取现有任务卡；
3. Codex 主线程判断哪些任务可以并行；
4. 一个 Skill 把判断转换成 Batch；
5. 自动创建 Worktree；
6. 启动 OpenCode 施工；
7. 收到施工结束；
8. 自动唤醒原 Codex Review Thread；
9. Codex 输出 RETURN / PASS；
10. RETURN 时恢复原 OpenCode Session；
11. PASS 后锁定 reviewed SHA；
12. 串行进入集成；
13. 一个极简本地进度页面。

暂时不做：

```text
自动 merge
自动 production
多人账号
云端调度
复杂权限平台
插件市场
Agent marketplace
全模型 benchmark
自动产品决策
```

先让一件事真正成立：

> **我把几张任务交出去，然后去做别的。回来的时候，它们已经施工、评审、返工，并明确告诉我哪些真的通过了。**

如果这件事成立，OPC 才真正少了一个需要人手维持的环节。

## 真正想减少的，不是代码工作量

这一轮重新思考以后，我越来越觉得，AI Coding 自动化的瓶颈可能并不是：

> 模型还能不能再多写 20% 的代码。

而是：

```text
等待
确认
搬运
切线程
重新解释
记状态
催施工
收结果
再派返工
```

这些不起眼的小动作。

它们每一个都不难。

但一天重复几十次以后，人就变成了整个 AI 团队最忙的调度器。

OPC 如果只是：

> 一个人同时打开十个 AI。

那其实没有真正减少组织成本。

只是把十个人变成了十个窗口。

真正有意思的方向也许是：

> **让 AI Agent 之间开始具备可追踪的交接、独立审查、返工和恢复能力，而人只保留真正需要判断的那几个节点。**

上一轮我们讨论的是：

**Codex、Skill、Worktree 与自动审查应该怎样组成可信流水线。**

这一轮更具体了一点。

我们终于开始看到那个可能真正值得做的东西：

> **一个运行在本机上的 AI 工程调度室。**

它不会替代 Codex。

不会替代 OpenCode。

也不会替代 Git。

它只是让这些已经足够强的工具，终于开始像一个团队那样工作。
