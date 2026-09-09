import type { ConflictSeverity } from "../lib";

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
