import { layerSlug } from "../../src/lib/present/layer-slug";
import type { LayerMeta, Tool } from "../../src/lib/schema";

/**
 * Cross-store checks for the `layers[]` section that the Zod schema cannot make
 * because it cannot see the tool store: every layer that holds tools has a
 * layers[] entry (the schema already enforces this direction), and every
 * `curatedPick` names a real tool id that actually sits in that layer, and no
 * two layers reduce to the same URL slug. Returns a list of human-readable
 * errors, empty when the section is consistent.
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

  // Slug collisions have to be checked across the whole layer set, which is why
  // this cannot be a unit test on layerSlug. The slug drops connectors, so
  // "Codebase understanding & onboarding" and a hypothetical "Codebase
  // understanding + onboarding" would both become
  // codebase-understanding-onboarding and silently overwrite one another's page.
  const slugOwners = new Map<string, string>();
  for (const layer of layers) {
    const slug = layerSlug(layer.name);
    const owner = slugOwners.get(slug);
    if (owner !== undefined) {
      errors.push(`layers '${owner}' and '${layer.name}' both reduce to the slug '${slug}'`);
      continue;
    }
    slugOwners.set(slug, layer.name);
  }

  return errors;
};
