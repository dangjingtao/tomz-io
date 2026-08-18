export function siteHref(path: string): string {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("#")) return path;

  const base = import.meta.env.BASE_URL || "/";
  if (path === "/") return base;

  return `${base}${path.replace(/^\//, "")}`.replace(/\/{2,}/g, "/");
}

export function routerBasename(): string {
  const base = import.meta.env.BASE_URL || "/";
  if (base === "/") return "/";
  return base.replace(/\/$/, "");
}
