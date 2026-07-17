import { openModal } from "./open-modal";
import { routeOf } from "./route-of";
import { modalState, type PageFragment } from "./state";

/**
 * Wire nav anchors so those pointing at a modal-backed page open the overlay
 * instead of navigating. The anchor keeps its href as a no-JS fallback.
 */
export const wirePageModals = (pages: Record<string, PageFragment>): void => {
  modalState.knownPages = pages;
  for (const a of document.querySelectorAll<HTMLAnchorElement>("nav a[href]")) {
    const route = routeOf(a.getAttribute("href"));
    const page = pages[route];
    if (!page) continue;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(page.title, page.html);
    });
  }
};
