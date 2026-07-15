---
title: Glossary
---

# Glossary

**Agentic context.** The information an AI coding agent must load into its context
window before it can complete a task in a repository: instructions, relevant source,
structural relationships, docs, and commands.

**Context budget.** The tokens available for a task. Building context competes with
reasoning and output for the same budget, so context spent inefficiently is capability
lost.

**Radar score.** context-radar's weighted total out of 100 across the seven scoring
dimensions. See the [methodology](methodology.md).

**Retrieval affordance.** Any feature that lets an agent fetch a scoped slice of a
project on demand rather than reading whole files: an `llms.txt`, an MCP server, a code
graph, structured metadata, or a search API.

**Progressive disclosure.** Documentation arranged as short entry points that link to
detail, so a reader (human or agent) can stop as soon as the question is answered
instead of loading everything up front.

**Signal-to-noise.** The proportion of a repository tree that is worth an agent's
attention. Generated output, vendored dependencies, and oversized files are noise when
they land in search results or file reads.

**`llms.txt`.** A convention for a plain-text file that gives language models a curated,
flat entry point to a project or site. context-radar publishes one for the catalogue.

**Onboarding tokens.** An estimate of the tokens needed to bring an agent up to speed
on one representative task in a repository. The basis for the context budget footprint
dimension.

**Adoption recommendation.** A technology-radar-style ring (adopt, trial, assess, hold)
capturing whether a team should lean on a project for agent-assisted work. Judgement
based, and not a direct function of the score.
