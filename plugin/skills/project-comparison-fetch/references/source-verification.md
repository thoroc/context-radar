# Source verification

How to turn a claim into a `confirmed`, source-backed citation the CI gate will accept. The
repo page proves a tool exists; only the source proves what it does. A GitHub Action
(`evidence.yml`) re-fetches every `source-code` citation at its pinned commit SHA and fails if
the quoted text is not there, so a citation copied from memory or from a second-hand analysis
will not pass. Verify against the tool's own source, not someone else's write-up.

## The citation shape

A `source-code` source is `{ url, quote, checkedOn, evidenceType: "source-code" }`:

- `url`: a blob permalink pinned to a **commit SHA** (not a branch) with a **line anchor**.
- `quote`: the code or comment at those lines, copied verbatim.
- `checkedOn`: the ISO date (`YYYY-MM-DD`) you read it. Always the date you actually re-read
  the source, never the date of an analysis you are migrating from.

## Building the permalink

Pin to a commit SHA so the line reference cannot rot on a later refactor. Line anchors and hex
SHAs are required; the rule is host-aware:

| Host | Accepted shape |
| --- | --- |
| GitHub / Gitea | `https://github.com/<owner>/<repo>/blob/<sha>/<path>#L42` (or `#L42-L60`) |
| GitLab | `https://gitlab.com/<group>/<repo>/-/blob/<sha>/<path>#L42` |
| Codeberg / Gitea | `https://codeberg.org/<owner>/<repo>/src/commit/<sha>/<path>#L42` |

On GitHub, open the file and press `y` to rewrite the URL to the current commit SHA, then click
the start line and shift-click the end line to add the `#L..-L..` anchor. The `<sha>` must be
hexadecimal (7 to 40 chars); a branch name such as `main` is rejected by validation and by the
gate.

## What must NOT be typed `source-code`

`source-code` means a specific span of code or an in-file comment. A claim with no single line
belongs under a different `evidenceType`:

- A LICENSE file or a relicensing statement: `official-docs` or `release`.
- A release note or version tag: `release`.
- A documentation-site page: `official-docs`.
- An absence claim ("no telemetry", "no network calls"): cite the specific region that would
  contain it if it existed, or record it as `caveated` under `official-docs`; do not force a
  line anchor onto a whole-file assertion.

## The verbatim-match gate

`mise run evidence:verify` (and `evidence.yml` in CI) fetches each `source-code` file at its
pinned SHA, slices the cited line range, and checks the `quote` appears there. Comparison is
whitespace- and comment-normalised (leading `//`, `//!`, `#`, `*` are stripped, whitespace
collapsed), so a genuine quote survives comment markers and re-wrapping while a fabricated or
drifted one fails.

- A **mismatch** or an **unparseable** permalink is a hard failure: the citation is wrong, fix
  it before merge.
- An **unreachable** source (network error, repo gone private) is a soft warning, so CI does not
  flake on a transient outage.

Run it locally before committing evidence: it is network-bound and deliberately kept out of the
offline `mise run validate` and pre-commit path.

## Migrating a claim from a secondary source

Analyses in other repositories are a bibliography, not a shortcut. They give you the
file-and-symbol pointer; you still open the tool's own source at a current SHA and quote it
yourself. Two failure modes to avoid, both real:

- **Stale reads.** A source-verified analysis can lag the tool (one had a reference at `v0.28.2`
  while the source was `v0.35.0`). Re-fetch at a current SHA and re-record `checkedOn`.
- **Inherited errors.** A claim can be confidently wrong in the source analysis (one asserted a
  compile-time test enforcement that did not exist). Confirm behaviour in the code, not the
  prose.

Reusing the exact SHA a vendored analysis pinned is a signal you did not re-read the source. Pin
to a SHA you fetched yourself.

## When to clone locally

For most tools a blob fetch per claim is enough. Clone the repo locally only for a contested or
high-signal tool where you need to grep across files, confirm an absence, or trace a call path
before you can quote the decisive line. The citation you record is still a blob permalink at the
SHA you checked out, so the gate can re-verify it.

## Worked example

`tokensave`, a runnable benchmark harness claim:

- `url`: `https://github.com/aovestdipaperino/tokensave/blob/f14b3bb5d70256211d094aced9a48c7018355dd5/src/bench.rs#L1-L6`
- `quote`: the `//!` module doc at lines 1 to 6 describing the harness, copied verbatim.
- `checkedOn`: `2026-07-16`, `evidenceType`: `source-code`.

The gate fetches `bench.rs` at that SHA, normalises lines 1 to 6, and confirms the quote is
present. If the harness were only described in the README, the claim would be `readme` and could
not reach `confirmed` (code-beats-docs).
