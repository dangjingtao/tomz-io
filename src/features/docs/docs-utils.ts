import { compareDocs, type Doc } from '../../content/mira-docs-adapter';
import type { SiteArea } from '../../types/site';

export function directoryTitle(directory: string) {
  return directory
    .split("/")
    .filter(Boolean)
    .map((part) =>
      part
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    )
    .join(" / ");
}
export function docsByDirectory(docs: Doc[]) {
  return [...new Set(docs.map((doc) => doc.directory))]
    .map((directory) => ({
      directory,
      docs: docs
        .filter((doc) => doc.directory === directory)
        .sort(compareDocs),
    }));
}

export function projectNavTitle(title: string) {
  const match = title.match(/^(.+?)[：:]\s*(.+)$/);
  return match
    ? { category: match[1].trim(), title: match[2].trim() }
    : { category: "", title };
}
export type ProjectDocGroup = {
  id: string;
  title: string;
  order: number;
  overview?: Doc;
  articles: Doc[];
};
export function projectIdFromPath(path: string) {
  const [root, projectId] = path.split("/").filter(Boolean);
  return root === "projects" ? projectId : undefined;
}
export function docsByProjectDirectory(docs: Doc[]): ProjectDocGroup[] {
  const groups = new Map<string, ProjectDocGroup>();
  for (const doc of docs) {
    const id = projectIdFromPath(doc.path);
    if (!id) continue;
    const group = groups.get(id) || {
      id,
      title: doc.title,
      order: doc.order,
      articles: [],
    };
    if (doc.path === `/projects/${id}`) {
      group.overview = doc;
      group.title = doc.title;
      group.order = doc.order;
    } else {
      group.articles.push(doc);
    }
    groups.set(id, group);
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      articles: group.articles.sort(compareDocs),
    }))
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
}
export function isProjectArea(area: SiteArea) {
  return area.docs.some((doc) => doc.type === "project");
}
