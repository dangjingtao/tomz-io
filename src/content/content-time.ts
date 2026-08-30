import {
  contentGitHistory,
  type GeneratedContentGitHistoryEntry,
} from "./content-times.generated";

export type ContentTimePrecision = "date" | "datetime";

export type ResolvedContentTime = {
  publishedAt?: string;
  publishedPrecision?: ContentTimePrecision;
  modifiedAt?: string;
};

type ResolveContentTimeInput = {
  sourcePath: string;
  date?: string;
  publishedAt?: string;
};

const SITE_OFFSET_MS = 8 * 60 * 60 * 1000;

function normalizedDateOnly(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  const text = value.trim();
  const match = text.match(/^(\d{4})[年\-\/.](\d{1,2})[月\-\/.](\d{1,2})日?$/);
  if (!match) return undefined;
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function toSiteIso(value?: string): string | undefined {
  if (!value || Number.isNaN(Date.parse(value))) return undefined;
  const shifted = new Date(Date.parse(value) + SITE_OFFSET_MS);
  return shifted.toISOString().replace(/Z$/, "+08:00");
}

function siteDate(value?: string): string | undefined {
  return toSiteIso(value)?.slice(0, 10);
}

function normalizePublishedOverride(
  value?: string,
): { value: string; precision: ContentTimePrecision } | undefined {
  if (!value?.trim()) return undefined;
  const text = value.trim();
  const dateOnly = normalizedDateOnly(text);
  if (dateOnly) return { value: dateOnly, precision: "date" };

  // Require an explicit timezone for precise manual overrides so builds are deterministic.
  if (!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(text) || Number.isNaN(Date.parse(text))) {
    return undefined;
  }
  const normalized = toSiteIso(text);
  return normalized ? { value: normalized, precision: "datetime" } : undefined;
}

function historyFor(sourcePath: string): GeneratedContentGitHistoryEntry | undefined {
  return contentGitHistory[sourcePath.replace(/^\/+/, "")];
}

function earliestCommitOnDate(
  history: GeneratedContentGitHistoryEntry | undefined,
  declaredDate: string,
): string | undefined {
  const matches = (history?.commitTimes ?? [])
    .filter((value) => siteDate(value) === declaredDate)
    .sort((left, right) => Date.parse(left) - Date.parse(right));
  return toSiteIso(matches[0]);
}

export function resolveContentTime({
  sourcePath,
  date,
  publishedAt,
}: ResolveContentTimeInput): ResolvedContentTime {
  const history = historyFor(sourcePath);
  const override = normalizePublishedOverride(publishedAt);
  const declaredDate = normalizedDateOnly(date);

  let resolvedPublishedAt: string | undefined;
  let publishedPrecision: ContentTimePrecision | undefined;

  if (override) {
    resolvedPublishedAt = override.value;
    publishedPrecision = override.precision;
  } else if (declaredDate) {
    const inferred = earliestCommitOnDate(history, declaredDate);
    resolvedPublishedAt = inferred || declaredDate;
    publishedPrecision = inferred ? "datetime" : "date";
  } else if (history?.firstCommitAt) {
    resolvedPublishedAt = toSiteIso(history.firstCommitAt);
    publishedPrecision = resolvedPublishedAt ? "datetime" : undefined;
  }

  return {
    publishedAt: resolvedPublishedAt,
    publishedPrecision,
    modifiedAt: toSiteIso(history?.latestCommitAt),
  };
}

export function latestModifiedAt(values: Array<string | undefined>): string | undefined {
  return values
    .filter((value): value is string => Boolean(value && !Number.isNaN(Date.parse(value))))
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0];
}

export function contentTimeSortValue(value?: string): number {
  if (!value) return 0;
  const dateOnly = normalizedDateOnly(value);
  if (dateOnly) return Date.parse(`${dateOnly}T00:00:00+08:00`);
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatContentTime(value?: string): string | undefined {
  if (!value) return undefined;
  const dateOnly = normalizedDateOnly(value);
  if (dateOnly) {
    const [year, month, day] = dateOnly.split("-");
    return `${year}年${Number(month)}月${Number(day)}日`;
  }

  const normalized = toSiteIso(value);
  if (!normalized) return undefined;
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return undefined;
  const [, year, month, day, hour, minute] = match;
  return `${year}年${Number(month)}月${Number(day)}日 ${hour}:${minute}`;
}

export function normalizedContentModifiedAt(sourcePath: string): string | undefined {
  return toSiteIso(historyFor(sourcePath)?.latestCommitAt);
}
