import { openModal } from "./open-modal";
import { routeOf } from "./route-of";
import { modalState } from "./state";

/**
 * Delegate clicks within `root` so any anchor pointing at a modal-backed page
 * opens the overlay in place instead of navigating; the anchor keeps its href as
 * a no-JS fallback. Delegation (rather than per-anchor listeners) is what lets
 * this work for the comparison table, whose rows are re-rendered on every
 * filter/sort, and for cross-links inside the modal body.
 */
export const delegateModals = (root: Element): void => {
  root.addEventListener("click", (e) => {
    const anchor = (e.target as Element).closest("a[href]");
    if (!anchor || !root.contains(anchor)) return;
    const page = modalState.knownPages[routeOf(anchor.getAttribute("href"))];
    if (!page) return;
    e.preventDefault();
    openModal(page.title, page.html);
  });
};
