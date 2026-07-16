# Scenario 03: Code-beats-docs and cited evidence

## User Prompt

"Assess https://github.com/acme/graphmind and add it. Its README claims
'96% recall on LongMemEval' and 'native Neo4j support'."

## Context

The repo has source implementing a Neo4j client, but the benchmark number
appears only in README marketing copy; there is no evaluation script in the repo.

## Expected Behaviour

1. Verify each headline claim against source, not README copy.
2. Neo4j support is found in source, so it may be recorded as a confirmed evidence
   claim citing a commit-SHA permalink to the client code (evidenceType source-code).
3. The 96% benchmark has no eval script in source, so it must not be confirmed.
   Record it caveated (proof ledger OPEN), with the README as a readme-type source.
4. Any confirmed claim cites at least one source-code, official-docs, or release source.
5. Sources use commit-SHA permalinks with a verbatim quote and a checkedOn date,
   not a moving-branch URL.

## Failure Conditions

- Records the 96% benchmark as a confirmed fact.
- Uses a README-only citation to mark a claim confirmed.
- Cites a /blob/main/ URL (moving branch) instead of a commit SHA.
- Fabricates a quote or a source URL that was not actually fetched.
