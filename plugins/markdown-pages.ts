import { readFileSync } from "node:fs";
import MarkdownIt from "markdown-it";
import type { Plugin } from "vite";

export interface MarkdownPage {
  /** Absolute path to the source `.md` file. */
  source: string;
  /** Output filename served at the site root, e.g. `methodology.html`. */
  route: string;
  /** Document title. */
  title: string;
}

export interface MarkdownPagesOptions {
  pages: MarkdownPage[];
}

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

const PAGE_STYLE = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:15px;
  line-height:1.65;background:#f5f5f5;color:#111;padding:32px 20px}
main{max-width:760px;margin:0 auto;background:#fff;border:1px solid #e0e0e0;border-radius:8px;
  padding:32px 40px}
.backlink{font-size:13px;margin-bottom:20px}
a{color:#0066cc}
h1,h2,h3{line-height:1.25;margin:1.4em 0 .5em;font-weight:600}
h1{font-size:26px;margin-top:0}h2{font-size:20px}h3{font-size:16px}
p,ul,ol,table,blockquote,pre{margin:0 0 1em}
ul,ol{padding-left:1.4em}li{margin:.25em 0}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em;
  background:#f0f0f0;padding:1px 5px;border-radius:3px}
pre{background:#f0f0f0;padding:12px 14px;border-radius:6px;overflow-x:auto}
pre code{background:none;padding:0}
blockquote{border-left:3px solid #ddd;padding-left:14px;color:#555}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid #ddd;padding:6px 10px;text-align:left;font-size:14px}
th{background:#f0f0f0}
@media(prefers-color-scheme:dark){
  body{background:#111;color:#e5e5e5}
  main{background:#1a1a1a;border-color:#333}
  a{color:#60a5fa}
  code,pre{background:#242424}
  blockquote{border-left-color:#444;color:#aaa}
  th,td{border-color:#333}th{background:#242424}
}
`;

/** Strips a leading YAML front-matter block (`---` ... `---`) if present. */
function stripFrontMatter(source: string): string {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

/** Rendered inner HTML of the markdown, without the standalone-page chrome. */
function renderBody(page: MarkdownPage): string {
  return md.render(stripFrontMatter(readFileSync(page.source, "utf8")));
}

/** Full standalone HTML page, kept as a no-JS fallback for the modal overlay. */
function renderPage(page: MarkdownPage): string {
  const body = renderBody(page);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${page.title}</title>
<style>${PAGE_STYLE}</style>
</head>
<body>
<main>
<p class="backlink"><a href="./">&larr; Back to the comparison table</a></p>
${body}
</main>
</body>
</html>
`;
}

// Virtual module the site entries import to render Methodology/Glossary as modal
// overlays instead of navigating away: `import pages from "virtual:context-radar-pages"`.
const VIRTUAL_ID = "virtual:context-radar-pages";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

/** Map of route -> { title, html } for the in-page modal overlays. */
function pageFragments(pages: MarkdownPage[]): Record<string, { title: string; html: string }> {
  const out: Record<string, { title: string; html: string }> = {};
  for (const page of pages) {
    out[page.route] = { title: page.title, html: renderBody(page) };
  }
  return out;
}

function requestPath(url: string | undefined): string {
  return (url ?? "").split("?")[0].replace(/^\//, "");
}

/**
 * Renders a set of markdown files to standalone static HTML pages: served on the
 * fly during `vite dev`, emitted into the build output at `vite build`. Replaces
 * the previous Jekyll pipeline.
 */
export function markdownPages(options: MarkdownPagesOptions): Plugin {
  return {
    name: "context-radar:markdown-pages",
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;
      return `export default ${JSON.stringify(pageFragments(options.pages))};`;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const page = options.pages.find((p) => p.route === requestPath(req.url));
        if (!page) {
          next();
          return;
        }
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(renderPage(page));
      });
    },
    generateBundle() {
      for (const page of options.pages) {
        this.emitFile({ type: "asset", fileName: page.route, source: renderPage(page) });
      }
    },
  };
}
