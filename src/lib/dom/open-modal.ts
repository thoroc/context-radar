import { ensureDialog } from "./ensure-dialog";
import { modalTitle } from "./modal-title";
import { modalState } from "./state";
import { mountToc } from "./toc";

/** Open the overlay with a heading and pre-rendered HTML body. */
export const openModal = (title: string, html: string): void => {
  const d = ensureDialog();
  const { titleEl, bodyEl, articleEl, tocEl } = modalState;
  if (!titleEl || !bodyEl || !articleEl) return;
  titleEl.textContent = modalTitle(title);
  articleEl.innerHTML = html;
  bodyEl.scrollTop = 0;
  // Re-mounted on every open because the overlay swaps content in place, and
  // rooted at the modal body, which scrolls independently of the page.
  if (tocEl) mountToc({ article: articleEl, nav: tocEl, root: bodyEl });
  d.showModal();
  // Lock the page behind the overlay; ensureDialog's close handler restores it.
  document.body.style.overflow = "hidden";
};
