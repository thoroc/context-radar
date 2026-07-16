# context-radar — Agent Guide

A comparison catalogue of tools that reduce context-window token consumption in coding agents, published as a Vite +
TypeScript site on GitHub Pages. There is one canonical store, `data/context-reduction-tools.json`, imported directly by
the site build; the record shape is defined once as a Zod schema (`src/lib/schema.ts`). The CSV download is generated
from the JSON.

## Commands

Toolchain and tasks are managed by [mise](https://mise.jdx.dev). Run `mise install` once to get the pinned toolchain and
install the git hooks, then `mise run install` for the JS dependencies. All build/lint/format operations go through mise
tasks; prefer them over calling `bun`/`vite`/`biome` directly.

- Dev server: `mise run dev`
- Build the site into docs/: `mise run build`
- Type-check TypeScript: `mise run typecheck`
- Run the unit tests: `mise run test` (bun test, collocated `*.test.ts`)
- Lint (no changes): `mise run lint` (prettier, markdownlint, yamllint, actionlint, Biome)
- Format and auto-fix in place: `mise run fmt`
- Validate the canonical JSON against the Zod schema: `mise run validate`
- Ingest a filled `templates/*.yaml` into the store: `mise run data:add -- <file>.yaml`
- Regenerate the skill's JSON Schema from Zod: `mise run gen:schema`
- Security/compliance scan: `mise run security`
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

- **Arrow functions over named declarations.** Prefer `export const foo = (): T => ...` over `export function foo()`.
  This is a review-time convention; Biome has no rule that bans function declarations, so keep an eye on it in review.
  Rollout is incremental: `src/lib/` is converted; other files follow as they are touched.
- **Barrel modules.** A folder exposes its public API through an `index.ts` barrel when that API is imported from
  elsewhere; consumers import from the folder (`../lib`), not deep paths (`../lib/present`). `src/lib/index.ts` is the
  worked example. Page folders (`landing/`, `comparison/`, `stack-builder/`) are Vite entry points that nothing imports,
  so they have no barrel.
- **Collocated unit tests.** Put `*.test.ts` next to the module it exercises (e.g. `src/lib/present.test.ts`), run with
  `bun test`. Test pure logic; DOM-bound modules (`modal.ts`) are out of the unit slice until a DOM harness is added.

## Key paths

- Canonical store: `data/context-reduction-tools.json` (`{meta, tools:[]}`, stable-key records)
- Data contract (Zod): `src/lib/schema.ts` — the single source of truth for the record shape (typed: enums, numbers,
  structured objects for runtime/licence/conflict/activity/activityStatus/verdict)
- Display reconstruction (shared by table + CSV): `src/lib/present.ts`
- Column order + CSV serialisation: `src/lib/columns.ts`
- Authoring template: `templates/tool.yaml`
- Data scripts: `scripts/validate-data.ts`, `scripts/gen-schema.ts`, `scripts/data-add.ts`
- Site source (Vite + TS): `src/` — `index.html` + `landing/` (landing page), `comparison.html` + `comparison/` (summary
  table linking to detail pages), `stack-builder.html` + `stack-builder/` (builder, with its own curated
  `stack-data.ts`), `lib/` (schema/columns/data/modal), `styles/` (shared tokens/nav/modal CSS), `pages/` (markdown,
  shown as modal overlays with an HTML fallback), `public/llms.txt`
- Per-tool detail pages are generated at build from the JSON by `plugins/tool-pages.ts`, reusing `lib/present.ts`; the
  comparison links and the generated filenames share `toolSlug` (in `lib/present.ts`)
- Build output (git-ignored): `docs/` — produced by `mise run build`, deployed to Pages
- Fetch/assessment methodology: `plugin/skills/project-comparison-fetch/SKILL.md`
- Published JSON Schema (generated from Zod): `plugin/skills/project-comparison-fetch/schema/tool-record.schema.json`

## CI

- `.github/workflows/static.yml` — build with Vite and deploy to GitHub Pages
- `.github/workflows/lint.yml` — lint, type-check, format check, data validation
- `.github/workflows/plumber.yml` — Plumber security/compliance scan

## How to add or re-assess a tool

See [CONTRIBUTING.md](CONTRIBUTING.md).
