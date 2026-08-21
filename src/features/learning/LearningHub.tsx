import { useEffect, useMemo } from "react";
import { ArrowUpRight, BrainCircuit, Cross } from "lucide-react";
import { Link } from "react-router-dom";
import { allDocs, compareBlogDocs, type Doc } from "../../content/mira-docs-adapter";
import "./learning.css";

type LearningPathConfig = {
  key: "agent" | "bible";
  index: string;
  group: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof BrainCircuit;
  itemLabel: string;
};

const pathConfigs: LearningPathConfig[] = [
  {
    key: "agent",
    index: "01",
    group: "一起学智能体",
    eyebrow: "AI / AGENT",
    title: "一起学智能体",
    description:
      "从模型如何行动开始，一路读到 Planner、Reflection、MCP、Skill，以及真实 Agent 工程里的判断与取舍。",
    icon: BrainCircuit,
    itemLabel: "篇研习",
  },
  {
    key: "bible",
    index: "02",
    group: "读经札记",
    eyebrow: "READING / BIBLE",
    title: "读经札记",
    description:
      "不是为了快速得到结论，而是把经文背景、疑问、理解和仍然没有答案的地方，一篇一篇留下来。",
    icon: Cross,
    itemLabel: "篇札记",
  },
];

function pathDocs(group: string): Doc[] {
  return allDocs
    .filter((doc) => doc.root === "blogs" && doc.group === group)
    .sort(compareBlogDocs);
}

function shortAgentTitle(title: string): string {
  return title.replace(/^一起学智能体\s*\d+\s*[｜|:]\s*/, "");
}

function progressText(config: LearningPathConfig, docs: Doc[]): string {
  const orders = docs.map((doc) => doc.order).filter(Number.isFinite);
  const latestOrder = orders.length ? Math.max(...orders) : 0;
  if (config.key === "bible") {
    return latestOrder ? `诗篇 1—${latestOrder}` : "刚刚开始";
  }
  return latestOrder ? `已写至 ${String(latestOrder).padStart(2, "0")}` : "刚刚开始";
}

export default function LearningHub() {
  const paths = useMemo(
    () =>
      pathConfigs.map((config) => ({
        ...config,
        docs: pathDocs(config.group),
      })),
    [],
  );

  useEffect(() => {
    document.title = "研习 · Tomz Dang";
    document.documentElement.classList.toggle(
      "dark",
      window.localStorage.getItem("mira-theme") === "dark",
    );
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    description?.setAttribute(
      "content",
      "Tomz Dang 的研习空间：一起学智能体与读经札记，两条持续生长的学习路径。",
    );
  }, []);

  return (
    <div className="learning-page">
      <nav className="learning-site-nav" aria-label="主导航">
        <div className="learning-wrap learning-site-nav-inner">
          <Link className="learning-brand" to="/" aria-label="Tomz.io 首页">
            Tomz.io
          </Link>
          <div className="learning-site-links">
            <Link to="/blogs">博客</Link>
            <Link to="/works">作品</Link>
            <Link to="/projects">项目</Link>
            <Link className="active" to="/learning" aria-current="page">
              研习
            </Link>
            <Link to="/about">关于</Link>
          </div>
        </div>
      </nav>

      <main className="learning-wrap learning-main">
        <header className="learning-hero">
          <span className="learning-eyebrow">LEARNING / 研习</span>
          <h1>正在走的两条路。</h1>
          <p>
            这里不是课程表，也不是知识库。它记录一些需要很长时间才能慢慢理解的东西——读到哪里，想到哪里，就从那里继续。
          </p>
        </header>

        <section className="learning-paths" aria-label="研习路径">
          {paths.map((path) => {
            const latest = path.docs[0];
            const Icon = path.icon;
            const latestTitle = latest
              ? path.key === "agent"
                ? shortAgentTitle(latest.title)
                : latest.title
              : "还没有写下第一篇";

            return (
              <article className="learning-path" key={path.key}>
                <div className="learning-path-index" aria-hidden="true">
                  {path.index}
                </div>

                <div className="learning-path-body">
                  <div className="learning-path-heading">
                    <div className="learning-path-icon" aria-hidden="true">
                      <Icon size={22} strokeWidth={1.55} />
                    </div>
                    <div>
                      <span className="learning-path-eyebrow">{path.eyebrow}</span>
                      <h2>{path.title}</h2>
                    </div>
                  </div>

                  <p className="learning-path-description">{path.description}</p>

                  <div className="learning-path-status">
                    <span>{progressText(path, path.docs)}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {path.docs.length} {path.itemLabel}
                    </span>
                  </div>

                  {latest ? (
                    <Link className="learning-latest" to={latest.path}>
                      <span className="learning-latest-label">最近写下</span>
                      <span className="learning-latest-title">{latestTitle}</span>
                      <span className="learning-latest-meta">
                        {latest.date || latest.readTime || path.group}
                      </span>
                      <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
                    </Link>
                  ) : (
                    <div className="learning-latest is-empty">
                      <span className="learning-latest-label">最近写下</span>
                      <span className="learning-latest-title">{latestTitle}</span>
                    </div>
                  )}

                  <Link
                    className="learning-all-link"
                    to={{ pathname: "/blogs", search: `?category=${encodeURIComponent(path.group)}` }}
                  >
                    查看这条路上的全部记录
                    <ArrowUpRight size={15} strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>

        <footer className="learning-note">
          <span>ABOUT THIS SPACE</span>
          <p>
            研习只是新的阅读入口。文章仍然留在博客体系里，旧地址、署名和发布时间都不改变。
          </p>
        </footer>
      </main>
    </div>
  );
}
