import { openModal } from "./openModal";
import { routeOf } from "./routeOf";
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
  modalState.titleEl = d.querySelector("h2") as HTMLHeadingElement;
  modalState.bodyEl = d.querySelector(".modal-body") as HTMLDivElement;
  d.querySelector(".modal-close")?.addEventListener("click", () => d.close());
  // Click on the backdrop (the dialog element itself, outside its content) closes.
  d.addEventListener("click", (e) => {
    if (e.target === d) d.close();
  });
  // A link in the body that points at another modal-backed page swaps content
  // rather than navigating away.
  modalState.bodyEl.addEventListener("click", (e) => {
    const anchor = (e.target as Element).closest("a[href]");
    if (!anchor) return;
    const page = modalState.knownPages[routeOf(anchor.getAttribute("href"))];
    if (!page) return;
    e.preventDefault();
    openModal(page.title, page.html);
  });
  document.body.appendChild(d);
  modalState.dialog = d;
  return d;
};
