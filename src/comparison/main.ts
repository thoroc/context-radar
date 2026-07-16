import pages from "virtual:context-radar-pages";
import type { ConflictSeverity, Tool } from "../lib";
import {
  conflictText,
  DECISION_LABEL,
  formatDisplayDate,
  LANG_BADGE,
  META,
  runtimeText,
  searchText,
  TOOLS,
  toolSlug,
  verdictClass,
  wirePageModals,
} from "../lib";

interface LayerDef {
  label: string;
  note: string;
  match: string[];
}

// Display layers, in order. `match` lists the raw Layer strings that collapse
// into this display group (matched by prefix). The group heading replaces the
// per-row layer tag, so the layer is shown once per section rather than on
// every row.
const LAYERS: LayerDef[] = [
  {
    label: "Shell & tool output compression",
    note: "pick exactly one shell tool",
    match: ["Shell output", "All tool output"],
  },
  { label: "Static context injection", note: "", match: ["Static context injection (push model)"] },
  {
    label: "Conversation history management",
    note: "",
    match: ["Conversation history management"],
  },
  { label: "Personal knowledge retrieval", note: "", match: ["Personal knowledge retrieval"] },
  {
    label: "Library documentation retrieval",
    note: "",
    match: ["Library documentation retrieval"],
  },
  {
    label: "Codebase understanding & onboarding",
    note: "",
    match: ["Codebase understanding & onboarding"],
  },
  {
    label: "Code navigation",
    note: "pick a primary; others stackable",
    match: ["Code navigation"],
  },
  {
    label: "Architecture violation detection",
    note: "",
    match: ["Architecture violation detection (trust-first)", "Architecture violation detection"],
  },
  { label: "MCP definition tokens", note: "", match: ["MCP definition tokens"] },
  { label: "Agent memory persistence", note: "", match: ["Agent memory persistence"] },
  {
    label: "Cross-session governance & reasoning capture",
    note: "",
    match: ["Cross-session governance & reasoning capture", "Cross-session governance"],
  },
  {
    label: "Response verbosity & memory compression",
    note: "",
    match: ["Response verbosity & memory compression", "Response verbosity + memory compression"],
  },
  {
    label: "Config stack audit & optimisation",
    note: "",
    match: ["Config stack audit & optimisation", "Config stack audit"],
  },
  { label: "Agent safety enforcement", note: "", match: ["Agent safety enforcement"] },
  {
    label: "Agent runtime & context orchestration",
    note: "",
    match: ["Agent runtime & context orchestration"],
  },
  {
    label: "Universal context compression middleware",
    note: "",
    match: ["Universal context compression middleware"],
  },
  { label: "Tabular data retrieval", note: "", match: ["Tabular data retrieval"] },
  {
    label: "Reference resource (curated list)",
    note: "not installable",
    match: ["Reference resource (curated list)"],
  },
  {
    label: "Code generation minimalism (YAGNI enforcement)",
    note: "",
    match: ["Code generation minimalism (YAGNI enforcement)"],
  },
];

// Non-permissive licence identifiers that also get a warning badge.
const LWARN = new Set([
  "ELv2",
  "AGPL-3",
  "AGPL-3.0",
  "PolyForm Noncommercial",
  "PolyForm NC",
  "Source-available (commercial licence for distribution)",
  "Paid (commercial)",
]);

// Conflict severity to [css class, short label], concentrating the strong
// colour on the two decision-support signals (verdict + conflict).
const CONFLICT: Record<ConflictSeverity, [string, string]> = {
  hard: ["cf-hard", "Hard conflict"],
  soft: ["cf-soft", "Soft overlap"],
  "either-or": ["cf-either", "Either / or"],
  stackable: ["cf-stack", "Stackable"],
  none: ["cf-none", "None"],
};

function fmtStars(stars: number | null): string {
  if (stars === null) return "—";
  return stars >= 1000 ? `${(stars / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(stars);
}

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node as T;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function isDrop(t: Tool): boolean {
  return t.verdict.decision === "drop";
}

function needsExternal(t: Tool): boolean {
  return t.requirements.trimStart().startsWith("⚠");
}

function toolCell(t: Tool): string {
  const named = t.runtime.languages.filter((l) => l !== "none");
  const rt = named.length ? LANG_BADGE[named[0]][1] : (t.runtime.detail ?? runtimeText(t.runtime));
  const licClass = t.licence.warning || LWARN.has(t.licence.spdx) ? "lic warn" : "lic";
  let html = `<div class="tname"><a href="tools/${toolSlug(t.tool)}.html">${escapeHtml(t.tool)}</a></div>`;
  html += `<div class="tmeta"><span class="rt">${escapeHtml(rt)}</span>`;
  html += `<span class="${licClass}">${escapeHtml(t.licence.spdx)}</span>`;
  html += `<span class="stars">★ ${fmtStars(t.stars)}</span>`;
  html += `<a class="gh" href="${t.githubUrl}" target="_blank" rel="noopener">GitHub ↗</a></div>`;
  if (needsExternal(t)) html += `<div class="reqwarn">⚠ needs model or infra</div>`;
  return html;
}

function conflictCell(t: Tool): string {
  const [cls, label] = CONFLICT[t.conflict.severity];
  if (t.conflict.severity === "none" && !t.conflict.note) {
    return `<div class="conf cf-none">None</div>`;
  }
  return `<div class="conf ${cls}"><span class="sv">${label}</span>${escapeHtml(conflictText(t.conflict))}</div>`;
}

function activityCell(t: Tool): string {
  const band = t.activityStatus.band;
  let html = `<div class="act"><span class="dot dot-${band}"></span><span class="lbl">${escapeHtml(t.activityStatus.label)}</span></div>`;
  if (t.trend !== null) {
    const cls = t.trend > 0 ? "tr-up" : t.trend < 0 ? "tr-down" : "tr-flat";
    const glyph = t.trend > 0 ? `▲ +${t.trend}%` : t.trend < 0 ? `▼ ${t.trend}%` : "● flat";
    html += `<div class="trend ${cls}">${glyph}</div>`;
  }
  return html;
}

function verdictMatches(t: Tool, fv: Set<string>): boolean {
  if (fv.size === 0) return true;
  const d = t.verdict.decision;
  // "add" also covers the conditional "add-if" decision.
  return fv.has(d === "add-if" ? "add" : d);
}

// Read the checked values of a dropdown multiselect group.
function selectedValues(id: string): Set<string> {
  const set = new Set<string>();
  for (const cb of el(id).querySelectorAll<HTMLInputElement>("input[type=checkbox]")) {
    if (cb.checked) set.add(cb.value);
  }
  return set;
}

// Wire a dropdown multiselect: a toggle button that opens a checkbox panel,
// with a live summary label and outside-click/Escape dismissal.
function setupMultiselect(panelId: string, allLabel: string): void {
  const toggle = el<HTMLButtonElement>(`${panelId}-toggle`);
  const panel = el<HTMLElement>(panelId);
  const ms = toggle.closest(".ms");
  if (!ms) throw new Error(`Multiselect wrapper missing for #${panelId}`);
  const wrapper: Element = ms;

  function updateLabel(): void {
    const checked = [...panel.querySelectorAll<HTMLInputElement>("input:checked")];
    if (checked.length === 0) {
      toggle.textContent = allLabel;
    } else if (checked.length === 1) {
      toggle.textContent = (checked[0].closest("label")?.textContent ?? "").trim();
    } else {
      toggle.textContent = `${checked.length} selected`;
    }
    wrapper.classList.toggle("on", checked.length > 0);
  }

  function close(): void {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.hidden = !panel.hidden;
    toggle.setAttribute("aria-expanded", String(!panel.hidden));
  });
  panel.addEventListener("change", () => {
    updateLabel();
    render();
  });
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target as Node)) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  updateLabel();
}

function sortValue(t: Tool, col: string): string | number {
  switch (col) {
    case "whatItDoes":
      return t.whatItDoes.toLowerCase();
    case "conflict":
      return t.conflict.severity;
    case "activityStatus":
      return t.activityStatus.band;
    case "verdict":
      return t.verdict.decision;
    case "decisionRule":
      return t.decisionRule.toLowerCase();
    default:
      return t.tool.toLowerCase();
  }
}

let sCol: string | null = null;
let sDir = 1;

function render(): void {
  const q = el<HTMLInputElement>("s").value.toLowerCase();
  const fl = el<HTMLSelectElement>("fl").value;
  const fv = selectedValues("fv");
  const fa = selectedValues("fa");
  const fr = el<HTMLSelectElement>("fr").value;
  const tb = el("tb");
  tb.innerHTML = "";
  let total = 0;
  for (const layer of LAYERS) {
    const rows = TOOLS.filter((t) => {
      if (!layer.match.some((m) => t.layer.startsWith(m))) return false;
      if (fl && !t.layer.startsWith(fl) && !layer.match.some((m) => m.startsWith(fl))) return false;
      if (q && !searchText(t).includes(q)) return false;
      if (!verdictMatches(t, fv)) return false;
      if (fa.size && !fa.has(t.activityStatus.band)) return false;
      if (fr === "clean" && needsExternal(t)) return false;
      if (fr === "warn" && !needsExternal(t)) return false;
      return true;
    });
    if (!rows.length) continue;
    if (sCol !== null) {
      const col = sCol;
      rows.sort((a, b) => {
        const av = sortValue(a, col);
        const bv = sortValue(b, col);
        return av < bv ? -sDir : av > bv ? sDir : 0;
      });
    } else {
      // Default: alphabetical by tool name within each layer.
      rows.sort((a, b) => a.tool.toLowerCase().localeCompare(b.tool.toLowerCase()));
    }
    total += rows.length;
    const hdr = document.createElement("tr");
    hdr.className = "lh";
    const note = layer.note ? `<span class="lh-note">${escapeHtml(layer.note)}</span>` : "";
    hdr.innerHTML = `<td colspan="6">${escapeHtml(layer.label)}${note}</td>`;
    tb.appendChild(hdr);
    for (const t of rows) {
      const tr = document.createElement("tr");
      if (isDrop(t)) tr.className = "dropped";
      tr.innerHTML =
        `<td>${toolCell(t)}</td>` +
        `<td><div class="desc" title="${escapeHtml(t.whatItDoes)}">${escapeHtml(t.whatItDoes)}</div></td>` +
        `<td>${conflictCell(t)}</td>` +
        `<td>${activityCell(t)}</td>` +
        `<td><span class="verdict ${verdictClass(t.verdict.decision)}">${DECISION_LABEL[t.verdict.decision]}</span></td>` +
        `<td><div class="rule" title="${escapeHtml(t.decisionRule)}">${escapeHtml(t.decisionRule)}</div></td>`;
      tb.appendChild(tr);
    }
  }
  el("cnt").textContent = `${total} tool${total === 1 ? "" : "s"} shown`;
}

function renderSummary(): void {
  const layerCount = LAYERS.filter((layer) =>
    TOOLS.some((t) => layer.match.some((m) => t.layer.startsWith(m))),
  ).length;
  el("summary").innerHTML =
    `<strong>${TOOLS.length} tools</strong> across <strong>${layerCount} layers</strong> &middot; stars &amp; activity verified ${formatDisplayDate(META.stars_verified)} &middot; <a href="context-reduction-tools.csv">Download CSV</a>`;
}

el("s").addEventListener("input", render);
el("fl").addEventListener("change", render);
el("fr").addEventListener("change", render);
setupMultiselect("fv", "All verdicts");
setupMultiselect("fa", "All activity");
for (const th of document.querySelectorAll<HTMLTableCellElement>("th[data-col]")) {
  th.addEventListener("click", () => {
    const c = th.dataset.col ?? "";
    if (sCol === c) sDir *= -1;
    else {
      sCol = c;
      sDir = 1;
    }
    for (const t of document.querySelectorAll("th")) t.classList.remove("sort-asc", "sort-desc");
    th.classList.add(sDir === 1 ? "sort-asc" : "sort-desc");
    render();
  });
}

wirePageModals(pages);
renderSummary();
render();
