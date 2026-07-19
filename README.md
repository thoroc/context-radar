# context-radar

A comparison catalogue of tools that reduce **context-window token consumption** in Claude Code and comparable coding
agents (Codex, OpenCode, Cursor, Gemini CLI).

Every entry answers one question: **does this tool reduce what gets loaded into or generated within an agent's context
window, and how does it interact with everything else in the stack?** Tools are grouped by the layer they act on (shell
output, code navigation, agent memory, MCP definition tokens, and so on), rated with a verdict, and checked for
conflicts, above all the MCP tool-name collisions that break an agent's ability to route between two servers.

The catalogue currently tracks **81 tools**, last updated **17-07-2026** (star snapshot **15-07-2026**).

## Audience and outputs

- **Humans** browse the interactive comparison table (each tool opens its detail as a modal overlay, with a standalone
  page as the direct-link fallback) and assemble a conflict-free stack on GitHub Pages, reached from a landing page. The
  chrome carries a light/dark theme toggle, and the comparison table reflows into per-tool cards on narrow screens.
- **Agents and tooling** read the same catalogue in an LLM-friendly shape: one canonical JSON store, a generated CSV
  export, and a flat [`src/public/llms.txt`](src/public/llms.txt) index (served at `/llms.txt`).

## Repository layout

```
context-radar/
  README.md                              This file
  CONTRIBUTING.md                        How to add or re-assess a tool
  data/
    context-reduction-tools.json         Canonical store ({meta, tools:[...]}), imported by the build
    tool-recommendations.json            Cross-tool "use this, not that" recommendations per layer
    star-history.csv                     Append-only star history (date,tool,repo,stars)
  templates/
    tool.yaml                            Authoring scaffold; fill and ingest with `mise run data:add`
  scripts/                               Thin entry files over domain folders (validate/, freshness/, freshness-issue/, evidence-verify/)
    validate-data.ts                     Zod validator for the store + cross-store recommendation checks
    gen-schema.ts                        Regenerates the skill's JSON Schema from the Zod schema
    gen-icons.ts                         Regenerates src/styles/icons.css from the Tabler SVGs
    data-add.ts                          Ingests a filled template into the store
    check-freshness.ts                   Detects drift (upstream version vs recorded) + the evidence gap into freshness-report.json
    sync-freshness-issue.ts              Opens/updates one GitHub issue per drifting tool
    verify-evidence.ts                   Re-fetches each source-code citation at its SHA and asserts the quote matches
  src/                                   Site source (Vite + TypeScript)
    index.html                           Landing page (intro, tool cards, verdict legend)
    comparison.html                      Comparison table page (tool links open detail as a modal overlay)
    stack-builder.html                   MCP stack builder page
    landing/                             Landing page logic + styles
    comparison/                          Comparison table logic + styles
    stack-builder/                       Stack builder logic, styles, and curated dataset
    lib/index.ts                         Root barrel: the shared library's public surface (import from here)
    lib/schema.ts                        Zod schema: single source of truth for the record shape
    lib/present/                         Presentation helpers, one function per module (+ labels.ts, per-module *.test.ts)
    lib/csv/                             CSV column order + serialisation (+ csv.test.ts)
    lib/data/                            Typed loader for the canonical JSON
    lib/dom/                             Shared modal overlay + theme toggle (state + one function per module)
    detail/                              Shared tool-detail renderer (standalone pages + comparison overlay)
    styles/                              Shared CSS: design tokens, top nav, modal, detail (scoped .tool-detail)
    pages/                               methodology.md, glossary.md (modal overlays + HTML fallback)
    public/llms.txt                      Flat, LLM-friendly index (served at /llms.txt)
  plugins/                               Vite build plugins (markdown pages, per-tool pages, CSV export)
  docs/                                  Vite build OUTPUT (git-ignored; uploaded to Pages)
  plugin/                                Local tessl plugin (tracked)
    .tessl-plugin/plugin.json            tessl plugin manifest
    skills/project-comparison-fetch/
      SKILL.md                           Fetch and assessment methodology (entry point)
      references/                        Deep-dive references linked from SKILL.md (layer, verdict, evidence, conflicts, freshness)
      evals/                             Scenario-based eval suite for the skill
      schema/tool-record.schema.json     JSON Schema, generated from src/lib/schema.ts
  .github/workflows/
    static.yml                           CI: build the site with Vite and deploy to GitHub Pages
    lint.yml                             CI: lint, type-check, format check, data validation
    plumber.yml                          CI: Plumber CI/CD security and compliance scan
    evidence.yml                         CI: re-verify source-code citations against upstream at pinned SHAs
    ai-hygiene.yml                       CI: warn-only aislop (code slop) + ctxharness (doc drift) report + PR comment
    freshness.yml                        Scheduled: detect version/activity drift and open per-tool issues
  vite.config.ts                         Vite config (MPA, base './', outputs to docs/)
  vitest.config.ts                       Vitest config (whole-project coverage + ratchet floor)
  tsconfig.json                          TypeScript config
  biome.json                             Biome (TypeScript lint + format) config
  package.json                           Dependencies and scripts (Bun)
  mise.toml                              Toolchain and tasks (mise-en-place)
  hk.pkl                                 Git pre-commit hooks (hk): lint, validate, ctxharness, aislop
  .ctxharness.yml                        ctxharness assertions (agent-doc claims checked against the repo)
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
mise run test       # collocated unit tests (vitest)
mise run test:coverage  # tests + whole-project coverage; enforces the ratcheted floor
mise run fmt        # format everything in place (incl. TypeScript via Biome)
mise run validate   # validate the JSON store + the recommendations file against the Zod schema
mise run data:add   # ingest a filled templates/*.yaml into the store (-- <file>.yaml)
mise run evidence:verify  # re-fetch each source-code citation at its SHA and assert the quote matches
mise run design:check     # run the impeccable design detector against DESIGN.md
mise run gen:schema # regenerate the skill's JSON Schema from the Zod schema
mise run gen:icons  # regenerate src/styles/icons.css from the Tabler SVGs
mise run freshness  # detect version/activity drift + the evidence gap into freshness-report.json (git-ignored)
mise run docs:check # check the agent docs (CLAUDE.md/AGENTS.md) for drift against the repo (ctxharness)
mise run slop:check # aislop code-slop gate over the whole repo (slop:changes for changed files only)
```

`mise run build` writes the static site to `docs/`, which is git-ignored: CI rebuilds it and uploads it to GitHub Pages
on every push to `main` (`.github/workflows/static.yml`).

### Code-hygiene gates

Two agent-hygiene tools guard the repo:

- **aislop** flags code slop AI agents tend to leave behind (dead code, duplication, unsafe casts, swallowed errors,
  risky constructs). Pinned via mise.
- **ctxharness** detects drift between the agent docs (`CLAUDE.md` / `AGENTS.md`) and the repo (missing paths, stale
  versions, renamed scripts) using the assertions in `.ctxharness.yml`. Run via a pinned `npx`.

The pre-commit hook (`hk.pkl`) **blocks** on `ctxharness check` (doc drift) and `aislop ci --changes` (new slop in the
staged TypeScript). The `ai-hygiene.yml` workflow runs both as a **warn-only** report and posts a sticky PR comment, so
CI surfaces findings without failing the build; enforcement is local.

## The data model

There is one canonical store: [`data/context-reduction-tools.json`](data/context-reduction-tools.json), shaped
`{meta, tools:[...]}`. Each tool is a strongly typed record with an immutable `id` and stable identifier keys: enums
(`layer`, and the bands and decisions inside the objects below), numbers (`stars`, `trend`), and structured objects
(`runtime`, `licence`, `conflict`, `activity`, `activityStatus`, `verdict`, `extraClaims`) alongside the plain-text
`whatItDoes`, `requirements`, and `decisionRule`. Verdict-carrying claims can attach an `evidence` block (status plus
cited sources), and benchmark claims carry a `proofLedger`. The recorded upstream version lives in
`activity.latestVersion` with an ISO `activity.releasedOn`; the weekly freshness check compares it against upstream.
Free-text detail is preserved verbatim inside the objects so the table and CSV render losslessly. The snapshot date
lives in `meta.stars_verified`.

The record shape is defined once, as a Zod schema in [`src/lib/schema.ts`](src/lib/schema.ts). From that single
definition come the TypeScript types the site compiles against (`z.infer`), the JSON Schema published beside the skill
([`tool-record.schema.json`](plugin/skills/project-comparison-fetch/schema/tool-record.schema.json), regenerated by
`mise run gen:schema`), and runtime validation (`mise run validate`). Zod runs at build/CI time only and is never
bundled into the browser.

To add or change a tool, fill [`templates/tool.yaml`](templates/tool.yaml) and run `mise run data:add -- <file>.yaml`;
it validates the record and upserts it into the store. The comparison table, the per-tool detail pages, and the CSV
download are all generated from the JSON at build time.

### Evidence and source verification

Verdict-bearing claims carry cited `sources` in the record. A `source-code` citation must be a commit-SHA blob permalink
with a line anchor and a verbatim `quote`; `mise run evidence:verify` (CI: `evidence.yml`) re-fetches each one at its
SHA and fails if the quote is not there, so "verified against source" cannot be faked. `mise run freshness` also reports
the **evidence gap**: verdicts not yet backed by confirmed source-code evidence. The methodology is documented in the
skill's [`references/source-verification.md`](plugin/skills/project-comparison-fetch/references/source-verification.md).

### Cross-tool recommendations

[`data/tool-recommendations.json`](data/tool-recommendations.json) holds per-layer "use this, not that" recommendations:
one default **pick** plus **alternatives**, each gated by the condition under which it wins. A recommendation only
validates once its pick holds a `best`/`either-or` verdict and every member carries confirmed source-code evidence
(`scripts/validate/check-recommendations.ts`). They render on each tool's detail and as a per-layer "catalogue pick"
line in the stack builder; nothing is hand-duplicated. See the skill's
[`references/recommendation-placement.md`](plugin/skills/project-comparison-fetch/references/recommendation-placement.md).

### Verdicts

Best in class, Add, Add if you use [X], Either/or pick one, Watch (too early or unique but early), Reference only (not a
tool), and Drop. Full definitions are in [`src/pages/methodology.md`](src/pages/methodology.md) (served at
`/methodology.html`).

### Conflicts

- **Hard conflict:** two MCP servers expose the same or near-identical tool name, so an agent cannot route between them.
  Pick one.
- **Soft conflict:** redundant role or overlap. Running both wastes resources but does not break routing.

## Status and roadmap

The catalogue, the Vite + TypeScript site, the stack builder, the source-verified evidence layer, the cross-tool
recommendations, and the fetch methodology are all in the repository. CI builds the site and deploys it to GitHub Pages
on every push to `main`, and re-verifies every source-code citation against upstream (`evidence.yml`). A weekly
`freshness.yml` workflow checks each tool's recorded version and activity against upstream, reports the evidence gap,
and opens one GitHub issue per drifting tool.

1. **Now.** The comparison table renders from the JSON at build time, so a CSV/JSON update reshapes the site
   automatically on the next deploy. The freshness check flags drift weekly for human re-assessment.
2. **Next.** Append fresh star fetches to `star-history.csv` on a schedule so the trend line becomes meaningful.
   Reconcile the stack builder's curated dataset (`src/stack-builder/stack-data.ts`) with the main catalogue.
3. **Later.** Let an agent following the methodology draft new tool assessments for human review; because the JSON shape
   is a typed contract, generated and hand-written rows share one format.

---

_These ratings are decision support. A human should make and document any adoption decision that materially affects a
team or product._
