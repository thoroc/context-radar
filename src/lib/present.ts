import type {
  ActivityBand,
  ConflictSeverity,
  Runtime,
  RuntimeLanguage,
  Tool,
  VerdictDecision,
} from "./schema";

// Presentation helpers shared by the comparison table and the CSV export, so the
// two stay in lock-step. These reconstruct the human-facing display from the
// structured record; the verbatim `notes`/`note`/`detail` fields make the
// reconstruction lossless where the source was free text.

const BAND_EMOJI: Record<ActivityBand, string> = {
  active: "🟢",
  stable: "🟡",
  slowing: "🟠",
  early: "🔴",
  dormant: "⚫",
  none: "—",
};

const BAND_CLASS: Record<ActivityBand, string> = {
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

const DECISION_CLASS: Record<VerdictDecision, string> = {
  best: "v-best",
  add: "v-add",
  "add-if": "v-cond",
  "either-or": "v-either",
  watch: "v-watch",
  reference: "v-watch",
  drop: "v-drop",
};

const SEVERITY_LABEL: Record<ConflictSeverity, string> = {
  hard: "⛔ HARD",
  soft: "⚠ SOFT",
  "either-or": "Either/or",
  stackable: "Stackable",
  none: "—",
};

const CONFLICT_CLASS: Record<ConflictSeverity, string> = {
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

/**
 * URL-safe stable identifier for a tool name. Shared by the comparison table
 * (which links to detail pages) and the tool-pages plugin (which emits them),
 * so the link targets and the generated filenames never drift apart.
 */
export const toolSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const starsText = (stars: number | null): string => (stars === null ? "—" : String(stars));

export const trendText = (trend: number | null): string => {
  if (trend === null) return "—";
  if (trend === 0) return "● flat";
  return trend > 0 ? `▲ +${trend}%` : `▼ ${trend}%`;
};

export const statusText = (status: Tool["activityStatus"]): string =>
  `${BAND_EMOJI[status.band]} ${status.label}`.trim();

export const statusClass = (band: ActivityBand): string => BAND_CLASS[band];

export const verdictText = (verdict: Tool["verdict"]): string =>
  verdict.rationale
    ? `${DECISION_LABEL[verdict.decision]} — ${verdict.rationale}`
    : DECISION_LABEL[verdict.decision];

export const verdictClass = (decision: VerdictDecision): string => DECISION_CLASS[decision];

export const conflictText = (conflict: Tool["conflict"]): string => {
  if (conflict.note) return conflict.note;
  if (conflict.severity === "none") return "—";
  const head = SEVERITY_LABEL[conflict.severity];
  return conflict.projects.length ? `${head}: ${conflict.projects.join(", ")}` : head;
};

export const conflictClass = (severity: ConflictSeverity): string => CONFLICT_CLASS[severity];

export const runtimeText = (runtime: Runtime): string => {
  if (runtime.detail) return runtime.detail;
  const named = runtime.languages.filter((l) => l !== "none").map((l) => LANG_BADGE[l][1]);
  return named.length ? named.join(" + ") : "—";
};

export const licenceText = (licence: Tool["licence"]): string => licence.spdx;

/** Lowercased haystack of every human-readable value, for the search box. */
export const searchText = (t: Tool): string => {
  const a = t.activity;
  return [
    t.tool,
    t.layer,
    t.whatItDoes,
    conflictText(t.conflict),
    runtimeText(t.runtime),
    t.requirements,
    t.licence.spdx,
    t.licence.warning ?? "",
    a.notes ?? "",
    a.corroboration ?? "",
    a.latestVersion ?? "",
    statusText(t.activityStatus),
    verdictText(t.verdict),
    t.decisionRule,
  ]
    .join(" ")
    .toLowerCase();
};
