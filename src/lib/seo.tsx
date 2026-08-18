import { useEffect } from "react";
import { site } from "../site";

type SeoProps = {
  title?: string;
  description?: string;
  path?: string;
  type?: "website" | "article";
};

function ensureMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element!.setAttribute(key, value));
}

function canonicalUrl(path: string) {
  const normalized = path === "/" ? "/" : `${path.replace(/\/+$/, "")}/`;
  return new URL(normalized.replace(/^\//, ""), `${site.url}/`).toString();
}

export function Seo({ title, description = site.description, path = "/", type = "website" }: SeoProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${site.name}` : site.title;
    const canonical = canonicalUrl(path);
    document.title = fullTitle;

    ensureMeta('meta[name="description"]', { name: "description", content: description });
    ensureMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    ensureMeta('meta[property="og:description"]', { property: "og:description", content: description });
    ensureMeta('meta[property="og:type"]', { property: "og:type", content: type });
    ensureMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    ensureMeta('meta[property="og:site_name"]', { property: "og:site_name", content: site.name });

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [description, path, title, type]);

  return null;
}
