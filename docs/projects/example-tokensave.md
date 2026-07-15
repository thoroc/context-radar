---
name: tokensave
repo: https://github.com/aovestdipaperino/tokensave
category: mcp-server
analysed: 15-07-2026
analyst: manual
version_reviewed: illustrative
summary: A code-graph MCP server that lets agents query structure instead of reading files, cutting context tokens on exploration tasks.
scores:
  agent_instructions: 4
  code_navigability: 5
  documentation_structure: 3
  retrieval_affordances: 5
  repo_signal_to_noise: 4
  verification_loops: 3
  context_budget_footprint: 4
radar_score: 82
grade: B
recommendation: trial
tags: [mcp, token-reduction, code-graph, indexing]
---

# tokensave

> This is an illustrative analysis included to demonstrate the catalogue format.
> The scores show how the rubric is applied; they are not a rigorous audit of the
> project. Replace with a versioned analysis before treating the numbers as findings.

tokensave is an MCP server that builds and maintains a structural index of a codebase
(nodes, edges, and files in a local SQLite store) and exposes it to agents through
tools such as `tokensave_context`, `tokensave_search`, `tokensave_callers`,
`tokensave_callees`, and `tokensave_impact`. The point is to let an agent answer
"who calls this?" or "what does this touch?" by querying the graph rather than reading
files, which is where exploration tokens usually go.

## Radar profile

| Dimension | Score | Evidence |
|-----------|-------|----------|
| Agent instructions | 4/5 | Clear tool descriptions with a call budget and usage guidance; guidance lives in the consuming project rather than the repo itself. |
| Code navigability and indexing | 5/5 | This is the project's core: a queryable, auto-updating code graph purpose-built to replace file reads. |
| Documentation structure | 3/5 | README-led. Adequate entry point, less in the way of layered or addressable sections. |
| Retrieval affordances | 5/5 | First-class agent retrieval over MCP, plus a directly queryable SQLite store for structural questions the tools do not expose. |
| Repository signal-to-noise | 4/5 | Index artefacts are partitioned under `.tokensave/`; source tree is focused. |
| Verification loops | 3/5 | Buildable and testable, but the feedback loop is not documented as granular or fast. |
| Context budget footprint | 4/5 | Assumed task below lands in the 10k to 25k band once the graph is warm. |

**Radar score: 82/100. Grade: B. Recommendation: trial.**

## What works well

- Retrieval replaces reading. `callers`, `callees`, and `impact` answer structural
  questions in a few hundred tokens where file scanning would cost thousands.
- The index auto-updates, so the agent is not reasoning over a stale map.
- A fallback query path (raw SQLite) means structural questions the tools do not
  cover are still answerable without dumping files into context.

## What costs tokens

- Documentation is a single README rather than short, addressable sections, so an
  agent that needs project detail reads more than it strictly needs.
- Verification commands are not documented as targeted, so confirming a change may
  pull in broad output.

## Context budget estimate

- Assumed task: locate the definition and all callers of a named function, then make a
  one-line change and identify the tests that cover it.
- Estimated onboarding tokens: roughly 12k to 18k with a warm graph. Two or three
  `tokensave` calls answer the structural questions; a small amount of source is read
  to make the edit. Without the tool the same task typically runs well past 50k on a
  medium repository.

## Recommendation

**trial.** The indexing and retrieval story is best in class and directly targets the
main source of wasted tokens. It sits below adopt only because the documentation and
verification dimensions leave some avoidable reading on the table. Raising those two
would move it into A-grade, adopt territory.
