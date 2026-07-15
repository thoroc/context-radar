# Contributing

context-radar grows one tool at a time. The methodology is strict because the whole value of the catalogue is that its
numbers and verdicts are trustworthy.

## Before you start

Read the methodology in
[`plugin/skills/project-comparison-fetch/SKILL.md`](plugin/skills/project-comparison-fetch/SKILL.md). It encodes
hard-won lessons (stale renders, org transfers, benchmark metric traps, MCP tool-name collisions) that are not obvious
from the data alone. A shorter summary is at [`src/pages/methodology.md`](src/pages/methodology.md).

## Local setup

The toolchain is pinned with [mise](https://mise.jdx.dev). From the repository root:

```sh
mise trust      # approve this project's mise.toml (first time only)
mise install    # install the toolchain AND wire up the git hooks (see below)
```

`mise install` installs hk, pkl, prettier, markdownlint-cli2, yamllint, actionlint, node, Bun, Biome, and the tessl CLI.
Its `postinstall` hook then runs `hk install`, so the git hooks are set up in the same step. If you use `mise activate`
in your shell, the `enter` hook does this automatically when you `cd` into the project.

The site is a [Vite](https://vite.dev) + TypeScript app built with [Bun](https://bun.sh). All build, lint, and format
operations go through mise tasks; use those rather than calling `bun`/`vite`/`biome` directly.

```sh
mise run install    # install JS dependencies from the lockfile (bun install --frozen-lockfile)
mise run dev        # Vite dev server for both pages, with live reload
mise run build      # type-check and build the static site into docs/ (git-ignored output)
```

Format and lint:

```sh
mise run fmt        # format markdown, YAML, HTML, JSON, and TypeScript in place
mise run lint       # check only, no changes (prettier, markdownlint, yamllint, actionlint, Biome)
mise run typecheck  # TypeScript type-check
```

When adding or upgrading a JS dependency, run `bun add`/`bun install` directly so the lockfile updates, then commit
`bun.lock`. `mise run install` is the reproducible, lockfile-frozen install used for setup and CI.

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

The `project-comparison-fetch` skill lives under `plugin/` as a **local** tessl plugin
(`plugin/.tessl-plugin/plugin.json`). The committed `tessl.json` declares it as a dependency with a relative source
(`file:plugin`), so it installs into this project, not globally, and reproducibly. The committed `.mcp.json` wires the
tessl MCP server for Claude Code in this project.

`mise install` provides the tessl CLI. Then authenticate if prompted and install the skill into the project:

```sh
tessl login     # first time only, if prompted
mise run skill  # runs `tessl install`, reading tessl.json
```

That vendors the plugin into `.tessl/` and links the skill into `.claude/skills/` (both git-ignored install outputs that
`tessl install` regenerates). After editing the skill, run `mise run skill` again to re-sync. Publishing the plugin to
the tessl registry is optional and not done yet.

## Continuous integration

Three GitHub Actions workflows run on push to `main` and on pull requests. Third-party actions are pinned by commit SHA.

- `.github/workflows/static.yml` builds the site with Vite (`bun install` then `bun run build`) and deploys the `docs/`
  output to GitHub Pages.
- `.github/workflows/lint.yml` sets up the mise toolchain, installs the JS dependencies, and runs `mise run lint`
  (prettier, markdownlint, yamllint, actionlint, and Biome via hk), then `mise run typecheck` (TypeScript), then
  `mise run validate` (the CSV and JSON mirror must agree).
- `.github/workflows/plumber.yml` runs [Plumber](https://getplumber.io), which scans the CI/CD workflows for security
  and compliance issues (exposed secrets, unpinned actions, over-broad permissions, dangerous triggers) and grades them.
  `score-push` is off, so nothing about this repository is made public.

Run the same checks locally:

```sh
mise run lint       # prettier, markdownlint, yamllint, actionlint, Biome
mise run typecheck  # TypeScript type-check
mise run validate   # CSV and JSON mirror consistency
mise run security   # Plumber scan (needs a git remote; use the CI job otherwise)
```

The Plumber CLI needs a git remote to resolve the owner and repository. Until this repo has a remote, run the scan
through the CI workflow rather than locally.

### Dependency updates (Renovate)

[Renovate](https://docs.renovatebot.com) keeps dependencies current, configured in `renovate.json`. Its `mise` manager
bumps the pinned tools in `mise.toml` (including the `github:getplumber/plumber` CLI), and its `github-actions` manager
updates the SHA-pinned actions in the workflows while preserving the `# vX` version comment. New releases wait out a
7-day `minimumReleaseAge` before a pull request opens. Renovate runs once the repository is on GitHub and the app is
enabled.

## Adding or re-assessing a tool

1. **Check scope.** Is it a context-reduction tool that works with a coding agent, and not a full runtime or a generic
   library? If not, say why and stop.
2. **Fetch and verify.** Follow the fetch protocol: fetch the repo page, cross-verify stars with a search, check
   releases and changelog. Verify feature and benchmark claims against source, not README copy.
3. **Classify.** Assign the primary layer, the LLM dependency tier, and the verdict. Check for hard and soft conflicts
   against existing entries, especially MCP tool-name collisions.
4. **Write the row.** Add or update the row in [`data/context-reduction-tools.csv`](data/context-reduction-tools.csv).
   It must have exactly 14 fields and validate against
   [`tool-record.schema.json`](plugin/skills/project-comparison-fetch/schema/tool-record.schema.json).
5. **Rebuild the derived artefacts.** Regenerate the JSON mirror and the `src/public/llms.txt` index from the CSV. The
   comparison table imports the JSON at build time, so it needs no manual edit. If the tool belongs in the stack
   builder, add it to `src/stack-builder/stack-data.ts`, and update the conflict entries for any existing tools it
   affects. Then run `mise run build` to confirm the site still builds.
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
pull request. The JSON shape is also a contract consumed by the site build — see the Data Shape Contract section in the
[skill](plugin/skills/project-comparison-fetch/SKILL.md).

If you touch the site source (comparison table, stack builder, or the data types), run `mise run typecheck` and
`mise run build`.

## Automated contributions (planned)

An agent following the fetch methodology can draft a new assessment: fetch, verify, classify, and propose a CSV row.
Because the schema is the contract, generated and hand-written rows share one format. Automated drafts are reviewed by a
human before merge.
