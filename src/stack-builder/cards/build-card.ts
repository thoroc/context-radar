import { toggle } from "../actions";
import type { StackTool } from "../stack-data";

export const buildCard = (t: StackTool, isSel: boolean, isConf: boolean): HTMLDivElement => {
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
  const reqCls = t.warn ? "treq treq-warn" : "treq treq-ok";
  const badge = t.free
    ? '<span class="tc-badge tb-free">built-in</span>'
    : t.rec
      ? '<span class="tc-badge tb-rec">rec</span>'
      : "";
  const check = isSel
    ? '<i class="ti ti-check" style="color:var(--purple);font-size:13px;margin-left:4px"></i>'
    : "";
  card.innerHTML = `
        ${badge}
        <div class="tc-top">
          <div class="tname">${t.name}${check}</div>
          <div class="tstars">${t.stars}★</div>
        </div>
        <div class="tdesc">${t.desc}</div>
        <div class="${reqCls}">${t.req}</div>
        <div class="tc-foot">
          <span class="lic l-${t.lic}">${t.ll}</span>
          <a href="${t.url}" target="_blank" rel="noopener" style="font-size:13px;color:var(--text3);text-decoration:none"><i class="ti ti-external-link"></i></a>
        </div>`;
  // The link must not toggle the card when clicked.
  card.querySelector("a")?.addEventListener("click", (e) => e.stopPropagation());
  return card;
};
