import type { Doc } from '../content/mira-docs-adapter';
import type { SiteArea } from '../types/site';

const defaultPageTitle = '独立开发与产品设计';

export function getPageTitle(pathname: string, docs: Doc[], areas: SiteArea[]) {
  if (pathname === '/') return defaultPageTitle;
  if (pathname === '/about') return '关于 Tomz Dang';
  const doc = docs.find((item) => item.path === pathname);
  if (doc) return doc.title;
  const area = areas.find((item) => item.path === pathname);
  return area?.title || '页面不存在';
}
