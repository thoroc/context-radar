import { formatDisplayDate } from "../lib/columns";
import { META, TOOLS } from "../lib/data";
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
  "Response verbosity & memory compression": "t-resp",
  "Config stack audit & optimisation": "t-audit",
  "Agent safety enforcement": "t-audit",
  "Agent runtime & context orchestration": "t-gov",
  "Universal context compression middleware": "t-resp",
  "Reference resource (curated list)": "t-gov",
  "Code generation minimalism (YAGNI enforcement)": "t-resp",
  "Tabular data retrieval": "t-lib",
};

// Non-permissive licences that get a warning badge.
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

function highlightConflict(text: string, selfName: string): { html: string; cls: string } {
  if (!text || text === "—" || text.trim() === "-") return { html: "—", cls: "conf-none" };
  let cls = "conf-none";
  if (text.startsWith("⛔")) cls = "conf-hard";
  else if (text.startsWith("⚠")) cls = "conf-soft";
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = escaped.replace(TOOL_NAME_RE, (m) => {
    if (m === selfName) return m; // don't highlight self-reference
    return `<span class="conf-tool">${m}</span>`;
  });
  return { html, cls };
}

// Runtime badge classifier — scans free-text Runtime field for language keywords.
const RUNTIME_MAP: [RegExp, string, string][] = [
  [/rust/i, "rt-rust", "Rust"],
  [/gleam|erlang|beam|otp/i, "rt-gleam", "Gleam/BEAM"],
  [/python/i, "rt-python", "Python"],
  [/typescript/i, "rt-ts", "TS"],
  [/javascript/i, "rt-js", "JS"],
  [/node\.?js/i, "rt-node", "Node"],
  [/go|golang/i, "rt-go", "Go"],
  [/powershell/i, "rt-ps", "PS"],
  [/shell|bash/i, "rt-shell", "Shell"],
  [/lua/i, "rt-lua", "Lua"],
];

function runtimeBadges(text: string): string {
  if (!text) return '<span class="rt-chip rt-none">—</span>';
  const low = text.toLowerCase();
  if (
    low.includes("built-in") ||
    low.includes("none (curated") ||
    low === "skill file" ||
    low.includes("claude code skill")
  ) {
    return `<span class="rt-chip rt-none">${text}</span>`;
  }
  const found: string[] = [];
  const seen = new Set<string>();
  for (const [re, cls, label] of RUNTIME_MAP) {
    if (re.test(text) && !seen.has(cls)) {
      seen.add(cls);
      found.push(`<span class="rt-chip ${cls}">${label}</span>`);
    }
    if (found.length >= 3) break;
  }
  if (!found.length) return `<span class="rt-chip rt-none">${text.slice(0, 20)}</span>`;
  return `<div class="rt-badges">${found.join("")}</div>`;
}

function trendBadge(t: string): string {
  if (!t || t === "—") return '<span class="trend trend-none">—</span>';
  let cls = "trend-flat";
  let note = "";
  if (t.startsWith("▲")) cls = "trend-up";
  else if (t.startsWith("▼")) cls = "trend-down";
  let display = t;
  if (t.endsWith("*")) {
    display = t.slice(0, -1);
    note =
      ' <span class="trend-note" title="Org/repo transfer occurred — figure reflects move, not pure organic growth">(moved)</span>';
  } else if (t.endsWith("?")) {
    display = t.slice(0, -1);
    note =
      ' <span class="trend-note" title="Single source, not independently corroborated">(unconf.)</span>';
  }
  return `<span class="trend ${cls}">${display}</span>${note}`;
}

function vClass(v: string): string {
  const l = v.toLowerCase();
  if (l.includes("best")) return "v-best";
  if (l.includes("keep") || l.includes("already on")) return "v-keep";
  if (l.startsWith("add")) return "v-add";
  if (l.includes("either") || l.includes("fallback")) return "v-either";
  if (l.includes("drop")) return "v-drop";
  if (l.includes("free") || l.includes("already free")) return "v-free";
  if (
    l.includes("if you have") ||
    l.includes("if structured") ||
    l.includes("if unstructured") ||
    l.includes("if python")
  )
    return "v-cond";
  return "v-watch";
}

function aClass(a: string): string {
  if (a.includes("Hyper")) return "a-hyper";
  if (a.includes("Very active")) return "a-high";
  if (a.includes("Slowing")) return "a-slow";
  if (a.includes("Dormant") || a.includes("dormant")) return "a-dead";
  if (a.includes("Early") || a.includes("Pre-release") || a.includes("Very early"))
    return "a-early";
  return "a-stable";
}

function aFilter(status: string, f: string): boolean {
  if (!f) return true;
  const s = status.toLowerCase();
  if (f === "green") return s.includes("hyper") || s.includes("very active");
  if (f === "yellow")
    return (
      (s.includes("active") && !s.includes("very") && !s.includes("hyper")) || s.includes("stable")
    );
  if (f === "slow") return s.includes("slow");
  if (f === "red") return s.includes("early") || s.includes("pre-release");
  if (f === "dead") return s.includes("dormant");
  return true;
}

function sNum(s: string): number {
  const n = Number.parseInt(s.replace(/[^0-9]/g, ""), 10);
  return Number.isNaN(n) ? -1 : n;
}

function isDrop(t: Tool): boolean {
  return t.verdict.toLowerCase().includes("drop");
}

function lShort(l: string): string {
  return l
    .replace(" (push model)", "")
    .replace(" (trust-first)", "")
    .replace(" & reasoning capture", "")
    .replace(" & onboarding", "");
}

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node as T;
}

let sCol: keyof Tool | null = null;
let sDir = 1;

function render(): void {
  const q = el<HTMLInputElement>("s").value.toLowerCase();
  const fl = el<HTMLSelectElement>("fl").value;
  const fv = el<HTMLSelectElement>("fv").value.toLowerCase();
  const fa = el<HTMLSelectElement>("fa").value;
  const fr = el<HTMLSelectElement>("fr").value;
  const tb = el("tb");
  tb.innerHTML = "";
  let total = 0;
  for (const layer of LAYERS) {
    const rows = TOOLS.filter((t) => {
      if (!layer.match.some((m) => t.layer.startsWith(m))) return false;
      if (fl && !t.layer.startsWith(fl) && !layer.match.some((m) => m.startsWith(fl))) return false;
      if (q && !Object.values(t).join(" ").toLowerCase().includes(q)) return false;
      if (fv) {
        const v = t.verdict.toLowerCase();
        if (fv === "best" && !v.includes("best")) return false;
        if (fv === "keep" && !v.includes("keep") && !v.includes("already")) return false;
        if (fv === "add" && !v.startsWith("add")) return false;
        if (fv === "watch" && !v.includes("watch")) return false;
        if (fv === "drop" && !v.includes("drop")) return false;
      }
      if (!aFilter(t.activityStatus, fa)) return false;
      if (fr === "clean" && t.requirements.startsWith("⚠")) return false;
      if (fr === "warn" && !t.requirements.startsWith("⚠")) return false;
      return true;
    });
    if (!rows.length) continue;
    if (sCol !== null) {
      const col = sCol;
      rows.sort((a, b) => {
        let av: string | number = a[col];
        let bv: string | number = b[col];
        if (col === "stars") {
          av = sNum(a.stars);
          bv = sNum(b.stars);
        }
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
      const lc = LWARN.has(t.licence) ? "lic lic-warn" : "lic";
      const vc = vClass(t.verdict);
      const ac = aClass(t.activityStatus);
      const reqHtml = t.requirements.startsWith("⚠")
        ? `<span style="color:#A32D2D;font-size:11px">${t.requirements}</span>`
        : `<span style="font-size:11px;color:var(--text2,#777)">${t.requirements}</span>`;
      const conf = highlightConflict(t.conflict, t.tool);
      const rtHtml = runtimeBadges(t.runtime);
      const trendHtml = trendBadge(t.trend);
      tr.innerHTML = `<td><div class="tname"><a href="${t.githubUrl}" target="_blank" rel="noopener">${t.tool}</a></div></td><td><span class="tag ${tc}">${lShort(t.layer)}</span></td><td>${t.whatItDoes}</td><td class="conf-cell ${conf.cls}">${conf.html}</td><td>${rtHtml}</td><td>${reqHtml}</td><td><span class="${lc}">${t.licence}</span></td><td style="white-space:nowrap">${t.stars}</td><td>${trendHtml}</td><td><span class="act ${ac}">${t.activityStatus}</span><div class="detail">${t.activity}</div></td><td><span class="verdict ${vc}">${t.verdict}</span></td><td>${t.decisionRule}</td>`;
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
    const c = th.dataset.col as keyof Tool;
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
