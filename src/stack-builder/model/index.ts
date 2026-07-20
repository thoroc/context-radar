// Model domain: pure derivations over the canonical store (src/lib). Takes tools,
// layers, recommendations and the conflict graph as inputs and never reads the
// builder's mutable state, so every function is unit-testable in isolation and no
// runtime Zod is pulled into the browser bundle.

export * from "./activity-rank";
export * from "./conflicts-for";
export * from "./ideal-pick";
export * from "./suggested-stack";
export * from "./types";
export * from "./verdict-rank";
