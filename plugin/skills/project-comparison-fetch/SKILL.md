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

Read the result carefully. Note:
- Star count (shown as `Star N` or `N stars`)
- Fork count
- Commit count
- Latest release / version tag
- Licence (shown in About sidebar)
- Language breakdown
- README content

### Step 2 — Cross-verify star count with a search

Never trust the fetched star count alone. Always run a search to catch stale renders:

```
web_search(query: "<owner>/<repo> github stars <current year>")
```

If the search result differs significantly from the fetched page (e.g. fetched shows 4 stars, search shows 1.5k), **use the higher, more recent figure** and note the discrepancy. This has happened repeatedly:
- `yvgude/lean-ctx`: fetched as 4 stars, actual 1.5k
- `JuliusBrussee/caveman`: fetched as 2 stars, actual 5k+
- `DeusData/codebase-memory-mcp`: fetched as 0 stars, actual ~1k
- `buildingjoshbetter/TrueMemory`: fetched as 29 stars / v0.3.0, actual 311 stars / v0.7.1.2+ with substantially evolved feature set

### Resolving conflicts between a direct fetch and search results

When a direct fetch and a web search disagree on stars for the *same URL*, don't assume either source by default — work through this order:

1. **Check for an org/repo transfer first.** If search results show a differently-named owner for what looks like the same project (matching description, README content, badge set, or topics), this is not automatically a stale aggregator — it may be a real move. Fetch the alternate URL directly and compare `repository_id` in the page metadata (visible in the fetched markdown's frontmatter) between the two candidates. An identical `repository_id` confirms it's the same repository under a new owner/org — not two different projects. (Real example: `chopratejas/headroom` transferred to `headroomlabs-ai/headroom` — both URLs returned live, non-redirected, internally-consistent pages with different star counts, and only checking `repository_id` resolved which was canonical.)
2. **If no transfer is found, trust a fresh direct fetch of the exact URL over third-party aggregator snapshots** (star-history.com, ecosyste.ms, OpenGithubs rankings, etc.) — these cache on their own schedule and can lag by weeks. (Real example: `thedotmack/claude-mem` — our recorded 85.4k was correct; star-history.com's cached 70.9k and an even older third-party citation of 46.1k were both stale snapshots.)
3. **If a transfer is confirmed, update the `githubUrl` field in the record**, not just the star count — the old URL should not remain as the tool's primary reference.

### Query refinement for batched star searches

Batching 3-4 tools per search query (per the Star Count Refresh Policy) is efficient but frequently returns comparison docs, marketing copy, or unrelated mentions rather than a clean current number. When a batch query doesn't yield an unambiguous figure for a given tool, follow up with a single-tool, quoted-repo-path query: `"owner/repo" github star count`. This reliably surfaces star-history.com entries or live GitHub issue-page snippets (which render current stats regardless of the issue's age) with an unambiguous number.

### Treat meta-comparison articles as corroboration, not as a star-count source

Third-party research/comparison articles (e.g. category roundups analyzing "code intelligence tools" or "AI memory tools") are valuable for qualitative corroboration — competitive positioning, licensing friction anecdotes, maintainer concentration risk — but their star figures are snapshots from whenever the article was written and age exactly like any other cached source. Use them to validate narrative claims, not as the deciding number in a conflict.

### Step 3 — Check releases page if version matters

For maturity assessment, fetch the releases page directly:

```
web_fetch(url: "https://github.com/<owner>/<repo>/releases")
```

This gives: number of releases, latest version, release cadence, and changelog highlights.

### Step 4 — Check CHANGELOG if capabilities changed significantly

If the star count or version suggests significant growth since last assessment:

```
web_fetch(url: "https://github.com/<owner>/<repo>/blob/main/CHANGELOG.md")
```

Look for: new features, licence changes, breaking changes, new integrations.

---

## Code-Beats-Docs Rule

**Feature claims in README copy must be verified against source code or official documentation before being recorded as supported.** Marketing language is not evidence. Apply this especially to:

- **Benchmark scores**: does the evaluation script exist in the repo? Is there a `scripts/`, `evals/`, `benchmarks/`, or `experiments/` directory with runnable code?
- **Feature claims**: does the claimed feature appear in the implementation, or only in the README?
- **Compatibility claims**: is the platform integration actually wired in source (hooks, config files, `.claude-plugin/`), or merely listed?

If a feature cannot be traced to source code or official docs, record it with a caveat — not as a confirmed capability.

This rule was learned from `carsteneu/ai-memory-comparison`, which applies it consistently across 66 features and catches meaningful gaps between what tools claim and what they implement.

---

## Assessment Checklist

Before writing any assessment, confirm you have answers to all of these:

| Field | Source |
|---|---|
| Stars (verified) | fetch + search cross-check |
| Forks | fetch |
| Commits | fetch |
| Latest version | fetch or releases page |
| Number of releases | releases page |
| Licence | fetch (About sidebar) |
| Primary runtime | README |
| Bun compatibility | README / CHANGELOG (relevant to this project) |
| MCP server? | README + source (`mcp/`, `server.py`, etc.) |
| Claude Code hook integration? | README + source (`.claude-plugin/`, hooks directory) |
| LLM dependency tier | See LLM Dependency Classification below |
| Benchmark claims | See Benchmark Verification below |
| Key differentiator vs existing tools | README + own analysis |
| Conflict of interest | Is this tool by the same author as an existing comparison or tool in the table? |

---

## LLM Dependency Classification

For any tool that mentions AI/LLM calls, classify it precisely — not just as a binary warning:

| Tier | Meaning | Examples |
|---|---|---|
| **Zero-LLM** | No model calls at any stage; pure algorithmic/rule-based | RTK, omni, caveman, TrueMemory Edge |
| **Extraction-only** | Calls LLM once to extract/classify input; retrieval is algorithmic | mem0, most memory tools |
| **Full-pipeline** | LLM involved in extraction AND retrieval (e.g. HyDE query expansion) | TrueMemory Pro, cognee graph queries |
| **Session-calling** | Uses the user's own active Claude/Codex session credits | claude-mem compression, token-optimizer audit agents |
| **SaaS-hosted** | All calls go to a third-party API; no self-host option for the core | supermemory |

Record this in the Requirements column accordingly:
- `Zero-LLM; no model calls`
- `⚠ Extraction: LLM API key required (OpenAI default; Anthropic/Gemini/Ollama supported)`
- `⚠ Full-pipeline: LLM API key + model download (~N GB on first use)`
- `⚠ Uses your Claude session credits`
- `⚠ SaaS-only: memory stored on [provider] servers`

This distinction matters because zero-LLM tools work fully offline and cost nothing to run, while full-pipeline tools are most capable but highest cost and latency.

---

## Benchmark Verification

When a tool claims benchmark scores, record these five fields — not just the number:

| Field | What to record |
|---|---|
| **Benchmark name** | LoCoMo, LongMemEval, BEAM-1M, BEAM-10M, GDPVal, ConvoMem, or custom |
| **Metric** | Accuracy @1, Recall @5, F1, exact match — these are NOT interchangeable |
| **Test set** | Session-level, turn-level, fact-level, retrieval-only |
| **Methodology open?** | Are evaluation scripts publicly available in the repo? |
| **Self-reported?** | Vendor ran their own eval vs independently verified |

**Benchmark scores are only comparable when both the benchmark name AND metric are identical.** Common traps:
- LoCoMo accuracy @1 ≠ LongMemEval R@5 — different task, different scale
- "88% accuracy" vs "88% recall" — completely different claims even on the same benchmark
- Self-reported on a closed test set ≠ independently verified on a public benchmark

When recording benchmark claims, always note: `[score] on [benchmark] ([metric], [self-reported / methodology at: link])`.

This discipline was learned from `carsteneu/ai-memory-comparison`, where inconsistent metric comparisons obscure real performance differences: TrueMemory (93.0% LoCoMo accuracy @1), Kage (96.17 R@5 LongMemEval), and ByteRover (96.1 LoCoMo accuracy) look similar but measure different things.

---

## Claim Pressure-Test (before recording any headline benchmark number)

Adapted from `tonyblu331/research-proof`'s falsifiable-claim methodology. Apply this to any benchmark number, percentage reduction, or comparative claim before it goes in the CSV as a stated fact rather than a self-reported figure. This is heavier than the five-field Benchmark Verification table above — use it specifically for a tool's *headline* claim, the number that will anchor its verdict.

Work through six questions, in order:

1. **Claim** — restate the number as a precise, falsifiable statement. Not "93% token reduction" but "for query set Q run against the tool's own repo, mean tokens-after / tokens-before = 7%, across N published queries."
2. **Verifier boundary** — what was frozen before the test ran, and what could the tool's own code influence? If the tool's author chose the test queries, the test repo, and the scoring method, the boundary is weak. If it runs against a public benchmark with a fixed test set and independent scoring, the boundary is strong.
3. **Baseline / candidate** — what exactly is being compared? "vs raw file reads" is a different (usually much easier) baseline than "vs the next-best tool in this comparison."
4. **Enemy terms** — state the strongest reason this number might not transfer to a typical user's repo. Common enemy terms already seen in this project: self-selected queries, single-repo case study, warm cache vs cold, small test corpus, metric mismatch (recall vs accuracy vs F1), self-reported with no independent replication.
5. **Rejection gate** — what would make you discount the number entirely? (e.g., no evaluation script in the repo; the benchmark script exists but was never run in CI; the number changed between README versions with no changelog explanation.)
6. **Proof ledger decision** — label the claim `PROVEN` (independently reproducible, public benchmark, fixed test set), `SUPPORTED` (methodology published and internally reproducible, but self-run and/or on a self-selected test set), `OPEN` (numbers exist but methodology is opaque or the eval script isn't in the repo), or `REJECTED` (claim contradicted by the actual source code, or the benchmark is comparing different things and presenting them as equivalent).

Record the Proof Ledger Decision alongside the benchmark in the record's `whatItDoes` or `decisionRule` field, e.g. `(SUPPORTED — reproducible via published Modal scripts, self-run)`.

**Worked example, applied retroactively to an existing entry (tokensave):**
- Claim: "93% mean retrieval savings" on `tokensave bench`, 10 published queries, run against the tool's own repo.
- Verifier boundary: weak-to-medium — the author chose the repo (their own) and the 10 queries, but the queries and results are published in full, and a separate criterion micro-benchmark against 4 pinned external repos (polkadot-sdk, emacs, scipy, node) partially strengthens this.
- Baseline: raw grep/glob/Read exploration vs querying the pre-built graph — a real baseline, not a strawman, but the easiest one to look good against.
- Enemy terms: self-selected test repo and queries; no independent third-party replication yet; "93%" is a mean, individual query variance not shown in the headline figure.
- Rejection gate: none triggered — the benchmark script (`tokensave bench`) exists in the repo and is runnable, the pinned-ref external benchmarks are real and reproducible by anyone.
- Proof Ledger Decision: **SUPPORTED** — methodology is published and independently re-runnable, but it's self-selected and self-run, not yet independently replicated on third-party repos at scale.

Note: don't apply this full six-step process to every minor claim — reserve it for headline numbers that will materially affect a tool's verdict, and especially whenever a claim would flip a tool from "Watch" to "Add" or "Best in class."

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

## Data Shape Contract (single source of truth)

The catalogue has **one canonical store**: `data/context-reduction-tools.json`, shaped
`{ meta: { last_updated, stars_verified, tool_count }, tools: [ { <stableKey>: <string> } ] }`.
The Vite + TypeScript site imports it directly at build time. There is no CSV source of truth and no JSON mirror; the CSV download is generated from this JSON.

Records use **stable identifier keys** and are strongly typed, not flat strings:

| Field | Type |
| --- | --- |
| `tool` | string (unique) |
| `githubUrl` | string (URL) |
| `layer` | enum (see `layerSchema`) |
| `whatItDoes`, `requirements`, `decisionRule` | string |
| `stars` | integer or `null` (null = unknown / built-in) |
| `trend` | signed number (percent) or `null`; sign carries direction |
| `runtime` | `{ languages: enum[], detail?: string }` |
| `licence` | `{ spdx: string, warning?: string }` |
| `conflict` | `{ severity: hard\|soft\|either-or\|stackable\|none, projects: string[], note?: string }` |
| `activity` | `{ contributors?, latestVersion?, releaseCount?, releasedOn?, corroboration?, notes? }` |
| `activityStatus` | `{ band: active\|stable\|slowing\|early\|dormant\|none, label: string }` |
| `verdict` | `{ decision: best\|add\|add-if\|either-or\|watch\|reference\|drop, rationale: string }` |

Free-text detail is preserved verbatim in the `notes`/`note`/`detail`/`rationale` fields, so the table and CSV export reproduce the original display losslessly. The snapshot date lives in `meta.stars_verified` (the dated `Stars (<date>)` header is reconstructed only in the CSV export).

The **schema is defined once** as a Zod schema in `src/lib/schema.ts`. It drives, so nothing can drift:

- the TypeScript types the site compiles against (`z.infer` → `Tool`, `Dataset`);
- the JSON Schema published beside this skill (`schema/tool-record.schema.json`), regenerated by `mise run gen:schema`;
- runtime validation of the JSON (`mise run validate`), which also runs in the pre-commit hook and CI.

Zod is build/CI-only; it is never shipped to the browser. `src/lib/present.ts` reconstructs the display strings (and CSS classes) from the structured record and is shared by the table and the CSV export.

Rules when the data changes:

- Match the field types above. Prefer the structured fields; keep the verbatim `notes`/`note`/`detail`/`rationale` populated so nothing is lost.
- To add/remove/rename a field, edit `src/lib/schema.ts` (the Zod schema), `src/lib/columns.ts` (`COLUMNS`, the CSV order/headers), and `src/lib/present.ts` (reconstruction) as needed, then run `mise run gen:schema`. `mise run validate` and `mise run typecheck` fail until everything agrees.
- Tool names must be unique and `meta.tool_count` must equal `tools.length`; the validator enforces both.

The stack builder does **not** consume this JSON. Its dataset (`src/stack-builder/stack-data.ts`) is a separate, richer, hand-curated structure (per-tool `rec`/`free`/`warn` flags, short ids, layer notes, and a conflict ruleset). Keep the two reconciled by hand when tools change.

---

## Post-Assessment Actions

After writing the assessment, always:

1. **Fill the template**: copy `templates/tool.yaml`, complete every field (correct layer, overlap tags, verdict), using the stable identifier keys.
2. **Ingest it**: `mise run data:add -- <your-file>.yaml`. This Zod-validates the record and upserts it into `data/context-reduction-tools.json` by tool name (re-adding an existing name updates it), refreshing `meta.tool_count` and `meta.last_updated`.
3. **Validate**: `mise run validate` (also runs on commit and in CI). Editing the JSON by hand instead of via the template is fine, but it must still pass validation.
4. **Update `src/public/llms.txt`** to reflect the new or changed entry. The comparison table and the CSV download need no manual edit — both are generated from the JSON on the next `mise run build`.
5. **Update the MCP Stack Builder dataset** if the tool belongs there: add it to the correct layer in `src/stack-builder/stack-data.ts` (see the Data Shape Contract above — this is separate from the canonical JSON).
6. **Type-check and build**: `mise run typecheck` then `mise run build`.
7. **Update overlap/conflict columns** for existing tools affected by the new entry.

### File locations

All data and artefacts live in the repository:

- `data/context-reduction-tools.json`: the single canonical store, imported by the site build (`src/lib/data.ts`)
- `src/lib/schema.ts`: the Zod schema — single source of truth for the record shape (types + JSON Schema + validation)
- `src/lib/columns.ts`: canonical column order + CSV serialisation (drives the download)
- `templates/tool.yaml`: authoring scaffold; fill and ingest with `mise run data:add`
- `scripts/validate-data.ts`: Zod validator, run via `mise run validate`
- `scripts/gen-schema.ts`: regenerates the JSON Schema from Zod, run via `mise run gen:schema`
- `scripts/data-add.ts`: ingests a filled template into the store, run via `mise run data:add`
- `src/index.html` + `src/comparison/`: filterable/sortable comparison table (Vite + TypeScript; renders from the JSON)
- `src/stack-builder.html` + `src/stack-builder/`: interactive stack builder; its dataset is `src/stack-builder/stack-data.ts` (maintained separately)
- `src/public/llms.txt`: flat, LLM-friendly index of the catalogue (served at `/llms.txt`)
- `docs/`: the Vite build output (git-ignored; produced by `mise run build`, uploaded to GitHub Pages by CI)
- `schema/tool-record.schema.json` (beside this skill): the record JSON Schema, generated from `src/lib/schema.ts`

### Layer assignment guide

| Layer | Use when the tool... |
|---|---|
| Shell & tool output compression | Intercepts Bash commands or tool outputs before they reach context |
| All tool output | Sandboxes all tool output (web fetches, API calls, Playwright) not covered by shell hooks |
| Static context injection | Pre-writes structured data (signatures, graph summaries) to CLAUDE.md or a navigable knowledge graph |
| Conversation history management | Manages the message history itself via paging or compression |
| Personal knowledge retrieval | Searches the user's own notes, docs, meeting transcripts |
| Library documentation retrieval | Serves versioned upstream library docs from a community registry |
| Tabular data retrieval | Indexes CSV/Excel files for structured query instead of full-file loading |
| Codebase understanding & onboarding | LLM-powered architectural understanding; run periodically not every session |
| Code navigation | Answers structural questions about a codebase (call chains, symbols, graph) |
| Architecture violation detection | Detects architectural problems (circular deps, violations, race conditions) |
| MCP definition tokens | Reduces the token cost of MCP tool schema definitions loaded at session start |
| Cross-session governance | Tracks intent, enables rewind, or manages handoff across sessions |
| Agent memory persistence | Persists what Claude learns from sessions (facts, rules, strategies) across restarts |
| Response verbosity & memory compression | Compresses Claude's own output or CLAUDE.md memory files |
| Code generation minimalism (YAGNI) | Prevents over-engineered code from being generated in the first place |
| Config stack audit | Audits CLAUDE.md, skills, MCP servers for drift, bloat, and unused rules |
| Universal context compression middleware | Compresses all context types in one layer (replaces shell hook + caveman + context-mode) |
| Agent safety enforcement | Enforces runtime policies and contracts on what the agent can do |
| Agent runtime orchestration | Manages which tools are loaded and how they're scored dynamically |

If the tool spans multiple layers, assign it to its **primary** layer and note secondary overlaps in the conflict column.

---

## Verdict Guide

| Verdict | When to use |
|---|---|
| **Best in class** | Highest capability + community validation in its layer |
| **Add** | Fills a clear role without problematic conflicts |
| **Add if you use [X]** | Conditional on having a specific artifact type or workflow |
| **Either/or — pick one** | Direct competitor within the same layer; running both wastes resources |
| **Watch — too early** | Promising concept but <100 stars, no releases, or unvalidated claims |
| **Watch — unique but early** | Genuinely novel capability but immature; follow closely |
| **Reference only — not a tool** | Curated list or documentation, not an installable tool |
| **Drop** | Fully superseded by another tool already in the comparison |

Do **not** use "Keep — in stack" or "Keep — already in stack". This comparison is written for new users discovering their ideal stack from scratch.

---

## New-User Framing Rule

Both the comparison HTML and the MCP Stack Builder SPA assume **no prior installation**. This means:

- Verdicts must not say "Keep — already in stack" or imply the user has anything installed
- SPA layer badges use install-oriented language: "install one shell tool", "run once after setup", "pick ONE primary"
- Tool Search is described as "built into Claude Code; enable it" — not "already active"
- The recommended stack represents a suggested starting point for a new user, not a maintenance view

---

## MCP Tool Name Conflict Rules

When assessing a new code navigation, memory, or MCP tool, explicitly check for tool name collisions with existing tools. Hard conflicts (same or semantically identical MCP tool name exposed by two different servers) must be flagged as ⛔ HARD in the Conflict/Overlap column. The agent cannot route between tools with identical or near-identical names.

Known conflict clusters as of Jun 2026:
- **Shell tools** (RTK / sqz / lean-ctx / omni): pick ONE — hooks run in the same position
- **Code nav** (codegraph / codebase-memory-mcp / CodeGraphContext / jCodemunch / pharos-mcp / Serena): all expose overlapping `search_code`, `get_symbols`, `find_references` variants
- **Memory tools** (claude-mem / claude-smart / mem0 / cognee / TrueMemory / supermemory / gitmem / memoir): fact-memory tools overlap; pick one. ACE is stackable (strategy memory, not fact memory)
- **jdocmunch + jdatamunch**: both expose `index_local` and `list_datasets`
- **lean-ctx + magic-context**: both use `ctx_*` namespace
- **claude-mem + claude-smart**: direct competitors; claude-smart README benchmarks explicitly against claude-mem

---

## Star Count Refresh Policy

When updating star counts for all tools:
- Run `web_search` for each tool — do not rely on previously cached fetches
- Group searches where possible (3–4 tools per query) to reduce round trips
- Flag significant movements (>50% change) in the table footnote
- Update `meta.stars_verified` to the refresh date (the CSV export's `Stars (<date>)` header is derived from it)
- For tools where page render and search disagree, use the higher/more-recent figure and note both sources

### Volatility tiering

This category moves faster than a single refresh date communicates. Real examples from one ~3-week window: ponytail +57%, caveman +38%, codegraph +117% over several months, GitNexus steady but continuous. Treat tools differently based on observed velocity:

- **High-velocity** (recently trending, <6 months old, prior >30% swing observed): re-verify every session that touches star counts, regardless of scope.
- **Stable/mature** (large, established, low week-over-week change per star-history-style trackers): safe to leave for longer between refreshes.
- **Dormant** (no commits/releases in 2+ months): star count rarely needs re-checking, but re-verify the *activity status* — a dormant tool can still be receiving stars from discovery even with no development.

### Refresh coverage disclosure

When asked to refresh "all tools" or run a full sweep, state explicitly which subset was actually re-verified versus which retained prior data — by name or count, not just in aggregate. Never let a partial-coverage refresh read as if every entry was checked. If time/call budget only allows a partial sweep, prioritize high-velocity and highest-star tools first, and say plainly what remains unverified and roughly how old that data is.
