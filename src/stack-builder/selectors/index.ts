// Selectors domain: pure reads over the shared selection state and the canonical
// layers (coverage, warnings, star total, visibility). Conflict detection lives in
// the model domain (conflictsFor over the shared conflict graph).

export * from "./covered-layers";
export * from "./get-warned-tools";
export * from "./tool-visible";
export * from "./total-stars";
