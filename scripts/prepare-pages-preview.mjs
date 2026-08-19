import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const dist = resolve(process.cwd(), "dist");
if (!existsSync(dist)) throw new Error("dist does not exist");

function filesUnder(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = resolve(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

let htmlCount = 0;
for (const path of filesUnder(dist).filter((path) => path.endsWith(".html"))) {
  let html = readFileSync(path, "utf8");
  const robots = '<meta name="robots" content="noindex,nofollow">';
  if (/<meta\s+name=["']robots["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i, robots);
  } else {
    html = html.replace(/<head([^>]*)>/i, `<head$1>\n    ${robots}`);
  }
  writeFileSync(path, html);
  htmlCount += 1;
}

writeFileSync(resolve(dist, "robots.txt"), "User-agent: *\nDisallow: /\n");
console.log(`BR003A preview noindex applied to ${htmlCount} HTML files; robots.txt disallows crawling.`);
