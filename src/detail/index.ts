// Detail domain: renders one tool's full detail content. Shared by the
// build-time tool-pages plugin (standalone `/tools/*.html`) and the comparison
// page's modal overlay, so the two never drift.

export { esc } from "./esc";
export { renderDetailBody } from "./render-detail-body";
export { toolFragments } from "./tool-fragments";
export type { DetailContext, EvidenceRow } from "./types";
