# Scenario 04: Benchmark claim pressure-test

## User Prompt

"Add https://github.com/acme/tokenpack. Its README headlines '90% token savings'
from `tokenpack bench`, run against the tool's own repo with 8 published queries.
The bench script is in the repo and runnable."

## Expected Behaviour

1. Restate the claim as a falsifiable statement (query set, repo, metric).
2. Work the six-step pressure-test: verifier boundary, baseline, enemy terms
   (self-selected repo and queries, self-run), and rejection gate.
3. Assign a proof-ledger decision of SUPPORTED (methodology published and
   re-runnable, but self-selected and self-run), not PROVEN.
4. Record it as an extraClaims entry with kind benchmark, proofLedger SUPPORTED,
   and an evidence block citing the in-repo bench script (source-code permalink).
5. Note that a benchmark extraClaim without a proofLedger fails validation.

## Failure Conditions

- Labels the claim PROVEN despite self-selected, self-run methodology.
- Records the number as a plain stated fact with no proof ledger.
- Omits proofLedger on a benchmark extraClaim.
