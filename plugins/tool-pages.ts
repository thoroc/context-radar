import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { formatDisplayDate } from "../src/lib/columns";
import {
  conflictClass,
  conflictText,
  DECISION_LABEL,
  LANG_BADGE,
  starsText,
  statusText,
  toolSlug,
  trendText,
  verdictClass,
} from "../src/lib/present";
import type { Tool } from "../src/lib/schema";

export interface ToolPagesOptions {
  /** Absolute path to the canonical JSON store. */
  dataPath: string;
  /** Output directory (relative to the site root) the pages are emitted into. */
  outDir?: string;
}

interface Store {
  meta: { stars_verified: string };
  tools: Tool[];
}

const here = dirname(fileURLToPath(import.meta.url));
const TOKENS_CSS = readFileSync(resolve(here, "../src/styles/tokens.css"), "utf8");

// Non-permissive licence identifiers that get a warning treatment, matching the
// comparison table.
const LICENCE_WARN = new Set([
  "ELv2",
  "AGPL-3",
  "AGPL-3.0",
  "PolyForm Noncommercial",
  "PolyForm NC",
  "Source-available (commercial licence for distribution)",
  "Paid (commercial)",
]);

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function licenceWarns(licence: Tool["licence"]): boolean {
  return Boolean(licence.warning) || LICENCE_WARN.has(licence.spdx);
}

function runtimeChips(runtime: Tool["runtime"]): string {
  const named = runtime.languages.filter((l) => l !== "none");
  if (!named.length) return `<span class="rt">${esc(runtime.detail ?? "—")}</span>`;
  return named.map((l) => `<span class="rt">${esc(LANG_BADGE[l][1])}</span>`).join(" ");
}

function requirementsBlock(requirements: string): string {
  const warn = requirements.trimStart().startsWith("⚠");
  const cls = warn ? "req-warn" : "req-ok";
  const mark = warn ? "⚠" : "✓";
  return `<div class="${cls}">${mark} ${esc(requirements)}</div>`;
}

function activityParagraph(tool: Tool): string {
  const a = tool.activity;
  const parts: string[] = [];
  if (a.notes) parts.push(esc(a.notes));
  const facts: string[] = [];
  if (typeof a.contributors === "number") facts.push(`${a.contributors} contributors`);
  if (typeof a.releaseCount === "number") facts.push(`${a.releaseCount} releases`);
  if (a.latestVersion) facts.push(`latest ${esc(a.latestVersion)}`);
  if (a.releasedOn) facts.push(`released ${esc(a.releasedOn)}`);
  if (a.corroboration) facts.push(`corroborated via ${esc(a.corroboration)}`);
  if (facts.length) parts.push(facts.join(", "));
  return parts.length ? parts.map((p) => `<p>${p}</p>`).join("") : "<p>No activity notes.</p>";
}

function conflictBlock(tool: Tool, slugByName: Map<string, string>): string {
  const severity = tool.conflict.severity;
  if (severity === "none" && !tool.conflict.note) {
    return '<p class="conf-none">No known conflicts or overlap.</p>';
  }
  const links = tool.conflict.projects
    .map((name) => {
      const slug = slugByName.get(name);
      return slug
        ? `<a href="../tools/${slug}.html">${esc(name)}</a>`
        : `<span>${esc(name)}</span>`;
    })
    .join("");
  return `<div class="conf ${conflictClass(severity)}">
      <div class="conf-sev">${esc(severity === "none" ? "Note" : severity.replace("-", " / "))}</div>
      <p>${esc(conflictText(tool.conflict))}</p>
      ${links ? `<div class="conf-tools">${links}</div>` : ""}
    </div>`;
}

const DETAIL_STYLE = `
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
.head{display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap;margin-bottom:6px}
.head h1{font-size:30px;font-weight:680;letter-spacing:-.02em}
.verdict{display:inline-block;font-size:12px;font-weight:700;padding:5px 13px;border-radius:20px;white-space:nowrap}
.v-best{background:var(--accent-bg);color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent-border)}
.v-add{background:var(--green-bg);color:var(--green)}
.v-cond{background:var(--amber-bg);color:var(--amber)}
.v-either{background:var(--amber-bg);color:var(--amber);box-shadow:inset 0 0 0 1px var(--dot-stable)}
.v-watch{background:var(--gray-bg);color:var(--gray)}
.v-drop{background:var(--red-bg);color:var(--red)}
.headsub{font-size:13px;color:var(--text2);margin-bottom:26px}
.headsub .layer{color:var(--accent);font-weight:600}
.cols{display:grid;grid-template-columns:1fr 268px;gap:34px;align-items:start}
section{margin-bottom:26px}
section h2{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);margin-bottom:9px}
section p{color:var(--text)}
.lede{font-size:16px;line-height:1.6}
.callout{border:1px solid var(--accent-border);background:var(--accent-bg);border-radius:12px;padding:16px 18px}
.callout .verdict{margin-bottom:10px}
.callout .rationale{font-size:15px;font-weight:600;color:var(--text)}
.rule-box{background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:15px 17px;color:var(--text2)}
.conf{border-radius:12px;padding:15px 17px;border:1px solid var(--border)}
.conf.conf-hard{background:var(--red-bg);border-color:var(--red)}
.conf.conf-soft{background:var(--amber-bg);border-color:var(--dot-stable)}
.conf-sev{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:7px;color:var(--text2)}
.conf.conf-hard .conf-sev{color:var(--red)}.conf.conf-soft .conf-sev{color:var(--amber)}
.conf p{margin-bottom:11px}
.conf-tools{display:flex;gap:7px;flex-wrap:wrap}
.conf-tools a,.conf-tools span{font-size:12px;font-weight:600;background:var(--bg);border:1px solid var(--border2);border-radius:7px;padding:4px 10px;color:var(--text)}
.conf-tools a:hover{border-color:var(--accent-border);color:var(--accent);text-decoration:none}
.conf-none{color:var(--text3)}
.req-ok{font-size:13px;color:var(--green);background:var(--green-bg);border-radius:9px;padding:10px 14px;font-weight:500}
.req-warn{font-size:13px;color:var(--amber);background:var(--amber-bg);border-radius:9px;padding:10px 14px;font-weight:500}
.facts{background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:6px 18px 14px;position:sticky;top:78px}
.facts .row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)}
.facts .row:last-of-type{border-bottom:none}
.facts .k{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--text3);font-weight:600}
.facts .v{font-size:13px;color:var(--text);font-weight:500;text-align:right;font-variant-numeric:tabular-nums}
.rt{font-size:11px;color:var(--text2);background:var(--bg3);border-radius:6px;padding:3px 9px;font-weight:600}
.lic-warn{color:var(--amber);font-weight:700}
.act{display:inline-flex;align-items:center;gap:7px}
.act .dot{width:9px;height:9px;border-radius:50%}
.dot-active{background:var(--dot-active)}.dot-stable{background:var(--dot-stable)}.dot-slowing{background:var(--dot-slowing)}.dot-early{background:var(--dot-early)}.dot-dormant{background:var(--dot-dormant)}.dot-none{background:var(--dot-dormant)}
.trend-up{color:var(--dot-active);font-weight:600}.trend-down{color:var(--red);font-weight:600}.trend-flat{color:var(--text3)}
.facts .actions{display:flex;flex-direction:column;gap:8px;margin-top:15px}
.btn{display:flex;align-items:center;justify-content:center;gap:7px;font-size:13px;font-weight:600;padding:9px 12px;border-radius:9px;border:1px solid var(--border2);color:var(--text)}
.btn:hover{background:var(--bg3);text-decoration:none}
.btn.accent{border-color:var(--accent-border);color:var(--accent)}.btn.accent:hover{background:var(--accent-bg)}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:4px}
@media(max-width:820px){.cols{grid-template-columns:1fr}.facts{position:static}.head h1{font-size:25px}}
`;

function trendCell(trend: number | null): string {
  if (trend === null) return "";
  const cls = trend > 0 ? "trend-up" : trend < 0 ? "trend-down" : "trend-flat";
  return ` <span class="${cls}">${esc(trendText(trend))}</span>`;
}

function renderPage(tool: Tool, store: Store, slugByName: Map<string, string>): string {
  const verified = formatDisplayDate(store.meta.stars_verified);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(tool.tool)} — Context Radar</title>
<style>${TOKENS_CSS}${DETAIL_STYLE}</style>
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
  <div class="head">
    <h1>${esc(tool.tool)}</h1>
    <span class="verdict ${verdictClass(tool.verdict.decision)}">${esc(DECISION_LABEL[tool.verdict.decision])}</span>
  </div>
  <p class="headsub"><span class="layer">${esc(tool.layer)}</span></p>
  <div class="cols">
    <div class="main">
      <section><h2>What it does</h2><p class="lede">${esc(tool.whatItDoes)}</p></section>
      <section><h2>Verdict</h2><div class="callout"><span class="verdict ${verdictClass(tool.verdict.decision)}">${esc(DECISION_LABEL[tool.verdict.decision])}</span>${tool.verdict.rationale ? `<p class="rationale">${esc(tool.verdict.rationale)}</p>` : ""}</div></section>
      <section><h2>Decision rule</h2><div class="rule-box">${esc(tool.decisionRule)}</div></section>
      <section><h2>Conflicts &amp; overlap</h2>${conflictBlock(tool, slugByName)}</section>
      <section><h2>Requirements</h2>${requirementsBlock(tool.requirements)}</section>
      <section><h2>Activity</h2>${activityParagraph(tool)}</section>
    </div>
    <aside>
      <div class="facts">
        <div class="row"><span class="k">Layer</span><span class="v">${esc(tool.layer)}</span></div>
        <div class="row"><span class="k">Runtime</span><span class="v">${runtimeChips(tool.runtime)}</span></div>
        <div class="row"><span class="k">Licence</span><span class="v ${licenceWarns(tool.licence) ? "lic-warn" : ""}">${esc(tool.licence.spdx)}</span></div>
        <div class="row"><span class="k">Stars</span><span class="v">${esc(starsText(tool.stars))}${trendCell(tool.trend)}</span></div>
        <div class="row"><span class="k">Activity</span><span class="v"><span class="act"><span class="dot dot-${tool.activityStatus.band}"></span>${esc(statusText(tool.activityStatus).replace(/^[^ ]+ /, ""))}</span></span></div>
        <div class="row"><span class="k">Verified</span><span class="v">${esc(verified)}</span></div>
        <div class="actions">
          <a class="btn accent" href="${esc(tool.githubUrl)}" target="_blank" rel="noopener">View on GitHub ↗</a>
          <a class="btn" href="../stack-builder.html">Open stack builder</a>
        </div>
      </div>
    </aside>
  </div>
</div>
</body>
</html>
`;
}

function loadStore(dataPath: string): { store: Store; slugByName: Map<string, string> } {
  const store = JSON.parse(readFileSync(dataPath, "utf8")) as Store;
  const slugByName = new Map<string, string>();
  const used = new Map<string, string>();
  for (const tool of store.tools) {
    const slug = toolSlug(tool.tool);
    const clash = used.get(slug);
    if (clash)
      throw new Error(`Tool slug collision: "${tool.tool}" and "${clash}" both map to "${slug}"`);
    used.set(slug, tool.tool);
    slugByName.set(tool.tool, slug);
  }
  return { store, slugByName };
}

function requestSlug(url: string | undefined, outDir: string): string | null {
  const path = (url ?? "").split("?")[0].replace(/^\//, "");
  const prefix = `${outDir}/`;
  if (!path.startsWith(prefix) || !path.endsWith(".html")) return null;
  return path.slice(prefix.length, -".html".length);
}

/**
 * Generates one standalone detail page per tool from the canonical JSON store:
 * served on the fly during `vite dev`, emitted into the build output at
 * `vite build`. The JSON is the single source of truth; each page is a lossless
 * view of one record, reusing the shared presentation helpers.
 */
export function toolPages(options: ToolPagesOptions): Plugin {
  const outDir = options.outDir ?? "tools";
  return {
    name: "context-radar:tool-pages",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const slug = requestSlug(req.url, outDir);
        if (slug === null) {
          next();
          return;
        }
        const { store, slugByName } = loadStore(options.dataPath);
        const tool = store.tools.find((t) => slugByName.get(t.tool) === slug);
        if (!tool) {
          next();
          return;
        }
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(renderPage(tool, store, slugByName));
      });
    },
    generateBundle() {
      const { store, slugByName } = loadStore(options.dataPath);
      for (const tool of store.tools) {
        this.emitFile({
          type: "asset",
          fileName: `${outDir}/${slugByName.get(tool.tool)}.html`,
          source: renderPage(tool, store, slugByName),
        });
      }
    },
  };
}
