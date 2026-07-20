import type { LayerMeta, Tool } from "../../src/lib/schema";

/**
 * Cross-store checks for the `layers[]` section that the Zod schema cannot make
 * because it cannot see the tool store: every layer that holds tools has a
 * layers[] entry (the schema already enforces this direction), and every
 * `curatedPick` names a real tool id that actually sits in that layer. Returns a
 * list of human-readable errors, empty when the section is consistent.
 */
export const checkLayers = (tools: Tool[], layers: LayerMeta[]): string[] => {
  const errors: string[] = [];
  const byId = new Map(tools.map((t) => [t.id, t]));

  for (const layer of layers) {
    if (layer.curatedPick === undefined) continue;
    const pick = byId.get(layer.curatedPick);
    if (!pick) {
      errors.push(
        `layer '${layer.name}': curatedPick '${layer.curatedPick}' is not a known tool id`,
      );
      continue;
    }
    if (pick.layer !== layer.name) {
      errors.push(
        `layer '${layer.name}': curatedPick '${layer.curatedPick}' is in layer '${pick.layer}'`,
      );
    }
  }

  return errors;
};
