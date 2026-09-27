export function slug(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/[\s/]+/g, "-")
    .replace(/[^\w\u4e00-\u9fff-]/g, "")
    .toLowerCase();
}
