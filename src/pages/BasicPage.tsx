import type { ReactNode } from "react";

export function BasicPage({ title, eyebrow, description, children }: { title: string; eyebrow: string; description: string; path: string; children?: ReactNode }) {
  return (
    <div className="wrap page-frame">
      <header className="page-header"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></header>
      {children ?? <div className="empty-state"><strong>入口已经留好。</strong><p>这一部分会在后续任务继续施工，本轮不提前把它做重。</p></div>}
    </div>
  );
}
