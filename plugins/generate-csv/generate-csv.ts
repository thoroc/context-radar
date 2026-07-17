import type { Plugin } from "vite";
import { requestPath } from "../lib/request-path";
import { buildCsv } from "./build-csv";
import type { GenerateCsvOptions } from "./types";

/**
 * Generates the CSV download from the canonical JSON store: served on the fly
 * during `vite dev`, emitted into the build output at `vite build`. The JSON is
 * the single source of truth; the CSV is a derived export.
 */
export const generateCsv = (options: GenerateCsvOptions): Plugin => ({
  name: "context-radar:generate-csv",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (requestPath(req.url) !== options.outFile) {
        next();
        return;
      }
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.end(buildCsv(options.dataPath));
    });
  },
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: options.outFile,
      source: buildCsv(options.dataPath),
    });
  },
});
