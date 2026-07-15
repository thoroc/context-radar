---
title: Methodology
---

# Scoring methodology

context-radar rates a project on how efficiently an AI coding agent can build the
context it needs to complete a task. The unit of waste is the token: every file an
agent reads, every caller it traces by hand, every doc it re-scans costs tokens that
buy no work. A project scores well when it lets the agent retrieve exactly what it
needs and no more.

## The seven dimensions

Each dimension is scored from 0 (absent or actively harmful) to 5 (best in class).

| # | Dimension | Weight | What it measures |
|---|-----------|--------|------------------|
| 1 | Agent instructions | 20 | Presence and quality of agent-facing guidance (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules`, etc.). Scoped, current, low-token, deterministic. |
| 2 | Code navigability and indexing | 20 | Whether the agent can locate code without reading it all: code graph, symbol index, ctags, semantic search, MCP indexers. |
| 3 | Documentation structure | 15 | Progressive disclosure. Short entry points that link to detail, ADRs, scoped READMEs, rather than one wall of text. |
| 4 | Retrieval affordances | 15 | Machine-readable entry points: `llms.txt`, MCP servers, structured metadata, search, that let an agent fetch only what it needs. |
| 5 | Repository signal-to-noise | 10 | How much of the tree is signal. Clear module boundaries, small focused files, generated and vendored files excluded from search. |
| 6 | Verification loops | 10 | Fast, targeted feedback. Documented test and build commands so the agent can verify a change cheaply without broad scanning. |
| 7 | Context budget footprint | 10 | Outcome metric. Estimated tokens to onboard an agent to a representative task. Lower is better; scored on a band. |

Weights sum to 100.

## Rubric: what each score means

### 1. Agent instructions (weight 20)

| Score | Descriptor |
|-------|------------|
| 0 | No agent-facing instructions of any kind. |
| 1 | A stray note or an outdated file that misleads more than it helps. |
| 2 | Basic `CLAUDE.md` or `AGENTS.md` exists but is generic or partly stale. |
| 3 | Accurate top-level instructions covering build, test, and conventions. |
| 4 | The above, plus scoped instruction files near the code they govern. |
| 5 | Scoped, current, token-lean instructions that point to indexes and tools first, with deterministic navigation rules. |

### 2. Code navigability and indexing (weight 20)

| Score | Descriptor |
|-------|------------|
| 0 | No way to find code short of reading files. |
| 1 | Grep only, over a noisy tree. |
| 2 | Consistent naming and structure that make grep effective. |
| 3 | A generated symbol index (ctags, LSP export) is available. |
| 4 | A queryable code graph or semantic index (callers, callees, tests-for). |
| 5 | A maintained, auto-updating index exposed to agents via tooling or MCP, so retrieval replaces file reads by default. |

### 3. Documentation structure (weight 15)

| Score | Descriptor |
|-------|------------|
| 0 | No docs, or docs that contradict the code. |
| 1 | One long unstructured README. |
| 2 | README plus scattered notes, no clear hierarchy. |
| 3 | Layered docs with a clear entry point and links to detail. |
| 4 | Progressive disclosure throughout, plus ADRs or design records. |
| 5 | Docs designed for partial reads: short, addressable sections an agent can fetch individually without loading the whole file. |

### 4. Retrieval affordances (weight 15)

| Score | Descriptor |
|-------|------------|
| 0 | Nothing machine-readable beyond source files. |
| 1 | Structured metadata exists but is incidental (for example `package.json` only). |
| 2 | A search facility humans can use but agents cannot easily script. |
| 3 | Deliberate machine-readable metadata (manifests, tags, sitemap). |
| 4 | An `llms.txt` or equivalent curated entry point for agents. |
| 5 | First-class agent retrieval: MCP server, documented query surface, or an API that returns scoped context on demand. |

### 5. Repository signal-to-noise (weight 10)

| Score | Descriptor |
|-------|------------|
| 0 | Generated, vendored, and source files indistinguishable; huge files everywhere. |
| 1 | Some structure, but build output and dependencies pollute search. |
| 2 | Ignore rules exist but boundaries between modules are unclear. |
| 3 | Clear module boundaries; generated and vendored content excluded from search. |
| 4 | The above, plus small focused files and a shallow, predictable tree. |
| 5 | Every path an agent is likely to open is signal; noise is fully partitioned. |

### 6. Verification loops (weight 10)

| Score | Descriptor |
|-------|------------|
| 0 | No documented way to build or test. |
| 1 | Build and test exist but are undocumented or slow to discover. |
| 2 | Commands documented but slow or all-or-nothing. |
| 3 | Documented, reasonably fast test and build commands. |
| 4 | Targeted commands (test a single file or unit) that give quick feedback. |
| 5 | Fast, granular, documented loops that let an agent verify a change without broad scanning. |

### 7. Context budget footprint (weight 10)

An estimate of the tokens needed to onboard an agent to one representative task in the
repository (for example: fix a bug in a named module). Score on this band:

| Score | Estimated onboarding tokens |
|-------|-----------------------------|
| 5 | under 10k |
| 4 | 10k to 25k |
| 3 | 25k to 50k |
| 2 | 50k to 100k |
| 1 | 100k to 200k |
| 0 | over 200k |

State the assumed task alongside the estimate so it can be reproduced.

## Computing the radar score

```
radar_score = sum over dimensions of ( weight_i * score_i / 5 )
```

Because the weights sum to 100 and each score is at most 5, the maximum radar score is
100.

Worked example, using the values from the example analysis:

| Dimension | Weight | Score | Contribution (weight * score / 5) |
|-----------|--------|-------|-----------------------------------|
| Agent instructions | 20 | 4 | 16 |
| Code navigability | 20 | 5 | 20 |
| Documentation structure | 15 | 3 | 9 |
| Retrieval affordances | 15 | 5 | 15 |
| Repository signal-to-noise | 10 | 4 | 8 |
| Verification loops | 10 | 3 | 6 |
| Context budget footprint | 10 | 4 | 8 |
| **Total** | **100** | | **82** |

## Grades

| Grade | Radar score |
|-------|-------------|
| A | 85 to 100 |
| B | 70 to 84 |
| C | 55 to 69 |
| D | 40 to 54 |
| F | under 40 |

## Adoption recommendation

A separate, judgement-based verdict, in the style of a technology radar ring. It
answers "should a team lean on this project for agent-assisted work?" and need not
track the grade exactly.

| Ring | Meaning |
|------|---------|
| adopt | Strong agentic-context setup. Safe default for agent-assisted work. |
| trial | Good, with gaps. Worth using with awareness of the weak dimensions. |
| assess | Promising or interesting, but unproven or uneven. Worth a look. |
| hold | Poor agentic-context setup today. Expect high token cost. |

## Notes on fairness and scope

- Score the project as published, at a stated version or commit. Record it.
- A small library and a large monorepo are scored on the same rubric but the context
  budget band accounts for scale.
- These ratings are decision support. A human should make and document any adoption
  decision that materially affects a team or product. context-radar does not replace
  that judgement.
