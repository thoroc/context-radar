import type { Plugin } from "vite";
import { requestPath } from "../lib/request-path";
import { buildLlmsTxt } from "./build-llms-txt";
import type { GenerateLlmsTxtOptions } from "./types";

/**
 * Generates llms.txt from the canonical JSON store: served on the fly during
 * `vite dev`, emitted into the build output at `vite build`. Mirrors
 * generate-csv, because llms.txt is a derived export in exactly the same sense
 * and had gone stale precisely because it was not treated as one.
 */
export const generateLlmsTxt = (options: GenerateLlmsTxtOptions): Plugin => ({
  name: "context-radar:generate-llms-txt",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (requestPath(req.url) !== options.outFile) {
        next();
        return;
      }
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end(buildLlmsTxt(options.dataPath));
    });
  },
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: options.outFile,
      source: buildLlmsTxt(options.dataPath),
    });
  },
});
