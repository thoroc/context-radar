import type { Tool } from "../../lib";
import { escapeHtml } from "../dom";

export const activityCell = (t: Tool): string => {
  const band = t.activityStatus.band;
  let html = `<div class="act"><span class="dot dot-${band}"></span><span class="lbl">${escapeHtml(t.activityStatus.label)}</span></div>`;
  if (t.trend !== null) {
    const cls = t.trend > 0 ? "tr-up" : t.trend < 0 ? "tr-down" : "tr-flat";
    const glyph = t.trend > 0 ? `▲ +${t.trend}%` : t.trend < 0 ? `▼ ${t.trend}%` : "● flat";
    html += `<div class="trend ${cls}">${glyph}</div>`;
  }
  return html;
};
