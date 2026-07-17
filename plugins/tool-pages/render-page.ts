import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { esc, renderDetailBody } from "../../src/detail";
import type { Tool } from "../../src/lib";
import type { Store } from "./types";

const stylesDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../src/styles");
const TOKENS_CSS = readFileSync(resolve(stylesDir, "tokens.css"), "utf8");
// The detail content styles are shared with the comparison-page modal overlay;
// inline them here so the standalone page is self-contained.
const DETAIL_CSS = readFileSync(resolve(stylesDir, "detail.css"), "utf8");

// Page chrome only (reset, top bar, breadcrumb). The content styles live in
// detail.css above, scoped under `.tool-detail`.
const CHROME_STYLE = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--bg2);color:var(--text);font-size:14px;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
.topbar{position:sticky;top:0;z-index:50;background:var(--bg);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:18px;padding:11px 24px;flex-wrap:wrap}
.brand .mark{font-size:15px;font-weight:650;letter-spacing:-.01em;color:var(--text)}
.brand .mark .d{color:var(--accent)}
nav{display:flex;gap:4px;margin-left:4px;flex-wrap:wrap}
nav a{font-size:12.5px;padding:5px 11px;border-radius:7px;color:var(--text2);font-weight:500}
nav a:hover{background:var(--bg3);color:var(--text);text-decoration:none}
nav a.active{background:var(--accent-bg);color:var(--accent)}
.page{max-width:980px;margin:0 auto;padding:22px 24px 80px}
.crumb{font-size:12px;color:var(--text3);margin-bottom:18px;display:flex;gap:7px;align-items:center;flex-wrap:wrap}
.crumb a{color:var(--text2)}.crumb .sep{color:var(--border2)}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:4px}
`;

export const renderPage = (tool: Tool, store: Store, slugByName: Map<string, string>): string => {
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
<style>${TOKENS_CSS}${CHROME_STYLE}${DETAIL_CSS}</style>
</head>
<body>
<div class="topbar">
  <a class="brand" href="../index.html"><span class="mark">Context Radar<span class="d">.</span></span></a>
  <nav>
    <a href="../index.html">Home</a>
    <a href="../comparison.html">Comparison</a>
    <a href="../stack-builder.html">Stack builder</a>
    <a href="../methodology.html">Methodology</a>
    <a href="../glossary.html">Glossary</a>
  </nav>
</div>
<div class="page">
  <div class="crumb">
    <a href="../comparison.html">Comparison</a><span class="sep">/</span>
    <span>${esc(tool.layer)}</span><span class="sep">/</span><span>${esc(tool.tool)}</span>
  </div>
  <div class="tool-detail">${body}</div>
</div>
</body>
</html>
`;
};
