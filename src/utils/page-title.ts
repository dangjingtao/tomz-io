import type { Doc } from '../content/mira-docs-adapter';
import type { SiteArea } from '../types/site';

const defaultPageTitle = '独立开发与产品设计';

export function getPageTitle(
  pathname: string,
  docs: Doc[],
  areas: SiteArea[],
  books: Array<{ id: string; title: string }> = [],
) {
  if (pathname === '/') return defaultPageTitle;
  if (pathname === '/about') return '关于 Tomz Dang';
  if (pathname === '/books') return '书架';

  const doc = docs.find((item) => item.path === pathname);
  if (doc) return doc.title;

  const bookMatch = pathname.match(/^\/books\/([^/]+)$/);
  if (bookMatch) {
    const book = books.find((item) => item.id === bookMatch[1]);
    if (book) return book.title;
  }

  const area = areas.find((item) => item.path === pathname);
  return area?.title || '页面不存在';
}
