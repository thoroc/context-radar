// Shared modal overlay used to show the Methodology/Glossary markdown on top of
// the current page instead of navigating away. Built on the native <dialog>
// element so Escape-to-close and focus handling come for free.

interface PageFragment {
  title: string;
  html: string;
}

let dialog: HTMLDialogElement | null = null;
let titleEl: HTMLHeadingElement;
let bodyEl: HTMLDivElement;
// Known modal-backed pages, populated by wirePageModals, so cross-links inside
// one page's body (e.g. Glossary linking to Methodology) swap modals in place.
let knownPages: Record<string, PageFragment> = {};

function routeOf(href: string | null): string {
  return (href ?? "").replace(/^\.?\//, "");
}

function ensureDialog(): HTMLDialogElement {
  if (dialog) return dialog;
  const d = document.createElement("dialog");
  d.className = "modal";
  d.innerHTML =
    '<div class="modal-head"><h2></h2>' +
    '<button type="button" class="modal-close" aria-label="Close">&times;</button></div>' +
    '<div class="modal-body"></div>';
  titleEl = d.querySelector("h2") as HTMLHeadingElement;
  bodyEl = d.querySelector(".modal-body") as HTMLDivElement;
  d.querySelector(".modal-close")?.addEventListener("click", () => d.close());
  // Click on the backdrop (the dialog element itself, outside its content) closes.
  d.addEventListener("click", (e) => {
    if (e.target === d) d.close();
  });
  // A link in the body that points at another modal-backed page swaps content
  // rather than navigating away.
  bodyEl.addEventListener("click", (e) => {
    const anchor = (e.target as Element).closest("a[href]");
    if (!anchor) return;
    const page = knownPages[routeOf(anchor.getAttribute("href"))];
    if (!page) return;
    e.preventDefault();
    openModal(page.title, page.html);
  });
  document.body.appendChild(d);
  dialog = d;
  return d;
}

/** Open the overlay with a heading and pre-rendered HTML body. */
export function openModal(title: string, html: string): void {
  const d = ensureDialog();
  // Drop the " — Context Radar" page-title suffix for the modal heading.
  titleEl.textContent = title.split(" — ")[0];
  bodyEl.innerHTML = html;
  bodyEl.scrollTop = 0;
  d.showModal();
}

/**
 * Wire nav anchors so those pointing at a modal-backed page open the overlay
 * instead of navigating. The anchor keeps its href as a no-JS fallback.
 */
export function wirePageModals(pages: Record<string, PageFragment>): void {
  knownPages = pages;
  for (const a of document.querySelectorAll<HTMLAnchorElement>("nav a[href]")) {
    const route = routeOf(a.getAttribute("href"));
    const page = pages[route];
    if (!page) continue;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(page.title, page.html);
    });
  }
}
