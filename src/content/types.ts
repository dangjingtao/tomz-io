export type KnownAuthor = "tomz" | "mira";
export type ContentAuthor = KnownAuthor | string;
export type WritingMode = "authored" | "co-authored" | string;

export type ContentFrontmatter = {
  title: string;
  description: string;
  group: string;
  order: number;
  date?: string;
  readTime?: string;
  tags: string[];
  cover?: string;
  author: ContentAuthor[];
  writingMode?: WritingMode;
  writtenBy?: ContentAuthor;
  reviewedBy?: ContentAuthor;
  commitUrl?: string;
};

export type ContentDocument = {
  sourcePath: string;
  urlPath: string;
  body: string;
  frontmatter: ContentFrontmatter;
};
