export type BookKind = "study" | "reading-notes" | "novel" | "collection" | "other";
export type BookStatus = "active" | "completed" | "draft" | "archived";

export type BookManifest = {
  id: string;
  title: string;
  description: string;
  category?: string;
  kind: BookKind;
  order: number;
  status: BookStatus;
  legacyPrefix?: string;
};

function scalar(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseBookManifest(source: string, sourcePath = "_book.yml"): BookManifest {
  const values = new Map<string, string>();

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf(":");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    const value = scalar(line.slice(separator + 1));
    values.set(key, value);
  }

  const id = values.get("id")?.trim() || "";
  const title = values.get("title")?.trim() || "";
  if (!id || !title) {
    throw new Error(`Invalid book manifest ${sourcePath}: id and title are required.`);
  }

  const parsedOrder = Number(values.get("order") || 0);
  const kindValue = values.get("kind") || "other";
  const statusValue = values.get("status") || "active";
  const allowedKinds: BookKind[] = ["study", "reading-notes", "novel", "collection", "other"];
  const allowedStatuses: BookStatus[] = ["active", "completed", "draft", "archived"];

  return {
    id,
    title,
    description: values.get("description") || "",
    category: values.get("category") || undefined,
    kind: allowedKinds.includes(kindValue as BookKind) ? (kindValue as BookKind) : "other",
    order: Number.isFinite(parsedOrder) ? parsedOrder : 0,
    status: allowedStatuses.includes(statusValue as BookStatus)
      ? (statusValue as BookStatus)
      : "active",
    legacyPrefix: values.get("legacyPrefix") || undefined,
  };
}
