import { githubProfileUrl, siteName, topNavigationOrder } from "../site.config";
import type { LinkItem, SiteArea } from "../types/site";
import { appBase, docHref } from "../utils/paths";
import {
  allDocs,
  compareDocs,
  pageDirectories,
  type Doc,
} from "./mira-docs-adapter";

function rootTitle(root: string, first?: Doc) {
  return (
    first?.nav ||
    (root === "blogs"
      ? "博客"
      : root === "weekly"
        ? "见π"
        : root
            .replace(/[-_]+/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase()))
  );
}

export function buildSiteAreas(docs: Doc[], declaredRoots: string[]): SiteArea[] {
  const roots = [...new Set([...declaredRoots, ...docs.map((doc) => doc.root)])];

  return roots
    .map((root) => {
      const rootDocs = docs
        .filter((doc) => doc.root === root)
        .sort(compareDocs);
      const first =
        (root === "projects"
          ? rootDocs.find(
              (doc) => doc.path.split("/").filter(Boolean).length === 2,
            )
          : rootDocs.find((doc) => doc.root === root)) ?? rootDocs[0];
      const path = `/${root}`;

      return {
        key: root,
        title: rootTitle(root, first),
        description: first?.description || "",
        docs: rootDocs,
        path,
        href: docHref(path),
      };
    })
    .filter((area) => area.docs.length > 0);
}

export function buildSiteNav(areas: SiteArea[]): LinkItem[] {
  const nav: LinkItem[] = [
    ...areas
      .filter((area) => area.key !== "submissions")
      .map((area) => ({ label: area.title, href: area.href })),
    { label: "关于", href: "/about" },
  ];

  const keyFor = (item: LinkItem) =>
    item.href.replace(appBase, "").split("/")[0];
  const rank = (item: LinkItem) => {
    const index = topNavigationOrder.indexOf(
      keyFor(item) as (typeof topNavigationOrder)[number],
    );
    return index === -1 ? topNavigationOrder.length : index;
  };

  return nav.sort((left, right) => rank(left) - rank(right));
}

export function getBlogNavCategories(areas: SiteArea[]) {
  const blogArea = areas.find((area) => area.key === "blogs");
  const groups = new Map<string, number>();

  for (const doc of blogArea?.docs || []) {
    const group = doc.group.trim();
    if (!group || group === "归档") continue;
    groups.set(group, (groups.get(group) || 0) + 1);
  }

  return [...groups].map(([label, count]) => ({ label, count }));
}

export const siteAreas = buildSiteAreas(allDocs, pageDirectories);
export const siteNav = buildSiteNav(siteAreas);
export const blogNavCategories = getBlogNavCategories(siteAreas);
export const siteTitle = siteName;
export const githubUrl = githubProfileUrl;
export const tomzMarkSrc = `${appBase}brand/tomz-mark.png`;
