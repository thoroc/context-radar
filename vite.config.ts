import { resolve } from "node:path";
import { defineConfig } from "vite";
import { generateCsv } from "./plugins/generate-csv";
import { generateLlmsTxt } from "./plugins/generate-llms-txt";
import { markdownPages } from "./plugins/markdown-pages";
import { siteChrome } from "./plugins/site-chrome";
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
        // Not a page: the shared chunk the generated tool and markdown pages
        // reference. They are emitted as raw asset strings, so Rollup never
        // sees them and cannot inject a script; listing the entry here gets it
        // bundled, hashed and typechecked, and the generators look its final
        // filename up in the bundle.
        chrome: resolve(srcRoot, "chrome/main.ts"),
      },
    },
  },
  plugins: [
    // Renders the shared top bar into the three static entries, which carry a
    // placeholder instead of copy-pasted markup.
    siteChrome(),
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
    // llms.txt is derived data too. It used to be a hand-checked static file in
    // src/public and had drifted on every count it stated.
    generateLlmsTxt({
      dataPath: resolve(projectRoot, "data/context-reduction-tools.json"),
      outFile: "llms.txt",
    }),
  ],
});
