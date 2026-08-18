import type { MiraDoc } from "@uichat-mira/docs";
import miraDocsContent from "virtual:mira-docs/content";
import { adaptTomzDocs, compareBlogDocs } from "./tomz-docs-adapter";

export const allDocs = adaptTomzDocs(miraDocsContent as MiraDoc[]);

export const blogPosts = allDocs
  .filter((doc) => doc.sourcePath.startsWith("blogs/"))
  .sort(compareBlogDocs);
