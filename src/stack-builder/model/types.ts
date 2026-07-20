// Shared model types. `curated` = a human-designated pick (a recommendation or a
// layer curatedPick); `suggested` = the top-verdict candidate the heuristic
// chose; `none` = no confident pick, the layer is left for the user to choose.
export type Provenance = "curated" | "suggested" | "none";

/** The pick for one layer plus where it came from; `toolId` is absent when none. */
export interface IdealPick {
  toolId?: string;
  provenance: Provenance;
}
