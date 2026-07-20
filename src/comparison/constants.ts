import type { ConflictSeverity } from "../lib";

export interface LayerDef {
  label: string;
  note: string;
  match: string[];
}

// Display layers, in order. `match` lists the raw Layer strings that collapse
// into this display group (matched by prefix). The group heading replaces the
// per-row layer tag, so the layer is shown once per section rather than on
// every row.
export const LAYERS: LayerDef[] = [
  {
    label: "Shell & tool output compression",
    note: "pick exactly one shell tool",
    match: ["Shell output", "All tool output"],
  },
  { label: "Static context injection", note: "", match: ["Static context injection (push model)"] },
  {
    label: "Conversation history management",
    note: "",
    match: ["Conversation history management"],
  },
  { label: "Personal knowledge retrieval", note: "", match: ["Personal knowledge retrieval"] },
  {
    label: "Library documentation retrieval",
    note: "",
    match: ["Library documentation retrieval"],
  },
  {
    label: "Codebase understanding & onboarding",
    note: "",
    match: ["Codebase understanding & onboarding"],
  },
  {
    label: "Code navigation",
    note: "pick a primary; others stackable",
    match: ["Code navigation"],
  },
  {
    label: "Architecture violation detection",
    note: "",
    match: ["Architecture violation detection"],
  },
  { label: "MCP definition tokens", note: "", match: ["MCP definition tokens"] },
  { label: "Agent memory persistence", note: "", match: ["Agent memory persistence"] },
  {
    label: "Cross-session governance",
    note: "",
    match: ["Cross-session governance"],
  },
  {
    label: "Response verbosity & memory compression",
    note: "",
    match: ["Response verbosity & memory compression", "Response verbosity + memory compression"],
  },
  {
    label: "Config stack audit",
    note: "",
    match: ["Config stack audit"],
  },
  { label: "Agent safety enforcement", note: "", match: ["Agent safety enforcement"] },
  {
    label: "Agent runtime & context orchestration",
    note: "",
    match: ["Agent runtime & context orchestration"],
  },
  {
    label: "Universal context compression middleware",
    note: "",
    match: ["Universal context compression middleware"],
  },
  { label: "Tabular data retrieval", note: "", match: ["Tabular data retrieval"] },
  {
    label: "Reference resource (curated list)",
    note: "not installable",
    match: ["Reference resource (curated list)"],
  },
  {
    label: "Code generation minimalism (YAGNI enforcement)",
    note: "",
    match: ["Code generation minimalism (YAGNI enforcement)"],
  },
];

// Non-permissive licence identifiers that also get a warning badge.
export const LWARN = new Set([
  "ELv2",
  "AGPL-3",
  "AGPL-3.0",
  "PolyForm Noncommercial",
  "PolyForm NC",
  "Source-available (commercial licence for distribution)",
  "Paid (commercial)",
]);

// Conflict severity to [css class, short label], concentrating the strong
// colour on the two decision-support signals (verdict + conflict).
export const CONFLICT: Record<ConflictSeverity, [string, string]> = {
  hard: ["cf-hard", "Hard conflict"],
  soft: ["cf-soft", "Soft overlap"],
  "either-or": ["cf-either", "Either / or"],
  stackable: ["cf-stack", "Stackable"],
  none: ["cf-none", "None"],
};
