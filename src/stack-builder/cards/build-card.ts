import { compactCount, licenceClass, licenceText, type Tool } from "../../lib";
import { CURATED_PICK_IDS } from "../constants";

// A tool with no star count and no external dependency is a Claude Code built-in
// (Tool Search); it takes badge priority over the curated-pick marker.
const badgeHtml = (t: Tool): string => {
  if (t.stars === null) return '<span class="tc-badge tb-free">built-in</span>';
  if (CURATED_PICK_IDS.has(t.id)) return '<span class="tc-badge tb-rec">rec</span>';
  return "";
};

/**
 * A tool card. When `onActivate` is given the card is a selectable checkbox
 * (click / Space / Enter fire it); without it the card is static, for a
 * non-selectable layer such as the curated reference lists.
 */
export const buildCard = (
  t: Tool,
  isSel: boolean,
  isConf: boolean,
  onActivate?: () => void,
): HTMLDivElement => {
  const interactive = onActivate !== undefined;
  const cls = ["tc", isConf ? "tc-conflict" : isSel ? "tc-sel" : "", interactive ? "" : "tc-static"]
    .filter(Boolean)
    .join(" ");
  const card = document.createElement("div");
  card.className = cls;
  if (interactive) {
    card.setAttribute("role", "checkbox");
    card.setAttribute("aria-checked", String(isSel));
    card.setAttribute("tabindex", "0");
    card.onclick = onActivate;
    card.onkeydown = (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onActivate();
      }
    };
  }
  const reqCls = t.requiresExternal ? "treq treq-warn" : "treq treq-ok";
  const check =
    interactive && isSel
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
  // The description and requirements are clamped to keep cards scannable; expose
  // the full text on hover. Set as DOM properties so quotes in the copy are safe.
  const desc = card.querySelector<HTMLElement>(".tdesc");
  if (desc) desc.title = t.whatItDoes;
  const req = card.querySelector<HTMLElement>(".treq");
  if (req) req.title = t.requirements;
  // The link must not toggle the card when clicked.
  card.querySelector("a")?.addEventListener("click", (e) => e.stopPropagation());
  return card;
};
