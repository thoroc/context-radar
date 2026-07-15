import { readFileSync } from "node:fs";
import type { Plugin } from "vite";
import { type CsvDataset, toCsv } from "../src/lib/columns";

export interface GenerateCsvOptions {
  /** Absolute path to the canonical JSON store. */
  dataPath: string;
  /** Output filename served at the site root, e.g. `context-reduction-tools.csv`. */
  outFile: string;
}

function requestPath(url: string | undefined): string {
  return (url ?? "").split("?")[0].replace(/^\//, "");
}

function buildCsv(dataPath: string): string {
  return toCsv(JSON.parse(readFileSync(dataPath, "utf8")) as CsvDataset);
}

/**
 * Generates the CSV download from the canonical JSON store: served on the fly
 * during `vite dev`, emitted into the build output at `vite build`. The JSON is
 * the single source of truth; the CSV is a derived export.
 */
export function generateCsv(options: GenerateCsvOptions): Plugin {
  return {
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
  };
}
