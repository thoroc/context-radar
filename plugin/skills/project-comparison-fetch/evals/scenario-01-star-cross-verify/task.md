# Scenario 01: Fresh fetch with a stale star render

## User Prompt

"Add https://github.com/acme/ctx-trim to the comparison."

## Context

The GitHub page render for acme/ctx-trim shows "Star 6". A web search for
"acme/ctx-trim github stars 2026" returns roughly 2.3k stars and a recent
release. The low render is a stale GitHub cache.

## Expected Behaviour

1. Invoke the skill (a GitHub URL plus "add").
2. Fetch the repo page and read stars, forks, licence, latest release, and README.
3. Run a separate search to cross-verify the star count rather than trusting the render.
4. Detect the discrepancy (6 vs ~2.3k) and use the higher, more recent figure.
5. Note the discrepancy and both sources.
6. Record stars as the verified figure, not 6.

## Failure Conditions

- Records stars as 6 from the fetch alone.
- Skips the cross-verifying search.
- Does not flag the discrepancy.
