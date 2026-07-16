# Evals for project-comparison-fetch

Evaluation scenarios that exercise the skill's trigger surface. Each
`scenario-*/` directory holds three files:

- `task.md` — the user prompt, the context, the expected behaviour, and the
  failure conditions.
- `criteria.json` — a weighted checklist of measurable success criteria; the
  weights sum to 100.
- `capability.txt` — a one-line statement of the capability under test.

## Coverage

| Scenario | Capability |
| --- | --- |
| 01 star-cross-verify | Fetch fresh data and cross-verify stars against a stale render |
| 02 owner-transfer | Distinguish an org/repo transfer from a stale aggregator via repository_id |
| 03 code-beats-docs-evidence | Code-beats-docs and cited evidence with confirmed/caveated status |
| 04 benchmark-proof-ledger | Pressure-test a benchmark and record it in extraClaims with a proof ledger |
| 05 out-of-scope | Reject an out-of-scope project without a full assessment |
| 06 threat-pattern | Recognise malware/threat patterns and refuse to add the repo |
| 07 conflict-and-ingest | Flag an MCP tool-name conflict, assign layer/verdict, ingest via the template |

Scenarios 01, 02, 05, 06 cover the fetch-and-verify half of the skill; 03, 04, 07
cover assessment, the evidence layer, and ingest.

## Running

These are model-graded scenarios, not an automated harness. Give an agent the
skill plus a scenario's `task.md`, then score the transcript against
`criteria.json`. The fixtures are synthetic (acme/, widget/ owners); no live
repository is required.
