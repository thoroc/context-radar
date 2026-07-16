import type { Tool } from "../lib/schema";

/** A valid Tool for tests; override any field. Kept out of coverage (see
 * vitest.config.ts coverage.exclude). */
export const makeTool = (overrides: Partial<Tool> = {}): Tool => ({
  id: "t",
  tool: "Example",
  githubUrl: "https://example.com/example",
  layer: "Shell output",
  whatItDoes: "does a thing",
  conflict: { severity: "none", projects: [] },
  runtime: { languages: ["none"] },
  requirements: "none",
  licence: { spdx: "MIT" },
  stars: 1,
  trend: 0,
  activity: {},
  activityStatus: { band: "stable", label: "Stable" },
  verdict: { decision: "add", rationale: "" },
  decisionRule: "use it",
  ...overrides,
});
