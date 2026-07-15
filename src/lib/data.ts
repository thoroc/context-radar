import rawData from "../../data/context-reduction-tools.json";
import type { Dataset, Meta, Tool } from "./schema";

// The JSON is validated against the Zod schema at build/CI time (`mise run
// validate`), so the site trusts it and imports only the inferred *type* — Zod
// itself is never bundled into the browser. A cheap invariant guard stays here
// so a hand-broken file fails fast in dev too.
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
