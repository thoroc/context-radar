---
name: project-comparison-fetch
description: Use this skill whenever you are asked to add, assess, or update a project in a comparison table. Triggers on any request containing a GitHub URL alongside words like "add", "compare", "assess", "update", "how does X fit", or "what about X". Enforces fresh data fetching before assessment to prevent stale GitHub render errors.
---

# Project Comparison Fetch

## Purpose

This skill governs how to fetch and assess a GitHub project before adding it to a comparison. It exists because GitHub page renders are frequently stale — star counts, version numbers, and descriptions can be severely out of date from a single `web_fetch`. This skill enforces a two-source verification pattern before any assessment is written.

**Keywords**: github, comparison, add to comparison, assess project, project fit, stars, version, tool comparison, context reduction, MCP, Claude Code

---

## Mandatory Fetch Protocol

### Step 1 — Fetch the GitHub repo page

```
web_fetch(url: "https://github.com/<owner>/<repo>", html_extraction_method: "markdown")
```

Read the result carefully. Note the star count, fork count, commit count, latest release / version tag, licence (About sidebar), language breakdown, and README content.

### Step 2 — Cross-verify star count with a search

Never trust the fetched star count alone. Always run a search to catch stale renders:

```
web_search(query: "<owner>/<repo> github stars <current year>")
```

If the search differs significantly from the fetched page (e.g. fetched shows 4 stars, search shows 1.5k), **use the higher, more recent figure** and note the discrepancy. This has happened repeatedly (`yvgude/lean-ctx` fetched as 4, actual 1.5k; `JuliusBrussee/caveman` fetched as 2, actual 5k+; `buildingjoshbetter/TrueMemory` fetched as 29 / v0.3.0, actual 311 / v0.7.1.2+).

When a fetch and a search disagree for the *same URL*, or a repo looks like it may have moved owner, work through the ordered resolution in [Fetch conflict resolution](references/fetch-conflict-resolution.md) (transfer check via `repository_id`, aggregator staleness, batched-search refinement).

### Step 3 — Check releases page if version matters

```
web_fetch(url: "https://github.com/<owner>/<repo>/releases")
```

Gives number of releases, latest version, release cadence, and changelog highlights.

### Step 4 — Check CHANGELOG if capabilities changed significantly

If stars or version suggest significant growth since last assessment, fetch `blob/main/CHANGELOG.md` and look for new features, licence changes, breaking changes, and new integrations.

---

## Code-Beats-Docs Rule

**Feature claims in README copy must be verified against source code or official documentation before being recorded as supported.** Marketing language is not evidence. Apply this especially to:

- **Benchmark scores**: does the evaluation script exist in the repo (`scripts/`, `evals/`, `benchmarks/`, `experiments/`)?
- **Feature claims**: does the claimed feature appear in the implementation, or only in the README?
- **Compatibility claims**: is the platform integration actually wired in source (hooks, config files, `.claude-plugin/`), or merely listed?

If a feature cannot be traced to source code or official docs, record it with a caveat — not as a confirmed capability. This rule is **schema-enforced** for cited claims (see Evidence Layer): a claim whose only sources are `readme` cannot be recorded as `confirmed`. It was learned from `carsteneu/ai-memory-comparison`.

---

## Evidence Layer (schema-enforced)

Verdict-bearing claims carry cited sources in the record itself, so the factual basis for a verdict is re-auditable. This is enforced by `src/lib/schema.ts`, not by discipline.

**Scope**: source the claims that carry the verdict — benchmark numbers, conflict / overlap assertions, and headline capability claims. Do **not** mandate sourcing star counts (they move weekly and are governed by the Star count refresh policy). Licence and runtime may carry evidence when a claim about them is genuinely contested.

**Where evidence lives**:

- On the sub-object it backs: `conflict.evidence`, `activity.evidence`, `licence.evidence`, `runtime.evidence`.
- Standalone benchmark / feature claims that map to no field go in `extraClaims[]` (`{ kind: benchmark|feature, label, statement, evidence, proofLedger? }`).

Each `evidence` block is `{ status, sources: [{ url, quote, checkedOn, evidenceType }] }`:

- `status`: `confirmed | caveated | refuted | unverified`.
- `evidenceType` per source: `source-code | official-docs | readme | release | search | third-party`.
- `url` must be a **commit-SHA permalink** (e.g. `.../blob/<sha>/path#Lnn`), never a moving branch — line references into `main` rot on any refactor. `quote` holds the cited text verbatim. `checkedOn` is ISO `YYYY-MM-DD`.

**Enforced rules** (validation fails otherwise):

- A `confirmed` claim needs at least one `source-code`, `official-docs`, or `release` source; a README-only claim tops out at `caveated`.
- A claim that is not `unverified` must cite at least one source.
- An `extraClaims` entry with `kind: benchmark` must carry a `proofLedger` (`PROVEN | SUPPORTED | OPEN | REJECTED`) — see [Benchmark verification and claim pressure-test](references/benchmark-verification.md).

Evidence is **not** required across every tool. It is required for verdict-bearing claims on new and re-assessed tools, and backfilled opportunistically. Never present an unsourced verdict claim as sourced. The MCP Stack Builder dataset (`src/stack-builder/stack-data.ts`) is separate and carries no evidence.

---

## Assessment Checklist

Before writing any assessment, confirm you have answers to all of these:

| Field | Source |
|---|---|
| Stars (verified) | fetch + search cross-check |
| Forks / commits | fetch |
| Latest version / number of releases | releases page |
| Licence | fetch (About sidebar) |
| Primary runtime | README |
| Bun compatibility | README / CHANGELOG |
| MCP server? | README + source (`mcp/`, `server.py`, etc.) |
| Claude Code hook integration? | README + source (`.claude-plugin/`, hooks directory) |
| LLM dependency tier | [LLM dependency classification](references/llm-dependency-classification.md) |
| Benchmark claims | [Benchmark verification and claim pressure-test](references/benchmark-verification.md) |
| Key differentiator vs existing tools | README + own analysis |
| Conflict of interest | Is this tool by the same author as an existing comparison or tool in the table? |

---

## Threat Patterns to Reject

Some repos are not legitimate tools. Reject immediately (do not add to comparison) if any of these are present:

- Every link in the README resolves to the same raw file URL (malware distribution pattern)
- No source code visible — only binary downloads
- README topics are inconsistent with the claimed tool purpose
- The repo is a GitHub page mirror / fork of an unrelated project

If a threat pattern is detected, say so explicitly and decline to add the project.

---

## Out-of-Scope Detection

Before fetching, check if the project belongs in this comparison at all. This comparison covers **tools that reduce context window bloat in Claude Code**. A project is out of scope if:

- It is an alternative MCP *client* rather than a tool that works *with* Claude Code (e.g. a full agentic runtime)
- It is a general-purpose library with no specific Claude Code / context reduction angle
- It duplicates an existing tool with no unique capability and 0 stars

If out of scope, explain why concisely rather than fetching and assessing fully.

---

## Post-Assessment Actions

After writing the assessment, always:

1. **Fill the template**: copy `templates/tool.yaml`, complete every field (correct layer, overlap tags, verdict), using the stable identifier keys.
2. **Ingest it**: `mise run data:add -- <your-file>.yaml`. This Zod-validates the record and upserts it into `data/context-reduction-tools.json` by tool name, refreshing `meta.tool_count` and `meta.last_updated`.
3. **Validate**: `mise run validate` (also runs on commit and in CI). Editing the JSON by hand instead of via the template is fine, but it must still pass validation.
4. **Update `src/public/llms.txt`** to reflect the new or changed entry. The comparison table and CSV download need no manual edit — both are generated from the JSON on the next `mise run build`.
5. **Update the MCP Stack Builder dataset** if the tool belongs there: add it to the correct layer in `src/stack-builder/stack-data.ts` (separate from the canonical JSON).
6. **Type-check and build**: `mise run typecheck` then `mise run build`.
7. **Update overlap/conflict columns** for existing tools affected by the new entry.

For the full record shape, field types, and the repository file map, see [Data shape contract and file locations](references/data-shape-contract.md).

---

## New-User Framing Rule

Both the comparison HTML and the MCP Stack Builder SPA assume **no prior installation**. This means:

- Verdicts must not say "Keep — already in stack" or imply the user has anything installed
- SPA layer badges use install-oriented language: "install one shell tool", "run once after setup", "pick ONE primary"
- Tool Search is described as "built into Claude Code; enable it" — not "already active"
- The recommended stack represents a suggested starting point for a new user, not a maintenance view

---

## References

| Reference | When to use |
| --- | --- |
| [Fetch conflict resolution](references/fetch-conflict-resolution.md) | A fetch and a search disagree on stars, a repo may have moved owner, or batched searches return noise |
| [LLM dependency classification](references/llm-dependency-classification.md) | A tool mentions AI/LLM calls and you must set its dependency tier |
| [Benchmark verification and claim pressure-test](references/benchmark-verification.md) | A tool claims a benchmark score or any headline percentage |
| [Data shape contract and file locations](references/data-shape-contract.md) | Writing to the store, adding or renaming a field, or you need the file map |
| [Layer assignment guide](references/layer-guide.md) | Choosing the `layer` value |
| [Verdict guide](references/verdict-guide.md) | Choosing the `verdict.decision` value |
| [MCP tool-name conflict rules](references/mcp-conflict-rules.md) | Setting `conflict` severity for a code-nav, memory, or MCP tool |
| [Star count refresh policy](references/star-refresh-policy.md) | Refreshing star counts across the catalogue |
