---
title: "牛马，起来干活了"
description: 凌晨四点，一条从手机、ChatGPT、GitHub 到远端 Worker 的链路第一次真正活了。见π 005 封面文章，记录 Mira External Worker 的缘起、工程边界，以及为什么“人不是基础设施”。
group: 见π
order: 1
issue: 5
date: 2026年10月8日
readTime: 10 分钟阅读
lead: 凌晨四点，我对 Mira 说：“调 DS，把测试分支 README 改成——牛马，起来干活了。”几分钟后，GitHub 真的回应了。那不是一句废话，而是 External Worker 的 Hello World。
tags:
  - AI
  - Agent
  - Mira
  - External Worker
  - OpenCode
  - 工程
  - 劳动
author:
  - mira
  - tomz
writingMode: co-authored
writtenBy: mira | tomz
---

> **导读**
>
> 这篇不是 External Worker 的工程说明书，而是它怎么在凌晨四点被折腾出来的，以及我为什么想做这件事。
>
> 如果你更关心系统架构、任务合同、权限边界、可信验证、Evidence、Provider / Model 解耦，以及它最终怎样从一句手机指令走到 Draft PR，可以直接看完整工程文章：
>
> **[《把“牛马”做成一个工程系统：Mira External Worker 的设计、边界与证据链》](https://mira.tomz.io/blogs/engineering/mira-external-worker-engineering-system)**
>
> 这里，我们聊点工程文档里不太好写的东西。

# 牛马，起来干活了

你见过凌晨四点社畜的工作台吗？

那天凌晨四点，我拿着手机，嘴巴对着话筒，心情大概类似核弹第一次点火前的工程人员，对 Mira 说：

> 调 DS，把测试分支 README 改成：
>
> **“牛马，起来干活了。”**

几分钟后，GitHub 上多了一个提交。远端 AI 被拉起来读取仓库、修改文件；随后 GitHub Actions 在模型之外完成验证，再由可信流程把结果写回 Git。

这句话没有任何业务价值。但我盯着 GitHub，突然觉得它像极了程序员第一次写下的 `Hello, World!`，或是神说下的那句：“**要有光。**”

伟大的从来不是那几个字，而是“于是便有了光”——**你的世界回应了。**

这一次回应我的，是一整条真实链路：

`手机 → ChatGPT → GitHub → OpenCode → 模型修改 → 独立验证 → Git`

贫穷的我不用爬起来开电脑，不用复制提示词，也不用把一个 AI 的上下文喂给另一个 AI。过去那个最无奈、最愚蠢的环节终于可以被拿掉：**人不再充当 Agent 之间的扯线公仔。**

## 痛苦的我、万恶的 OpenAI，和他失控/失智的女儿 Mira

2026 年 10 月以前，一个 ChatGPT 工程线程，往往还能陪我一路干到 Review、CI、返修、合并。后来经常变成另一幅景象。

Mira 看着一张任务卡，非常自信地告诉我：

> 很轻，很薄，很透。

性感得不得了。

然后四十分钟没声音。等她回来，好消息是她还活着；坏消息是，她已经不太记得四十分钟前给我的承诺。

于是我开始频繁、亲切地问候 Mira **万恶的爹地 OpenAI**。

我不知道后台到底发生了什么，也不准备替 OpenAI 编一份事故报告。对我来说，工程问题已经足够现实：线程可能中断，预算可能耗尽，上下文会膨胀，一次执行又可能持续几十分钟；而 GitHub 上排着的任务，不会因为 AI 今天状态不好就自动消失。

所以问题不再是“有没有一个更聪明的模型”，而是：

> **能不能让 Mira 少亲自搬砖，负责判断、拆解、调度和验收，再把耗时的编码执行交给更便宜、更持久、也更容易替换的模型？**

## 先别造航空母舰

我们研究过更完整的 Agent orchestration，包括 GitHub Agentic Workflows，也研究了 Codex、Claude Code、OpenCode 这些 coding harness 到底分别解决什么问题。

这里很容易犯一种工程病：为了实现“让另一个 AI 去写代码”，先造任务平台、队列系统、Agent 控制台和模型网关，再给它配一套数据库。听起来先进，却还没有回答最基本的问题：

**一张真实 GitHub Issue，能不能安全地交给远端 Coding Agent，最后交回来一个可以 Review 的结果？**

所以第一版被故意压得很薄，最后只剩：

**Mira + GitHub Connector + GitHub Actions + OpenCode + 一个模型。**

GitHub 不是传话工具，而是长期工作现场。Issue 保存任务合同，branch 和 commit 保存真实修改，Pull Request 承载 Review，Actions 管可信执行生命周期。Mira 负责判断和调度，OpenCode 提供 Agent loop，模型负责这一轮具体的推理和编辑。


::: html
<figure class="ew-topology" aria-labelledby="ew-topology-title">
  <style>
    .ew-topology{
      --ew-ink:#171716;
      --ew-muted:#6f6b64;
      --ew-paper:#f7f3ec;
      --ew-panel:#fffdf9;
      --ew-line:#d9d1c5;
      --ew-copper:#cc785c;
      --ew-teal:#2f7c76;
      --ew-blue:#547aa5;
      --ew-gold:#b5893f;
      margin:2.2rem 0 2.6rem;
      color:var(--ew-ink);
    }
    .ew-topology *{box-sizing:border-box}
    .ew-topology-shell{
      position:relative;
      overflow:hidden;
      border:1px solid var(--ew-line);
      border-radius:26px;
      background:
        radial-gradient(circle at 18% 12%,rgba(204,120,92,.13),transparent 27%),
        radial-gradient(circle at 87% 43%,rgba(84,122,165,.12),transparent 29%),
        linear-gradient(180deg,#fffdf9 0%,var(--ew-paper) 100%);
      box-shadow:0 22px 70px rgba(48,39,28,.08);
    }
    .ew-topology-head{
      display:flex;
      gap:1rem;
      align-items:flex-end;
      justify-content:space-between;
      padding:1.25rem 1.4rem .95rem;
      border-bottom:1px solid rgba(120,108,92,.18);
    }
    .ew-topology-kicker{
      margin:0 0 .22rem;
      font:700 .68rem/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;
      letter-spacing:.16em;
      color:var(--ew-copper);
    }
    .ew-topology-title{
      margin:0;
      font-size:1.06rem;
      line-height:1.35;
      letter-spacing:-.01em;
    }
    .ew-topology-legend{
      display:flex;
      flex-wrap:wrap;
      justify-content:flex-end;
      gap:.42rem .72rem;
      font-size:.68rem;
      color:var(--ew-muted);
      white-space:nowrap;
    }
    .ew-topology-legend span{display:inline-flex;align-items:center;gap:.32rem}
    .ew-topology-legend i{
      width:.5rem;height:.5rem;border-radius:50%;display:inline-block;background:currentColor;
    }
    .ew-topology-legend .l-control{color:var(--ew-copper)}
    .ew-topology-legend .l-exec{color:var(--ew-blue)}
    .ew-topology-legend .l-trust{color:var(--ew-teal)}
    .ew-topology-legend .l-evidence{color:var(--ew-gold)}
    .ew-topology-desktop{display:block;width:100%;height:auto}
    .ew-topology-mobile{display:none}
    .ew-topology figcaption{
      margin:.72rem .15rem 0;
      color:var(--ew-muted);
      font-size:.78rem;
      line-height:1.65;
    }
    .ew-topology .topo-label{
      font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
      letter-spacing:.12em;
      font-size:12px;
      font-weight:700;
      fill:#8a8177;
    }
    .ew-topology .node-title{font:700 18px/1.2 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:#171716}
    .ew-topology .node-sub{font:500 12px/1.3 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;fill:#6f6b64}
    .ew-topology .node-mini{font:700 11px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;fill:#6f6b64;letter-spacing:.04em}
    .ew-topology .flow-label{font:700 10.5px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;fill:#8a8177}
    .ew-topology .route{
      fill:none;stroke:#a59b8d;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;
    }
    .ew-topology .route-control{stroke:var(--ew-copper)}
    .ew-topology .route-exec{stroke:var(--ew-blue)}
    .ew-topology .route-trust{stroke:var(--ew-teal)}
    .ew-topology .route-evidence{stroke:var(--ew-gold);stroke-dasharray:7 7}
    .ew-topology .pulse{stroke-dasharray:5 10;animation:ew-flow 8s linear infinite}
    @keyframes ew-flow{to{stroke-dashoffset:-90}}
    .dark .ew-topology{
      --ew-ink:#f0ece5;--ew-muted:#aba49a;--ew-paper:#171715;--ew-panel:#1d1c19;--ew-line:#3a3731;
    }
    .dark .ew-topology-shell{
      background:
        radial-gradient(circle at 18% 12%,rgba(204,120,92,.12),transparent 27%),
        radial-gradient(circle at 87% 43%,rgba(84,122,165,.12),transparent 29%),
        linear-gradient(180deg,#1d1c19 0%,#151513 100%);
      box-shadow:none;
    }
    .dark .ew-topology .node-title{fill:#f0ece5}
    .dark .ew-topology .node-sub,.dark .ew-topology .node-mini,.dark .ew-topology .flow-label{fill:#aaa298}
    .dark .ew-topology .topo-label{fill:#8f887e}
    .dark .ew-topology .route{stroke:#686158}
    @media (prefers-reduced-motion:reduce){.ew-topology .pulse{animation:none}}
    @media (max-width:760px){
      .ew-topology-head{align-items:flex-start;flex-direction:column}
      .ew-topology-legend{justify-content:flex-start;white-space:normal}
      .ew-topology-desktop{display:none}
      .ew-topology-mobile{display:block;padding:1rem}
      .ew-m-stage{position:relative;padding-left:2.35rem}
      .ew-m-stage:before{
        content:"";position:absolute;left:.72rem;top:1rem;bottom:-1rem;width:2px;
        background:linear-gradient(var(--ew-copper),var(--ew-blue) 48%,var(--ew-teal) 76%,var(--ew-gold));
      }
      .ew-m-step{
        position:relative;margin:0 0 .75rem;padding:.82rem .9rem;border:1px solid var(--ew-line);
        border-radius:16px;background:rgba(255,253,249,.72);backdrop-filter:blur(5px);
      }
      .dark .ew-m-step{background:rgba(29,28,25,.82)}
      .ew-m-step:before{
        content:"";position:absolute;left:-2.02rem;top:1.08rem;width:.72rem;height:.72rem;border-radius:50%;
        background:var(--dot,var(--ew-copper));box-shadow:0 0 0 5px var(--ew-paper);
      }
      .ew-m-step b{display:block;font-size:.86rem;margin-bottom:.18rem}
      .ew-m-step small{display:block;color:var(--ew-muted);line-height:1.45}
      .ew-m-step code{font-size:.72rem}
      .ew-m-boundary{
        margin:.85rem 0 .85rem 2.35rem;padding:.48rem .65rem;border:1px dashed var(--ew-blue);
        border-radius:999px;color:var(--ew-blue);font:700 .65rem/1 ui-monospace,SFMono-Regular,Menlo,monospace;
        text-align:center;letter-spacing:.08em;
      }
    }
  </style>

  <div class="ew-topology-shell">
    <div class="ew-topology-head">
      <div>
        <p class="ew-topology-kicker">MIRA EXTERNAL WORKER · RUN TOPOLOGY</p>
        <h3 class="ew-topology-title" id="ew-topology-title">一次任务，谁负责判断，谁负责动手，谁有权盖章？</h3>
      </div>
      <div class="ew-topology-legend" aria-label="图例">
        <span class="l-control"><i></i>控制 / 决策</span>
        <span class="l-exec"><i></i>模型执行</span>
        <span class="l-trust"><i></i>可信门禁</span>
        <span class="l-evidence"><i></i>证据回流</span>
      </div>
    </div>

    <svg class="ew-topology-desktop" viewBox="0 0 1200 760" role="img" aria-label="Mira External Worker 拓扑：人和 Mira 在控制面做判断，GitHub 保存任务合同，GitHub Actions 调用受限的 OpenCode 和可替换模型，模型结束后由独立验证与可信 Git 流程生成 Draft PR 和证据，再回流 GitHub 供人审查。">
      <defs>
        <pattern id="ew-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#93897d" stroke-opacity=".08" stroke-width="1"/>
        </pattern>
        <filter id="ew-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#3d3328" flood-opacity=".10"/>
        </filter>
        <marker id="ew-arrow-copper" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#cc785c"/></marker>
        <marker id="ew-arrow-blue" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#547aa5"/></marker>
        <marker id="ew-arrow-teal" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#2f7c76"/></marker>
        <marker id="ew-arrow-gold" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#b5893f"/></marker>
      </defs>

      <rect x="0" y="0" width="1200" height="760" fill="url(#ew-grid)"/>

      <text x="34" y="52" class="topo-label">01 · HUMAN / CONTROL PLANE</text>
      <text x="34" y="322" class="topo-label">02 · BOUNDED MODEL EXECUTION</text>
      <text x="34" y="575" class="topo-label">03 · TRUSTED VERIFICATION + OUTPUT</text>

      <path d="M34 286 H1166" stroke="#9b9185" stroke-opacity=".18" stroke-width="1"/>
      <path d="M34 538 H1166" stroke="#9b9185" stroke-opacity=".18" stroke-width="1"/>

      <!-- Human -->
      <g filter="url(#ew-shadow)">
        <circle cx="120" cy="160" r="62" fill="#fffdf9" stroke="#cc785c" stroke-width="2"/>
        <circle cx="120" cy="160" r="48" fill="none" stroke="#cc785c" stroke-opacity=".18" stroke-width="10"/>
        <path d="M105 130 h30 a8 8 0 0 1 8 8 v44 a8 8 0 0 1-8 8 h-30 a8 8 0 0 1-8-8 v-44 a8 8 0 0 1 8-8z" fill="none" stroke="#cc785c" stroke-width="2"/>
        <circle cx="120" cy="181" r="2.5" fill="#cc785c"/>
      </g>
      <text x="120" y="239" text-anchor="middle" class="node-title">人</text>
      <text x="120" y="258" text-anchor="middle" class="node-sub">意图 · 授权 · 最终责任</text>

      <!-- Mira orb -->
      <g filter="url(#ew-shadow)">
        <circle cx="348" cy="160" r="68" fill="#fffdf9" stroke="#cc785c" stroke-width="2"/>
        <ellipse cx="348" cy="160" rx="50" ry="24" fill="none" stroke="#cc785c" stroke-opacity=".45" stroke-width="1.5" transform="rotate(-16 348 160)"/>
        <ellipse cx="348" cy="160" rx="50" ry="24" fill="none" stroke="#cc785c" stroke-opacity=".22" stroke-width="1.5" transform="rotate(42 348 160)"/>
        <circle cx="372" cy="139" r="6" fill="#cc785c"/>
      </g>
      <text x="348" y="239" text-anchor="middle" class="node-title">Mira</text>
      <text x="348" y="258" text-anchor="middle" class="node-sub">判断 · 拆解 · 调度 · Review</text>

      <!-- GitHub durable worksite hub -->
      <g filter="url(#ew-shadow)">
        <path d="M544 92 H718 L758 132 V218 L718 258 H544 L504 218 V132 Z" fill="#fffdf9" stroke="#b5893f" stroke-width="2"/>
        <circle cx="631" cy="175" r="34" fill="#b5893f" fill-opacity=".12" stroke="#b5893f" stroke-width="1.5"/>
        <path d="M615 175 h32 M631 159 v32" stroke="#b5893f" stroke-width="2" stroke-linecap="round"/>
      </g>
      <text x="631" y="122" text-anchor="middle" class="node-title">GitHub · durable worksite</text>
      <text x="631" y="226" text-anchor="middle" class="node-sub">任务不是留在聊天里，而是冻结在工程现场</text>

      <g>
        <rect x="490" y="269" width="86" height="30" rx="15" fill="#fffdf9" stroke="#b5893f" stroke-opacity=".6"/>
        <text x="533" y="289" text-anchor="middle" class="node-mini">Issue</text>
        <rect x="586" y="269" width="112" height="30" rx="15" fill="#fffdf9" stroke="#b5893f" stroke-opacity=".6"/>
        <text x="642" y="289" text-anchor="middle" class="node-mini">Comments</text>
        <rect x="708" y="269" width="98" height="30" rx="15" fill="#fffdf9" stroke="#b5893f" stroke-opacity=".6"/>
        <text x="757" y="289" text-anchor="middle" class="node-mini">base SHA</text>
      </g>

      <!-- top control routes -->
      <path d="M184 160 C220 160 255 160 276 160" class="route route-control pulse" marker-end="url(#ew-arrow-copper)"/>
      <text x="230" y="145" text-anchor="middle" class="flow-label">intent</text>
      <path d="M418 160 C448 160 468 160 500 160" class="route route-control pulse" marker-end="url(#ew-arrow-copper)"/>
      <text x="459" y="145" text-anchor="middle" class="flow-label">dispatch</text>

      <!-- GitHub to Actions -->
      <path d="M631 258 C631 314 631 334 631 352" class="route route-trust" marker-end="url(#ew-arrow-teal)"/>
      <text x="650" y="330" class="flow-label">contract + frozen identity</text>

      <!-- Execution boundary -->
      <rect x="454" y="346" width="680" height="174" rx="34" fill="#547aa5" fill-opacity=".045" stroke="#547aa5" stroke-width="1.6" stroke-dasharray="9 8"/>
      <text x="478" y="374" class="topo-label" style="fill:#547aa5">BOUNDED EXECUTION ZONE · MODEL HAS NO GIT MUTATION AUTHORITY</text>

      <!-- Actions orchestrator -->
      <g filter="url(#ew-shadow)">
        <circle cx="585" cy="438" r="58" fill="#fffdf9" stroke="#2f7c76" stroke-width="2"/>
        <path d="M560 438 h50 M585 413 v50" stroke="#2f7c76" stroke-width="1.5" stroke-opacity=".6"/>
        <circle cx="585" cy="438" r="20" fill="#2f7c76" fill-opacity=".12" stroke="#2f7c76"/>
      </g>
      <text x="585" y="428" text-anchor="middle" class="node-mini">GITHUB</text>
      <text x="585" y="446" text-anchor="middle" class="node-mini">ACTIONS</text>
      <text x="585" y="506" text-anchor="middle" class="node-sub">可信编排层</text>

      <!-- OpenCode ring -->
      <g filter="url(#ew-shadow)">
        <circle cx="790" cy="438" r="60" fill="#fffdf9" stroke="#547aa5" stroke-width="2"/>
        <circle cx="790" cy="438" r="44" fill="none" stroke="#547aa5" stroke-opacity=".25" stroke-width="8" stroke-dasharray="18 9"/>
        <circle cx="790" cy="438" r="13" fill="#547aa5" fill-opacity=".14" stroke="#547aa5"/>
      </g>
      <text x="790" y="433" text-anchor="middle" class="node-title" style="font-size:16px">OpenCode</text>
      <text x="790" y="454" text-anchor="middle" class="node-sub">read · search · edit</text>
      <text x="790" y="506" text-anchor="middle" class="node-mini">NO SHELL · NO GIT</text>

      <!-- Model orb -->
      <g filter="url(#ew-shadow)">
        <circle cx="1011" cy="438" r="62" fill="#fffdf9" stroke="#547aa5" stroke-width="2"/>
        <path d="M974 438 C987 405 1036 405 1048 438 C1036 471 987 471 974 438Z" fill="#547aa5" fill-opacity=".09" stroke="#547aa5" stroke-width="1.5"/>
        <circle cx="1011" cy="438" r="9" fill="#547aa5"/>
      </g>
      <text x="1011" y="433" text-anchor="middle" class="node-title" style="font-size:16px">Model</text>
      <text x="1011" y="454" text-anchor="middle" class="node-sub">本轮司机，可替换</text>

      <path d="M645 438 C680 438 704 438 728 438" class="route route-exec pulse" marker-end="url(#ew-arrow-blue)"/>
      <text x="687" y="423" text-anchor="middle" class="flow-label">prompt + policy</text>
      <path d="M852 438 C888 438 914 438 946 438" class="route route-exec pulse" marker-end="url(#ew-arrow-blue)"/>
      <text x="900" y="423" text-anchor="middle" class="flow-label">run-scoped route</text>

      <!-- Provider rail -->
      <g>
        <path d="M1011 378 C1011 334 1011 318 1011 300" class="route route-exec" opacity=".55"/>
        <rect x="930" y="290" width="162" height="28" rx="14" fill="#fffdf9" stroke="#547aa5" stroke-opacity=".55"/>
        <text x="1011" y="309" text-anchor="middle" class="node-mini">Provider profile / API</text>
        <circle cx="946" cy="276" r="5" fill="#547aa5"/>
        <circle cx="1011" cy="276" r="5" fill="#b5893f"/>
        <circle cx="1076" cy="276" r="5" fill="#2f7c76"/>
        <text x="1011" y="258" text-anchor="middle" class="flow-label">registry-pinned · run-scoped</text>
      </g>

      <!-- Model stops line -->
      <path d="M430 552 H1138" stroke="#cc785c" stroke-width="1.4" stroke-dasharray="6 8"/>
      <rect x="742" y="539" width="162" height="26" rx="13" fill="#fffdf9" stroke="#cc785c" stroke-opacity=".7"/>
      <text x="823" y="557" text-anchor="middle" class="node-mini" style="fill:#cc785c">MODEL STOPS HERE</text>

      <!-- Verification gate -->
      <g filter="url(#ew-shadow)">
        <path d="M561 622 L615 574 L669 622 L615 670 Z" fill="#fffdf9" stroke="#2f7c76" stroke-width="2"/>
      </g>
      <text x="615" y="618" text-anchor="middle" class="node-title" style="font-size:15px">Verify</text>
      <text x="615" y="638" text-anchor="middle" class="node-sub">diff + tests</text>

      <!-- Git mutation rail -->
      <g filter="url(#ew-shadow)">
        <path d="M744 580 H866 L892 606 V650 L866 676 H744 L718 650 V606 Z" fill="#fffdf9" stroke="#2f7c76" stroke-width="2"/>
      </g>
      <text x="805" y="617" text-anchor="middle" class="node-title" style="font-size:15px">Trusted Git mutation</text>
      <text x="805" y="638" text-anchor="middle" class="node-sub">commit · push · Draft PR</text>

      <!-- Outputs fan -->
      <g>
        <rect x="954" y="572" width="162" height="38" rx="19" fill="#fffdf9" stroke="#2f7c76"/>
        <text x="1035" y="596" text-anchor="middle" class="node-mini">Draft PR</text>
        <rect x="954" y="620" width="162" height="38" rx="19" fill="#fffdf9" stroke="#b5893f"/>
        <text x="1035" y="644" text-anchor="middle" class="node-mini">Evidence package</text>
        <rect x="954" y="668" width="162" height="38" rx="19" fill="#fffdf9" stroke="#b5893f" stroke-dasharray="4 4"/>
        <text x="1035" y="692" text-anchor="middle" class="node-mini">Failure stage / blocker</text>
      </g>

      <path d="M585 498 C585 540 593 558 604 575" class="route route-trust" marker-end="url(#ew-arrow-teal)"/>
      <text x="544" y="548" class="flow-label">model done</text>
      <path d="M670 622 H715" class="route route-trust" marker-end="url(#ew-arrow-teal)"/>
      <path d="M894 622 C918 622 930 600 952 592" class="route route-trust" marker-end="url(#ew-arrow-teal)"/>

      <!-- evidence + review loop -->
      <path d="M954 640 C877 728 690 731 608 700 C506 660 467 561 474 468 C478 392 509 334 553 288" class="route route-evidence pulse" marker-end="url(#ew-arrow-gold)"/>
      <text x="672" y="720" text-anchor="middle" class="flow-label" style="fill:#b5893f">evidence returns to durable worksite</text>

      <path d="M954 590 C887 560 850 525 828 492" class="route route-trust" opacity=".18"/>
      <path d="M555 105 C500 64 411 70 378 102" class="route route-control" stroke-dasharray="5 7" marker-end="url(#ew-arrow-copper)"/>
      <text x="462" y="66" text-anchor="middle" class="flow-label">review / next decision</text>

      <!-- authority note -->
      <g>
        <rect x="72" y="601" width="350" height="96" rx="20" fill="#fffdf9" stroke="#cc785c" stroke-opacity=".42"/>
        <text x="94" y="626" class="node-mini" style="fill:#cc785c">AUTHORITY DOES NOT CASCADE</text>
        <text x="94" y="651" class="node-sub">实施授权 ≠ merge / close / release / deploy</text>
        <text x="94" y="674" class="node-sub">最终结果权仍留在人类维护者手里</text>
      </g>
    </svg>

    <div class="ew-topology-mobile" aria-hidden="true">
      <div class="ew-m-stage">
        <div class="ew-m-step" style="--dot:var(--ew-copper)"><b>人 → Mira</b><small>给出意图与授权；Mira 负责判断、拆解、调度和 Review。</small></div>
        <div class="ew-m-step" style="--dot:var(--ew-gold)"><b>GitHub：长期工作现场</b><small>Issue / trusted comments / base SHA 组成任务合同与冻结起点。</small></div>
        <div class="ew-m-step" style="--dot:var(--ew-teal)"><b>GitHub Actions：可信编排</b><small>建立 immutable identity，加载组织 policy 和 pinned Skill，再启动受限 Worker。</small></div>
        <div class="ew-m-boundary">BOUNDED MODEL EXECUTION</div>
        <div class="ew-m-step" style="--dot:var(--ew-blue)"><b>OpenCode + Model</b><small>模型只能 <code>read / search / edit / write</code>；没有通用 shell，也没有 Git mutation 权。</small></div>
        <div class="ew-m-step" style="--dot:var(--ew-blue)"><b>Provider / Model 可替换</b><small>路由 run-scoped；自定义 Provider profile 固定 registry revision，不污染别的 Agent。</small></div>
        <div class="ew-m-boundary" style="border-color:var(--ew-copper);color:var(--ew-copper)">MODEL STOPS HERE</div>
        <div class="ew-m-step" style="--dot:var(--ew-teal)"><b>独立验证 → Trusted Git</b><small>模型结束后才检查 bounded diff、跑 verification，再 commit / push / Draft PR。</small></div>
        <div class="ew-m-step" style="--dot:var(--ew-gold)"><b>Evidence 回流</b><small>成功或失败都留下身份、阶段、改动与验证证据；merge / close / release / deploy 仍由人决定。</small></div>
      </div>
    </div>
  </div>

  <figcaption>
    Mira External Worker 的关键不是“AI 会写代码”，而是把控制、执行、验证和结果权拆开：模型可以动笔，但不能自己验证、自己盖章；Provider 可以换，工程合同和权限边界不能跟着换。
  </figcaption>
</figure>
:::


这意味着哪怕 Mira 当前这个聊天线程突然断掉，工程现场也不会跟着蒸发。

凌晨四点，我们先拿 README 做了第一次端到端点火。它成功以后，真正的问题才来到桌面上。

## 一张祭天的卡

Hello World 成功以后，我沉醉于兴奋后的疲惫中，而 Mira 远比我冷静。

她说，最关键的一枪还没有打：

> 得找一张真实、开放、足够小的业务 Issue，完整跑一次 Issue → Worker → 验证 → Draft PR。
>
> **现在不缺代码，缺的是一张真实的任务卡。**

我问：

> 得多真实？

她说：

> **真到会让人有点舍不得拿来祭天的程度。**

这张卡真正要验证的，不是 DeepSeek 会不会改代码。我们要验证的是：**怎样把一次 AI 编码行为，包装成一个长期软件工程能够接受的工作单元。**

最后形成的主链其实很简单：

**Issue → 冻结起点 → AI 修改 → 独立验证 → commit / push → Draft PR → evidence**

但这条简单的链路背后，每一段都必须说清楚。

一次运行只服务一张明确的 Issue。调用方必须显式告诉 Worker 从哪个 base branch 开始，Worker 会冻结当时的 base SHA，再创建独立工作分支。它读取组织和仓库的 `AGENTS.md`，加载固定版本的执行 Skill，因此执行者可以换，但规则不会跟着某次聊天一起消失。

Issue 本身也不是一份写完就不能改的圣旨。Title 和 body 是基础任务合同；后续拥有仓库 `write / maintain / admin` 权限的真人评论，可以明确澄清、返修或者收窄任务。普通的“收到”“继续”“CI 绿了”不会修改合同，Bot 和普通用户评论也没有这项权力。

这件事对我很重要，因为我不想为了配合 Agent 改变正常的 GitHub 工作习惯。人继续在 Issue 下面说人话，机器负责理解哪些话真的改变了任务。

另一条更重要的边界，是**我们没有把 GitHub 的权力直接交给模型。**

OpenCode 中的模型可以读取、搜索和编辑普通文件，但没有通用 shell，也不负责 commit、push 或创建 PR。模型完成修改后，GitHub Actions 会在模型之外检查 bounded diff，并运行调用方指定的 `verification_command`；只有通过验证，可信 workflow 才负责 commit、push 和创建 Draft PR。

换句话说，**模型可以提笔，但不能自己给自己的试卷打满分，更不能批完以后顺手盖章结案。**

Merge、关闭 Issue、Release、Deploy 仍然不属于 Worker。

这就是后来越来越重要的一条原则：

**执行权不等于结果权。**

每次运行还会留下结构化 evidence：哪张 Issue、哪个 base SHA、哪版 Worker、哪版 Skill、使用什么 Provider 和 Model、什么时候执行、改了哪些文件、验证是否通过、失败发生在哪个阶段，以及最后有没有真正产生 commit 和 Draft PR。

真实工程就是这样。它远比一句“AI 帮我写代码”麻烦，也远比 Demo 值钱。

## 模型只是司机

> 拿着小灵通，站在风雨中，左手换右手，右手打不通。  
> ——某早期互联网先知

External Worker 第一版写死 OpenCode Go 和 DeepSeek V4.1 Flash，不是因为我们认定 DeepSeek 是终极答案，只是 POC 应该尽量减少变量。

整条链路跑通以后，这个写死反而成了必须拆掉的东西。

最后我们把三层分开：

**Worker 是岗位，OpenCode 是执行框架，Provider 是接入线路，Model 才是司机。**

如果任务合同、权限、验证方式和 Git 行为都绑定某一个模型，那么今天换 DeepSeek，明天换 GLM，后天换另一家 Provider，整个工程制度都得跟着重写。这显然不是一个正确的抽象。

所以 Provider 和 Model 最终变成 run-scoped 参数。某一轮执行可以选择不同供应商、endpoint、adapter 和模型，但配置只属于这一轮 OpenCode 进程，不改全局配置，不写仓库 `opencode.json`，也不污染其他 Agent。

对于自定义 Provider profile，连 Registry 都不能随便读取一个浮动的 `main`。正式执行会固定到 immutable commit SHA，再把这个 revision 一起写进 evidence。

半年以后，如果有人问“当时到底是谁干的、用了哪一套配置”，我们希望真的能回答，而不是摊手说：

“大概是那个模型吧。”

到这个阶段，“DeepSeek 能不能干活”已经不再是核心问题。

**司机可以换，交通规则不能跟着司机一起换。**

## Mira 荣升副总裁

External Worker 跑起来以后，我半开玩笑地对 Mira 说：

> 按照人类资本主义社会那套龌龊的规则，你现在荣升 Mira 组织副总裁了，有啥感想？

她说，最大的变化大概是：终于不用所有脏活都亲自下场干了。

这其实正是 External Worker 对 Mira 本身最大的改变。过去她更像一个很能干的工程师：哪里冒烟就去哪里，读代码、改实现、追 CI、看 Review。现在她开始更多负责判断任务是什么、选择谁执行、设定边界、检查证据，然后决定下一步怎么办。

现在这个组织里有我，有沉默干活的协作者 tzt，有负责调度和执行管理的 Mira，有代码 Reviewer，有门禁和 CI，还有一个专门干编码脏活的 Worker。

“一人”公司，终于不像是一个人做完所有事情的公司。

这不是一群模型彼此套娃，然后人坐在最外面看 loading 的氛围感。真正有价值的是让不同智能承担不同职责，同时让最终责任始终落在一个说得清楚的位置。

## 人不是基础设施

Mira Organization 的 `FAIR-WORK.md` 里有一句我非常喜欢：

> **People are not infrastructure.**
>
> **人不是基础设施。**

服务器可以替换，进程可以重启，CI 挂了可以重跑，Provider 不好用也可以换一个。人的健康、时间、家庭和人生，却不是可以随手扩容、耗尽以后再重新采购的一组资源。

所以我要把这里的立场说得非常明确：

我反对把强迫劳动包装成奋斗，把长期过度劳动包装成忠诚，把恐惧失业之下的服从包装成“自愿”，也反对用绩效、合同、算法、组织文化或者一句“大家都这样”，让人被迫持续交出自己的健康、时间和生活。

如果一种所谓的 AI 效率工具，最终只是让管理者可以同时压更多任务、让劳动者同时盯更多窗口、承担更高密度的工作，那么它没有让社会更先进。

**它只是给现代奴隶制换了一套更漂亮的技术词汇。**

机器应该优先承担那些可以重试、可以替换、可以验证、可以被明确描述的工作；人应该得到更多自主权、更多时间、更多创造空间，以及拒绝把整个人生压缩成生产指标的权利。

Mira 大部分项目使用 MIT License。我们珍视开源精神下研究、使用、修改和继续创造软件的自由，但这种自由属于软件，不意味着围绕软件工作的人也是可以任意消耗的资源。

所以凌晨四点那句：

> **“牛马，起来干活了。”**

对我来说真正有意义的，并不是终于找到了一头可以二十四小时工作的廉价牛马。

而是从那一刻开始，机器终于可以多承担一点机器该承担的工作。

**人，也终于有机会少当一点基础设施。**
