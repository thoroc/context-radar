import { formatDisplayDate } from "../lib/columns";
import { META, TOOLS } from "../lib/data";
import {
  conflictClass,
  conflictText,
  LANG_BADGE,
  runtimeText,
  searchText,
  starsText,
  statusClass,
  statusText,
  verdictClass,
  verdictText,
} from "../lib/present";
import type { Tool } from "../lib/schema";

interface LayerDef {
  label: string;
  match: string[];
}

// Display layers, in order. `match` lists the raw Layer strings that collapse
// into this display group (matched by prefix).
const LAYERS: LayerDef[] = [
  {
    label: "Shell & tool output compression — pick exactly one shell tool",
    match: ["Shell output", "All tool output"],
  },
  { label: "Static context injection", match: ["Static context injection (push model)"] },
  { label: "Conversation history management", match: ["Conversation history management"] },
  { label: "Personal knowledge retrieval", match: ["Personal knowledge retrieval"] },
  { label: "Library documentation retrieval", match: ["Library documentation retrieval"] },
  { label: "Codebase understanding & onboarding", match: ["Codebase understanding & onboarding"] },
  { label: "Code navigation — pick primary; others stackable", match: ["Code navigation"] },
  {
    label: "Architecture violation detection",
    match: ["Architecture violation detection (trust-first)", "Architecture violation detection"],
  },
  { label: "MCP definition tokens", match: ["MCP definition tokens"] },
  { label: "Agent memory persistence", match: ["Agent memory persistence"] },
  {
    label: "Cross-session governance & reasoning capture",
    match: ["Cross-session governance & reasoning capture", "Cross-session governance"],
  },
  {
    label: "Response verbosity & memory compression",
    match: ["Response verbosity & memory compression", "Response verbosity + memory compression"],
  },
  {
    label: "Config stack audit & optimisation",
    match: ["Config stack audit & optimisation", "Config stack audit"],
  },
  { label: "Agent safety enforcement", match: ["Agent safety enforcement"] },
  {
    label: "Agent runtime & context orchestration",
    match: ["Agent runtime & context orchestration"],
  },
  {
    label: "Universal context compression middleware",
    match: ["Universal context compression middleware"],
  },
  { label: "Tabular data retrieval", match: ["Tabular data retrieval"] },
  { label: "Reference resource (curated list)", match: ["Reference resource (curated list)"] },
  {
    label: "Code generation minimalism (YAGNI enforcement)",
    match: ["Code generation minimalism (YAGNI enforcement)"],
  },
];

const LTAG: Record<string, string> = {
  "Shell output": "t-shell",
  "All tool output": "t-output",
  "Static context injection (push model)": "t-push",
  "Conversation history management": "t-conv",
  "Personal knowledge retrieval": "t-know",
  "Library documentation retrieval": "t-lib",
  "Codebase understanding & onboarding": "t-onboard",
  "Code navigation": "t-code",
  "Architecture violation detection (trust-first)": "t-viol",
  "Architecture violation detection": "t-viol",
  "MCP definition tokens": "t-defs",
  "Agent memory persistence": "t-purple",
  "Cross-session governance & reasoning capture": "t-gov",
  "Cross-session governance": "t-gov",
  "Response verbosity + memory compression": "t-resp",
  "Config stack audit & optimisation": "t-audit",
  "Config stack audit": "t-audit",
  "Agent safety enforcement": "t-audit",
  "Agent runtime & context orchestration": "t-gov",
  "Universal context compression middleware": "t-resp",
  "Reference resource (curated list)": "t-gov",
  "Code generation minimalism (YAGNI enforcement)": "t-resp",
  "Tabular data retrieval": "t-lib",
};

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

// All tool names, longest first, for conflict-text highlighting.
const TOOL_NAMES = TOOLS.map((t) => t.tool).sort((a, b) => b.length - a.length);

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const TOOL_NAME_RE = new RegExp(`(${TOOL_NAMES.map(escapeRegex).join("|")})`, "g");

function highlightConflict(text: string, selfName: string): string {
  if (!text || text === "—" || text.trim() === "-") return "—";
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped.replace(TOOL_NAME_RE, (m) =>
    m === selfName ? m : `<span class="conf-tool">${m}</span>`,
  );
}

function runtimeBadges(runtime: Tool["runtime"]): string {
  const named = runtime.languages.filter((l) => l !== "none");
  if (!named.length) {
    return `<span class="rt-chip rt-none">${runtime.detail?.slice(0, 20) || "—"}</span>`;
  }
  const chips = named.slice(0, 3).map((l) => {
    const [cls, label] = LANG_BADGE[l];
    return `<span class="rt-chip ${cls}">${label}</span>`;
  });
  return `<div class="rt-badges">${chips.join("")}</div>`;
}

function trendBadge(trend: number | null): string {
  if (trend === null) return '<span class="trend trend-none">—</span>';
  const cls = trend > 0 ? "trend-up" : trend < 0 ? "trend-down" : "trend-flat";
  const display = trend > 0 ? `▲ +${trend}%` : trend < 0 ? `▼ ${trend}%` : "● flat";
  return `<span class="trend ${cls}">${display}</span>`;
}

function isDrop(t: Tool): boolean {
  return t.verdict.decision === "drop";
}

function lShort(l: string): string {
  return l
    .replace(" (push model)", "")
    .replace(" (trust-first)", "")
    .replace(" & reasoning capture", "")
    .replace(" & onboarding", "");
}

const BAND_FOR_FILTER: Record<string, string> = {
  green: "active",
  yellow: "stable",
  slow: "slowing",
  red: "early",
  dead: "dormant",
};

function verdictMatches(t: Tool, fv: string): boolean {
  if (!fv) return true;
  const d = t.verdict.decision;
  if (fv === "add") return d === "add" || d === "add-if";
  return d === fv;
}

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node as T;
}

function sortValue(t: Tool, col: string): string | number {
  switch (col) {
    case "layer":
      return t.layer.toLowerCase();
    case "whatItDoes":
      return t.whatItDoes.toLowerCase();
    case "conflict":
      return conflictText(t.conflict).toLowerCase();
    case "runtime":
      return runtimeText(t.runtime).toLowerCase();
    case "requirements":
      return t.requirements.toLowerCase();
    case "licence":
      return t.licence.spdx.toLowerCase();
    case "stars":
      return t.stars ?? -1;
    case "trend":
      return t.trend ?? Number.NEGATIVE_INFINITY;
    case "activityStatus":
      return t.activityStatus.label.toLowerCase();
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
  const fv = el<HTMLSelectElement>("fv").value;
  const fa = el<HTMLSelectElement>("fa").value;
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
      if (fa && t.activityStatus.band !== BAND_FOR_FILTER[fa]) return false;
      if (fr === "clean" && t.requirements.startsWith("⚠")) return false;
      if (fr === "warn" && !t.requirements.startsWith("⚠")) return false;
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
    hdr.innerHTML = `<td colspan="12">${layer.label}</td>`;
    tb.appendChild(hdr);
    for (const t of rows) {
      const tr = document.createElement("tr");
      if (isDrop(t)) tr.className = "dropped";
      const tc = LTAG[t.layer] || "t-code";
      const lc = t.licence.warning || LWARN.has(t.licence.spdx) ? "lic lic-warn" : "lic";
      const reqHtml = t.requirements.startsWith("⚠")
        ? `<span style="color:#A32D2D;font-size:11px">${t.requirements}</span>`
        : `<span style="font-size:11px;color:var(--text2,#777)">${t.requirements}</span>`;
      const confHtml = highlightConflict(conflictText(t.conflict), t.tool);
      tr.innerHTML = `<td><div class="tname"><a href="${t.githubUrl}" target="_blank" rel="noopener">${t.tool}</a></div></td><td><span class="tag ${tc}">${lShort(t.layer)}</span></td><td>${t.whatItDoes}</td><td class="conf-cell ${conflictClass(t.conflict.severity)}">${confHtml}</td><td>${runtimeBadges(t.runtime)}</td><td>${reqHtml}</td><td><span class="${lc}">${t.licence.spdx}</span></td><td style="white-space:nowrap">${starsText(t.stars)}</td><td>${trendBadge(t.trend)}</td><td><span class="act ${statusClass(t.activityStatus.band)}">${statusText(t.activityStatus)}</span><div class="detail">${t.activity.notes ?? ""}</div></td><td><span class="verdict ${verdictClass(t.verdict.decision)}">${verdictText(t.verdict)}</span></td><td>${t.decisionRule}</td>`;
      tb.appendChild(tr);
    }
  }
  el("cnt").textContent = `${total} tool${total === 1 ? "" : "s"}`;
}

function renderSummary(): void {
  const layerCount = LAYERS.filter((layer) =>
    TOOLS.some((t) => layer.match.some((m) => t.layer.startsWith(m))),
  ).length;
  el("summary").innerHTML =
    `${TOOLS.length} tools across ${layerCount} layers &middot; Stars &amp; activity verified ${formatDisplayDate(META.stars_verified)} &middot; <a href="context-reduction-tools.csv">Download CSV</a>`;
}

el("s").addEventListener("input", render);
el("fl").addEventListener("change", render);
el("fv").addEventListener("change", render);
el("fa").addEventListener("change", render);
el("fr").addEventListener("change", render);
for (const th of document.querySelectorAll<HTMLTableCellElement>("th[data-col]")) {
  th.addEventListener("click", () => {
    const c = th.dataset.col ?? "";
    if (sCol === c) sDir *= -1;
    else {
      sCol = c;
      sDir = 1;
    }
    for (const t of document.querySelectorAll("th")) t.classList.remove("asc", "desc");
    th.classList.add(sDir === 1 ? "asc" : "desc");
    render();
  });
}

renderSummary();
render();
