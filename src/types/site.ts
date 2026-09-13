import type { Doc } from '../content/mira-docs-adapter';

export type LinkItem = { label: string; href: string };
export type ThemeName = 'claude' | 'apple' | 'supabase';
export type SiteArea = {
  key: string;
  title: string;
  description: string;
  docs: Doc[];
  path: string;
  href: string;
};
