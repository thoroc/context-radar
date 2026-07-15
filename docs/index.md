---
title: context-radar
---

# context-radar

**How cheaply can an AI agent work on this project?**

context-radar rates GitHub projects on _agentic context efficiency_: the token cost an
AI coding agent pays to build the context it needs before it can do useful work. A
project that ships clear agent instructions, a code index, layered docs, and retrieval
affordances lets an agent fetch exactly what it needs. A project that does not forces
the agent to read everything, and tokens are the bill.

- [Methodology](methodology.md): the seven-dimension scoring rubric and how the radar
  score is computed.
- [Catalogue](projects/): every project analysed, with scores and grades.
- [Glossary](glossary.md): terms used across the catalogue.
- [`llms.txt`](llms.txt): the whole catalogue in a flat, LLM-friendly shape.

## How to read a score

Each project is scored 0 to 5 on seven dimensions. The weighted total is the **radar
score** out of 100, mapped to a grade (A to F) and an adoption recommendation (adopt,
trial, assess, hold). The seven dimensions are chosen so a project's profile reads as
a radar chart.

## Contributing

Analyses can be added by hand today and generated automatically later. Both paths write
the same artefact: a Markdown file in `docs/projects/` whose YAML frontmatter is the
structured record. See [CONTRIBUTING](https://github.com/pantheon-org/context-radar/blob/main/CONTRIBUTING.md).

## Roadmap

1. **Now.** Docs-only. Methodology, a worked example, contribution template and schema.
2. **Next.** Enable GitHub Pages from `/docs`. Grow the catalogue by hand.
3. **Later.** A scanner that reads a repository and drafts an analysis from the rubric,
   plus a generated catalogue table and radar-chart rendering. The frontmatter schema
   is the contract that keeps manual and automated entries interchangeable.

---

_These ratings are decision support. A human should make and document any adoption
decision that materially affects a team or product._
