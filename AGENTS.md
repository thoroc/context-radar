# context-radar — Agent Guide

A docs-only comparison catalogue of tools that reduce context-window token consumption in coding agents. The CSV is the
source of truth; the JSON mirror and HTML table are derived from it.

## Commands

Toolchain and tasks are managed by [mise](https://mise.jdx.dev). Run `mise install` once to get the pinned toolchain and
install the git hooks.

- Lint (no changes): `mise run lint`
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
- JSON mirror: `data/context-reduction-tools.json`
- LLM-friendly index: `docs/llms.txt`
- GitHub Pages source: `docs/` (`index.html`, `stack-builder.html`, `methodology.md`, `glossary.md`)
- Fetch/assessment methodology: `plugin/skills/project-comparison-fetch/SKILL.md`
- Data schema: `plugin/skills/project-comparison-fetch/schema/tool-record.schema.json`
- Validator: `plugin/skills/project-comparison-fetch/scripts/validate-data.mjs`

## CI

- `.github/workflows/lint.yml` — lint, format check, data validation
- `.github/workflows/plumber.yml` — Plumber security/compliance scan

## How to add or re-assess a tool

See [CONTRIBUTING.md](CONTRIBUTING.md).
