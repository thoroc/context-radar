import { renderLayerBody } from "../../src/layer";
import type { LayerMeta, Recommendation } from "../../src/lib";
import { docShell, type PageStore, pageShell } from "../lib";
import { LAYER_STYLES } from "./styles";

/** One standalone layer page. */
export const renderPage = (
  layer: LayerMeta,
  store: PageStore,
  recs: Recommendation[],
  slug: string,
  chromeSrc: string,
): string => {
  const tools = store.tools.filter((t) => t.layer === layer.name);
  const body = renderLayerBody(layer, tools, store.tools, recs, {
    base: "../",
    starsVerified: store.meta.stars_verified,
  });
  return pageShell({
    title: layer.name,
    styles: LAYER_STYLES,
    base: "../",
    active: `layers/${slug}.html`,
    chromeSrc,
    body: `<div class="page page-shell">
  <div class="crumb">
    <a href="../index.html">Home</a><span class="sep">/</span>
    <a href="../layers.html">Layers</a><span class="sep">/</span><span>${layer.name}</span>
  </div>
  ${docShell({ body, articleClass: "detail layer-detail" })}
</div>`,
  });
};
