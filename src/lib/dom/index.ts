// DOM domain: the shared modal overlay. Public surface only; ensureDialog,
// routeOf, and the mutable modalState are internal to the domain.

export { delegateModals } from "./delegate-modals";
export { openModal } from "./open-modal";
export type { PageFragment } from "./state";
export { initThemeToggle } from "./theme-toggle";
export { wirePageModals } from "./wire-page-modals";
