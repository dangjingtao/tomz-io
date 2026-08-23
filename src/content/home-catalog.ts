import { allDocs, compareBlogDocs } from "./mira-docs-adapter";

export type HomeCatalogLatest = {
  title: string;
  path: string;
  date?: string;
};

export type HomeBookshelfItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  order: number;
  path: string;
  count: number;
  latest?: HomeCatalogLatest;
};

export type HomeProjectItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  order: number;
  path: string;
  count: number;
  latest?: HomeCatalogLatest;
};

const bookManifestSources = import.meta.glob<string>("../pages/books/*/_book.yml", {
  eager: true,
  query: "?raw",
  import: "default",
});

function yamlValue(source: string, key: string): string {
  const match = source.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, "mi"));
  return match?.[1]?.trim().replace(/^['"]|['"]$/g, "") || "";
}

function numericValue(source: string, key: string): number {
  const value = Number(yamlValue(source, key));
  return Number.isFinite(value) ? value : 0;
}

function bookStatusLabel(status: string, kind: string): string {
  if (status === "completed") return "已完成";
  if (status === "active" && kind === "reading-notes") return "持续阅读";
  if (status === "active") return "持续更新";
  return status || "收录中";
}

function latestFrom(docs: typeof allDocs): HomeCatalogLatest | undefined {
  const latest = [...docs].sort(compareBlogDocs)[0];
  if (!latest) return undefined;
  return {
    title: latest.title,
    path: latest.path,
    ...(latest.date ? { date: latest.date } : {}),
  };
}

export const homeBookshelfItems: HomeBookshelfItem[] = Object.entries(bookManifestSources)
  .map(([manifestPath, source]) => {
    const id = manifestPath.match(/\/books\/([^/]+)\/_book\.yml$/)?.[1] || "";
    const status = yamlValue(source, "status");
    const kind = yamlValue(source, "kind");
    const docs = allDocs.filter((doc) => doc.root === "books" && doc.book === id);

    return {
      id,
      title: yamlValue(source, "title") || id,
      description: yamlValue(source, "description"),
      category: yamlValue(source, "category") || "书架",
      status: bookStatusLabel(status, kind),
      order: numericValue(source, "order"),
      path: `/books/${id}`,
      count: docs.length,
      latest: latestFrom(docs),
      hidden: status === "archived" || status === "draft",
    };
  })
  .filter((item) => item.id && !item.hidden)
  .sort((left, right) => left.order - right.order)
  .map(({ hidden: _hidden, ...item }) => item);

const projectDocs = allDocs.filter((doc) => doc.root === "projects");
const projectHomeDocs = projectDocs.filter((doc) => !doc.directory);

export const homeProjectItems: HomeProjectItem[] = projectHomeDocs
  .map((project) => {
    const id = project.path.split("/").filter(Boolean).at(-1) || "";
    const children = projectDocs.filter(
      (doc) => doc !== project && doc.directory.split("/")[0] === id,
    );

    return {
      id,
      title: project.title,
      description: project.description,
      category: project.group || "项目",
      order: project.order,
      path: project.path,
      count: children.length,
      latest: latestFrom(children),
    };
  })
  .filter((item) => item.id)
  .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title));
