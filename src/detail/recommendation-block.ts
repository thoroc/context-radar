import { type Recommendation, type Tool, toolSlug } from "../lib";
import { esc } from "./esc";

/**
 * The cross-tool recommendation block for a tool that belongs to one. When the
 * tool is the layer pick it names the layer and lists the alternatives with the
 * condition under which each is preferable; when the tool is an alternative it
 * points at the pick and states when to prefer this tool instead. Empty when the
 * tool sits in no recommendation. Member ids are resolved through `byId` so each
 * member links to its own detail page (via `base`, as elsewhere in the body).
 */
export const recommendationBlock = (
  tool: Tool,
  recs: Recommendation[],
  byId: Map<string, Tool>,
  base: string,
): string => {
  const rec = recs.find((r) => r.members.includes(tool.id));
  if (!rec) return "";

  const where = rec.group ? `${rec.layer} · ${rec.group}` : rec.layer;
  const link = (id: string): string => {
    const member = byId.get(id);
    return member
      ? `<a href="${base}tools/${toolSlug(member.tool)}.html">${esc(member.tool)}</a>`
      : esc(id);
  };

  let inner: string;
  if (rec.pick === tool.id) {
    const alts = rec.alternatives
      .map((a) => `<li>${link(a.id)} <span class="rec-when">when ${esc(a.when)}</span></li>`)
      .join("");
    inner = `<div class="rec-lead"><span class="rec-tag">Recommended pick</span> for ${esc(where)}</div>
      <p class="rationale">${esc(rec.rationale)}</p>
      ${alts ? `<div class="rec-alts"><span class="rec-alts-head">Alternatives</span><ul>${alts}</ul></div>` : ""}`;
  } else {
    const mine = rec.alternatives.find((a) => a.id === tool.id);
    inner = `<div class="rec-lead">In ${esc(where)}, the recommended pick is ${link(rec.pick)}.</div>
      ${mine ? `<p class="rationale">Prefer ${esc(tool.tool)} when ${esc(mine.when)}.</p>` : ""}`;
  }
  return `<section><h2>Cross-tool recommendation</h2><div class="callout rec">${inner}</div></section>`;
};
