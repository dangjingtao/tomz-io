import { BookOpen, Brain, Cross } from "lucide-react";
import "./learning.css";

const shelves = [
  {
    title: "一起学智能体",
    tag: "AI / AGENT",
    progress: "08 / 30",
    description: "从 Agent 基础、工具调用到 MCP 与实践记录。",
    icon: Brain,
  },
  {
    title: "读经",
    tag: "READING / BIBLE",
    progress: "诗篇 04",
    description: "经文阅读、背景理解与个人研读笔记。",
    icon: Cross,
  },
];

export default function LearningHub() {
  return (
    <section className="learning-hub">
      <header>
        <span>LEARNING SPACE</span>
        <h1>研习</h1>
        <p>不是文档目录，而是持续成长的学习路径。</p>
      </header>
      <div className="learning-grid">
        {shelves.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="learning-card">
              <Icon size={28} />
              <small>{item.tag}</small>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <div>{item.progress}</div>
              <BookOpen size={16} />
            </article>
          );
        })}
      </div>
    </section>
  );
}
