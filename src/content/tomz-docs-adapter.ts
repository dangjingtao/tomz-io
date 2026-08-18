import type { MiraDoc } from "@uichat-mira/docs";

export type AuthorKey = "tomz" | "mira";
export type WritingMode = "authored" | "co-authored";

export type TomzDoc = MiraDoc & {
  root: string;
  directory: string;
  readTime?: string;
  author: AuthorKey[];
  writingMode: WritingMode;
  writtenBy?: AuthorKey;
  reviewedBy?: AuthorKey;
  commitUrl?: string;
};

export function dataString(data: Record<string, unknown>, key: string): string | undefined {
  const value = data[key];
  if (Array.isArray(value)) return value.length ? String(value[0]) : undefined;
  if (value == null || value === "") return undefined;
  return String(value);
}

export function dataList(data: Record<string, unknown>, key: string): string[] {
  const value = data[key];
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }
  if (typeof value !== "string" || !value.trim()) return [];
  return value
    .split(/[|,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeAuthorKey(value?: string): AuthorKey | undefined {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "tomz" || normalized === "tomz dang") return "tomz";
  if (normalized === "mira") return "mira";
  return undefined;
}

export function authorDisplayName(author: AuthorKey): string {
  return author === "mira" ? "Mira" : "Tomz Dang";
}

function authorFields(doc: MiraDoc): Pick<TomzDoc, "author" | "writingMode" | "writtenBy" | "reviewedBy" | "commitUrl"> {
  const explicitAuthors = dataList(doc.data, "author")
    .map(normalizeAuthorKey)
    .filter((author): author is AuthorKey => Boolean(author));
  const explicitWritingMode = dataString(doc.data, "writingMode");
  const explicitWrittenBy = normalizeAuthorKey(dataString(doc.data, "writtenBy"));
  const explicitReviewedBy = normalizeAuthorKey(dataString(doc.data, "reviewedBy"));
  const commitUrl = dataString(doc.data, "commitUrl");

  if (explicitAuthors.length) {
    return {
      author: explicitAuthors,
      writingMode: explicitWritingMode === "co-authored" ? "co-authored" : explicitAuthors.length > 1 ? "co-authored" : "authored",
      writtenBy: explicitWrittenBy,
      reviewedBy: explicitReviewedBy,
      commitUrl,
    };
  }

  if (doc.group === "Mira 来信") {
    return {
      author: ["mira"],
      writingMode: "authored",
      writtenBy: "mira",
      reviewedBy: "tomz",
      commitUrl,
    };
  }

  if (doc.group === "共同思考") {
    return {
      author: ["tomz", "mira"],
      writingMode: "co-authored",
      writtenBy: "mira",
      reviewedBy: "tomz",
      commitUrl,
    };
  }

  return {
    author: ["tomz"],
    writingMode: "authored",
    writtenBy: "tomz",
    commitUrl,
  };
}

export function adaptTomzDoc(doc: MiraDoc): TomzDoc {
  const root = doc.sourcePath.split("/")[0] || "content";
  const relative = doc.sourcePath.replace(new RegExp(`^${root}/`), "").replace(/\.md$/i, "");
  const segments = relative.split("/");

  return {
    ...doc,
    root,
    directory: segments.slice(0, -1).join("/"),
    readTime:
      dataString(doc.data, "readTime") ||
      dataString(doc.data, "readtime") ||
      dataString(doc.data, "read_time"),
    ...authorFields(doc),
  };
}

export function adaptTomzDocs(docs: MiraDoc[]): TomzDoc[] {
  return docs.map(adaptTomzDoc);
}

function dateValue(value?: string): number {
  if (!value) return 0;
  const chinese = value.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (chinese) {
    return new Date(Number(chinese[1]), Number(chinese[2]) - 1, Number(chinese[3])).getTime();
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function compareBlogDocs(left: TomzDoc, right: TomzDoc): number {
  return (
    dateValue(right.date) - dateValue(left.date) ||
    right.order - left.order ||
    left.path.localeCompare(right.path)
  );
}
