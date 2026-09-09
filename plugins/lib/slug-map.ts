/**
 * Name-to-slug map with collision detection, shared by the tool-page and
 * layer-page generators.
 *
 * The collision check is the point. Both generators emit one file per slug, so
 * two names reducing to the same slug means one page silently overwrites the
 * other and the build still reports success. `kind` only shapes the error
 * message, so a failure says which generator tripped.
 */
export const slugMap = <T>(
  items: readonly T[],
  name: (item: T) => string,
  slug: (value: string) => string,
  kind: string,
): Map<string, string> => {
  const byName = new Map<string, string>();
  const owners = new Map<string, string>();
  for (const item of items) {
    const label = name(item);
    const value = slug(label);
    const owner = owners.get(value);
    if (owner !== undefined) {
      throw new Error(`${kind} slug collision: "${label}" and "${owner}" both map to "${value}"`);
    }
    owners.set(value, label);
    byName.set(label, value);
  }
  return byName;
};
