import { readFileSync } from "node:fs";
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

if (!main.includes("basename={routerBasename()}")) {
  failures.push("BrowserRouter must use the Vite-base-aware router basename.");
}

if (!app.includes("allDocs.find") || !app.includes('path="*" element={<ContentRoute />}')) {
  failures.push("The client router must resolve MiraDocs content paths before the fallback redirect.");
}

for (const [name, text] of [["SiteLayout", layout], ["HomePage", home], ["BlogsPage", blogs]]) {
  if (text.includes("NavLink") || text.includes("<Link ")) {
    failures.push(`${name} must use document navigation for static metadata routes.`);
  }
}

if (!layout.includes("siteHref(") || !home.includes("siteHref(") || !blogs.includes("siteHref(")) {
  failures.push("Static-route links must be Vite-base-aware through siteHref().");
}

if (failures.length) {
  console.error("Runtime routing verification failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Runtime routing verification passed: basename, content routing, and document-navigation metadata strategy are present.");
