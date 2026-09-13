import type { Doc } from "./mira-docs-adapter";

export type DocumentContext = {
  previous?: Doc;
  next?: Doc;
};

function projectIdFromPath(path: string) {
  const [root, projectId] = path.split("/").filter(Boolean);
  return root === "projects" ? projectId : undefined;
}

function compareStandardDocs(left: Doc, right: Doc) {
  return (
    left.order - right.order ||
    left.directory.localeCompare(right.directory) ||
    left.path.localeCompare(right.path)
  );
}

function compareWeeklySequence(left: Doc, right: Doc) {
  return (left.issue ?? left.order) - (right.issue ?? right.order);
}

export function buildDocumentContext(
  doc: Doc,
  docs: readonly Doc[],
): DocumentContext {
  const projectId = projectIdFromPath(doc.path);
  const scoped = docs.filter(
    (item) =>
      item.root === doc.root &&
      (!projectId || projectIdFromPath(item.path) === projectId),
  );

  const ordered = [...scoped].sort(
    doc.root === "weekly" ? compareWeeklySequence : compareStandardDocs,
  );
  const index = ordered.findIndex((item) => item.path === doc.path);

  return {
    previous: index > 0 ? ordered[index - 1] : undefined,
    next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : undefined,
  };
}
