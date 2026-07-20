import {
  conflictGraph,
  LAYERS_META,
  type LayerMeta,
  RECOMMENDATIONS,
  TOOLS,
  type Tool,
} from "../lib";

/** Filter chips, in order. */
export const FILTERS = [
  { id: "all", label: "All tools" },
  { id: "rec", label: "Rec picks" },
  { id: "sel", label: "Selected" },
  { id: "open", label: "Open source only" },
  { id: "warn", label: "Needs model/infra" },
];

/** A layer's metadata plus the tools that sit in it, in catalogue order. */
export interface BuilderLayer extends LayerMeta {
  tools: Tool[];
}

// Layers derived once at module load from the canonical store (cf. TOOLS_BY_ID in
// src/lib/data): ordered by the layers[] `order`, each carrying its tools. The
// builder reads these instead of a hand-maintained list, so it can never drift
// from the catalogue.
export const LAYERS: BuilderLayer[] = [...LAYERS_META]
  .sort((a, b) => a.order - b.order)
  .map((meta) => ({ ...meta, tools: TOOLS.filter((t) => t.layer === meta.name) }));

/** Layer coverage denominator: installable layers only (reference layers excluded). */
export const TOTAL_LAYERS = LAYERS.filter((l) => l.cardinality !== "reference").length;

/** Symmetric, max-severity conflict graph over the whole store, built once. */
export const CONFLICT_GRAPH = conflictGraph(TOOLS);

// Tool ids that are a curated pick for their layer: a layer `curatedPick` or a
// recommendation `pick`. Drives the "rec" badge and the "Rec picks" filter.
export const CURATED_PICK_IDS: ReadonlySet<string> = new Set(
  [...LAYERS_META.map((l) => l.curatedPick), ...RECOMMENDATIONS.map((r) => r.pick)].filter(
    (id): id is string => id !== undefined,
  ),
);
