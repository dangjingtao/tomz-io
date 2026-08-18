import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { miraDocs } from "@uichat-mira/docs/vite";
import { tomzDocsStaticBuild } from "./tomz-docs-static";
import { site } from "./src/site";

export default defineConfig(({ mode }) => {
  const base = mode === "github-pages" ? "/tomz-io/" : "/";

  return {
    plugins: [
      miraDocs({
        contentDir: "src/content/markdown",
        config: {
          title: site.name,
          description: site.description,
          siteUrl: site.url,
        },
        staticRoutes: tomzDocsStaticBuild,
        exclude: (sourcePath) => /(^|\/)README\.md$/i.test(sourcePath),
      }),
      react(),
    ],
    base,
  };
});
