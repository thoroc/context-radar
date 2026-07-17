import { delegateModals } from "./delegate-modals";
import { modalState } from "./state";

/** Lazily create the singleton <dialog> and wire its close/backdrop/link
 * behaviour. Returns the existing dialog on subsequent calls. */
export const ensureDialog = (): HTMLDialogElement => {
  if (modalState.dialog) return modalState.dialog;
  const d = document.createElement("dialog");
  d.className = "modal";
  d.innerHTML =
    '<div class="modal-head"><h2></h2>' +
    '<button type="button" class="modal-close" aria-label="Close">&times;</button></div>' +
    '<div class="modal-body"></div>';
  const bodyEl = d.querySelector(".modal-body") as HTMLDivElement;
  modalState.titleEl = d.querySelector("h2") as HTMLHeadingElement;
  modalState.bodyEl = bodyEl;
  d.querySelector(".modal-close")?.addEventListener("click", () => d.close());
  // Restore body scroll on every close path (button, backdrop, Escape).
  d.addEventListener("close", () => {
    document.body.style.overflow = "";
  });
  // Click on the backdrop (the dialog element itself, outside its content) closes.
  d.addEventListener("click", (e) => {
    if (e.target === d) d.close();
  });
  // A link in the body that points at another modal-backed page swaps content
  // rather than navigating away.
  delegateModals(bodyEl);
  document.body.appendChild(d);
  modalState.dialog = d;
  return d;
};
