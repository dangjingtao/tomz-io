import { defineConfig } from "vitest/config";

export default defineConfig({ test: { include: ["scripts/generate-json-feed.test.mjs", "scripts/generate-feed-discovery.test.mjs"] } });
