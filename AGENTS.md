# context-radar — Agent Guide

A comparison catalogue of tools that reduce context-window token consumption in coding agents, published as a Vite +
TypeScript site on GitHub Pages. The CSV is the source of truth; the JSON mirror is generated from it and imported
directly by the site build (the comparison table is a typed view of the same data).

## Commands

Toolchain and tasks are managed by [mise](https://mise.jdx.dev). Run `mise install` once to get the pinned toolchain and
install the git hooks, then `mise run install` for the JS dependencies. All build/lint/format operations go through mise
tasks; prefer them over calling `bun`/`vite`/`biome` directly.

- Dev server: `mise run dev`
- Build the site into docs/: `mise run build`
- Type-check TypeScript: `mise run typecheck`
- Lint (no changes): `mise run lint` (prettier, markdownlint, yamllint, actionlint, Biome)
- Format and auto-fix in place: `mise run fmt`
- Validate CSV/JSON consistency: `mise run validate`
- Security/compliance scan: `mise run security`
- Install local tessl skill plugin: `mise run skill`
- Install git hooks: `mise run hooks`

## Conventions

- British English. No em dashes. Dates as DD-MM-YYYY.
- The data contract lives with the skill that owns it, under `plugin/skills/project-comparison-fetch/`. Edit the schema
  and validator there.
- Edit `data/context-reduction-tools.csv` first; keep the JSON mirror in sync and run `mise run validate` before
  committing (the pre-commit hook enforces this).
- Never commit directly to `main`. Use feature branches and conventional commits.
- Do not invent charity names, donation figures, or prize copy; ratings are decision support, not adoption decisions.

## Key paths

- Source of truth: `data/context-reduction-tools.csv` (14 columns)
- JSON mirror (imported by the build): `data/context-reduction-tools.json`
- Data contract (TypeScript): `src/lib/types.ts` — keep in sync with the schema and validator
- Site source (Vite + TS): `src/` — `index.html` + `comparison/` (table), `stack-builder.html` + `stack-builder/`
  (builder, with its own curated `stack-data.ts`), `pages/` (markdown), `public/llms.txt`
- Build output (git-ignored): `docs/` — produced by `mise run build`, deployed to Pages
- Fetch/assessment methodology: `plugin/skills/project-comparison-fetch/SKILL.md`
- Data schema: `plugin/skills/project-comparison-fetch/schema/tool-record.schema.json`
- Validator: `plugin/skills/project-comparison-fetch/scripts/validate-data.mjs`

## CI

- `.github/workflows/static.yml` — build with Vite and deploy to GitHub Pages
- `.github/workflows/lint.yml` — lint, type-check, format check, data validation
- `.github/workflows/plumber.yml` — Plumber security/compliance scan

## How to add or re-assess a tool

See [CONTRIBUTING.md](CONTRIBUTING.md).
