import { LANG_BADGE, runtimeText, type Tool, toolSlug } from "../../lib";
import { LWARN } from "../constants";
import { escapeHtml, fmtStars } from "../dom";
import { needsExternal } from "../query";

export const toolCell = (t: Tool): string => {
  const named = t.runtime.languages.filter((l) => l !== "none");
  const rt = named.length ? LANG_BADGE[named[0]][1] : (t.runtime.detail ?? runtimeText(t.runtime));
  const licClass = t.licence.warning || LWARN.has(t.licence.spdx) ? "lic warn" : "lic";
  let html = `<div class="tname"><a href="tools/${toolSlug(t.tool)}.html">${escapeHtml(t.tool)}</a></div>`;
  html += `<div class="tmeta"><span class="rt">${escapeHtml(rt)}</span>`;
  html += `<span class="${licClass}">${escapeHtml(t.licence.spdx)}</span>`;
  html += `<span class="stars">★ ${fmtStars(t.stars)}</span>`;
  html += `<a class="gh" href="${t.githubUrl}" target="_blank" rel="noopener">GitHub ↗</a></div>`;
  if (needsExternal(t)) html += `<div class="reqwarn">needs model or infra</div>`;
  return html;
};
