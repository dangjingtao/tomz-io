import policy from "../site-policy.json";

/**
 * Top-level navigation order. Keys are dynamic page directory names;
 * unlisted directories are appended in their generated order.
 */
export const topNavigationOrder = [
  "blogs",
  "submissions",
  "works",
  "projects",
  "books",
] as const;

export const siteName = policy.siteName;
export const appName = policy.appName;
export const siteUrl = policy.siteUrl;
export const siteDescription = policy.siteDescription;
export const homeIntro = policy.homeIntro;
export const githubProfileUrl = policy.githubProfileUrl;
export const miraAvatarUrl = policy.miraAvatarUrl;
export const authorAvatarUrl = policy.authorAvatarUrl;
export const blogDirectoryByGroup: Record<string, string> = policy.blogDirectoryByGroup;
export const removedRoots: string[] = policy.removedRoots;
export const removedBlogCategories: string[] = policy.removedBlogCategories;
export const seo = {
  enabled: true,
} as const;
