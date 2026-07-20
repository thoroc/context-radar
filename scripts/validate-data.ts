import { readFileSync } from "node:fs";
import { datasetSchema, recommendationsFileSchema } from "../src/lib/schema";
import { checkConflicts, checkLayers, checkRecommendations } from "./validate";

// Validates the canonical store and the recommendations file against the Zod
// schema (the single source of truth), then cross-checks recommendations against
// the store. Run via `mise run validate`; also runs in the pre-commit hook and CI.
const storePath = "data/context-reduction-tools.json";
const recsPath = "data/tool-recommendations.json";

const printIssues = (label: string, issues: { message: string; path: PropertyKey[] }[]): void => {
  console.error(`Data validation failed for ${label}:`);
  for (const issue of issues) {
    console.error(`  ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
};

const parseJson = (label: string): unknown => {
  try {
    return JSON.parse(readFileSync(label, "utf8"));
  } catch (err) {
    console.error(`Could not read/parse ${label}: ${(err as Error).message}`);
    process.exit(1);
  }
};

const store = datasetSchema.safeParse(parseJson(storePath));
if (!store.success) {
  printIssues(storePath, store.error.issues);
  process.exit(1);
}

const recs = recommendationsFileSchema.safeParse(parseJson(recsPath));
if (!recs.success) {
  printIssues(recsPath, recs.error.issues);
  process.exit(1);
}

const storeErrors = [
  ...checkLayers(store.data.tools, store.data.layers),
  ...checkConflicts(store.data.tools),
];
if (storeErrors.length > 0) {
  console.error(`Cross-store validation failed for ${storePath}:`);
  for (const error of storeErrors) console.error(`  ${error}`);
  process.exit(1);
}

const crossErrors = checkRecommendations(store.data.tools, recs.data.recommendations);
if (crossErrors.length > 0) {
  console.error(`Cross-store validation failed for ${recsPath}:`);
  for (const error of crossErrors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(
  `OK: ${store.data.tools.length} tools, ${recs.data.recommendations.length} recommendations, schema valid (verified ${store.data.meta.stars_verified}).`,
);
