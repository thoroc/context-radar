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
    // The same document shell as the standalone pages, so one mountToc call
    // serves both. Most readers reach Methodology and Glossary through this
    // overlay rather than the page, so a TOC only on the page would have been
    // invisible to them.
    '<div class="modal-body"><div class="doc-shell" data-doc-shell>' +
    '<aside class="toc-shell"><p class="toc-label">On this page</p>' +
    '<nav data-toc aria-label="On this page"></nav></aside>' +
    '<article data-article class="prose-measure"></article></div></div>';
  const bodyEl = d.querySelector(".modal-body") as HTMLDivElement;
  modalState.articleEl = d.querySelector("[data-article]") as HTMLElement;
  modalState.tocEl = d.querySelector("[data-toc]") as HTMLElement;
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
  delegateModals(modalState.articleEl ?? bodyEl);
  document.body.appendChild(d);
  modalState.dialog = d;
  return d;
};
