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
  // Known modal-backed pages, populated by wirePageModals, so cross-links inside
  // one page's body (e.g. Glossary linking to Methodology) swap modals in place.
  knownPages: Record<string, PageFragment>;
}

export const modalState: ModalState = {
  dialog: null,
  titleEl: null,
  bodyEl: null,
  knownPages: {},
};
