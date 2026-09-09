import { renderIndexBody } from "../../src/layer";
import { docShell, type PageStore, pageShell } from "../lib";
import { LAYER_STYLES } from "./styles";

/**
 * The layer index.
 *
 * Emitted twice, at `layers.html` and at `layers/index.html`, with different
 * bases: the two coexist on GitHub Pages, and without the second a request for
 * `/layers/` would 404 with no directory listing.
 */
export const renderIndex = (store: PageStore, base: string, chromeSrc: string): string =>
  pageShell({
    title: "Layers",
    styles: LAYER_STYLES,
    base,
    active: "layers.html",
    chromeSrc,
    body: `<div class="page page-shell">
  <div class="crumb"><a href="${base}index.html">Home</a><span class="sep">/</span><span>Layers</span></div>
  ${docShell({
    body: renderIndexBody(store.layers, store.tools, {
      base,
      starsVerified: store.meta.stars_verified,
    }),
    articleClass: "detail layer-detail",
  })}
</div>`,
  });
