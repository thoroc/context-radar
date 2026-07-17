import type { ActivityBand, ConflictSeverity, RuntimeLanguage, VerdictDecision } from "../schema";

// Lookup tables shared by the presentation helpers. Kept in one const module per
// the "dedicated const/type modules" convention, so the function modules stay
// pure single-purpose units.

export const BAND_EMOJI: Record<ActivityBand, string> = {
  active: "🟢",
  stable: "🟡",
  slowing: "🟠",
  early: "🔴",
  dormant: "⚫",
  none: "—",
};

export const BAND_CLASS: Record<ActivityBand, string> = {
  active: "a-hyper",
  stable: "a-stable",
  slowing: "a-slow",
  early: "a-early",
  dormant: "a-dead",
  none: "a-stable",
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
  hard: "⛔ HARD",
  soft: "⚠ SOFT",
  "either-or": "Either/or",
  stackable: "Stackable",
  none: "—",
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
  none: ["rt-none", "—"],
};
