# Cross-tool recommendation placement

Load this when authoring or changing a "use this, not that" recommendation for a layer.

## What it is

A recommendation names one default **pick** for a layer, plus **alternatives** each gated by the
condition under which it is the better choice. It is decision support, not an adoption decision: the
reader still chooses. Recommendations live in their own file, `data/tool-recommendations.json`
(`{ "recommendations": [] }`), separate from the tool store. The site renders them; nothing is
hand-duplicated into the stack-builder data.

## Record shape

```jsonc
{
  "id": "code-nav-ast-graph",        // unique slug
  "layer": "Code navigation",        // must equal every member's store layer
  "group": "AST knowledge-graph",    // optional label when splitting a broad layer
  "members": ["codegraph", "tokensave", "gitnexus", "codebase-memory-mcp"],
  "pick": "codegraph",               // the default; a member id
  "alternatives": [
    { "id": "tokensave", "when": "you want the broader, actively developed successor" },
    { "id": "gitnexus", "when": "you need zero-server, in-browser code intelligence" }
    // ... one entry per non-pick member
  ],
  "rationale": "Why the pick is the default, in one short paragraph."
}
```

`members` must equal exactly `{pick} ∪ alternatives` — no member the head-to-head ignores, and no
pick or alternative missing from `members`. An optional `evidence` block may back the recommendation
itself, using the same shape as verdict evidence.

## Precondition: every member must be source-verified

The recommendation gate refuses to validate until each member carries **confirmed source-code
verdict evidence**. This is the Phase 2 evidence bar reused as a placement bar: a recommendation
cannot rest on an unsourced verdict. So before authoring, confirm every member's `verdict.evidence`
is `status: "confirmed"` with at least one `source-code` source; backfill any that are missing (see
[Source verification](source-verification.md)) first.

## Enforced rules

Checked by `mise run validate` (`scripts/validate/check-recommendations.ts` plus the schema
`superRefine`), which fails otherwise:

- Every member is a known tool id and sits in the recommendation's `layer`.
- The `pick` holds a `best` or `either-or` verdict. An `add`/`add-if`/`watch` tool may be an
  alternative but never the pick.
- Every member carries confirmed source-code verdict evidence.
- Member sets are disjoint per layer: a tool appears in at most one recommendation for its layer.
- Recommendation ids are unique; the pick is not also listed as an alternative.

If the honest pick would be a tool whose verdict is not `best`/`either-or`, fix the verdict first (on
its own merits, with evidence), do not force the recommendation. Stepping a tool down (for example
`best` to `either-or` because of stability or licence caveats) is a verdict change made in the store,
not something the recommendation can override.

## How it renders (no new view)

- **Tool detail** (`src/detail/recommendation-block.ts`, shared by the standalone pages and the
  comparison modal): the pick shows its alternatives with each condition; an alternative points at
  the pick and states when to prefer this tool instead.
- **Stack builder** (`src/stack-builder/selectors/layer-recommendation.ts`): a per-layer "Catalogue
  pick" line, for stack layers that map to a store layer via `STORE_LAYER_BY_STACK_ID`. Extend that
  map when a recommendation reaches a layer it does not yet cover.

## Authoring steps

1. Confirm (or backfill) confirmed source-code verdict evidence for the pick and every alternative.
2. If the pick's verdict is not `best`/`either-or`, correct it in the store first.
3. Add the record to `data/tool-recommendations.json`.
4. `mise run validate` (schema plus cross-store checks) and `mise run evidence:verify` (re-fetches
   every source-code citation at its SHA).
5. `mise run typecheck` then `mise run build`; both surfaces pick the recommendation up automatically.
