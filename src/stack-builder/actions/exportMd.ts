import { getConflicts, getWarnedTools } from "../selectors";
import { LAYERS } from "../stack-data";
import { state } from "../state";

export const exportMd = (): void => {
  const lines = [
    "# My Claude Code MCP Stack\n",
    `Generated ${new Date().toISOString().slice(0, 10)}\n`,
  ];
  const conf = getConflicts();
  const warns = getWarnedTools();
  if (conf.length) {
    lines.push("## ⛔ Conflicts to resolve\n");
    for (const c of conf) lines.push(`- ${c.msg}`);
    lines.push("");
  }
  if (warns.length) {
    lines.push("## ⚠ External dependencies needed\n");
    for (const w of warns) lines.push(`- **${w.name}**: ${w.req}`);
    lines.push("");
  }
  for (const l of LAYERS) {
    const s = l.tools.filter((t) => state.sel.has(t.id));
    if (!s.length) continue;
    lines.push(`## ${l.name}`);
    for (const t of s)
      lines.push(`- **${t.name}** (${t.stars}★, ${t.ll}) — ${t.url}\n  > ${t.req}`);
    lines.push("");
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/markdown" }));
  a.download = "mcp-stack.md";
  a.click();
};
