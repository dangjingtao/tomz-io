import { ArrowRight, Brain, Cross, BookOpen } from "lucide-react";
import "./learning.css";

const paths = [
  {
    title: "一起学智能体",
    label: "AI / AGENT",
    progress: "第 08 节",
    description:
      "以课程路径理解 Agent、Tool Calling、MCP，并记录 Mira 实践过程。",
    chapters: ["Agent 基础", "工具调用", "MCP 架构"],
    icon: Brain,
  },
  {
    title: "读经",
    label: "READING / BIBLE",
    progress: "诗篇 04",
    description:
      "以阅读笔记形式记录经文背景、理解过程与个人思考。",
    chapters: ["诗篇", "背景", "研读笔记"],
    icon: Cross,
  },
];

export default function LearningHub() {
  return (
    <main className="learning-hub">
      <header className="learning-header">
        <span>LEARNING SPACE</span>
        <h1>研习</h1>
        <p>
          不是文档目录，而是持续学习、实践和沉淀的路径。
        </p>
      </header>

      <section className="learning-grid">
        {paths.map((item) => {
          const Icon = item.icon;
          return (
            <article className="learning-card" key={item.title}>
              <div className="learning-card-icon">
                <Icon size={30} />
              </div>
              <small>{item.label}</small>
              <h2>{item.title}</h2>
              <p>{item.description}</p>

              <div className="learning-progress">
                {item.progress}
              </div>

              <ul>
                {item.chapters.map((chapter) => (
                  <li key={chapter}>{chapter}</li>
                ))}
              </ul>

              <button type="button">
                进入研习 <ArrowRight size={16} />
              </button>
              <BookOpen className="learning-book" size={18} />
            </article>
          );
        })}
      </section>
    </main>
  );
}
