import { readFileSync } from "node:fs";
import { datasetSchema } from "../src/lib/schema";

// Validates data/context-reduction-tools.json against the Zod schema (the single
// source of truth for the record shape). Run via `mise run validate`; also runs
// in the pre-commit hook and in CI.
const path = "data/context-reduction-tools.json";

let raw: unknown;
try {
  raw = JSON.parse(readFileSync(path, "utf8"));
} catch (err) {
  console.error(`Could not read/parse ${path}: ${(err as Error).message}`);
  process.exit(1);
}

const result = datasetSchema.safeParse(raw);
if (!result.success) {
  console.error(`Data validation failed for ${path}:`);
  for (const issue of result.error.issues) {
    console.error(`  ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
  process.exit(1);
}

console.log(
  `OK: ${result.data.tools.length} tools, schema valid (verified ${result.data.meta.stars_verified}).`,
);
