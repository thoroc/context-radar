# context-radar

A catalogue that rates GitHub projects on **agentic context efficiency**: how well a
project is set up so that an AI coding agent can work on it while spending as few
tokens as possible.

When an agent picks up a task in a repository, most of its token budget is spent
just building context: reading files, tracing callers, re-scanning docs. Some
projects make that cheap (clear agent instructions, a code index, progressive
documentation, retrieval affordances). Others force the agent to read everything.
context-radar measures that difference and publishes the findings.

## What this repository is

Three things in one place:

1. **A methodology.** A scoring rubric that defines what "good agentic context" means,
   across seven dimensions. See [`docs/methodology.md`](docs/methodology.md).
2. **A catalogue.** One analysis per project, each scored against the rubric. See
   [`docs/projects/`](docs/projects/).
3. **A contribution path.** Templates and a schema so analyses can be added by hand
   today and generated automatically later. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Audience and outputs

- **Humans** browse the catalogue (via GitHub Pages, once enabled) to infer which
  tools and project patterns to adopt.
- **Agents and tooling** consume the same data in an LLM-friendly shape: every
  analysis is a Markdown file whose YAML frontmatter is the structured record, and
  [`docs/llms.txt`](docs/llms.txt) is a flat index of the whole catalogue.

## Repository layout

```
context-radar/
  README.md                     This file
  CONTRIBUTING.md               How to add or update a project analysis
  docs/                         GitHub Pages source (Settings then Pages then /docs)
    _config.yml                 Jekyll config for GitHub Pages
    index.md                    Landing page
    methodology.md              The scoring rubric
    glossary.md                 Terms used across the catalogue
    llms.txt                    Flat, LLM-friendly index of the catalogue
    projects/
      index.md                  Catalogue table
      example-context-mode.md   Worked example analysis
  templates/
    project-analysis.md         Blank template for a new analysis
  schema/
    project-analysis.schema.json  JSON Schema describing the frontmatter
```

## Status

Docs-only for now. GitHub Pages is not yet enabled and there is no remote. The
structure is arranged so that enabling Pages (source: `/docs`) and adding automated
generation later are both low-effort. See the roadmap in
[`docs/index.md`](docs/index.md).

## The scoring model in one paragraph

Each project is scored 0 to 5 on seven dimensions. The weighted total is the
**radar score** out of 100, which maps to a grade (A to F) and an adoption
recommendation (adopt, trial, assess, hold). The seven axes are chosen so the profile
can be read as a radar chart, which is where the name comes from. Full definitions
live in [`docs/methodology.md`](docs/methodology.md).
