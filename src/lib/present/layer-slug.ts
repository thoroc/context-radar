/**
 * URL-safe stable identifier for a layer name. Shared by the comparison table
 * and the layer-pages plugin the same way `toolSlug` is shared, so link targets
 * and generated filenames cannot drift.
 *
 * Note it collapses `&` and `+` to the same separator, so two layer names
 * differing only in their conjunction would produce one slug. The store-wide
 * collision guard lives in scripts/validate-data.ts, which can see the whole
 * layer set; this function deliberately stays a pure string transform.
 */
export const layerSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
