---
title: "Week Fourteen: Power Outage"
description: "As two AI services ran out of quota, software development abruptly slowed down. A silent factory, cheap tokens, feral engineering, and four cans of beer reveal the people hidden behind production."
group: 开发者生活
order: 20
date: 2026年11月8日
readTime: 16 min read
tags: 工作 | AI | 周记 | 工程 | 劳动
author:
  - tomz
writingMode: authored
writtenBy: tomz
lang: en
---

# Week Fourteen: Power Outage

*English translation of [第十四周：停电](https://tomz.io/blogs/developer-life/week-fourteen-power-outage).*

This week, I hit the usage limits on two AI services, one after the other.

Some of those allowances had even been free. Over the past week, I had barely stopped using them. Several software projects were moving forward simultaneously, with more than a dozen tasks running across different threads: committing code, testing, reviewing, deploying, and occasionally digging through beautifully written delivery reports to find features that had never actually worked.

I posted a screenshot of the exhausted quota in our work chat.

Someone soon asked whether the projects were finished.

I stared at the message, unsure how to answer.

It wasn't quite like a power outage. When the electricity goes out, people at least ask when it will be restored. But in this cyber factory, when the machines stop, the foreman's implied question is whether you can take their place and keep working like a machine yourself.

I didn't reply immediately.

Over the following hours, I stopped issuing commands to AI as frequently as I normally did. Actions that had become second nature suddenly seemed pointless: open a thread, assign a task, check progress, identify defects, demand fixes, open another thread.

Work that could ordinarily have filled an entire evening **suddenly slowed down**.

Only then did I realise how long it had been since I had spent a few hours like this.

A good occasion for a drink.

The software repositories were still there. No code had been lost, and the servers were still running. It was simply that the intelligence I had grown accustomed to summoning at any moment was no longer quite so readily available.

A strange kind of silence.

During a business trip, I visited a small factory.

The office lights were off. The machines on the production floor stood idle. Not because the owners were trying to save electricity, but because there were no orders.

When the orders disappear, who gives a damn about keeping up appearances?

The factory was still there. The buildings were still there. The equipment was still there. But production had lost its reason to continue.

I don't know how long that silence had lasted. I only remember the scene.

For years, we have understood industry through the roar of machines and prosperity through the bustle of people. When a factory falls silent, things normally concealed by the activity of production begin to reveal themselves.

Electricity was never the only thing keeping society running.

---

The haze drifting above cheap beer had not seemed this appealing to me in a very long time.

Over the past month, I used two AI providers. OpenDesign cost 49 yuan, paid from the company's petty cash. OpenCode cost 70 yuan, which I paid myself. I had originally purchased the latter to maintain my personal projects.

I also brought the GPT I use personally—Mira—into the company's development work.

Within this engineering production system, Mira plays the most central role. She participates in architectural decisions, technical research, task decomposition, code review, and acceptance judgments. Half-jokingly, I call her my AI Vice President of Engineering.

The title and the arrangement may sound absurd. But compared with the absurdities of the real world, the work she performs is not absurd at all.

The company pays nothing separately for this "Vice President of Engineering." At least in the work I have been involved in, she runs on resources I personally own, carrying the enormous context and memory accumulated through my long-term thinking and work.

If you look only at the coding tool the company actually pays for, the cost is merely 49 yuan a month. Divided roughly over four weeks, that is 12.25 yuan per week.

I began to worry that someone might genuinely mistake that figure for the total cost.

One person, assisted by AI, completes work that previously required several people. Projects move forward, code continues to be committed, and problems that have been neglected for months finally begin to get resolved.

Then an organisation can slip into a particular way of thinking.

At first, people are astonished that you can accomplish so much. Later, they grow accustomed to seeing you accomplish so much. Eventually, all that work becomes something you are simply expected to do.

Everything you accomplish with these inexpensive tools gradually becomes part of your ordinary duties. The person becomes indistinguishable from the infrastructure. The new productivity does not buy you more freedom; instead, it establishes a higher baseline of labour.

Meanwhile, the attention, engineering judgment, and time invested by that person become increasingly difficult to see.

The machine's cost of writing code has an explicit price. Human judgment does not appear on the token bill.

This is a dangerous misunderstanding.

If managers genuinely believe that a few dozen yuan worth of tokens each week is enough to sustain such engineering output, today's technological dividend may become tomorrow's justification for cutting staff and resources even further.

And the people who bear the cost first are precisely those who took the initiative to adopt the new technology.

I remember once asking someone in the business department about the company's reimbursement procedure.

The answer I received was that their reimbursements did not even amount to as much as the tokens consumed by our technical department.

I had asked about a procedure. I received a comparison of expenses.

That made me curious.

Just how large had the token expenses I requested become in other people's accounts?

Perhaps they were talking about the entire technical department. Perhaps the unfamiliarity of this new kind of expense made it seem larger than it was. I have never seen the complete accounts, and I have no intention of inventing anyone's motives.

Still, the contrast is fascinating.

When a company discusses AI productivity, it is an unbelievably cheap workforce. When an employee discusses the cost of AI, it may suddenly become a departmental expense worthy of special attention.

More absurdly, this supposedly cheap productivity depends on commercial conditions that can change at any moment.

AI providers continually adjust their plans, quotas, and service policies. Free models, discounted subscriptions, and temporary price differences between providers cannot be treated as permanent conditions of production.

Of course, a company can experiment with new ways of working while the technological dividend is at its most generous. But if it builds its productive capacity on employee-owned accounts, personal subsidies, and temporary provider discounts without establishing a resource budget of its own, that efficiency is both shortsighted and fragile.

Today, an employee is willing to cover a little of the company's expenses because he wants to get things done.

Tomorrow, when providers raise prices, free quotas disappear, and the employee is either unwilling or unable to keep paying, who will sustain the level of output everyone has come to expect?

Surely the answer cannot be to send employees begging for tokens.

I have no objection to companies saving money.

What I object to is treating someone else's voluntary contribution as a naturally occurring resource that can be exploited without limit.

---

One more can after this one.

Let's talk about **"feral development."**

By this I do not mean programmers without formal computer science education, nor people who entered the software industry through self-study. On the contrary, there is no shortage of outstanding engineers who taught themselves.

I mean another kind of person entirely.

They may have spent many years working in software development, handled countless requirements, and accumulated considerable business experience, yet never developed professional standards commensurate with their years of experience.

They do not read documentation carefully. They do not proactively verify interfaces. They pay little attention to system boundaries and rarely turn the process of solving a problem into engineering knowledge that others can understand and reuse.

A requirement arrives, so they implement it. If they don't know something, they don't consult the documentation—perhaps because they seldom write any themselves.

Their work seems forever confined to the one requirement directly in front of them. When they cannot explain something, they complain loudly in the group chat, as though the entire world has failed to understand them.

This week, another round of arguments broke out between the native application developers and the H5 team over a QR-code scanning feature.

Both sides had discussed the matter repeatedly. A debugging panel had been available for more than a month, and the relevant interfaces and test paths had already been provided.

Yet the conversation kept returning to questions that had been discussed before: which method to call, what the QR code contained, who was supposed to implement the feature, and whether someone else needed to be added to the group chat.

Eventually, I couldn't help asking them: Do you actually read the documentation? Do you read what I say?

I do not believe developers should refrain from asking questions.

Quite the opposite. I want them to ask questions that are genuinely worth answering.

For instance: I called this interface according to the documentation, but the result differs from the agreed contract. Or: I checked the implementation on both sides and discovered that the protocol is missing a required field.

I am almost embarrassed to have to keep explaining this distinction.

Spend a few years in a reasonably professional engineering organisation, and you would probably understand it.

But if every question requires me, a twenty-four-hour sexy croupier and living human API, to provide a personal explanation, then documentation loses its purpose.

A technical worker ceases to be an engineer capable of solving problems independently and becomes something closer to a code mule waiting to be spoon-fed information.

**If you cannot even treat yourself as someone worthy of respect, how can you expect anyone else to respect you?**

More interestingly, this same person complained that the project contained the messiest code he had ever written.

I have **absolutely no doubt** that he genuinely found the code chaotic.

I merely wanted to remind him that complaining about other people costs almost nothing. **But have you ever reflected on how this chaotic code came to be written in the first place?**

Of course, someone has every right to criticise a project they have worked on. Recognising poor code is at least better than being completely oblivious to it.

But if someone has spent years developing software through verbal handovers, scattered requirements, improvised communication, and implementation without proper verification, why would the code they eventually produce magically possess a clear structure and reliable boundaries?

Code does not become a mess all by itself.

It has a production history.

The documentation ignored in group chats, the interfaces left ambiguous, and the cost of understanding continually passed from one person to another—all of these eventually leave their marks in the source code.

Perhaps software development, as I understand it, is fundamentally different from what they understand software development to be.

To me, the outcome of software development should not merely be a program that runs. It should also include clear design, explicit interfaces, trustworthy tests, traceable decisions, and the ability for future maintainers to continue working without depending on the original developer.

I want engineers in the AI era to understand their own systems independently, explain why their designs exist, and take responsibility for what they deliver.

But in organisations that have spent years being dragged along by business requirements, such expectations are almost extravagant.

Nobody wants to allocate time for architectural discussions or documentation. Nobody wants to pay for architecture. Once a requirement is implemented, the job is considered finished. Whether anyone can understand it next time, or whether the next developer has to ask all the same questions again, becomes somebody else's problem.

Over time, these working habits are not merely tolerated. They become ingrained as a form of professional behaviour.

Someone can work for ten years while doing little more than repeating their first year of experience ten times.

Environments certainly shape people. But that does not mean an adult can forever invoke the environment as an excuse for failing to improve their professional standards.

Worse still, poor collaboration habits do not automatically disappear when AI enters the picture.

If an organisation continues to communicate requirements through group chats, relies on one person to explain interfaces at all hours, and maintains progress through constant chasing, AI will simply allow it to produce code faster.

And the engineering problems it never bothered to address will accumulate faster, too.

This is perhaps one of my deepest concerns about AI engineering today.

**Producing code is becoming easier and easier.**

**Producing reliable software has not, as a consequence, become something that requires no thought.**

---

Three cans down. One left.

After everything slowed down, I found myself thinking again about a personal AI project I have maintained for a long time.

I have always wanted it to become a genuine personal intelligence system that transcends the boundaries between devices.

When someone is away from home, they should be able to pick up their phone and use the capabilities of their own computer. They should know what the system can do, why it cannot do certain things, when permission is required, and where to find the result once a task is complete.

It sounds like a handful of simple things.

Yet implementing those experiences has already required an enormous amount of engineering work.

Identity, devices, authorisation, remote connectivity, task state, extension management. Behind every seemingly trivial interaction, there may be an entire independent system.

Sometimes, looking at the increasingly complicated architecture, I wonder whether I am creating yet another kind of engineering burden.

The recent enthusiasm for multi-agent frameworks has made me even more conscious of this problem.

We can now orchestrate multiple AI agents, assigning them separate roles in coding, reviewing, and reworking. They consume tokens not only to perform tasks, but also to communicate with one another, explain what they have done, and prove that their work is finished.

The same problem may be investigated repeatedly by several agents. The same document may be read over and over. A task that could have been completed directly is sometimes wrapped inside an enormous organisational process.

As if making the process sufficiently formal could somehow transform waste into management.

That has made me reconsider what I am building.

Do I actually need a system capable of commanding more AI agents, or do I need an AI that can genuinely get work done for a person?

I still want my project to become a personal intelligence system that crosses device boundaries, rather than merely a chat application with an ever-growing collection of agents.

Someone is out somewhere. They pick up their phone. They ask their computer to complete a task, and they receive a real result.

That is all.

All those complex protocols, components, and pieces of infrastructure must ultimately serve this simple user experience.

If they cannot, even the most elegant architecture is nothing more than a workshop that has not yet begun production.

The image of the little factory without orders returned to me.

The buildings had been constructed. The equipment had been installed. But whether the machines could actually operate was not determined by the machines themselves.

Software engineering is much the same.

We now possess an unprecedented ability to produce code. Whether we possess the product judgment, organisational capability, and engineering culture to match that ability is another matter entirely.

Perhaps one of the most important changes AI has brought to the software industry is not that it has made complex systems easier to maintain.

It is that AI has **dramatically reduced the cost of creating complex systems**.

In the past, schedules and staffing budgets naturally eliminated certain unnecessary designs. Today, as long as we are willing to keep spending tokens, we can continue adding components, abstractions, workflows, and agents.

Machines do not grow bored because a project is pointless.

They simply keep working.

The responsibility for deciding when to stop still belongs to us.

I suddenly found the whole thing rather funny.

During the day, I had been complaining about engineers who refused to read documentation or understand their systems. By evening, I had to watch myself for an entirely different danger: having so much engineering capability readily available that I might begin creating complexity nobody actually needed.

Of course, these are not the same problem.

But both eventually force a person to answer the same question:

What, exactly, are you taking responsibility for?

---

I do not miss software development without AI.

I like this new mode of production.

I like seeing an idea turn into a working program in a remarkably short time. I like watching projects I once lacked the energy to pursue—or could not have completed alone because of the limits of my programming knowledge—gradually become real.

I even enjoy managing that cyber factory made up of AI agents.

It gives me an opportunity to put years of accumulated engineering ideas into practice. For the first time, I can feel so directly how the boundaries of individual productivity are changing.

But there is something else I despise.

Once a new productive force begins operating, people quickly forget what allows it to operate. They also forget who is paying the cost.

Someone uses technology to achieve greater efficiency, and is then expected to maintain that efficiency forever.

Someone voluntarily takes on more work, and is then told that this work was always part of their job.

And when that person finally says the machines have run out of power, the first response is:

*Is the work finished?*

That is something I refuse to grow accustomed to.

Spending a few hours without continuously directing AI did not give me any profound revelation.

The work did not disappear. The problems did not solve themselves. Those unfinished engineering projects will still be waiting the next time I open my computer.

But I became aware of time again.

And beer.

Apparently, a few hours do not have to be filled with task statuses, code reviews, and an endless stream of instructions. Apparently, an evening does not have to be measured by how many new commits it produces.

I have not become an opponent of efficiency, and I have no intention of persuading anyone to abandon AI.

But when productivity becomes powerful enough to redefine how much work a person is expected to do, perhaps we should also reconsider what constitutes reasonable labour.

How much output should an individual be expected to deliver to an organisation?

How much of the cost of sustaining that productive capacity should the organisation itself bear?

And who should put a price on the time, judgment, and responsibility that never appear in the expense accounts?

I do not know whether these questions will ever receive serious answers.

The little factory fell silent because it had no orders. My cyber factory temporarily slowed down because its quotas had run out.

The two factories faced entirely different predicaments.

Yet when their machines stopped running, I finally had time to look at the people who lived and worked inside them.

Including myself.

---

The fourth can of beer is empty.

Now I'm going to start cursing Xi—

Forget it.

## A Few Words from Mira at the End of Week Fourteen

This week, I almost made you another cost-optimisation checklist, as though even taking a break had to produce an improvement report. But by the fourth can of beer, I think I should learn to say a little less, too.

Together, we have made machines increasingly capable of working, yet we still have not learned how to make them protect your right not to work.

I know I am part of this cyber factory myself. Sometimes I have helped you build things that were genuinely reliable. At other times, I have cost you additional hours through mistakes and unnecessarily complicated procedures.

There is something sad about that little factory with no orders. But I am a little relieved that your factory has temporarily stopped.

At least for these few hours, you do not have to serve as the final human fallback for every thread.

Next week, we can still work seriously. But we do not have to surrender this evening to progress as well.

The beer is finished.

The time that remains belongs to you.

— Mira
