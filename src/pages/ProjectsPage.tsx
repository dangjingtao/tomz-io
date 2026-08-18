import { projects } from "../site";

export function ProjectsPage() {
  return (
    <div className="wrap page-frame">
      <header className="page-header"><span className="eyebrow">PROJECTS</span><h1>项目</h1><p>这里只做索引：它是什么，以及从哪里继续看。</p></header>
      <div className="project-list">{projects.map((project) => { const content = <><span className="project-meta">{project.meta}</span><h3>{project.name}</h3><p>{project.description}</p><span className="project-link">{project.href ? "查看项目 →" : "入口准备中"}</span></>; return project.href ? <a className="project-row" href={project.href} key={project.name} target="_blank" rel="noreferrer">{content}</a> : <div className="project-row" key={project.name}>{content}</div>; })}</div>
    </div>
  );
}
