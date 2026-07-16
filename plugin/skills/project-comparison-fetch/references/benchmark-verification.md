# Benchmark verification and claim pressure-test

Load this when a tool claims benchmark scores or any headline percentage. The
five-field table applies to every benchmark claim; the six-step pressure-test is
heavier and reserved for the headline number that anchors a verdict.

## Benchmark verification (five fields)

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

## Claim pressure-test (before recording any headline benchmark number)

Adapted from `tonyblu331/research-proof`'s falsifiable-claim methodology. Apply this to any benchmark number, percentage reduction, or comparative claim before it goes in the CSV as a stated fact rather than a self-reported figure. This is heavier than the five-field table above — use it specifically for a tool's *headline* claim, the number that will anchor its verdict.

Work through six questions, in order:

1. **Claim** — restate the number as a precise, falsifiable statement. Not "93% token reduction" but "for query set Q run against the tool's own repo, mean tokens-after / tokens-before = 7%, across N published queries."
2. **Verifier boundary** — what was frozen before the test ran, and what could the tool's own code influence? If the tool's author chose the test queries, the test repo, and the scoring method, the boundary is weak. If it runs against a public benchmark with a fixed test set and independent scoring, the boundary is strong.
3. **Baseline / candidate** — what exactly is being compared? "vs raw file reads" is a different (usually much easier) baseline than "vs the next-best tool in this comparison."
4. **Enemy terms** — state the strongest reason this number might not transfer to a typical user's repo. Common enemy terms already seen in this project: self-selected queries, single-repo case study, warm cache vs cold, small test corpus, metric mismatch (recall vs accuracy vs F1), self-reported with no independent replication.
5. **Rejection gate** — what would make you discount the number entirely? (e.g., no evaluation script in the repo; the benchmark script exists but was never run in CI; the number changed between README versions with no changelog explanation.)
6. **Proof ledger decision** — label the claim `PROVEN` (independently reproducible, public benchmark, fixed test set), `SUPPORTED` (methodology published and internally reproducible, but self-run and/or on a self-selected test set), `OPEN` (numbers exist but methodology is opaque or the eval script isn't in the repo), or `REJECTED` (claim contradicted by the actual source code, or the benchmark is comparing different things and presenting them as equivalent).

Record the Proof Ledger Decision alongside the benchmark. For a headline claim that maps to no record field, use an `extraClaims` entry with `kind: benchmark` and `proofLedger` (see the Evidence Layer in SKILL.md).

**Worked example, applied retroactively to an existing entry (tokensave):**

- Claim: "93% mean retrieval savings" on `tokensave bench`, 10 published queries, run against the tool's own repo.
- Verifier boundary: weak-to-medium — the author chose the repo (their own) and the 10 queries, but the queries and results are published in full, and a separate criterion micro-benchmark against 4 pinned external repos (polkadot-sdk, emacs, scipy, node) partially strengthens this.
- Baseline: raw grep/glob/Read exploration vs querying the pre-built graph — a real baseline, not a strawman, but the easiest one to look good against.
- Enemy terms: self-selected test repo and queries; no independent third-party replication yet; "93%" is a mean, individual query variance not shown in the headline figure.
- Rejection gate: none triggered — the benchmark script (`tokensave bench`) exists in the repo and is runnable, the pinned-ref external benchmarks are real and reproducible by anyone.
- Proof Ledger Decision: **SUPPORTED** — methodology is published and independently re-runnable, but it's self-selected and self-run, not yet independently replicated on third-party repos at scale.

Note: don't apply this full six-step process to every minor claim — reserve it for headline numbers that will materially affect a tool's verdict, and especially whenever a claim would flip a tool from "Watch" to "Add" or "Best in class."
