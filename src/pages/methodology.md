# Methodology

How a tool is fetched, verified, and rated before it enters the catalogue. This is a summary. The full, authoritative
procedure lives in the skill at
[`.agents/skills/project-comparison-fetch/SKILL.md`](https://github.com/pantheon-org/context-radar/blob/main/.agents/skills/project-comparison-fetch/SKILL.md)
and should be read before adding or re-assessing any tool.

## Scope

The catalogue covers tools that reduce context-window bloat in Claude Code and comparable agents. A project is out of
scope if it is a full agentic runtime rather than a tool that works with the agent, a general-purpose library with no
context reduction angle, or a zero-star duplicate of an existing entry.

## Fetch and verify

GitHub page renders go stale, sometimes by a factor of ten, so no single fetch is trusted.

1. Fetch the repository page and note stars, forks, commits, latest release, licence, and language breakdown.
2. Cross-verify the star count with a search. If the two disagree, first check for an org or owner transfer (compare
   `repository_id` on both pages), then prefer a fresh direct fetch over third-party aggregators, which cache on their
   own schedule.
3. Check the releases page for maturity, and the changelog when capabilities have moved significantly.

Small star counts are recorded exactly; large ones are rounded to the nearest thousand. The `Stars` column header
carries the refresh date.

## Code beats docs

Feature claims, licences, and "no telemetry" statements in a README are verified against source or official docs before
being recorded as fact. Anything that cannot be traced to code or docs is recorded with a caveat, not as a confirmed
capability.

## Benchmark claims

A headline benchmark number is recorded with its benchmark name, metric, test set, whether the methodology is open, and
whether it is self-reported. Scores are comparable only when both the benchmark and the metric match. For any number
that would move a tool from Watch to Add or Best in class, the claim is pressure-tested (claim, verifier boundary,
baseline, enemy terms, rejection gate) and labelled PROVEN, SUPPORTED, OPEN, or REJECTED.

## LLM dependency tier

Every tool that makes model calls is classified: Zero-LLM (no calls, offline, free to run), Extraction-only (LLM
classifies input, retrieval is algorithmic), Full-pipeline (LLM in both extraction and retrieval), Session-calling (uses
your own agent session credits), or SaaS-hosted (all calls go to a third party). This is recorded in the Requirements
column because it drives cost, latency, and privacy.

## Layers

Each tool is assigned to its primary layer (shell output, static context injection, code navigation, agent memory
persistence, MCP definition tokens, and so on) with secondary overlaps noted in the conflict column. When grouping by
layer programmatically, group on prefix match rather than exact string equality: several raw layer strings collapse to
one display layer, and exact matching silently drops rows.

## Conflicts

The main practical conflict to catch is an MCP tool-name collision: two servers exposing the same or semantically
identical tool name confuse an agent's routing even when nothing crashes.

- **Hard conflict:** same or near-identical MCP tool name from two servers. Pick one.
- **Soft conflict:** redundant role or conceptual overlap. Running both wastes resources.

Known collision clusters (shell tools, code-nav servers, fact-memory tools, and others) are listed in the skill.

## Verdicts

| Verdict            | When to use                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| Best in class      | Highest capability plus community validation in its layer.                |
| Add                | Fills a clear role without problematic conflicts.                         |
| Add if you use [X] | Conditional on a specific artefact type or workflow.                      |
| Either/or pick one | Direct competitor in the same layer; running both wastes resources.       |
| Watch              | Promising but early: under 100 stars, no releases, or unvalidated claims. |
| Reference only     | A curated list or documentation, not an installable tool.                 |
| Drop               | Fully superseded by another tool already in the catalogue.                |

Verdicts are written for a new user assembling a stack from scratch, so they never assume anything is already installed.

## Data quality notes

- The star snapshot is a point in time. `star-history.csv` is append-only; add new fetches rather than overwriting so a
  real trend line can build up.
- When a full refresh is only partial, state plainly which tools were re-verified and which retained older data.

---

_These ratings are decision support. A human should make and document any adoption decision that materially affects a
team or product._
