import { conflictClass, conflictText, type Tool } from "../../src/lib";
import { esc } from "./esc";

export const conflictBlock = (tool: Tool, slugByName: Map<string, string>): string => {
  const severity = tool.conflict.severity;
  if (severity === "none" && !tool.conflict.note) {
    return '<p class="conf-none">No known conflicts or overlap.</p>';
  }
  const links = tool.conflict.projects
    .map((name) => {
      const slug = slugByName.get(name);
      return slug
        ? `<a href="../tools/${slug}.html">${esc(name)}</a>`
        : `<span>${esc(name)}</span>`;
    })
    .join("");
  return `<div class="conf ${conflictClass(severity)}">
      <div class="conf-sev">${esc(severity === "none" ? "Note" : severity.replace("-", " / "))}</div>
      <p>${esc(conflictText(tool.conflict))}</p>
      ${links ? `<div class="conf-tools">${links}</div>` : ""}
    </div>`;
};
