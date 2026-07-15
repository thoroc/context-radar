import { readFileSync, writeFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { datasetSchema, toolSchema } from "../src/lib/schema";

// Ingests a filled-in tool template (YAML), validates it against the schema, and
// upserts it into the canonical store by tool name. Usage:
//   mise run data:add -- templates/my-tool.yaml
// Accept the path whether invoked as `... <file>` or `... -- <file>`.
const yamlPath = process.argv.slice(2).find((a) => a !== "--");
if (!yamlPath) {
  console.error("Usage: mise run data:add -- <path-to-filled-template.yaml>");
  process.exit(1);
}

const toolResult = toolSchema.safeParse(parseYaml(readFileSync(yamlPath, "utf8")));
if (!toolResult.success) {
  console.error(`${yamlPath} does not match the tool schema:`);
  for (const issue of toolResult.error.issues) {
    console.error(`  ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
  process.exit(1);
}
const tool = toolResult.data;

const dataPath = "data/context-reduction-tools.json";
const dataset = datasetSchema.parse(JSON.parse(readFileSync(dataPath, "utf8")));

const idx = dataset.tools.findIndex((t) => t.tool === tool.tool);
if (idx >= 0) dataset.tools[idx] = tool;
else dataset.tools.push(tool);

dataset.meta.tool_count = dataset.tools.length;
dataset.meta.last_updated = new Date().toISOString().slice(0, 10);

// Re-validate the whole dataset before writing (catches duplicate-name and count invariants).
const final = datasetSchema.safeParse(dataset);
if (!final.success) {
  console.error("Resulting dataset is invalid:");
  for (const issue of final.error.issues) {
    console.error(`  ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
  process.exit(1);
}

writeFileSync(dataPath, `${JSON.stringify(final.data, null, 2)}\n`);
console.log(
  `${idx >= 0 ? "Updated" : "Added"} "${tool.tool}". Catalogue now has ${dataset.tools.length} tools.`,
);
