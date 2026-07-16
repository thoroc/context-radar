import { resolve } from "node:path";
import { defineConfig } from "vite";
import { generateCsv } from "./plugins/generate-csv";
import { markdownPages } from "./plugins/markdown-pages";
import { toolPages } from "./plugins/tool-pages";

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
        comparison: resolve(srcRoot, "comparison.html"),
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
    // One detail page per tool, generated from the canonical JSON store so the
    // comparison table can summarise while the full record stays one click away.
    toolPages({
      dataPath: resolve(projectRoot, "data/context-reduction-tools.json"),
    }),
    // The CSV download is generated from the canonical JSON store so the
    // "Download CSV" link resolves without a second source of truth.
    generateCsv({
      dataPath: resolve(projectRoot, "data/context-reduction-tools.json"),
      outFile: "context-reduction-tools.csv",
    }),
  ],
});
