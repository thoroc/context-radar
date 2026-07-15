---
title: Glossary
---

# Glossary

**Context window.** The bounded amount of text an agent can hold at once. Everything the agent reads, is told, or
generates competes for the same space, so context spent inefficiently is capability lost.

**Context reduction.** Cutting what gets loaded into or generated within the context window: compressing tool output,
retrieving scoped slices instead of whole files, persisting memory across sessions, or trimming the agent's own
verbosity.

**Layer.** The point in the pipeline a tool acts on, for example shell output, static context injection, code
navigation, agent memory persistence, or MCP definition tokens. Tools are grouped by primary layer; group on prefix
match, not exact string equality.

**Verdict.** The catalogue's adoption call for a tool: Best in class, Add, Add if you use [X], Either/or pick one,
Watch, Reference only, or Drop. See the [methodology](methodology.md).

**Hard conflict.** Two MCP servers expose the same or near-identical tool name. The agent cannot reliably route between
them, so only one should be installed.

**Soft conflict.** Two tools have overlapping or redundant roles. Running both wastes resources but does not break
routing.

**MCP tool-name collision.** The specific hard conflict this catalogue tracks most carefully: identical tool names from
different servers confuse an agent's tool routing even when nothing crashes.

**LLM dependency tier.** How much a tool relies on model calls: Zero-LLM, Extraction-only, Full-pipeline,
Session-calling, or SaaS-hosted. Drives cost, latency, and privacy.

**Session-calling.** A tool that consumes your own active agent session credits rather than a separate API key, for
example when it compresses history using the same session.

**Code beats docs.** The rule that a feature, licence, or telemetry claim in a README is verified against source or
official docs before being recorded as fact.

**Proof ledger decision.** The label given to a pressure-tested headline claim: PROVEN, SUPPORTED, OPEN, or REJECTED.
See the [methodology](methodology.md).

**Activity status.** A banded read on how alive a project is, from hyper-active through active to early and dormant,
based on releases, commits, and contributor activity.

**Trend.** The direction and rough size of a tool's star movement since the previous recorded figure. Direction is
reliable; the exact percentage is approximate.

**Source of truth.** The CSV. The JSON mirror and the HTML comparison table are rebuilt from it, so edits are made to
the CSV first.
