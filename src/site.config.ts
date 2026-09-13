import policy from "../site-policy.json";

/**
 * Public top-level navigation. Runtime and static renderers must consume this
 * list instead of maintaining their own copies.
 */
export const siteNavigation = [
  { key: "blogs", label: "博客", path: "/blogs" },
  { key: "weekly", label: "见π", path: "/weekly" },
  { key: "works", label: "作品", path: "/works" },
  { key: "projects", label: "项目", path: "/projects" },
  { key: "books", label: "书架", path: "/books" },
  { key: "about", label: "关于", path: "/about" },
] as const;

export const topNavigationOrder = siteNavigation.map((item) => item.key);

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
