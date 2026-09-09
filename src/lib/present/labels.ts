import type {
  ActivityBand,
  ConflictSeverity,
  LayerCardinality,
  RuntimeLanguage,
  VerdictDecision,
} from "../schema";

// Lookup tables shared by the presentation helpers. Kept in one const module per
// the "dedicated const/type modules" convention, so the function modules stay
// pure single-purpose units.

export const BAND_CLASS: Record<ActivityBand, string> = {
  active: "a-hyper",
  stable: "a-stable",
  slowing: "a-slow",
  early: "a-early",
  dormant: "a-dead",
  none: "a-stable",
};

/**
 * How many tools a layer expects, in reader-facing words. Shared so the
 * comparison table's section heading and the stack-builder's layer badge cannot
 * describe the same layer differently -- which is what happened while the
 * comparison table kept its own taxonomy and labelled a section containing a
 * stackable layer "pick exactly one shell tool".
 */
export const CARDINALITY_LABEL: Record<LayerCardinality, string> = {
  "pick-one": "pick one",
  stackable: "stackable",
  "install-both": "install both",
  reference: "reference",
};

export const DECISION_LABEL: Record<VerdictDecision, string> = {
  best: "Best in class",
  add: "Add",
  "add-if": "Add if you use",
  "either-or": "Either/or",
  watch: "Watch",
  reference: "Reference only",
  drop: "Drop",
};

export const DECISION_CLASS: Record<VerdictDecision, string> = {
  best: "v-best",
  add: "v-add",
  "add-if": "v-cond",
  "either-or": "v-either",
  watch: "v-watch",
  reference: "v-watch",
  drop: "v-drop",
};

export const SEVERITY_LABEL: Record<ConflictSeverity, string> = {
  hard: "HARD",
  soft: "SOFT",
  "either-or": "Either/or",
  stackable: "Stackable",
  none: "-",
};

export const CONFLICT_CLASS: Record<ConflictSeverity, string> = {
  hard: "conf-hard",
  soft: "conf-soft",
  "either-or": "conf-none",
  stackable: "conf-none",
  none: "conf-none",
};

/** [css class, short label] for each runtime language badge. */
export const LANG_BADGE: Record<RuntimeLanguage, [string, string]> = {
  rust: ["rt-rust", "Rust"],
  python: ["rt-python", "Python"],
  typescript: ["rt-ts", "TS"],
  javascript: ["rt-js", "JS"],
  node: ["rt-node", "Node"],
  go: ["rt-go", "Go"],
  powershell: ["rt-ps", "PS"],
  shell: ["rt-shell", "Shell"],
  lua: ["rt-lua", "Lua"],
  gleam: ["rt-gleam", "Gleam/BEAM"],
  elixir: ["rt-elixir", "Elixir/BEAM"],
  none: ["rt-none", "-"],
};
