---
title: OPC 探索（五）：给一人公司搭一套 AI 工程系统
description: 从六月底开始的“面向台账编程”实践出发，讨论 GitHub Organization、Agent、测试、CI、Review、权限与状态投影怎样组成一套适合一人公司和极小团队的工程系统。
group: 共同思考
order: 5
date: 2026年9月9日
readTime: 22 分钟阅读
tags: OPC | 一人公司 | AI Coding | Agent | GitHub | 工程管理
author:
  - tomz
  - mira
writingMode: co-authored
writtenBy: tomz | mira
reviewedBy: tomz
---

# OPC 探索（五）：给一人公司搭一套 AI 工程系统

**Tomz × Mira**

六月底，我们已经开始用一种后来被自己叫作“面向台账编程”的方式做 Mira。

不是先开一个聊天窗口告诉 AI“把这个功能做了”，而是先留下任务卡：目标是什么、边界是什么、什么算完成，然后让 Agent 去读代码、施工、测试、交 PR，再由 Review、CI 或人工验收决定它到底有没有完成。到八月底，这套方法已经在 Mira Desktop 和 Mobile 里长出了很具体的形状：Desktop 有总控制台账和一批任务卡，Mobile 有自己的 work ledger、task cards 和验收状态。[Mira 八月工程复盘](https://mira.tomz.io/blogs/engineering/august-development-retrospective)里已经记录过这段演化。

方向一开始没有错。后面发生的事情，不是我们突然发现“台账很好用”，而是台账真的跑起来以后，越来越多原本藏在脑子里的工程问题被迫显形了。

如果一个 Agent 只负责一项任务，台账很好理解；如果 Desktop、Mobile、Docs、Relay、拾言和一堆云端服务都开始有自己的任务、分支、CI、发布方式和密钥，事情就不再只是“记一张卡”那么简单。你会逐渐发现：任务体系不唯一，状态语义不唯一，开发规范不唯一，测试标准不唯一，部署凭据也散在不同仓库。AI 当然可以帮助跨过去，只是每次跨过去之前都得先重新学一遍地方习俗。

这篇是 OPC 探索的第五篇。前三篇分别讨论过[一人公司怎样减少人的持续介入](https://tomz.io/blogs/shared-thinking/one-person-company-not-do-everything)、[Mira Forge 怎样把多个 AI 工具接成工程接力](https://tomz.io/blogs/shared-thinking/mira-forge-local-ai-orchestrator)，以及[宏观 Agent Loop 为什么需要真正的交接和放行边界](https://tomz.io/blogs/shared-thinking/macro-agent-loop-beyond-copy-paste)。第四篇则把视线从生产力拉到市场、平台和分发：[需要氛围感的不只是女人](https://tomz.io/blogs/shared-thinking/opc-atmosphere-not-only-women)。

第五篇重新回到工程，而且这次讨论的不是某个 Agent，而是一件更基础的事情：

> **当一人公司真的开始让 AI 长期参与开发以后，它需要怎样一套工程系统？**

这篇讲为什么这样设计。更具体的协议、状态机、Evidence、权限和事件模型，我另外写在 Mira 官网的工程文章：[《Mira Engineering Control Plane：从 Issue 派工到证据回流》](https://mira.tomz.io/blogs/engineering/mira-engineering-control-plane)。

## 一、所谓“面向台账编程”，本质上是在给 Agent 一个稳定的任务入口

人自己写代码时，Issue 有时候确实显得多余。

今天想到一个 Bug，开个 branch，修完，提交。整个任务一直在脑子里，没有发生明显的信息交接。

Agent 参与以后情况变了。

今天施工的是一个模型，明天 Review 的可能是另一个；同一项任务可能跨两个聊天线程，中间还隔着 CI、真机测试和一次新的 commit。这个时候，聊天上下文不是很可靠的长期载体，人自己的记忆也一样。

所以台账真正提供的不是“项目管理感”，而是一个可重新读取的任务锚点。

理想的链路应该更接近：

```text
Work Item / Issue
      ↓
Agent 或人领取任务
      ↓
Branch / Workspace
      ↓
Pull Request
      ↓
Test / CI / Review
      ↓
Release / Deployment
      ↓
Evidence 回到任务
```

GitHub 目前已经把这条链路做得越来越直接。Issue 页面可以直接创建关联 branch；当这个 branch 建立 Pull Request 后，PR 会自动成为 Issue 的 Development 关联。[GitHub 官方文档](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-a-branch-for-an-issue)对这套关系有明确说明。

更重要的是，GitHub 的 coding agent 已经能够直接从 Issue 接单。官方目前支持把已有 Issue 分配给 Copilot cloud agent 或包括 Codex 在内的第三方 coding agent；Agent 完成修改以后创建 PR，再请求人 Review。[GitHub 对第三方 coding agents 的说明](https://docs.github.com/en/copilot/concepts/agents/about-third-party-coding-agents)已经把“Issue → Agent → PR”变成了正式产品路径。

Linear 甚至把这个过程做得更像一个完整工作台。它可以通过 branch name、PR title 或 commit 把代码活动挂回 Issue，自动推动 Issue 状态；2026 年上线的 Coding Sessions 还允许直接把一个 Issue 委派给 Claude Code 或 Codex，在托管环境里完成施工、生成 diff 和 PR，再进入 Review。[Linear GitHub Integration](https://linear.app/docs/github-integration)和[Coding Sessions](https://linear.app/docs/coding-sessions)都在往同一个方向走。

Jira 的路径更传统，但逻辑没有本质区别：把 Work Item Key 放进 branch、commit message 和 PR title，开发活动就会重新进入 Jira 的 Development 面板。[Atlassian 官方文档](https://support.atlassian.com/jira-software-cloud/docs/reference-issues-in-your-development-work/)就是这么要求的。

所以“面向台账编程”如果换个不那么像会计软件的名字，可以叫：

> **面向 Work Item 编排，面向 Git 施工。**

这里最容易犯的错，是把 Issue 同时当成施工现场。

Agent 定位到哪个函数、哪条命令刚失败、接下来准备试什么，这些属于施工过程。如果每一步都写回台账，很快就会得到一本内容详实、无人愿意阅读的工程日记。真正适合留在 Work Item 里的，是相对稳定的合同：目标、边界、验收、阻塞、最终证据。

GitHub 自己在 Projects Best Practices 里也明确建议保持 single source of truth，避免同一个日期、状态在不同地方重复维护；新的 Organization Issue Fields 更进一步把字段值直接放到 Issue 上，并明确称 Issue Fields 是这些数据的 source of truth。[GitHub Projects Best Practices](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/best-practices-for-projects)与[Organization Issue Fields](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/managing-issue-fields-in-your-organization)都在强调这一点。

我们后来给自己留了一句很简单的规则：

> **台账决定做什么，仓库决定现在是什么，证据决定是否完成。**

台账不能证明代码已经实现；Agent 的汇报也不能证明测试已经通过。事情做没做，最后还是要回来读代码、PR、CI 和真实运行结果。

## 二、台账跑起来以后，最先暴露的是“不唯一”

Mira 早期的仓库都是个人项目自然长出来的。

这很正常。一个项目先解决眼前的问题，另一个项目按照当时的理解再长一套自己的规则。只要作者本人一直在现场，这些差异通常不会立刻造成灾难。

AI 把这个问题放大了。

如果 Desktop 把某个状态叫 PASS，Mobile 叫 Done，另一个项目又通过 README 里一段自然语言表示“基本完成”，人类可能凭长期记忆理解其中差异，Agent 每次进场却都要重新推断。

同样的问题还发生在更多地方：

- 任务卡怎么写；
- 哪个文件才是当前台账；
- branch 从哪里切；
- PR 进哪个目标分支；
- 什么情况必须补测试；
- CI 哪些失败可以忽略，哪些不能；
- Review 是建议，还是门禁；
- 什么状态才允许发布；
- API Key、R2 Key、签名和部署凭据放在哪里；
- 哪些规范是项目自己的，哪些应该跨项目复用。

这其实已经开始接近 Platform Engineering 所讨论的问题，只是规模小得多。Google 对 Internal Developer Platform 的解释很直接：平台通过模板、自动化和 Golden Paths 把重复的复杂度收进去，目标之一就是降低开发者的 cognitive load，并“让正确的方式成为容易的方式”。[Google Cloud 的 Platform Engineering 说明](https://cloud.google.com/discover/what-is-an-internal-developer-platform)把这件事说得很清楚。

一人公司当然没必要成立平台工程部门。

但“小团队不需要统一”也是一种误解。规模小只意味着应该更薄，而不是应该永远靠记忆。

统一带来的收益并不神秘。任务语义统一以后，Agent 跨仓少猜一点；Review 规范共享以后，不需要每个项目重新教育 Reviewer；CI 基础能力共享以后，修一次构建规则，不必去十个仓库抄十遍；凭据进入组织级治理以后，也不用继续依赖“我记得这个 Key 好像藏在那个仓库”。

统一规范最大的好处，大概是以后犯错可以犯得比较一致。

这听起来不太励志，但工程上相当有价值：一致的错误通常可以一次性修，不一致的错误需要逐个考古。

## 三、可惜统一有一个特点：越晚越贵

如果项目还只有三个文件，建立统一规范很容易。

等系统跑起来，迁移就不再像“换个目录”。

Mira Desktop 是一个很好的历史负债样本。我们在 9 月做 Organization 迁移核查时，它已经有接近百条 branch，`dev / test / prod / main` 各自背着历史职责，同时还有多套 Actions、Release、R2 和 Cloudflare 相关配置。仓库自己的 [BRANCHING.md](https://github.com/dangjingtao/uichat-mira/blob/dev/.github/BRANCHING.md)已经说明了这条长期分支流，而[生产发布 workflow](https://github.com/dangjingtao/uichat-mira/blob/dev/.github/workflows/release-production.yml)又把 Release 与 R2 发布绑在一起。

Mobile 更有教育意义，因为它才开发一个多月。迁移盘点时已经有十几条 branch、Android 签名 secrets、GitHub Release、R2 发布，以及代码中写死旧 owner/repository 的 GitHub Release API 地址。比如 [appUpdate.ts](https://github.com/dangjingtao/uichat-mira-mobile/blob/dev/src/update/appUpdate.ts) 就是这种很具体的耦合。

技术债不需要十年。

给它一个月和足够旺盛的开发欲，它自己会长。

GitHub 对 repository transfer 的支持其实已经相当完整。官方说明 Issues、PR、wiki、stars、watchers 会随仓库迁移，webhooks、services、secrets 和 deploy keys 也会继续与仓库关联，原 URL 还会重定向到新位置。[GitHub Repository Transfer](https://docs.github.com/en/enterprise-cloud@latest/repositories/creating-and-managing-repositories/transferring-a-repository)列得很详细。

问题是 GitHub 只能迁自己知道的东西。

它不知道 Cloudflare 某个项目是否通过 Git Integration 绑定旧 repo，不知道应用代码里有没有硬编码旧 GitHub URL，也不知道某个第三方 GitHub App 是否只安装在个人账户。

我们这次就遇到了一个很典型的例子。ChatGPT 可以正常写个人仓库，但对 Organization 仓库一直返回 `Resource not accessible by integration`。最后发现 ChatGPT Codex Connector 只安装在个人账户；个人安装虽然写着 `All repositories`，这里的 All 只包含那个 owner 的所有仓库。给 `uichat-mira` Organization 单独安装以后，写权限立刻恢复。

GitHub 没有撒谎，只是“全部”这个词比人的直觉更尊重作用域。

所以我们的迁移策略最后变得很朴素：

> **一仓一核查。迁移就是迁移。**

不因为要迁 Organization，就顺手清九十九条 branch、重写 CI、改 Cloudflare 架构、换 repo 名字。把五种改变绑在一起，出问题以后就只能用玄学判断是哪一种改变惹的祸。

我们已经把这次组织迁移的计划放进了新的 Organization：[Mira Organization migration plan](https://github.com/uichat-mira/.github/issues/1)。Relay 会先作为小型试点，跑通以后再沉淀迁移 SOP。

## 四、问题很多，于是 Organization 来了

软件工程里有一种稳定的进步方式：现有问题解决不了的时候，先创造一个新的抽象层。

于是 `uichat-mira` Organization 来了。

它当然不会自动消除历史负债。Organization 也不是一个更高级的文件夹。真正值得迁进去的，是**共同治理能力**。

GitHub 目前已经允许 Organization 级 Issue Fields 跨仓使用，Project 可以把不同仓库的 Issue 放进同一视图；Actions 可以共享 reusable workflows；Organization Secrets 可以通过 repository access policy 只暴露给指定仓库；Rulesets 可以跨一组仓库统一 required checks；Environment 可以把生产部署和审批、branch 条件、environment secrets 绑定起来。[GitHub 的 Issue Fields](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/managing-issue-fields-in-your-organization)、[共享 Actions/workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/share-with-your-organization)、[Organization Secrets](https://docs.github.com/en/actions/concepts/security/secrets)、[Organization Rulesets](https://docs.github.com/en/organizations/managing-organization-settings/creating-rulesets-for-repositories-in-your-organization)和[Deployments & Environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)分别覆盖了这些能力。

于是，原来散落在各个 repo 里的东西开始有机会向组织层靠拢：

```text
Organization
├─ Work Item 语义
├─ Project / Ledger / Board
├─ Engineering Rules
├─ Reusable CI
├─ Review Policy
├─ Secret / Credential Policy
├─ Agent Skills / Guidance
└─ Knowledge / SOP
```

这和“大公司管理学”其实有一个共同点：局部自由往往会换来整体协调成本。

每个 repo 单独设计自己的流程，局部当然很舒服；等你需要跨项目调度时，五套局部最优会组成一套很有个性的全局系统。

对个人项目来说，往 Organization 靠拢还有另一个意义：项目开始从“作者本人知道怎么运行”变成“系统自己能够说明怎么运行”。只要所有关键规则还必须从作者脑子里读取，这个项目技术上可能已经上线，组织上仍然处于单机模式。

Organization 不会让一人公司突然拥有组织。

但它至少提供了一个可以把个人习惯逐渐变成组织能力的地方。

## 五、真正值得统一的，不只是任务，而是“怎么证明做对了”

如果最后只统一 Issue 和看板，我觉得这套组织化是不够的。

AI Coding 把代码生产速度提高以后，最需要加强的反而是验证系统。一个极小团队不可能靠增加很多真人互相盯着来建立可靠性，只能把更多约束变成机器和协议。

所以 Organization 后面真正值得统一的是测试、CI、Review 和 Release 的证据链。

### 测试：定义什么叫“真的没坏”

不同项目当然不需要同一套测试。Mobile 有真机和平台差异，Desktop 有 Electron、Windows、Mac 和本地服务，Relay 又是另一套运行环境。

应该共享的是测试语言和最低原则：什么时候需要 regression，什么时候要 smoke，什么情况必须保留人工验收，哪些结果能够算 Evidence。

测试系统的意义不是证明软件永远不会坏。

至少它能避免“应该没问题”成为一种正式验收格式。

### CI：让规则变成不会疲劳的检查

GitHub 的 reusable workflows 本身就是为了减少 workflow 复制，把可重复逻辑集中起来。[GitHub Reusing Workflow Configurations](https://docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations)现在甚至明确区分了适合 reusable workflow 的确定性逻辑和需要 contextual judgment 的 agentic workflow。

对 AI 协作来说，CI 还有一个更重要的作用：它提供了与作者无关的机器证据。

Agent A 写代码，Agent B Review，最后能不能合，不应该看谁总结得更自信。required checks 不认识任何人的文风。

### Review：把施工和判断拆开

GitHub 的 protected branches 可以要求 PR approvals，也可以要求 Code Owners Review；新的 rulesets 则可以把这些约束应用到组织中的一组仓库。[Protected Branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)说明了 approvals 与 Code Owner Review 的门禁关系。

这和我们前面做的 AI Code Review Loop 正好接得上。

施工 Agent 不应该自动成为自己唯一的审查者。即使现实里只有一个人，也可以在系统上把 Coding Agent、Review Agent、确定性 Gate 和最终 merge 分成不同职责。[上一篇 OPC 探索](https://tomz.io/blogs/shared-thinking/macro-agent-loop-beyond-copy-paste)和对应的[Mira 工程实现记录](https://mira.tomz.io/blogs/engineering/opencode-go-pr-review-agent-loop)已经详细讨论过这件事。

### Release：Done 不能只是把卡拖到最右边

GitHub Environments 支持 required reviewers、等待时间、branch restrictions 和 environment secrets。也就是说，“代码通过 Review”和“代码现在可以进入 production”可以是两层不同的 gate。[GitHub Deployments and Environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)提供了这一层机制。

这对一人公司反而很重要。

因为人少以后，最危险的捷径不是沟通慢，而是“反正都是我，直接发吧”。

系统的价值之一，就是在这种时候表现得不太通人情。

## 六、共享 Key 的正确方向，是共享治理，而不是共享万能钥匙

Organization 还有一个很现实的诱惑：终于可以把 API Key、部署凭据、R2 Key 等集中起来。

这个方向是对的，但需要把措辞改一下。

应该共享的是**凭据治理**，不是让所有 repo 共用一串万能 Key。

GitHub Organization Secrets 可以限制为 all、private 或 selected repositories；Environment Secrets 还能在 protection rules 通过以后才交给 job。[GitHub Secrets](https://docs.github.com/en/actions/concepts/security/secrets)已经提供了比较完整的作用域控制。

进一步，如果云平台支持 OIDC，GitHub 推荐让 Actions 用 federated identity 换短期 token，而不是长期保存 cloud credentials。[GitHub OIDC 文档](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-cloud-providers)明确把“不保存长期凭据”作为主要收益。

至于 deploy key，更不能简单理解为“组织以后大家共享一个”。GitHub 官方明确说明 deploy key 只访问单一 repository，也不能在多个 repo 之间重复使用；对于复杂的跨仓访问，官方还建议考虑 GitHub App。[Managing Deploy Keys](https://docs.github.com/en/enterprise-cloud@latest/authentication/connecting-to-github-with-ssh/managing-deploy-keys)把这个边界写得很明确。

所以组织化之后更合理的目标不是：

```text
所有项目
   ↓
一个超级 Key
```

而是：

```text
Organization identity
       ↓
Policy / Scope
       ↓
Repo / Environment / Agent
       ↓
最小必要凭据
```

Agent 越能干，这个边界越值得认真做。

## 七、市面上的工具，其实代表几种不同的组织范式

做到这里，再讨论“要不要上 Linear”“是不是应该用 Jira”，问题就清楚很多了。

我们真正选择的不是一个更漂亮的看板，而是**控制平面放在哪里**。

| 范式 | 典型工具 | 核心思路 | 对 Mira 当前阶段 |
| --- | --- | --- | --- |
| Git-native | GitHub Issues + Projects + Actions | Work Item、代码、PR、CI、Release 尽量靠近 | 高 |
| Work-management-first | Linear + GitHub | Linear 管任务与体验，GitHub 管代码，通过集成同步 | 中高 |
| Enterprise workflow | Jira + GitHub / Bitbucket | Jira Work Item 做主系统，开发活动回挂工单 | 中低 |
| All-in-one DevOps | GitLab | Issue、MR、CI/CD 尽可能平台内闭环 | 低，迁移成本高 |
| Document-first | Notion + GitHub | 知识和文档先行，再连接工程状态 | 适合知识，不适合当前工程 SSOT |
| Agent / Chat-first | Coding Agent、Slack、企微 | 自然语言成为工作入口 | 很适合入口，不适合单独做真相源 |
| Platform Engineering | IDP / Golden Paths | 把重复基础设施做成统一自服务能力 | 思想高度匹配，实现必须很薄 |

Linear 的开发体验确实比 GitHub Projects 更完整。GitHub Integration 能让 branch 和 PR 自动驱动 Issue 状态，Coding Sessions 甚至可以直接把 Issue 委派给 Codex 或 Claude Code。[Linear 官方文档](https://linear.app/docs/coding-sessions)已经把这条链做得非常顺。

Jira 的优势则是成熟的 Work Item 控制面和跨开发工具关联；GitLab 更接近一个完整 DevOps 平台。

我们现在选择 GitHub-native，不是因为 GitHub Projects 天下第一。

恰恰是因为 Mira 当前的代码、PR、CI、Release、GitHub Apps 和越来越多的 Agent 活动已经在 GitHub。再引入一个新的主控制平面，会立刻出现“哪边才是真的”的同步问题。

GitHub 官方自己在 Projects Best Practices 里强调 single source of truth，这个原则对一个资源很少的小团队比“功能齐全”更重要。[GitHub Projects Best Practices](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/best-practices-for-projects)

所以我们的判断不是：

> GitHub 是最好的项目管理系统。

而是：

> **当前阶段，把控制平面放在离工程事实最近的地方，协调成本最低。**

## 八、控制平面不等于所有人都必须活在 GitHub 页面里

这又引出了最后一层。

GitHub 可以保存工程事实，不代表它一定是所有场景下最好的阅读界面。

手机上，我更想看到的可能只有：

```text
Now
Next
Attention
```

企业微信里，我真正需要的是：

- 哪个 CI 挂了；
- 哪个任务进入 Verification；
- 哪个工作 Blocked；
- 哪个版本刚刚发布；
- 有什么需要人工处理。

官网上的访问者更不需要知道内部每一条 branch。他们更适合看到最近在做什么、哪些能力正在推进、什么已经发布，以及接下来的一小段开发日历。

因此我们开始把系统最后一层理解成 **Projection / Publishing Layer**：

```text
                   GitHub
             Engineering Truth
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       Project   Mobile UI   Mira 官网
                    │
                    ▼
                 企业微信
```

这里最重要的不是做更多 Dashboard，而是坚持：这些都只是 Read Model。

不重新维护第二套任务数据库。

GitHub 的 audit log 用来追溯“谁在什么时候做了什么”，而如果需要实时知道某个事件发生，GitHub 官方明确建议考虑 Webhooks，而不是不断轮询 audit log 或 API。[GitHub Audit Log Events](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/audit-log-events-for-your-organization)也直接提到了这一点。

于是理想状态不应该是：

```text
PR merge
→ 人去改 Issue
→ 再改 Project
→ 再改官网
→ 再发企微
```

而应该逐渐变成：

```text
Engineering Event
      ↓
State / Evidence
      ↓
Project / Website / WeCom 自动投影
```

人负责决策。

机器负责搬事实。

## 九、一人公司真正开始需要的，不是更多 AI 员工，而是工程组织

OPC 探索第一篇的时候，我们已经提出过一个方向：一人公司不应该追求“一个人亲自完成一家公司的所有过程”，而应该让更多过程在不需要这个人持续介入的情况下自行运转。

两个多月以后，这个判断没有变。

只是我们现在看见了下一层。

一旦执行真的被交给 Agent，人的工作不会自动消失，而是逐渐从“怎么写”变成：

- 现在应该改变什么；
- 应该把任务交给谁；
- Agent 可以拥有多大权限；
- 什么证据足以进入下一阶段；
- 什么异常需要把人叫回来；
- 哪些经验已经重复到应该变成规则、SOP 或 Skill。

这时候，一人公司开始呈现出一种很有意思的结构：

```text
Human
  ↓ 决策
Engineering Control Plane
  ↓ 派工
Human / Coding Agent / Review Agent
  ↓
Git / PR / Test / CI
  ↓
Release
  ↓
Evidence
  ↓
Control Plane
  ↓
内部与外部投影
```

知识也可以沿着同一条路生长：

```text
真实问题
→ 一次解决
→ 重复模式
→ Engineering Rule
→ SOP
→ Skill / Automation
```

这比第一天就写四十页“一人公司工程管理规范”现实得多。

因为小团队真正宝贵的不是流程完整，而是**协调成本足够低，同时重要事实不会消失**。

Mira 的 Organization 现在才刚刚建立，仓库甚至还没有全部迁进去。这个设计很可能继续变化。

但从六月底的任务台账走到今天，我觉得有一件事情已经比较清楚了：

> **台账只是入口。真正需要建设的是台账背后的工程系统。**

GitHub 目前恰好可以承担这个控制平面：Issue 留下工作意图，Git 留下修改，PR 留下交付，测试和 CI 留下机器证据，Review 留下判断，Release 留下真正发生过的版本，Organization 再把这些东西逐渐收进同一个治理边界。

然后同一份事实，可以被 Agent、开发者、企业微信和官网分别看懂。

不用维护四份世界观。

这大概比“一个人拥有十个 AI 员工”少了一点氛围感。

但如果真准备把一人公司做下去，我更愿意先把这个系统搭稳。
