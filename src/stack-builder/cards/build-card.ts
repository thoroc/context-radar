import { compactCount, licenceClass, licenceText, type Tool } from "../../lib";
import { toggle } from "../actions";
import { CURATED_PICK_IDS } from "../constants";

// A tool with no star count and no external dependency is a Claude Code built-in
// (Tool Search); it takes badge priority over the curated-pick marker.
const badgeHtml = (t: Tool): string => {
  if (t.stars === null) return '<span class="tc-badge tb-free">built-in</span>';
  if (CURATED_PICK_IDS.has(t.id)) return '<span class="tc-badge tb-rec">rec</span>';
  return "";
};

export const buildCard = (t: Tool, isSel: boolean, isConf: boolean): HTMLDivElement => {
  const cls = ["tc", isConf ? "tc-conflict" : isSel ? "tc-sel" : ""].filter(Boolean).join(" ");
  const card = document.createElement("div");
  card.className = cls;
  card.setAttribute("role", "checkbox");
  card.setAttribute("aria-checked", String(isSel));
  card.setAttribute("tabindex", "0");
  card.onclick = () => toggle(t.id);
  card.onkeydown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle(t.id);
    }
  };
  const reqCls = t.requiresExternal ? "treq treq-warn" : "treq treq-ok";
  const check = isSel
    ? '<i class="ti ti-check" style="color:var(--purple);font-size:13px;margin-left:4px"></i>'
    : "";
  card.innerHTML = `
        ${badgeHtml(t)}
        <div class="tc-top">
          <div class="tname">${t.tool}${check}</div>
          <div class="tstars">${compactCount(t.stars)}★</div>
        </div>
        <div class="tdesc">${t.whatItDoes}</div>
        <div class="${reqCls}">${t.requirements}</div>
        <div class="tc-foot">
          <span class="lic l-${licenceClass(t.licence)}">${licenceText(t.licence)}</span>
          <a href="${t.githubUrl}" target="_blank" rel="noopener" style="font-size:13px;color:var(--text3);text-decoration:none"><i class="ti ti-external-link"></i></a>
        </div>`;
  // The link must not toggle the card when clicked.
  card.querySelector("a")?.addEventListener("click", (e) => e.stopPropagation());
  return card;
};
