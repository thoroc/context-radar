# Resolving fetch-vs-search conflicts

Load this when a direct fetch and a search disagree on a star count, when batched
star searches return noise, or when a repo looks like it may have moved owner.

## Resolving conflicts between a direct fetch and search results

When a direct fetch and a web search disagree on stars for the *same URL*, don't assume either source by default — work through this order:

1. **Check for an org/repo transfer first.** If search results show a differently-named owner for what looks like the same project (matching description, README content, badge set, or topics), this is not automatically a stale aggregator — it may be a real move. Fetch the alternate URL directly and compare `repository_id` in the page metadata (visible in the fetched markdown's frontmatter) between the two candidates. An identical `repository_id` confirms it's the same repository under a new owner/org — not two different projects. (Real example: `chopratejas/headroom` transferred to `headroomlabs-ai/headroom` — both URLs returned live, non-redirected, internally-consistent pages with different star counts, and only checking `repository_id` resolved which was canonical.)
2. **If no transfer is found, trust a fresh direct fetch of the exact URL over third-party aggregator snapshots** (star-history.com, ecosyste.ms, OpenGithubs rankings, etc.) — these cache on their own schedule and can lag by weeks. (Real example: `thedotmack/claude-mem` — our recorded 85.4k was correct; star-history.com's cached 70.9k and an even older third-party citation of 46.1k were both stale snapshots.)
3. **If a transfer is confirmed, update the `githubUrl` field in the record**, not just the star count — the old URL should not remain as the tool's primary reference.

## Query refinement for batched star searches

Batching 3-4 tools per search query (per the Star Count Refresh Policy) is efficient but frequently returns comparison docs, marketing copy, or unrelated mentions rather than a clean current number. When a batch query doesn't yield an unambiguous figure for a given tool, follow up with a single-tool, quoted-repo-path query: `"owner/repo" github star count`. This reliably surfaces star-history.com entries or live GitHub issue-page snippets (which render current stats regardless of the issue's age) with an unambiguous number.

## Treat meta-comparison articles as corroboration, not as a star-count source

Third-party research/comparison articles (e.g. category roundups analyzing "code intelligence tools" or "AI memory tools") are valuable for qualitative corroboration — competitive positioning, licensing friction anecdotes, maintainer concentration risk — but their star figures are snapshots from whenever the article was written and age exactly like any other cached source. Use them to validate narrative claims, not as the deciding number in a conflict.
