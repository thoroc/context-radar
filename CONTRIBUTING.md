# Contributing

context-radar grows one project analysis at a time. Analyses can be written by hand
now and generated automatically later. Both paths produce the same artefact, so they
stay interchangeable.

## The artefact

One Markdown file per project under `docs/projects/<slug>.md`. Its YAML frontmatter is
the structured, machine-readable record; the prose beneath it is the human explanation.
The frontmatter must validate against
[`schema/project-analysis.schema.json`](schema/project-analysis.schema.json).

## Add an analysis by hand

1. Read the [methodology](docs/methodology.md) so you score against the shared rubric.
2. Copy [`templates/project-analysis.md`](templates/project-analysis.md) to
   `docs/projects/<slug>.md`, where `<slug>` is a short lowercase name.
3. Score each of the seven dimensions 0 to 5, citing evidence.
4. Compute the radar score with the formula in the methodology and set the grade and
   recommendation.
5. Add a row to the catalogue table in [`docs/projects/index.md`](docs/projects/index.md)
   and a line to [`docs/llms.txt`](docs/llms.txt).

## Conventions

- British English.
- Dates as DD-MM-YYYY.
- No em dashes.
- State the version or commit you reviewed, and the assumed task behind the context
  budget estimate, so the analysis is reproducible.
- Set `analyst` to `manual` or `automated` so the source of each entry is visible.

## Validating frontmatter

Any JSON Schema validator works against the frontmatter. For example, with a YAML to
JSON step and a validator of your choice, check each file in `docs/projects/` against
`schema/project-analysis.schema.json`. A validation step will be wired into CI once a
remote and Pages build exist.

## Automated contributions (planned)

A future scanner will read a repository, apply the rubric, and draft a
`docs/projects/<slug>.md` with `analyst: automated`. Because the schema is the contract,
generated and hand-written analyses share one format and one catalogue. Automated
drafts are expected to be reviewed by a human before merge.
