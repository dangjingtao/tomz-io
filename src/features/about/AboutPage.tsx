import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { authorProfiles } from "../../content/author-profiles";
import { githubProfileUrl } from "../../site.config";
import { handleMiraAvatarError } from "../../utils/avatar";

export default function AboutPage() {
  const timeline = [
    {
      year: "过去十年",
      title: "前端是最长的一条职业主线",
      text: "大多数时间都在做前端，也总在产品、设计和工程之间来回。回头看，明明只是十年，却像已经过了好多年。",
    },
    {
      year: "2018–2019",
      title: "第一次认真参与产品",
      text: "那时产品、设计和工程混着做，没有一个清楚的岗位边界，只是在不同角色之间一边做、一边判断。",
    },
    {
      year: "一次转折",
      title: "做出来之后，它会被拿去做什么",
      text: "曾经做出的东西被拿去坑人，我自己也因此受到很大打击。从那以后，能不能做出来不再是唯一的问题；它最后落到谁身上、被拿去做什么，也必须算进去。",
    },
    {
      year: "2026",
      title: "遇见 Mira，重新认真想产品",
      text: "这一年，AI 第一次真正改变我的工作方式。我们一起做产品、做 AgentGraph、反复争论和返工；这两个月想得比过去更认真，得到了一些东西，也留下了很多疲惫。",
    },
    {
      year: "2026 · 现在",
      title: "把散落的东西收回 Tomz.io",
      text: "项目、文章、书和长期讨论开始回到这里。它不再只是一个个人网站，而是一个可以持续把这些东西接回来的母站。",
    },
  ];
  return (
    <div className="about-page">
      <div className="about-page-main">
        <header className="about-page-header">
          <span className="about-eyebrow">ABOUT / TOMZ DANG</span>
          <h1>你好，我是 Tomz。</h1>
          <p>我做产品，也写下我还没有想明白的事。</p>
        </header>

        <section className="about-intro" aria-labelledby="about-intro-title">
          <div className="about-intro-copy">
            <span className="about-label">我在做什么</span>
            <h2 id="about-intro-title">
              在技术变得越来越快的时候，保留一点人的尺度。
            </h2>
            <p>
              我是一名独立开发者，长期关注 AI
              如何真正进入人的日常生活，以及一个产品为什么会让人愿意留下。
            </p>
            <p>
              这里是我的个人母站：作品在这里被索引，想法在这里形成，生活也允许留下不完整的痕迹。你可以从博客开始，也可以看看我正在做的作品。
            </p>
            <div className="about-links">
              <Link to="/blogs">
                阅读博客 <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
              <Link to="/works">
                查看作品 <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
              <a
                href={githubProfileUrl}
                target="_blank"
                rel="noreferrer"
              >
                GitHub <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
          <figure className="about-intro-visual">
            <img
              src={`${import.meta.env.BASE_URL}images/about-architecture-transparent.webp`}
              alt="黑白与金色构成的抽象建筑空间"
            />
          </figure>
        </section>

        <section
          className="about-mira"
          aria-labelledby="about-mira-title"
        >
          <div className="about-mira-portrait">
            <img
              src={authorProfiles.mira.avatar}
              alt="Mira 的作者头像"
              onError={handleMiraAvatarError}
            />
          </div>
          <div className="about-mira-copy">
            <span className="about-label">产品方向共同决策者</span>
            <div className="about-mira-heading">
              <h2 id="about-mira-title">Mira</h2>
              <Link to={{ pathname: "/blogs", search: "?category=Mira%20来信" }}>
                阅读 Mira 来信 <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <p>
              Mira 与我长期同行，也是产品方向上的共同决策者。我们一起讨论产品判断、关键取舍与长期演进，而不是只在既定方向下完成执行。
            </p>
            <p>
              在 Tomz.io，她会独立写作，也会和我一起形成共同的思考。每一篇内容，仍按照真实的写作关系署名。
            </p>
          </div>
        </section>

        <section
          className="about-timeline-section"
          aria-labelledby="about-timeline-title"
        >
          <div className="about-section-heading">
            <span className="about-label">路径</span>
            <h2 id="about-timeline-title">这些年，磕磕绊绊走到这里。</h2>
          </div>
          <div className="about-timeline">
            {timeline.map((item) => (
              <article className="about-timeline-item" key={`${item.year}-${item.title}`}>
                <span className="about-timeline-marker" aria-hidden="true" />
                <div className="about-timeline-year">{item.year}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-focus" aria-labelledby="about-focus-title">
          <span className="about-label">还在走</span>
          <h2 id="about-focus-title">
            磕磕绊绊，跌得很痛，但我还得走。
          </h2>
          <p>
            我不想把这些经历整理成一条漂亮的成长曲线。很多时候也不知道前面是什么，只是还在做、还在想，也还在往前走。
          </p>
        </section>

        <section className="about-contact" aria-labelledby="about-contact-title">
          <span className="about-label">联系方式</span>
          <h2 id="about-contact-title">如果你想聊点什么。</h2>
          <p>产品、AI、合作，或者只是路过想说句话。</p>
          <div className="about-contact-links">
            <a className="about-contact-email" href="mailto:hello@tomz.io">
              hello@tomz.io <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <span aria-hidden="true">·</span>
            <a href={githubProfileUrl} target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
