import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  FEED_FILE,
  collectPublicationFeed,
} from "./publication-feed.mjs";
import policy from "../site-policy.json" with { type: "json" };

const distRoot = resolve(process.cwd(), "dist");
if (!existsSync(distRoot)) {
  throw new Error(`Missing build output: ${distRoot}`);
}

const feed = collectPublicationFeed(
  distRoot,
  resolve(process.cwd(), "src/pages"),
  policy.siteUrl,
);
const target = resolve(distRoot, FEED_FILE);
writeFileSync(target, JSON.stringify(feed, null, 2) + "\n");
console.log(
  `JSON Feed generated: ${feed.items.length} items -> ${target}`,
);
