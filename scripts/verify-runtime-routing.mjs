import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function source(path) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

const failures = [];
const main = source("src/main.tsx");
const app = source("src/App.tsx");
const layout = source("src/components/SiteLayout.tsx");
const home = source("src/pages/HomePage.tsx");
const blogs = source("src/pages/BlogsPage.tsx");
const thoughts = source("src/pages/ThoughtsPage.tsx");
const realArticle = "src/content/markdown/blogs/shared-thinking/matter-awakens.md";

if (!main.includes("basename={routerBasename()}")) {
  failures.push("BrowserRouter must use the Vite-base-aware router basename.");
}

if (!app.includes("allDocs.find") || !app.includes('path="*" element={<ContentRoute />}')) {
  failures.push("The client router must resolve MiraDocs content paths before the fallback redirect.");
}

if (!app.includes("normalizeContentPath(pathname)") || !app.includes('pathname.replace(/\\/+$/, "")') || !app.includes("candidate.path === contentPath")) {
  failures.push("ContentRoute must normalize a static host trailing slash before matching a MiraDocs article path.");
}

if (!app.includes('path="thoughts" element={<ThoughtsPage />}')) {
  failures.push("/thoughts must render the real shared-thinking aggregation page.");
}

if (/thoughts\/[:*]/.test(app)) {
  failures.push("BR003 must not create a /thoughts/:slug article namespace.");
}

for (const [name, text] of [["SiteLayout", layout], ["HomePage", home], ["BlogsPage", blogs], ["ThoughtsPage", thoughts]]) {
  if (text.includes("NavLink") || text.includes("<Link ")) {
    failures.push(`${name} must use document navigation for static metadata routes.`);
  }
}

if (!layout.includes("siteHref(") || !home.includes("siteHref(") || !blogs.includes("siteHref(") || !thoughts.includes("siteHref(")) {
  failures.push("Static-route links must be Vite-base-aware through siteHref().");
}

if (!thoughts.includes('post.group === "共同思考"') || !thoughts.includes("siteHref(post.path)")) {
  failures.push("/thoughts must filter the historical group and link to the original blog path.");
}

if (!existsSync(resolve(process.cwd(), realArticle))) {
  failures.push(`Missing real BR003 article fixture: ${realArticle}`);
}

if (failures.length) {
  console.error("Runtime routing verification failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Runtime routing verification passed: basename, real content routing, trailing-slash refresh normalization, thoughts aggregation, and document-navigation metadata strategy are present.");
