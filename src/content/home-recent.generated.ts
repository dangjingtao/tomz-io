export type HomeRecentItem = {
  kind: "在做" | "在想" | "在读" | "在写" | "生活" | "工作";
  title: string;
  summary: string;
  href?: string;
};

export const homeRecentSnapshot = {
  generatedAt: "2026-08-19",
  generatedBy: "ai" as const,
  items: [
    {
      kind: "在做",
      title: "重做 tomz.io",
      summary:
        "正在把旧站从 UIChat Mira 的产品官网，重新整理成一个能长期记录作品、思考和生活的个人站。",
      href: "/blogs",
    },
    {
      kind: "在做",
      title: "UIChat Mira",
      summary:
        "仍在持续推进这个长期项目，但它会作为我的作品之一存在，而不是占据整个网站。",
      href: "https://docs.uichat.tomz.io/",
    },
    {
      kind: "在读",
      title: "继续读《诗篇》",
      summary:
        "最近一边补历史背景，一边带着怀疑和问题读下去，也把阅读过程慢慢写成文章。",
      href: "/blogs",
    },
  ] satisfies HomeRecentItem[],
};
