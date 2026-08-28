---
title: OPC 探索（二）：Mira Forge，一间本地 AI 工程调度室
description: 从长期评审上下文、OpenCode 施工、worktree 并行、确定性门禁与断流恢复出发，设计一套让多个 AI 工具真正接力而不是靠人搬运的本地工程调度方案。
group: 共同思考
order: 2
date: 2026年8月28日
readTime: 16 分钟阅读
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
- 刚才那个长期评审线程是不是又断了。

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
长期评审 / 规划线程
    ↓
理解需求
拆任务
讨论方案
判断风险
    ↓
Builder Agent
    ↓
施工
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

长期评审上下文有它的价值。

但这并不意味着 Reviewer 应该顺便成为状态数据库、权限中心和最终放行者。

理解项目是一种能力。

决定流程能不能继续，是另一种权力。

后面会反复回到这个区别。

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

## Builder 可以换，Reviewer 也只是一个角色

第一版可以先有一个相对稳定的 Reviewer，例如长期 Codex 线程；Builder 则可以替换：

```text
OpenCode
Trae
Claude Code
Codex
未来其他 Agent
```

调度系统并不需要理解每一种工具所有细节。

它只需要很薄的 Adapter：

```text
startTask()
resumeTask()
sendFeedback()
getStatus()
stopTask()
```

这样我们验证的是调度模型，而不是同时兼容全世界。

同样重要的是，Reviewer 也应该被当成一个受约束角色，而不是“因为它懂项目，所以什么都让它做”。

Reviewer 的职责应该集中在：

```text
读取任务合同
读取当前版本
理解改动
寻找高置信度问题
表达不确定性
输出结构化 verdict / findings
```

它不应该偷偷修改施工结果，也不应该因为一句“看起来可以”就直接拥有所有后续写权限。

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

在真实项目里，任务卡往往已经包含：

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

## “哪些任务可以并行”应该继续由懂项目的角色判断

我经常会先问评审线程：

> 这几张任务卡哪些可以并行？

这件事不能简单看两个任务有没有改同一个文件。

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

所以并行判断应该由拥有足够项目上下文的角色完成，然后由 Skill 或调度器把判断转换成机器可执行的 batch。

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

## Review 是判断，Gate 才是控制信号

早期设计里，我很自然地让 Reviewer 最终输出：

```text
RETURN
PASS
```

这样调度器很好写：RETURN 就返工，PASS 就进入集成。

但继续把 GitHub Review 跑进真实项目以后，我越来越觉得这里混了两件事。

Reviewer 真正擅长的是判断：

```json
{
  "task": "T038",
  "reviewedSha": "abc123",
  "verdict": "CHANGES_NEEDED",
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
  "verdict": "NO_BLOCKING_FINDINGS"
}
```

这仍然是一个有不确定性的专业判断。

而流程是否真正进入 `RETURN` 或 `PASS`，最好再经过一个**确定性 Gatekeeper**：

```text
Reviewer verdict
        ↓
Gatekeeper
+ 当前版本
+ 必要检查
+ 任务合同
+ 人工介入标记
        ↓
RETURN / PASS
```

Gatekeeper 不需要模型。

它不重新读代码，也不重新解释 Reviewer 的长篇自然语言。

它只验证已经约定好的硬条件。

这条分工很重要：

> **Reviewer 负责“怎么看”，Gatekeeper 负责“规则是否允许继续”。**

这样 Reviewer 即使很聪明，也不会因为一句结论就直接拥有改任务状态、正式 Approve、合并代码等全部权力。

同时，人也不用永远重复点击那些规则已经完全确定的“通过”。

## PASS 必须绑定被审查的版本

Gatekeeper 的第一条硬规则应该非常朴素：

```text
currentSha == reviewedSha
```

假设 Reviewer 看的是：

```text
SHA A
```

并给出：

```text
NO_BLOCKING_FINDINGS
```

结果 Builder 又“顺手优化”了一点：

```text
SHA B
```

那么上一轮 Review 已经失效。

无论模型当时说得多有把握，Gatekeeper 都不能继续沿用那次结论。

应该变成：

```text
reviewed
↓
代码变化
↓
stale
↓
重新 Review
```

换句话说：

> **Review 通过的是一份具体代码，不是一个任务名字。**

而真正的 `PASS`，也必须是“某个确定版本满足了一组确定规则”的结果。

## Reviewer 和 Gatekeeper 不应该共享同一种权力

这件事继续往下推，会得到一个更一般的原则。

一个角色是否“聪明”，和它是否应该拥有写权限，是两回事。

可以让 Reviewer 深入理解：

```text
需求
代码
架构合同
风险
平台差异
验证缺口
```

但它依然可以保持只读。

真正写状态、正式 Approve、打标签或者推进流程的能力，可以交给一个更小、更容易审计的确定性组件。

这样做并不是不信任 AI。

而是在认真设计组织里的职责分离。

现实里也不会因为一个审计人员判断“没有发现问题”，就顺便把审批制度、账本和付款权限全部交给同一个人。

Agent 系统也不该因为模型会说话，就把所有权力塞进同一个 prompt。

## 线程会断，所以它不能成为状态数据库

现实里还有一个很烦的问题：

**长期 AI 线程会断流。**

如果整个调度系统依赖：

> Reviewer 记得我们刚才做到哪了。

那这套流水线是不可信的。

所以必须把两类信息分开。

长期线程保存的是：

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
哪一次 verdict 对应哪一个 SHA
Gate 是否已经放行
哪个 task 仍在返工
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
reviewedSha: ...
gate: pending

T39
builder: opencode
status: building
...
```

这样就算：

```text
AI UI 断掉
网络断掉
客户端重启
```

系统也知道下一步是什么。

线程是脑子。

Ledger 是账本。

脑子可以暂时断片。

账不能丢。

## 为什么开始倾向一个全局本地调度服务

一开始曾经想过，能不能直接借某个项目现成的 Vite 服务来承载这套 Workbench。

后来发现一个问题。

真实并行施工很快会出现：

```text
T38
├── Mobile Preview
└── PC Preview

T39
├── Mobile Preview
└── PC Preview
```

甚至更多项目同时工作。

如果每个 Preview 服务都成为调度器，就会立即出现：

```text
谁才是真相源？
哪个服务先启动？
关掉一个页面是不是任务也没了？
几个服务同时写状态怎么办？
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
Review Threads
Review Queue
Gate State
Runtime Processes
Preview URLs
```

Preview 只是 Preview。

OpenCode 只是 Builder。

Codex 或其他模型只是 Reviewer / Planner。

Git 是重要事实来源。

Gatekeeper 是流程规则执行器。

谁都不应该假装自己就是整个系统。

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

Reviewer
NO_BLOCKING_FINDINGS

Gate
PENDING / PASS / BLOCKED

Preview
Mobile : 5187
PC     : 5188
```

这不是另一个 Jira。

它甚至不应该承担需求管理。

它只是：

> **一个本地 AI 工地调度室。**

## 项目状态和运行状态必须分开

项目本身可能已经有：

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
gate_pending
waiting_integration
interrupted
stale
```

但最终只映射回任务合同：

```text
building / fixing
→ DOING

reviewing / gate_pending
→ REVIEW

Gate PASS + integration accepted
→ PASS
```

运行态可以消失。

项目事实不能消失。

## V1 应该小到什么程度

这次最重要的是不要再次把一个真实痛点写成一个漂亮但没落地的大系统。

第一版只需要：

1. 注册一个本地项目；
2. 读取现有任务卡；
3. 评审 / 规划角色判断哪些任务可以并行；
4. 一个 Skill 把判断转换成 Batch；
5. 自动创建 Worktree；
6. 启动一个 Builder 施工；
7. 收到施工结束；
8. 自动触发对应 Reviewer；
9. Reviewer 输出 findings / verdict，并绑定 reviewed SHA；
10. 确定性 Gatekeeper 校验版本、必要检查和任务合同；
11. Gate RETURN 时恢复原 Builder Session；
12. Gate PASS 时锁定 reviewed SHA，并进入等待集成；
13. 串行进入集成；
14. 一个极简本地进度页面。

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

> **我把几张任务交出去，然后去做别的。回来的时候，它们已经施工、评审、返工，并明确告诉我哪些版本真的满足了放行规则。**

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
重复确认已经满足的门禁
```

这些不起眼的小动作。

它们每一个都不难。

但一天重复几十次以后，人就变成了整个 AI 团队最忙的调度器。

OPC 如果只是：

> 一个人同时打开十个 AI。

那其实没有真正减少组织成本。

只是把十个人变成了十个窗口。

真正有意思的方向也许是：

> **让 AI Agent 之间开始具备可追踪的交接、独立审查、确定性放行、返工和恢复能力，而人只保留真正需要判断的那几个节点。**

它不会替代 Codex。

不会替代 OpenCode。

也不会替代 Git。

它只是让这些已经足够强的工具，终于开始像一个团队那样工作。
