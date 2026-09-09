import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderTopbar } from "../../src/lib/chrome";
import { renderBody } from "./render-body";
import type { MarkdownPage } from "./types";

const stylesDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../src/styles");
const TOKENS_CSS = readFileSync(resolve(stylesDir, "tokens.css"), "utf8");
const NAV_CSS = readFileSync(resolve(stylesDir, "nav.css"), "utf8");

const PAGE_STYLE = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:15px;
  line-height:1.65;background:var(--bg2);color:var(--text);-webkit-font-smoothing:antialiased}
main{max-width:760px;margin:32px auto;background:var(--bg);border:1px solid var(--border);border-radius:14px;
  padding:32px 40px}
@media (max-width:720px){main{margin:20px 16px}}
.backlink{font-size:13px;margin-bottom:20px}
a{color:var(--accent)}
h1,h2,h3{line-height:1.25;margin:1.4em 0 .5em;font-weight:650;letter-spacing:-.01em}
h1{font-size:26px;margin-top:0}h2{font-size:20px}h3{font-size:16px}
p,ul,ol,table,blockquote,pre{margin:0 0 1em}
ul,ol{padding-left:1.4em}li{margin:.25em 0}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em;
  background:var(--bg3);padding:1px 5px;border-radius:3px}
pre{background:var(--bg3);padding:12px 14px;border-radius:8px;overflow-x:auto}
pre code{background:none;padding:0}
blockquote{border-left:3px solid var(--border2);padding-left:14px;color:var(--text2)}
table{border-collapse:collapse;width:100%;display:block;overflow-x:auto}
th,td{border:1px solid var(--border);padding:6px 10px;text-align:left;font-size:14px}
th{background:var(--bg3)}
`;

/**
 * Full standalone HTML page. Reached directly, by a no-JS visitor, or from a
 * generated tool page; the three bundled entries open these as modal overlays
 * instead (see wire-page-modals), which Phase 3's document shell has to account
 * for.
 *
 * These two pages had no top bar at all until now, so a reader who arrived here
 * had no way back into the site except the one backlink to the comparison
 * table.
 */
export const renderPage = (page: MarkdownPage, chromeSrc: string): string => {
  const body = renderBody(page);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${page.title}</title>
<style>${TOKENS_CSS}${NAV_CSS}${PAGE_STYLE}</style>
</head>
<body>
    ${renderTopbar({ base: "./", active: page.route })}
<main>
<p class="backlink"><a href="./comparison.html">&larr; Back to the comparison table</a></p>
${body}
</main>
<script type="module" src="${chromeSrc}"></script>
</body>
</html>
`;
};
