/**
 * Resolve a `conflict.projects` reference to a canonical tool id. The field is
 * authored with a mix of ids ("rtk") and display names ("RTK", "GitNexus"), so
 * a match is tried against the id set first, then the lowercased display-name
 * map. Returns null when it resolves to neither (the validate guard fails the
 * build on that, so stored data should always resolve).
 */
export const resolveProjectRef = (
  ref: string,
  ids: ReadonlySet<string>,
  byName: ReadonlyMap<string, string>,
): string | null => (ids.has(ref) ? ref : (byName.get(ref.toLowerCase()) ?? null));
