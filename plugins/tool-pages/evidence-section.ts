import type { Evidence, Tool } from "../../src/lib";
import { esc } from "./esc";
import { evidenceRows } from "./evidence-rows";

const EVIDENCE_STATUS_LABEL: Record<Evidence["status"], string> = {
  confirmed: "Confirmed",
  caveated: "Caveated",
  refuted: "Refuted",
  unverified: "Unverified",
};

export const evidenceSection = (tool: Tool): string => {
  const rows = evidenceRows(tool);
  if (!rows.length) return "";
  const items = rows
    .map((row) => {
      const sources = row.evidence.sources
        .map(
          (s) =>
            `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.evidenceType)}</a><span class="ev-when">${esc(s.checkedOn)}</span><blockquote>${esc(s.quote)}</blockquote></li>`,
        )
        .join("");
      const ledger = row.proofLedger
        ? `<span class="ev-ledger">${esc(row.proofLedger)}</span>`
        : "";
      return `<div class="ev-item">
        <div class="ev-head"><span class="ev-claim">${esc(row.label)}</span><span class="ev-status ev-${row.evidence.status}">${esc(EVIDENCE_STATUS_LABEL[row.evidence.status])}</span>${ledger}</div>
        ${sources ? `<ul class="ev-sources">${sources}</ul>` : ""}
      </div>`;
    })
    .join("");
  return `<section><h2>Evidence</h2><div class="ev">${items}</div></section>`;
};
