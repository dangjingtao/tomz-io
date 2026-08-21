/**
 * Top-level navigation order. Keys are dynamic page directory names;
 * unlisted directories are appended in their generated order.
 */
export const topNavigationOrder = [
  "blogs",
  "works",
  "projects",
  "books",
] as const;

export const logoUrl = "https://assets.tomz.io/images/mira-logo.png";
export const siteUrl = "https://tomz.io";
export const seo = {
  enabled: true,
} as const;

export const directoryLabels: Record<string, string> = {
  视觉: "视觉",
};
