import rawData from "../../../data/context-reduction-tools.json";
import rawRecs from "../../../data/tool-recommendations.json";
import type { Dataset, Meta, Recommendation, RecommendationsFile, Tool } from "../schema";

// Data domain: the typed, guarded view of the canonical JSON store. The JSON is
// validated against the Zod schema at build/CI time (`mise run validate`), so the
// site trusts it and imports only the inferred *type* - Zod itself is never
// bundled into the browser. A cheap invariant guard stays here so a hand-broken
// file fails fast in dev too. This domain is const-only, so there is nothing to
// split into one-function-per-module.
const dataset = rawData as Dataset;

if (dataset.meta.tool_count !== dataset.tools.length) {
  throw new Error(
    `meta.tool_count (${dataset.meta.tool_count}) != tools.length (${dataset.tools.length}). ` +
      "Run `mise run validate`.",
  );
}

/** Catalogue metadata: refresh date, stars snapshot date, tool count. */
export const META: Meta = dataset.meta;

/** All tools, in catalogue order. */
export const TOOLS: Tool[] = dataset.tools;

/** Tools keyed by their stable `id`, for resolving recommendation members to their detail page. */
export const TOOLS_BY_ID: Map<string, Tool> = new Map(dataset.tools.map((t) => [t.id, t]));

/**
 * Cross-tool "use this, not that" recommendations, validated against the schema
 * and cross-checked against the tool store at build/CI time (`mise run validate`),
 * so the site imports only the inferred type. Empty until a layer is authored.
 */
export const RECOMMENDATIONS: Recommendation[] = (rawRecs as RecommendationsFile).recommendations;
