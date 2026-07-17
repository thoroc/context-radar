import { ensureDialog } from "./ensure-dialog";
import { modalState } from "./state";

/** Open the overlay with a heading and pre-rendered HTML body. */
export const openModal = (title: string, html: string): void => {
  const d = ensureDialog();
  const { titleEl, bodyEl } = modalState;
  if (!titleEl || !bodyEl) return;
  // Drop the " - Context Radar" page-title suffix for the modal heading.
  titleEl.textContent = title.split(" - ")[0];
  bodyEl.innerHTML = html;
  bodyEl.scrollTop = 0;
  d.showModal();
};
