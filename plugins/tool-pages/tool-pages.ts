import type { Plugin } from "vite";
import { loadStore } from "./load-store";
import { renderPage } from "./render-page";
import { requestSlug } from "./request-slug";
import type { ToolPagesOptions } from "./types";

/**
 * Generates one standalone detail page per tool from the canonical JSON store:
 * served on the fly during `vite dev`, emitted into the build output at
 * `vite build`. The JSON is the single source of truth; each page is a lossless
 * view of one record, reusing the shared presentation helpers.
 */
export const toolPages = (options: ToolPagesOptions): Plugin => {
  const outDir = options.outDir ?? "tools";
  return {
    name: "context-radar:tool-pages",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const slug = requestSlug(req.url, outDir);
        if (slug === null) {
          next();
          return;
        }
        const { store, slugByName } = loadStore(options.dataPath);
        const tool = store.tools.find((t) => slugByName.get(t.tool) === slug);
        if (!tool) {
          next();
          return;
        }
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(renderPage(tool, store, slugByName));
      });
    },
    generateBundle() {
      const { store, slugByName } = loadStore(options.dataPath);
      for (const tool of store.tools) {
        this.emitFile({
          type: "asset",
          fileName: `${outDir}/${slugByName.get(tool.tool)}.html`,
          source: renderPage(tool, store, slugByName),
        });
      }
    },
  };
};
