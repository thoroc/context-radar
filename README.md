# context-radar

A comparison catalogue of tools that reduce **context-window token consumption** in Claude Code and comparable coding
agents (Codex, OpenCode, Cursor, Gemini CLI).

Every entry answers one question: **does this tool reduce what gets loaded into or generated within an agent's context
window, and how does it interact with everything else in the stack?** Tools are grouped by the layer they act on (shell
output, code navigation, agent memory, MCP definition tokens, and so on), rated with a verdict, and checked for
conflicts, above all the MCP tool-name collisions that break an agent's ability to route between two servers.

The catalogue currently tracks **79 tools**, last refreshed **15-07-2026**.

## Audience and outputs

- **Humans** browse the interactive comparison table and assemble a conflict-free stack on GitHub Pages.
- **Agents and tooling** read the same catalogue in an LLM-friendly shape: a CSV source of truth, a JSON mirror, and a
  flat [`src/public/llms.txt`](src/public/llms.txt) index (served at `/llms.txt`).

## Repository layout

```
context-radar/
  README.md                              This file
  CONTRIBUTING.md                        How to add or re-assess a tool
  data/
    context-reduction-tools.csv          Source of truth (14 columns, 79 rows)
    context-reduction-tools.json         JSON mirror ({meta, tools:[...]}), imported by the build
    star-history.csv                     Append-only star history (date,tool,repo,stars)
  src/                                   Site source (Vite + TypeScript)
    index.html                           Comparison table page (landing page)
    stack-builder.html                   MCP stack builder page
    comparison/                          Comparison table logic + styles
    stack-builder/                       Stack builder logic, styles, and curated dataset
    lib/                                 types.ts (data contract) and data.ts (JSON loader)
    pages/                               methodology.md, glossary.md (rendered to HTML at build)
    public/llms.txt                      Flat, LLM-friendly index (served at /llms.txt)
  plugins/                               Vite build plugins (markdown pages, asset copy)
  docs/                                  Vite build OUTPUT (git-ignored; uploaded to Pages)
  plugin/                                Local tessl plugin (tracked)
    .tessl-plugin/plugin.json            tessl plugin manifest
    skills/project-comparison-fetch/
      SKILL.md                           The full fetch and assessment methodology (skill)
      schema/tool-record.schema.json     JSON Schema for one tool record
      scripts/validate-data.mjs          CSV and JSON mirror consistency validator
  .github/workflows/
    static.yml                           CI: build the site with Vite and deploy to GitHub Pages
    lint.yml                             CI: lint, type-check, format check, data validation
    plumber.yml                          CI: Plumber CI/CD security and compliance scan
  vite.config.ts                         Vite config (MPA, base './', outputs to docs/)
  tsconfig.json                          TypeScript config
  biome.json                             Biome (TypeScript lint + format) config
  package.json                           Dependencies and scripts (Bun)
  mise.toml                              Toolchain and tasks (mise-en-place)
  hk.pkl                                 Git pre-commit hooks (hk)
  .plumber.yaml                          Plumber scan configuration
  .markdownlint.jsonc                    Markdown lint rules
  .yamllint                              YAML lint rules
  .prettierignore                        Files prettier must not format
  renovate.json                          Automated dependency updates (Renovate)
  tessl.json                             Local tessl plugin install manifest
  .mcp.json                              tessl MCP server config (Claude Code)
```

## Build and develop

The site is a [Vite](https://vite.dev) app in TypeScript, built and run with [Bun](https://bun.sh). The toolchain is
pinned with [mise](https://mise.jdx.dev).

All build, lint, and format operations go through mise tasks (defined in `mise.toml`).

```sh
mise install        # install the toolchain (Bun, Node, Biome, …) and wire git hooks
mise run install    # install JS dependencies from the lockfile
mise run dev        # Vite dev server (both pages, live reload)
mise run build      # type-check and build the static site into docs/
mise run lint       # prettier, markdownlint, yamllint, actionlint, and Biome (TypeScript)
mise run typecheck  # TypeScript type-check only
mise run fmt        # format everything in place (incl. TypeScript via Biome)
```

`mise run build` writes the static site to `docs/`, which is git-ignored: CI rebuilds it and uploads it to GitHub Pages
on every push to `main` (`.github/workflows/static.yml`).

## The data model

Each tool is one row with 14 fields: Tool, GitHub URL, Layer, What it does, Conflict / Overlap, Runtime, Requirements,
Licence, Stars, Trend, Activity, Activity Status, Verdict, and Decision Rule. The CSV is the source of truth; the JSON
mirror is generated from it and imported directly by the site build, so the comparison table is a typed view of the same
data. The JSON shape is a contract between the data and the build — see
[`tool-record.schema.json`](plugin/skills/project-comparison-fetch/schema/tool-record.schema.json) for the field
definitions and [`src/lib/types.ts`](src/lib/types.ts) for the TypeScript type the app compiles against.

### Verdicts

Best in class, Add, Add if you use [X], Either/or pick one, Watch (too early or unique but early), Reference only (not a
tool), and Drop. Full definitions are in [`src/pages/methodology.md`](src/pages/methodology.md) (served at
`/methodology.html`).

### Conflicts

- **Hard conflict:** two MCP servers expose the same or near-identical tool name, so an agent cannot route between them.
  Pick one.
- **Soft conflict:** redundant role or overlap. Running both wastes resources but does not break routing.

## Status and roadmap

The catalogue, the Vite + TypeScript site, the stack builder, and the fetch methodology are all in the repository. CI
builds the site and deploys it to GitHub Pages on every push to `main`.

1. **Now.** The comparison table renders from the JSON at build time, so a CSV/JSON update reshapes the site
   automatically on the next deploy.
2. **Next.** Append fresh star fetches to `star-history.csv` on a schedule so the trend line becomes meaningful.
   Reconcile the stack builder's curated dataset (`src/stack-builder/stack-data.ts`) with the main catalogue.
3. **Later.** Let an agent following the methodology draft new tool assessments for human review; because the JSON shape
   is a typed contract, generated and hand-written rows share one format.

---

_These ratings are decision support. A human should make and document any adoption decision that materially affects a
team or product._
