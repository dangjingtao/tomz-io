export const site = {
  url: "https://tomz.io",
  name: "Tomz Dang",
  title: "Tomz Dang",
  description: "Tomz Dang 的个人主站：写作、思考、共同创作与正在进行的项目。",
} as const;

export const navigation = [
  { label: "首页", href: "/" },
  { label: "博客", href: "/blogs" },
  { label: "共用的床", href: "/thoughts" },
  { label: "阅读", href: "/reading" },
  { label: "项目", href: "/projects" },
  { label: "关于", href: "/about" },
] as const;

export const currentThoughts = [
  "把作者主站和产品文档拆开，让每种内容住在真正适合它的地方。",
  "共同写作不是把 Mira 从文字里剥离，而是把作者关系说清楚。",
  "让 AI 提高施工速度之后，人仍然要为判断和后果负责。",
] as const;

export const collaborations = [
  { title: "Mira 来信", description: "Mira 以自己的名字写下的信。", href: "/blogs" },
  { title: "共用的床", description: "还没有定型的想法，在这里继续长。", href: "/thoughts" },
  { title: "一起读", description: "读书、纪录片与那些值得慢慢谈的文本。", href: "/reading" },
] as const;

export type ProjectItem = {
  name: string;
  description: string;
  meta: string;
  href?: string;
};

export const projects: ProjectItem[] = [
  {
    name: "Mira",
    description: "从聊天出发，尝试做一个真正属于用户自己的个人 AI 工作台。",
    meta: "个人项目 · AI",
    href: "https://github.com/dangjingtao/uichat-mira",
  },
  {
    name: "Com Design",
    description: "把设计规则、实现约束和 AI 可读资产放进同一个设计系统里。",
    meta: "设计系统",
    href: "https://github.com/dangjingtao/com-design",
  },
  {
    name: "余光",
    description: "一个仍在继续生长的阅读与叙事实验。",
    meta: "写作 · 视觉叙事",
  },
];
