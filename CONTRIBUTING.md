# Contributing

context-radar grows one tool at a time. The methodology is strict because the whole value of the catalogue is that its
numbers and verdicts are trustworthy.

## Before you start

Read the methodology in
[`.agents/skills/project-comparison-fetch/SKILL.md`](.agents/skills/project-comparison-fetch/SKILL.md). It encodes
hard-won lessons (stale renders, org transfers, benchmark metric traps, MCP tool-name collisions) that are not obvious
from the data alone. A shorter summary is at [`docs/methodology.md`](docs/methodology.md).

## Local setup

The toolchain is pinned with [mise](https://mise.jdx.dev). From the repository root:

```sh
mise trust      # approve this project's mise.toml (first time only)
mise install    # install the toolchain AND wire up the git hooks (see below)
```

`mise install` installs hk, pkl, prettier, markdownlint-cli2, yamllint, and node. Its `postinstall` hook then runs
`hk install`, so the git hooks are set up in the same step. If you use `mise activate` in your shell, the `enter` hook
does this automatically when you `cd` into the project.

Format and lint the docs:

```sh
mise run fmt    # format markdown, YAML, HTML, and JSON in place
mise run lint   # check only, no changes
```

### Git hooks (hk)

Linting and formatting run automatically on commit via [hk](https://hk.jdx.dev), configured in `hk.pkl`. `mise install`
wires them up per repository for you (via the `postinstall` hook). No extra step is needed.

If you would rather install the hooks once per machine so every repo with an `hk.pkl` is covered, use the global install
instead:

```sh
hk install --global
```

Do not run both the global install and the per-repo one in the same repo: Git aggregates hook commands across scopes and
hk would fire twice. In a repo with the global install active, disable the local entries with
`git config --local hook.hk-pre-commit.enabled false`.

### The skill (tessl plugin)

The `project-comparison-fetch` skill lives under `.agents/` as a tessl plugin (`.agents/.tessl-plugin/plugin.json`). To
make it available to your coding agent from a local clone, install the tessl CLI (see [tessl.io](https://tessl.io)), run
`tessl login`, then install from the local path:

```sh
tessl install --global --agent claude-code "file:$PWD/.agents"
```

Other agents are supported in place of `claude-code`: `cursor`, `gemini`, `codex`, `copilot`, `copilot-vscode`. After
editing the skill, re-sync the install:

```sh
tessl update --global pantheon-ai/context-radar
```

Publishing the plugin to the tessl registry (so workspace members can install it by name without cloning) is optional
and not done yet.

## Continuous integration

Two GitHub Actions workflows run on push to `main` and on pull requests. Third-party actions are pinned by commit SHA.

- `.github/workflows/lint.yml` sets up the mise toolchain and runs `mise run lint` (prettier, markdownlint, yamllint,
  and actionlint via hk) followed by `mise run validate` (the CSV and JSON mirror must agree).
- `.github/workflows/plumber.yml` runs [Plumber](https://getplumber.io), which scans the CI/CD workflows for security
  and compliance issues (exposed secrets, unpinned actions, over-broad permissions, dangerous triggers) and grades them.
  `score-push` is off, so nothing about this repository is made public.

Run the same checks locally:

```sh
mise run lint       # prettier, markdownlint, yamllint, actionlint
mise run validate   # CSV and JSON mirror consistency
mise run security   # Plumber scan (needs a git remote; use the CI job otherwise)
```

The Plumber CLI needs a git remote to resolve the owner and repository. Until this repo has a remote, run the scan
through the CI workflow rather than locally.

## Adding or re-assessing a tool

1. **Check scope.** Is it a context-reduction tool that works with a coding agent, and not a full runtime or a generic
   library? If not, say why and stop.
2. **Fetch and verify.** Follow the fetch protocol: fetch the repo page, cross-verify stars with a search, check
   releases and changelog. Verify feature and benchmark claims against source, not README copy.
3. **Classify.** Assign the primary layer, the LLM dependency tier, and the verdict. Check for hard and soft conflicts
   against existing entries, especially MCP tool-name collisions.
4. **Write the row.** Add or update the row in [`data/context-reduction-tools.csv`](data/context-reduction-tools.csv).
   It must have exactly 14 fields and validate against
   [`schema/tool-record.schema.json`](schema/tool-record.schema.json).
5. **Rebuild the derived artefacts.** Regenerate the JSON mirror and the `docs/llms.txt` index from the CSV, and update
   the HTML table and the stack builder for the new entry and for any existing tools whose conflict column it affects.
6. **Record stars in history.** Append a row to [`data/star-history.csv`](data/star-history.csv) in
   `date,tool,repo,stars` format. Do not overwrite existing rows.

## Conventions

- British English.
- Dates as DD-MM-YYYY.
- No em dashes.
- The `Stars` column header carries the refresh date; update it on a full sweep.
- When a refresh is partial, state which tools were re-verified and which retained older data. Never let a partial sweep
  read as if every entry was checked.
- State the source of any figure that could be disputed, and prefer a fresh direct fetch over a cached aggregator.

## Validating the data

Run `mise run validate` after editing the data. It checks that the CSV carries the 14 schema columns, that every row has
14 fields, and that the JSON mirror agrees with the CSV on row count and tool names. This runs in CI on every push and
pull request.

If you touch the stack builder, extract its script block and run a syntax check.

## Automated contributions (planned)

An agent following the fetch methodology can draft a new assessment: fetch, verify, classify, and propose a CSV row.
Because the schema is the contract, generated and hand-written rows share one format. Automated drafts are reviewed by a
human before merge.
