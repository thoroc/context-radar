import { resolveProjectRef } from "../../src/lib";
import type { Tool } from "../../src/lib/schema";

/**
 * Cross-store check for the `conflict.projects` references. The field is authored
 * with a mix of tool ids ("rtk") and display names ("RTK", "GitNexus"), so a
 * downstream conflict engine must resolve each ref to a canonical id before it
 * can match co-selected tools. This guard fails the build on any ref that
 * resolves to neither (via the same resolver the conflict graph uses), so a typo
 * cannot silently drop a conflict edge. Returns human-readable errors, empty
 * when every reference resolves.
 */
export const checkConflicts = (tools: Tool[]): string[] => {
  const errors: string[] = [];
  const ids = new Set(tools.map((t) => t.id));
  const byName = new Map(tools.map((t) => [t.tool.toLowerCase(), t.id]));

  for (const tool of tools) {
    for (const ref of tool.conflict.projects) {
      if (resolveProjectRef(ref, ids, byName) === null) {
        errors.push(`tool '${tool.id}': conflict ref '${ref}' resolves to no tool id or name`);
      }
    }
  }

  return errors;
};
