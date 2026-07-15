import { writeFileSync } from "node:fs";
import { zodToJsonSchema } from "zod-to-json-schema";
import { toolSchema } from "../src/lib/schema";

// Generates the JSON Schema published beside the skill from the Zod schema, so
// the two never drift. Run via `mise run gen:schema` after changing the schema.
const outPath = "plugin/skills/project-comparison-fetch/schema/tool-record.schema.json";

const base = zodToJsonSchema(toolSchema, {
  $refStrategy: "none",
  target: "jsonSchema7",
}) as Record<string, unknown>;

const { $schema, ...rest } = base;

const out = {
  $schema: ($schema as string | undefined) ?? "http://json-schema.org/draft-07/schema#",
  $id: "https://github.com/pantheon-org/context-radar/schema/tool-record.schema.json",
  title: "context-radar tool record",
  description:
    "One tool record in data/context-reduction-tools.json. Generated from src/lib/schema.ts via `mise run gen:schema` — do not edit by hand.",
  ...rest,
};

writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`);
console.log(`Wrote ${outPath}`);
