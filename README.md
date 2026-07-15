# context-radar

A comparison catalogue of tools that reduce **context-window token consumption** in Claude Code and comparable coding
agents (Codex, OpenCode, Cursor, Gemini CLI).

Every entry answers one question: **does this tool reduce what gets loaded into or generated within an agent's context
window, and how does it interact with everything else in the stack?** Tools are grouped by the layer they act on (shell
output, code navigation, agent memory, MCP definition tokens, and so on), rated with a verdict, and checked for
conflicts, above all the MCP tool-name collisions that break an agent's ability to route between two servers.

The catalogue currently tracks **79 tools**, last refreshed **15-07-2026**.

## Audience and outputs

- **Humans** browse the interactive comparison table and assemble a conflict-free stack (via GitHub Pages, once
  enabled).
- **Agents and tooling** read the same catalogue in an LLM-friendly shape: a CSV source of truth, a JSON mirror, and a
  flat [`docs/llms.txt`](docs/llms.txt) index.

## Repository layout

```
context-radar/
  README.md                              This file
  CONTRIBUTING.md                        How to add or re-assess a tool
  data/
    context-reduction-tools.csv          Source of truth (14 columns, 79 rows)
    context-reduction-tools.json         JSON mirror ({meta, tools:[...]})
    star-history.csv                     Append-only star history (date,tool,repo,stars)
  docs/                                  GitHub Pages source (Settings then Pages then /docs)
    index.html                           Interactive comparison table (landing page)
    stack-builder.html                   MCP stack builder SPA
    methodology.md                       How tools are fetched, verified, and rated
    glossary.md                          Terms used across the catalogue
    llms.txt                             Flat, LLM-friendly index of the catalogue
    _config.yml                          Jekyll config for GitHub Pages
  schema/
    tool-record.schema.json              JSON Schema for one tool record
  .agents/                               Agent-facing tooling (tracked)
    .tessl-plugin/plugin.json            tessl plugin manifest
    skills/
      project-comparison-fetch/SKILL.md  The full fetch and assessment methodology (skill)
  mise.toml                              Toolchain and tasks (mise-en-place)
  hk.pkl                                 Git pre-commit hooks (hk)
  .markdownlint.jsonc                    Markdown lint rules
  .yamllint                              YAML lint rules
  .prettierignore                        Files prettier must not format
```

## The data model

Each tool is one row with 14 fields: Tool, GitHub URL, Layer, What it does, Conflict / Overlap, Runtime, Requirements,
Licence, Stars, Trend, Activity, Activity Status, Verdict, and Decision Rule. The CSV is the source of truth; the JSON
and the HTML table are rebuilt from it. See [`schema/tool-record.schema.json`](schema/tool-record.schema.json) for the
field definitions.

### Verdicts

Best in class, Add, Add if you use [X], Either/or pick one, Watch (too early or unique but early), Reference only (not a
tool), and Drop. Full definitions are in [`docs/methodology.md`](docs/methodology.md).

### Conflicts

- **Hard conflict:** two MCP servers expose the same or near-identical tool name, so an agent cannot route between them.
  Pick one.
- **Soft conflict:** redundant role or overlap. Running both wastes resources but does not break routing.

## Status and roadmap

Docs-only for now. GitHub Pages is not yet enabled and there is no remote.

1. **Now.** The catalogue, its data files, the interactive table, the stack builder, and the fetch methodology are all
   in the repository.
2. **Next.** Enable GitHub Pages from `/docs`. Append fresh star fetches to `star-history.csv` on a schedule so the
   trend line becomes meaningful.
3. **Later.** Generate the HTML table and JSON mirror from the CSV automatically, and let an agent following the
   methodology draft new tool assessments for human review.

---

_These ratings are decision support. A human should make and document any adoption decision that materially affects a
team or product._
