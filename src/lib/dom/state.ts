// Shared state for the modal overlay. One-function-per-module splits the four
// modal functions across files, so the mutable singleton they all touch lives
// here. Built on the native <dialog> element so Escape-to-close and focus
// handling come for free.

export interface PageFragment {
  title: string;
  html: string;
}

interface ModalState {
  dialog: HTMLDialogElement | null;
  titleEl: HTMLHeadingElement | null;
  bodyEl: HTMLDivElement | null;
  // The article the body is written into, and the nav the table of contents is
  // built into. Separate from bodyEl because bodyEl is the scroll container and
  // now also holds the sticky aside.
  articleEl: HTMLElement | null;
  tocEl: HTMLElement | null;
  // Known modal-backed pages, populated by wirePageModals, so cross-links inside
  // one page's body (e.g. Glossary linking to Methodology) swap modals in place.
  knownPages: Record<string, PageFragment>;
}

export const modalState: ModalState = {
  dialog: null,
  titleEl: null,
  bodyEl: null,
  articleEl: null,
  tocEl: null,
  knownPages: {},
};
