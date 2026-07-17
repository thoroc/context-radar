import { readFileSync } from "node:fs";
import { toolSlug } from "../../src/lib";
import type { Store } from "./types";

export const loadStore = (dataPath: string): { store: Store; slugByName: Map<string, string> } => {
  const store = JSON.parse(readFileSync(dataPath, "utf8")) as Store;
  const slugByName = new Map<string, string>();
  const used = new Map<string, string>();
  for (const tool of store.tools) {
    const slug = toolSlug(tool.tool);
    const clash = used.get(slug);
    if (clash)
      throw new Error(`Tool slug collision: "${tool.tool}" and "${clash}" both map to "${slug}"`);
    used.set(slug, tool.tool);
    slugByName.set(tool.tool, slug);
  }
  return { store, slugByName };
};
