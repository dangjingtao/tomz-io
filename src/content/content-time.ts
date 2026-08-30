import {
  contentTimes,
  type GeneratedContentTimeEntry,
} from "./content-times.generated";

export type ContentTimePrecision = "date" | "datetime";

export type ResolvedContentTime = {
  publishedAt?: string;
  publishedPrecision?: ContentTimePrecision;
  modifiedAt?: string;
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

function timeEntry(sourcePath: string): GeneratedContentTimeEntry | undefined {
  return contentTimes[sourcePath.replace(/^\/+/, "")];
}

export function resolveContentTime(sourcePath: string): ResolvedContentTime {
  const entry = timeEntry(sourcePath);
  return {
    publishedAt: entry?.publishedAt,
    publishedPrecision: entry?.publishedPrecision,
    modifiedAt: entry?.modifiedAt,
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
  return timeEntry(sourcePath)?.modifiedAt;
}
