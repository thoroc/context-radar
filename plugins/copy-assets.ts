import { existsSync, readFileSync } from "node:fs";
import type { Plugin } from "vite";

export interface AssetCopy {
  /** Absolute path to the source file. */
  from: string;
  /** Output path relative to the site root, e.g. `context-reduction-tools.csv`. */
  to: string;
}

export interface CopyAssetsOptions {
  assets: AssetCopy[];
}

function requestPath(url: string | undefined): string {
  return (url ?? "").split("?")[0].replace(/^\//, "");
}

/**
 * Serves and ships files that live outside the Vite root (e.g. generated data in
 * data/) at the site root, without duplicating them into the source tree.
 */
export function copyAssets(options: CopyAssetsOptions): Plugin {
  return {
    name: "context-radar:copy-assets",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const asset = options.assets.find((a) => a.to === requestPath(req.url));
        if (!asset || !existsSync(asset.from)) {
          next();
          return;
        }
        res.end(readFileSync(asset.from));
      });
    },
    generateBundle() {
      for (const asset of options.assets) {
        if (!existsSync(asset.from)) {
          this.warn(`copy-assets: source not found, skipping: ${asset.from}`);
          continue;
        }
        this.emitFile({ type: "asset", fileName: asset.to, source: readFileSync(asset.from) });
      }
    },
  };
}
