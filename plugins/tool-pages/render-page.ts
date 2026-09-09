import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { esc, renderDetailBody } from "../../src/detail";
import type { Tool } from "../../src/lib";
import { renderTopbar } from "../../src/lib/chrome";
import type { Store } from "./types";

const stylesDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../src/styles");
const TOKENS_CSS = readFileSync(resolve(stylesDir, "tokens.css"), "utf8");
// The top bar's styles, read from the same file the bundled pages import, so
// the bar cannot look different here. Before this, tool pages carried a
// hand-written copy in CHROME_STYLE that had already drifted: 11px vertical
// padding against nav.css's 8px, no .brand .tag rule, no .theme-toggle rules
// at all, and none of the 44px touch-target block.
const NAV_CSS = readFileSync(resolve(stylesDir, "nav.css"), "utf8");
// The detail content styles are shared with the comparison-page modal overlay;
// inline them here so the standalone page is self-contained.
const DETAIL_CSS = readFileSync(resolve(stylesDir, "detail.css"), "utf8");

// Page-specific chrome only. The top bar comes from NAV_CSS above and the
// focus ring from tokens.css, so neither is restated here.
const CHROME_STYLE = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--bg2);color:var(--text);font-size:14px;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
.page{max-width:980px;margin:0 auto;padding:22px 24px 80px}
.crumb{font-size:12px;color:var(--text3);margin-bottom:18px;display:flex;gap:7px;align-items:center;flex-wrap:wrap}
.crumb a{color:var(--text2)}.crumb .sep{color:var(--border2)}
`;

export const renderPage = (
  tool: Tool,
  store: Store,
  slugByName: Map<string, string>,
  chromeSrc: string,
): string => {
  const body = renderDetailBody(tool, {
    slugByName,
    base: "../",
    starsVerified: store.meta.stars_verified,
  });
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(tool.tool)} — Context Radar</title>
<style>${TOKENS_CSS}${NAV_CSS}${CHROME_STYLE}${DETAIL_CSS}</style>
</head>
<body>
    ${renderTopbar({ base: "../", active: `tools/${slugByName.get(tool.tool)}.html` })}
<div class="page">
  <div class="crumb">
    <a href="../comparison.html">Comparison</a><span class="sep">/</span>
    <span>${esc(tool.layer)}</span><span class="sep">/</span><span>${esc(tool.tool)}</span>
  </div>
  <div class="tool-detail">${body}</div>
</div>
<script type="module" src="${chromeSrc}"></script>
</body>
</html>
`;
};
