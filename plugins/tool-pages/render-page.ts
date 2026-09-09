import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { esc, renderDetailBody } from "../../src/detail";
import { layerSlug, type Tool } from "../../src/lib";
import { docShell, type PageStore, pageShell } from "../lib";

const stylesDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../src/styles");
const TOKENS_CSS = readFileSync(resolve(stylesDir, "tokens.css"), "utf8");
// The top bar's styles, read from the same file the bundled pages import, so
// the bar cannot look different here. Before this, tool pages carried a
// hand-written copy in CHROME_STYLE that had already drifted: 11px vertical
// padding against nav.css's 8px, no .brand .tag rule, no .theme-toggle rules
// at all, and none of the 44px touch-target block.
const NAV_CSS = readFileSync(resolve(stylesDir, "nav.css"), "utf8");
// The reset, page background, centred column and breadcrumb, shared with the
// layer pages. Was a template literal in this file, which is why the layer
// pages shipped without it.
const PAGE_CSS = readFileSync(resolve(stylesDir, "page.css"), "utf8");
const DOC_SHELL_CSS = readFileSync(resolve(stylesDir, "doc-shell.css"), "utf8");
// The detail content styles are shared with the comparison-page modal overlay;
// inline them here so the standalone page is self-contained.
const DETAIL_CSS = readFileSync(resolve(stylesDir, "detail.css"), "utf8");

export const renderPage = (
  tool: Tool,
  store: PageStore,
  slugByName: Map<string, string>,
  chromeSrc: string,
): string => {
  const body = renderDetailBody(tool, {
    slugByName,
    base: "../",
    starsVerified: store.meta.stars_verified,
  });
  // The layer segment links to its layer page, so a reader who arrives on a
  // tool can step up to the layer it competes in.
  const layerHref = `../layers/${layerSlug(tool.layer)}.html`;
  return pageShell({
    title: tool.tool,
    styles: `${TOKENS_CSS}${NAV_CSS}${PAGE_CSS}${DOC_SHELL_CSS}${DETAIL_CSS}`,
    base: "../",
    active: `tools/${slugByName.get(tool.tool)}.html`,
    chromeSrc,
    body: `<div class="page page-shell">
  <div class="crumb">
    <a href="../comparison.html">Comparison</a><span class="sep">/</span>
    <a href="${layerHref}">${esc(tool.layer)}</a><span class="sep">/</span><span>${esc(tool.tool)}</span>
  </div>
  ${docShell({ body, articleClass: "detail tool-detail" })}
</div>`,
  });
};
