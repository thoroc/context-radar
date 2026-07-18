# context-radar — Agent Guide

A comparison catalogue of tools that reduce context-window token consumption in coding agents, published as a Vite +
TypeScript site on GitHub Pages. There is one canonical store, `data/context-reduction-tools.json`, imported directly by
the site build; the record shape is defined once as a Zod schema (`src/lib/schema.ts`). The CSV download is generated
from the JSON.

## Design context

The design system and product intent are captured for design tooling (impeccable) and for you:

- `PRODUCT.md` (root): register (product), audience, purpose, voice, anti-references, and accessibility target (WCAG 2.1
  AA).
- `DESIGN.md` (root): the visual system, following the DESIGN.md spec. Frontmatter carries the token palette, type ramp,
  radius scale, and components; the body documents the rules (one violet accent, no literal colours, flat by default).
- `.impeccable/design.json`: generated sidecar for the detector and live panel. Do not hand-edit; refresh with
  `/impeccable document`.
- `.impeccable/config.json`: committed detector ignores (each with a reason). Local-only ignores go in
  `config.local.json` (git-ignored).

The impeccable detector reads `DESIGN.md` at the project root and runs in CI via `mise run design:check` (see CI below).
When you touch UI, keep colours on `var(--token)` and follow the DESIGN.md Do's and Don'ts.

## Commands

Toolchain and tasks are managed by [mise](https://mise.jdx.dev). Run `mise install` once to get the pinned toolchain and
install the git hooks, then `mise run install` for the JS dependencies. All build/lint/format operations go through mise
tasks; prefer them over calling `bun`/`vite`/`biome` directly.

- Dev server: `mise run dev`
- Build the site into docs/: `mise run build`
- Type-check TypeScript: `mise run typecheck`
- Run the unit tests: `mise run test` (vitest, collocated `*.test.ts`)
- Run tests with coverage + the ratchet floor: `mise run test:coverage`
- Lint (no changes): `mise run lint` (prettier, markdownlint, yamllint, actionlint, Biome)
- Format and auto-fix in place: `mise run fmt`
- Validate the canonical JSON against the Zod schema: `mise run validate`
- Ingest a filled `templates/*.yaml` into the store: `mise run data:add -- <file>.yaml`
- Regenerate the skill's JSON Schema from Zod: `mise run gen:schema`
- Regenerate `src/styles/icons.css` from the Tabler SVGs: `mise run gen:icons`
- Detect version/activity drift into `freshness-report.json`: `mise run freshness`
- Turn the freshness report into GitHub issues: `mise run freshness:sync`
- Re-verify source-code citations against upstream (fetch at pinned SHA, assert the quote): `mise run evidence:verify`
- Run the impeccable design detector against `DESIGN.md`: `mise run design:check`
- Install local tessl skill plugin: `mise run skill`
- Install git hooks: `mise run hooks`

## Conventions

- British English. No em dashes. Dates as DD-MM-YYYY.
- The data contract is the Zod schema in `src/lib/schema.ts`. It generates the TS types, the published JSON Schema
  (`mise run gen:schema`), and the validator. Edit the shape there, not in the JSON Schema.
- To add or change a tool, fill `templates/tool.yaml` and run `mise run data:add -- <file>.yaml`; then run
  `mise run validate` (the pre-commit hook enforces it). Hand-editing the JSON is fine if it still validates.
- Never commit directly to `main`. Use feature branches and conventional commits.
- Do not invent charity names, donation figures, or prize copy; ratings are decision support, not adoption decisions.

### Code shape

- **Arrow functions over named declarations.** Prefer `export const foo = (): T => ...` over `export function foo()`. A
  review-time convention; Biome has no rule that bans function declarations. Nested closures inside a function stay
  inside it; only top-level functions are subject to the rule below.
- **Kebab-case filenames.** Source files are kebab-case (`tool-slug.ts`, `get-conflicted-ids.ts`) even though the
  function they export keeps its camelCase identifier (`toolSlug`). Enforced by Biome's `useFilenamingConvention`, so CI
  fails on a camelCase filename.
- **One function per module, grouped into domains.** A module exports at most one function. Shared mutable state goes in
  a `state.ts` and shared constants/lookup tables in a dedicated const/type module (`constants.ts`, `labels.ts`,
  `types.ts`). The single-function modules are grouped into domain folders (`src/lib/present`, `src/comparison/render`,
  `plugins/tool-pages`, `scripts/freshness`, …), each with its own `index.ts` barrel. This holds across the whole
  codebase — `src/`, `plugins/`, and `scripts/`; the CLI scripts keep a thin entry file (the path package.json invokes)
  that parses argv and calls into its domain.
- **Barrel modules.** A folder exposes its public API through an `index.ts` barrel; consumers import from the folder
  (`../lib`, `../render`), not deep module paths. Page entry points (`main.ts`) stay thin: they wire events and call
  into their domains. The root `src/lib/index.ts` re-exports `schema` as `export type *` so Zod stays out of the browser
  bundle.
- **Collocated unit tests, one file per module.** Each module has its own `*.test.ts` beside it (e.g.
  `tool-slug.test.ts` next to `tool-slug.ts`) — not one test file per folder. Run with `vitest`. Whole-project coverage
  (`vitest.config.ts`, `coverage.all`) is ratcheted: `thresholds.autoUpdate` raises the floor as coverage climbs and CI
  (`mise run test:coverage`) fails on any drop. Target 85-90%; raise the floor by adding tests, then commit the bumped
  `vitest.config.ts`.

## Key paths

- Canonical store: `data/context-reduction-tools.json` (`{meta, tools:[]}`, stable-key records)
- Cross-tool recommendations: `data/tool-recommendations.json` (`{recommendations:[]}`, per-layer pick + alternatives).
  Cross-store checks in `scripts/validate/check-recommendations.ts` (pick holds `best`/`either-or`; every member carries
  confirmed source-code verdict evidence; per-layer disjoint). Rendered by `src/detail/recommendation-block.ts` (tool
  detail) and `src/stack-builder/selectors/layer-recommendation.ts` (stack-builder per-layer note). Authoring guide:
  `plugin/skills/project-comparison-fetch/references/recommendation-placement.md`
- Data contract (Zod): `src/lib/schema.ts` — the single source of truth for the record shape (typed: immutable `id`,
  enums, numbers, structured objects for runtime/licence/conflict/activity/activityStatus/verdict/extraClaims, plus an
  `evidence` block on verdict-carrying claims)
- Display reconstruction (shared by table + CSV): `src/lib/present/` (one function per module)
- Column order + CSV serialisation: `src/lib/csv/`
- Authoring template: `templates/tool.yaml`
- Data scripts: `scripts/validate-data.ts`, `scripts/gen-schema.ts`, `scripts/gen-icons.ts`, `scripts/data-add.ts`,
  `scripts/check-freshness.ts`, `scripts/sync-freshness-issue.ts`, `scripts/verify-evidence.ts` (thin entry over the
  `scripts/evidence-verify/` domain)
- Site source (Vite + TS): `src/` — `index.html` + `landing/` (landing page), `comparison.html` + `comparison/` (summary
  table whose tool links open the detail as a modal overlay), `stack-builder.html` + `stack-builder/` (builder, with its
  own curated `stack-data.ts`), `lib/` (schema + present/csv/data/dom domains), `detail/` (shared tool-detail renderer),
  `styles/` (shared tokens/nav/modal/detail CSS), `pages/` (markdown, shown as modal overlays with an HTML fallback),
  `public/llms.txt`
- Tool detail is rendered once, in `src/detail/` (`renderDetailBody`): the `plugins/tool-pages/` build plugin wraps it
  in page chrome to emit the standalone `/tools/<slug>.html` pages, and the comparison page renders it into the shared
  modal overlay (`toolFragments`) so a tool opens in place like Methodology/Glossary; the standalone pages remain as the
  no-JS fallback and direct-link target. Styles live in `src/styles/detail.css`, scoped under `.tool-detail`. The
  comparison links, the generated filenames, and the overlay route keys all share `toolSlug` (in
  `lib/present/tool-slug.ts`)
- Build output (git-ignored): `docs/` — produced by `mise run build`, deployed to Pages
- Fetch/assessment methodology: `plugin/skills/project-comparison-fetch/SKILL.md` (entry point), with deep-dive
  `references/` and a scenario `evals/` suite alongside it
- Published JSON Schema (generated from Zod): `plugin/skills/project-comparison-fetch/schema/tool-record.schema.json`

## CI

- `.github/workflows/static.yml` — build with Vite and deploy to GitHub Pages
- `.github/workflows/lint.yml` — lint, type-check, format check, data validation
- `.github/workflows/plumber.yml` — Plumber security/compliance scan
- `.github/workflows/freshness.yml` — weekly (and on-demand) version/activity drift check; opens one issue per drifting
  tool
- `.github/workflows/evidence.yml` — re-verifies source-code citations against upstream (fetch at pinned SHA, assert the
  quote) on data/schema changes and weekly; hard-fails on a mismatch, soft-warns on an unreachable source

## How to add or re-assess a tool

See [CONTRIBUTING.md](CONTRIBUTING.md).
