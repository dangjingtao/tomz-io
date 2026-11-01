import type { Doc } from '../../content/mira-docs-adapter';

export function weeklyIssueNumber(doc: Doc) {
  return doc.issue ?? doc.order;
}

export function weeklyDisplayTitle(doc: Doc) {
  return doc.title.replace(/^(?:见π|周刊)\s*#?\d+\s*[：:·-]\s*/, "");
}

export function weeklyDateLabel(value?: string) {
  if (!value) return "";
  const match = value.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
  if (!match) return value;
  return `${match[1]}.${match[2].padStart(2, "0")}.${match[3].padStart(2, "0")}`;
}

export function isWeeklyIssueIndexDoc(doc: Doc) {
  if (doc.root !== "weekly") return false;
  const segments = doc.path.split("/").filter(Boolean);
  return segments.length === 2 && /^\d+$/.test(segments[1] || "");
}

export function weeklyIssueIndexDocs(docs: Doc[]) {
  return docs.filter(isWeeklyIssueIndexDoc);
}

export function weeklyIssuePath(doc: Doc) {
  return `/weekly/${String(weeklyIssueNumber(doc)).padStart(3, "0")}`;
}

export type WeeklyTocHeading = Pick<Doc["headings"][number], "id" | "text" | "depth">;

export type WeeklyTocGroup = {
  heading: WeeklyTocHeading;
  children: WeeklyTocHeading[];
};

/** H2 chapters and their H3 sections. Older H2-only issues remain flat. */
export function groupWeeklyToc(headings: readonly WeeklyTocHeading[]): WeeklyTocGroup[] {
  const groups: WeeklyTocGroup[] = [];
  for (const heading of headings) {
    if (heading.depth === 3 && groups.length) {
      groups[groups.length - 1].children.push(heading);
    } else {
      // Treat an orphan H3 as a top-level entry, never hide navigable content.
      groups.push({ heading, children: [] });
    }
  }
  return groups;
}
