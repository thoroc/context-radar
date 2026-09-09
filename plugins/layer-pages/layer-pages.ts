import { readFileSync } from "node:fs";
import type { Plugin } from "vite";
import type { RecommendationsFile } from "../../src/lib";
import { chromeSrc, DEV_CHROME_SRC, requestPath, requestSlug } from "../lib";
import { loadLayerStore } from "./load-store";
import { renderIndex } from "./render-index";
import { renderPage } from "./render-page";
import type { LayerPagesOptions } from "./types";

/**
 * Generates one page per layer plus the layer index, from the canonical JSON
 * store: served on the fly during `vite dev`, emitted into the build output at
 * `vite build`. Mirrors the tool-pages plugin, sharing its store loading, slug
 * mapping, request routing and HTML envelope through plugins/lib.
 *
 * The layer curation in `data.layers[]` -- order, cardinality, note, pick and
 * summary -- had no page anywhere before this: a layer existed only as a
 * section heading in the comparison table and a value in its filter.
 */
export const layerPages = (options: LayerPagesOptions): Plugin => {
  const outDir = options.outDir ?? "layers";
  const indexRoute = `${outDir}.html`;
  const readRecs = (path: string): RecommendationsFile =>
    JSON.parse(readFileSync(path, "utf8")) as RecommendationsFile;

  return {
    name: "context-radar:layer-pages",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const { store, slugByName } = loadLayerStore(options.dataPath);

        // The index sits beside the directory rather than inside it, so
        // requestSlug does not match it and it needs its own branch. This only
        // exists under `vite dev`, which is why a build-only check cannot catch
        // it going missing.
        if (requestPath(req.url) === indexRoute) {
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(renderIndex(store, "./", DEV_CHROME_SRC));
          return;
        }

        const slug = requestSlug(req.url, outDir);
        if (slug === null) {
          next();
          return;
        }
        if (slug === "index") {
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(renderIndex(store, "../", DEV_CHROME_SRC));
          return;
        }
        const layer = store.layers.find((l) => slugByName.get(l.name) === slug);
        if (!layer) {
          next();
          return;
        }
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(
          renderPage(
            layer,
            store,
            readRecs(options.recsPath).recommendations,
            slug,
            DEV_CHROME_SRC,
          ),
        );
      });
    },
    generateBundle(_outputOptions, bundle) {
      const { store, slugByName } = loadLayerStore(options.dataPath);
      const recs = readRecs(options.recsPath).recommendations;
      const nested = chromeSrc(bundle, "../");
      const root = chromeSrc(bundle, "./");

      for (const layer of store.layers) {
        const slug = slugByName.get(layer.name) ?? "";
        this.emitFile({
          type: "asset",
          fileName: `${outDir}/${slug}.html`,
          source: renderPage(layer, store, recs, slug, nested),
        });
      }
      this.emitFile({
        type: "asset",
        fileName: indexRoute,
        source: renderIndex(store, "./", root),
      });
      // Also inside the directory, so /layers/ resolves instead of 404ing.
      this.emitFile({
        type: "asset",
        fileName: `${outDir}/index.html`,
        source: renderIndex(store, "../", nested),
      });
    },
  };
};
