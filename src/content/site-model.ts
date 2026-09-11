import { githubProfileUrl, siteName, topNavigationOrder } from "../site.config";
import { appBase, docHref } from "../utils/paths";
import { allDocs, compareDocs, pageDirectories } from "./mira-docs-adapter";
import {
  buildSiteAreas,
  buildSiteNav,
  getBlogNavCategories,
} from "./site-model-core";

export { buildSiteAreas, buildSiteNav, getBlogNavCategories } from "./site-model-core";

export const siteAreas = buildSiteAreas(allDocs, pageDirectories, {
  compareDocs,
  docHref,
});
export const siteNav = buildSiteNav(siteAreas, {
  appBase,
  topNavigationOrder,
});
export const blogNavCategories = getBlogNavCategories(siteAreas);
export const siteTitle = siteName;
export const githubUrl = githubProfileUrl;
export const tomzMarkSrc = `${appBase}brand/tomz-mark.png`;
