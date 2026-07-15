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
- **Agents and tooling** read the same catalogue in an LLM-friendly shape: one canonical JSON store, a generated CSV
  export, and a flat [`src/public/llms.txt`](src/public/llms.txt) index (served at `/llms.txt`).

## Repository layout

```
context-radar/
  README.md                              This file
  CONTRIBUTING.md                        How to add or re-assess a tool
  data/
    context-reduction-tools.json         Canonical store ({meta, tools:[...]}), imported by the build
    star-history.csv                     Append-only star history (date,tool,repo,stars)
  templates/
    tool.yaml                            Authoring scaffold; fill and ingest with `mise run data:add`
  scripts/
    validate-data.ts                     Zod validator for the canonical store
    gen-schema.ts                        Regenerates the skill's JSON Schema from the Zod schema
    data-add.ts                          Ingests a filled template into the store
  src/                                   Site source (Vite + TypeScript)
    index.html                           Comparison table page (landing page)
    stack-builder.html                   MCP stack builder page
    comparison/                          Comparison table logic + styles
    stack-builder/                       Stack builder logic, styles, and curated dataset
    lib/schema.ts                        Zod schema: single source of truth for the record shape
    lib/columns.ts                       Canonical column order + CSV serialisation
    lib/data.ts                          Typed loader for the canonical JSON
    pages/                               methodology.md, glossary.md (rendered to HTML at build)
    public/llms.txt                      Flat, LLM-friendly index (served at /llms.txt)
  plugins/                               Vite build plugins (markdown pages, CSV export)
  docs/                                  Vite build OUTPUT (git-ignored; uploaded to Pages)
  plugin/                                Local tessl plugin (tracked)
    .tessl-plugin/plugin.json            tessl plugin manifest
    skills/project-comparison-fetch/
      SKILL.md                           The full fetch and assessment methodology (skill)
      schema/tool-record.schema.json     JSON Schema, generated from src/lib/schema.ts
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
mise run validate   # validate the canonical JSON store against the Zod schema
mise run data:add   # ingest a filled templates/*.yaml into the store (-- <file>.yaml)
mise run gen:schema # regenerate the skill's JSON Schema from the Zod schema
```

`mise run build` writes the static site to `docs/`, which is git-ignored: CI rebuilds it and uploads it to GitHub Pages
on every push to `main` (`.github/workflows/static.yml`).

## The data model

There is one canonical store: [`data/context-reduction-tools.json`](data/context-reduction-tools.json), shaped
`{meta, tools:[...]}`. Each tool has 14 string fields keyed by stable identifiers (`tool`, `githubUrl`, `layer`,
`whatItDoes`, `conflict`, `runtime`, `requirements`, `licence`, `stars`, `trend`, `activity`, `activityStatus`,
`verdict`, `decisionRule`); the snapshot date lives in `meta.stars_verified`.

The record shape is defined once, as a Zod schema in [`src/lib/schema.ts`](src/lib/schema.ts). From that single
definition come the TypeScript types the site compiles against (`z.infer`), the JSON Schema published beside the skill
([`tool-record.schema.json`](plugin/skills/project-comparison-fetch/schema/tool-record.schema.json), regenerated by
`mise run gen:schema`), and runtime validation (`mise run validate`). Zod runs at build/CI time only and is never
bundled into the browser.

To add or change a tool, fill [`templates/tool.yaml`](templates/tool.yaml) and run `mise run data:add -- <file>.yaml`;
it validates the record and upserts it into the store. The comparison table and the CSV download are both generated from
the JSON at build time.

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
