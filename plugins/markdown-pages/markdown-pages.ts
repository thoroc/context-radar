import type { Plugin } from "vite";
import { requestPath } from "../lib/request-path";
import { pageFragments } from "./page-fragments";
import { renderPage } from "./render-page";
import type { MarkdownPagesOptions } from "./types";

// Virtual module the site entries import to render Methodology/Glossary as modal
// overlays instead of navigating away: `import pages from "virtual:context-radar-pages"`.
const VIRTUAL_ID = "virtual:context-radar-pages";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

/**
 * Renders a set of markdown files to standalone static HTML pages: served on the
 * fly during `vite dev`, emitted into the build output at `vite build`. Replaces
 * the previous Jekyll pipeline.
 */
export const markdownPages = (options: MarkdownPagesOptions): Plugin => ({
  name: "context-radar:markdown-pages",
  resolveId(id) {
    return id === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : null;
  },
  load(id) {
    if (id !== RESOLVED_VIRTUAL_ID) return null;
    return `export default ${JSON.stringify(pageFragments(options.pages))};`;
  },
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const page = options.pages.find((p) => p.route === requestPath(req.url));
      if (!page) {
        next();
        return;
      }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(renderPage(page));
    });
  },
  generateBundle() {
    for (const page of options.pages) {
      this.emitFile({ type: "asset", fileName: page.route, source: renderPage(page) });
    }
  },
});
