import { el } from "../dom";
import { render } from "./render";

// Wire a dropdown multiselect: a toggle button that opens a checkbox panel,
// with a live summary label and outside-click/Escape dismissal.
export const setupMultiselect = (panelId: string, allLabel: string): void => {
  const toggle = el<HTMLButtonElement>(`${panelId}-toggle`);
  const panel = el<HTMLElement>(panelId);
  const ms = toggle.closest(".ms");
  if (!ms) throw new Error(`Multiselect wrapper missing for #${panelId}`);
  const wrapper: Element = ms;

  const updateLabel = (): void => {
    const checked = [...panel.querySelectorAll<HTMLInputElement>("input:checked")];
    if (checked.length === 0) {
      toggle.textContent = allLabel;
    } else if (checked.length === 1) {
      toggle.textContent = (checked[0].closest("label")?.textContent ?? "").trim();
    } else {
      toggle.textContent = `${checked.length} selected`;
    }
    wrapper.classList.toggle("on", checked.length > 0);
  };

  const close = (): void => {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.hidden = !panel.hidden;
    toggle.setAttribute("aria-expanded", String(!panel.hidden));
  });
  panel.addEventListener("change", () => {
    updateLabel();
    render();
  });
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target as Node)) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  updateLabel();
};
