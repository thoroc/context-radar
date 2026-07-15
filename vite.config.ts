import { resolve } from "node:path";
import { defineConfig } from "vite";
import { copyAssets } from "./plugins/copy-assets";
import { markdownPages } from "./plugins/markdown-pages";

const projectRoot = import.meta.dirname;
const srcRoot = resolve(projectRoot, "src");

// Relative base so the built site works under a GitHub project-pages subpath
// (https://<org>.github.io/context-radar/) without hard-coding the repo name.
export default defineConfig({
  root: srcRoot,
  base: "./",
  build: {
    outDir: resolve(projectRoot, "docs"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(srcRoot, "index.html"),
        "stack-builder": resolve(srcRoot, "stack-builder.html"),
      },
    },
  },
  plugins: [
    markdownPages({
      pages: [
        {
          source: resolve(srcRoot, "pages/methodology.md"),
          route: "methodology.html",
          title: "Methodology — Context Radar",
        },
        {
          source: resolve(srcRoot, "pages/glossary.md"),
          route: "glossary.html",
          title: "Glossary — Context Radar",
        },
      ],
    }),
    // The CSV is generated data that lives in data/. Serve and ship it at the
    // site root so the "Download CSV" link resolves.
    copyAssets({
      assets: [
        {
          from: resolve(projectRoot, "data/context-reduction-tools.csv"),
          to: "context-reduction-tools.csv",
        },
      ],
    }),
  ],
});
