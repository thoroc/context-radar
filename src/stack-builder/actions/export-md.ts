import { compactCount, licenceText, TOOLS_BY_ID } from "../../lib";
import { CONFLICT_GRAPH, LAYERS } from "../constants";
import { conflictsFor } from "../model";
import { getWarnedTools } from "../selectors";
import { state } from "../state";

const nameOf = (id: string): string => TOOLS_BY_ID.get(id)?.tool ?? id;

export const exportMd = (): void => {
  const lines = [
    "# My Claude Code MCP Stack\n",
    `Generated ${new Date().toISOString().slice(0, 10)}\n`,
  ];

  const { blocking, warnings } = conflictsFor(state.sel, CONFLICT_GRAPH);
  const conflicts = [...blocking, ...warnings];
  if (conflicts.length) {
    lines.push("## Conflicts to resolve\n");
    for (const c of conflicts) lines.push(`- ${nameOf(c.a)} and ${nameOf(c.b)} (${c.severity})`);
    lines.push("");
  }

  const warns = getWarnedTools();
  if (warns.length) {
    lines.push("## External dependencies needed\n");
    for (const w of warns) lines.push(`- **${w.tool}**: ${w.requirements}`);
    lines.push("");
  }

  for (const layer of LAYERS) {
    const selected = layer.tools.filter((t) => state.sel.has(t.id));
    if (!selected.length) continue;
    lines.push(`## ${layer.name}`);
    for (const t of selected) {
      lines.push(
        `- **${t.tool}** (${compactCount(t.stars)} stars, ${licenceText(t.licence)}) - ${t.githubUrl}\n  > ${t.requirements}`,
      );
    }
    lines.push("");
  }

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/markdown" }));
  a.download = "mcp-stack.md";
  a.click();
};
