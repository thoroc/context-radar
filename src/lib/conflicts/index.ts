// Conflicts domain: resolve conflict.projects references (a mix of ids and
// display names) and build a symmetric, max-severity conflict graph over the
// tool store. Pure and type-only against the schema, so it stays out of the
// browser's Zod footprint.

export * from "./conflict-graph";
export * from "./resolve-project-ref";
