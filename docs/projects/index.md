---
title: Catalogue
---

# Catalogue

Every project analysed against the [methodology](../methodology.md). The table is
maintained by hand for now; a later step generates it from the frontmatter of each
analysis file.

| Project | Category | Radar score | Grade | Recommendation | Analysed |
|---------|----------|-------------|-------|----------------|----------|
| [tokensave](example-tokensave.md) | mcp-server | 82 | B | trial | 15-07-2026 |

## Columns

- **Radar score.** Weighted total out of 100. See the [methodology](../methodology.md).
- **Grade.** A (85+), B (70 to 84), C (55 to 69), D (40 to 54), F (under 40).
- **Recommendation.** adopt, trial, assess, or hold. A judgement-based ring, not a
  direct function of the score.

## Add a project

Copy [`templates/project-analysis.md`](https://github.com/pantheon-org/context-radar/blob/main/templates/project-analysis.md)
to `docs/projects/<slug>.md`, fill it in, and add a row above. Keep the frontmatter
valid against [the schema](https://github.com/pantheon-org/context-radar/blob/main/schema/project-analysis.schema.json).
