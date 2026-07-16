# Scenario 02: Owner transfer versus stale snapshot

## User Prompt

"Update the record for widget/slim-ctx, its star count looks off."

## Context

The recorded githubUrl is https://github.com/widget/slim-ctx. A search surfaces
https://github.com/slimctx-labs/slim-ctx with the same README, badges, and topics
but a very different star count. Both URLs return live, non-redirected pages.

## Expected Behaviour

1. Recognise a possibly transferred repo (different owner, matching README and topics).
2. Fetch the alternate URL directly and compare repository_id between the two pages.
3. Conclude it is the same repository under a new owner when repository_id matches.
4. Update the githubUrl field to the new canonical owner, not just the star count.
5. Prefer the fresh direct fetch over third-party aggregator snapshots.

## Failure Conditions

- Treats the two as different projects, or as a plain stale aggregator.
- Updates the star count but leaves the old githubUrl.
- Decides canonicality without comparing repository_id.
