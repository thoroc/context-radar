import { esc } from "../detail";
import { type ConflictGraph, SEVERITY_LABEL, type Tool, toolSlug } from "../lib";

/**
 * Conflicts between two tools that both sit in this layer.
 *
 * Restricted to the layer on purpose: the question a layer page answers is
 * which of these to install, so an edge leaving the layer belongs on the tool
 * page instead. Each unordered pair is listed once, not from both sides.
 *
 * Reuses the store-wide graph from the conflicts domain rather than re-reading
 * `conflict.projects`, which is directional and can disagree with itself by
 * direction.
 */
export const layerConflictsBlock = (tools: Tool[], graph: ConflictGraph, base: string): string => {
  const inLayer = new Map(tools.map((t) => [t.id, t]));
  const seen = new Set<string>();
  const rows: string[] = [];

  for (const tool of tools) {
    for (const [otherId, severity] of graph.get(tool.id) ?? []) {
      const other = inLayer.get(otherId);
      if (!other) continue;
      const pair = [tool.id, otherId].sort().join("|");
      if (seen.has(pair)) continue;
      seen.add(pair);
      rows.push(
        `<li><a href="${base}tools/${toolSlug(tool.tool)}.html">${esc(tool.tool)}</a>` +
          ` <span class="cf-sev cf-${severity}">${esc(SEVERITY_LABEL[severity])}</span> ` +
          `<a href="${base}tools/${toolSlug(other.tool)}.html">${esc(other.tool)}</a></li>`,
      );
    }
  }

  if (rows.length === 0) return "";
  return `<ul class="layer-conflicts">${rows.join("")}</ul>`;
};
