import pages from "virtual:context-radar-pages";
import { wirePageModals } from "../lib/modal";
import { CONFLICTS, LAYERS, RECOMMENDED, type StackTool, TOTAL_LAYERS } from "./stack-data";

let sel = new Set<string>();
let fActive = "all";

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node as T;
}

function getConflicts() {
  return CONFLICTS.filter((c) =>
    c.check ? c.check(sel) : c.ids.filter((id) => sel.has(id)).length >= (c.min ?? 2),
  );
}

function getConflictedIds(): Set<string> {
  const s = new Set<string>();
  for (const c of getConflicts()) {
    for (const id of c.ids.filter((id) => sel.has(id))) s.add(id);
  }
  return s;
}

function getWarnedTools(): StackTool[] {
  const out: StackTool[] = [];
  for (const l of LAYERS) {
    for (const t of l.tools) {
      if (sel.has(t.id) && t.warn) out.push(t);
    }
  }
  return out;
}

function toggle(id: string): void {
  if (sel.has(id)) sel.delete(id);
  else sel.add(id);
  render();
}

function clearAll(): void {
  sel.clear();
  render();
}

function loadRec(): void {
  sel = new Set(RECOMMENDED);
  render();
}

function setFilter(f: string): void {
  fActive = f;
  for (const c of document.querySelectorAll<HTMLElement>(".chip")) {
    c.classList.toggle("active", c.dataset.f === f);
  }
  render();
}

function toolVisible(t: StackTool): boolean {
  const q = el<HTMLInputElement>("q").value.toLowerCase();
  if (fActive === "rec" && !t.rec) return false;
  if (fActive === "sel" && !sel.has(t.id)) return false;
  if (fActive === "open" && t.lic !== "open") return false;
  if (fActive === "warn" && !t.warn) return false;
  if (
    q &&
    !t.name.toLowerCase().includes(q) &&
    !t.desc.toLowerCase().includes(q) &&
    !t.ll.toLowerCase().includes(q) &&
    !t.req.toLowerCase().includes(q)
  )
    return false;
  return true;
}

function totalStars(): string {
  let n = 0;
  for (const l of LAYERS) {
    for (const t of l.tools) {
      if (sel.has(t.id)) {
        const v = Number.parseInt(t.stars.replace(/[^0-9]/g, ""), 10);
        if (!Number.isNaN(v)) n += v;
      }
    }
  }
  if (n === 0) return "—";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

function coveredLayers(): number {
  const s = new Set<string>();
  for (const l of LAYERS) {
    if (l.tools.some((t) => sel.has(t.id))) s.add(l.id);
  }
  return s.size;
}

function exportMd(): void {
  const lines = [
    "# My Claude Code MCP Stack\n",
    `Generated ${new Date().toISOString().slice(0, 10)}\n`,
  ];
  const conf = getConflicts();
  const warns = getWarnedTools();
  if (conf.length) {
    lines.push("## ⛔ Conflicts to resolve\n");
    for (const c of conf) lines.push(`- ${c.msg}`);
    lines.push("");
  }
  if (warns.length) {
    lines.push("## ⚠ External dependencies needed\n");
    for (const w of warns) lines.push(`- **${w.name}**: ${w.req}`);
    lines.push("");
  }
  for (const l of LAYERS) {
    const s = l.tools.filter((t) => sel.has(t.id));
    if (!s.length) continue;
    lines.push(`## ${l.name}`);
    for (const t of s)
      lines.push(`- **${t.name}** (${t.stars}★, ${t.ll}) — ${t.url}\n  > ${t.req}`);
    lines.push("");
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/markdown" }));
  a.download = "mcp-stack.md";
  a.click();
}

function buildCard(t: StackTool, isSel: boolean, isConf: boolean): HTMLDivElement {
  const cls = ["tc", isConf ? "tc-conflict" : isSel ? "tc-sel" : ""].filter(Boolean).join(" ");
  const card = document.createElement("div");
  card.className = cls;
  card.setAttribute("role", "checkbox");
  card.setAttribute("aria-checked", String(isSel));
  card.setAttribute("tabindex", "0");
  card.onclick = () => toggle(t.id);
  card.onkeydown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle(t.id);
    }
  };
  const reqCls = t.req.startsWith("⚠") ? "treq treq-warn" : "treq treq-ok";
  const badge = t.free
    ? '<span class="tc-badge tb-free">built-in</span>'
    : t.rec
      ? '<span class="tc-badge tb-rec">★ rec</span>'
      : "";
  const check = isSel
    ? '<i class="ti ti-check" style="color:var(--purple);font-size:13px;margin-left:4px"></i>'
    : "";
  card.innerHTML = `
        ${badge}
        <div class="tc-top">
          <div class="tname">${t.name}${check}</div>
          <div class="tstars">${t.stars}★</div>
        </div>
        <div class="tdesc">${t.desc}</div>
        <div class="${reqCls}">${t.req}</div>
        <div class="tc-foot">
          <span class="lic l-${t.lic}">${t.ll}</span>
          <a href="${t.url}" target="_blank" rel="noopener" style="font-size:13px;color:var(--text3);text-decoration:none"><i class="ti ti-external-link"></i></a>
        </div>`;
  // The link must not toggle the card when clicked.
  card.querySelector("a")?.addEventListener("click", (e) => e.stopPropagation());
  return card;
}

function renderGrid(cIds: Set<string>): void {
  const grid = el("grid");
  grid.innerHTML = "";
  for (const layer of LAYERS) {
    const vis = layer.tools.filter(toolVisible);
    if (!vis.length) continue;
    const sec = document.createElement("div");
    sec.className = "layer";
    let h = `<div class="layer-head"><span class="layer-name">${layer.name}</span><span class="badge ${layer.bc}">${layer.badge}</span></div>`;
    if (layer.note) h += `<div class="layer-note">${layer.note}</div>`;
    h += `<div class="tools-grid" id="tg-${layer.id}"></div>`;
    sec.innerHTML = h;
    const tg = sec.querySelector(`#tg-${layer.id}`);
    if (!tg) continue;
    for (const t of vis) tg.appendChild(buildCard(t, sel.has(t.id), cIds.has(t.id)));
    grid.appendChild(sec);
  }
}

function renderSidebar(cIds: Set<string>, covered: number): void {
  const selTools: Array<StackTool & { layerName: string }> = [];
  for (const l of LAYERS) {
    for (const t of l.tools) {
      if (sel.has(t.id)) selTools.push({ ...t, layerName: l.name });
    }
  }
  el("cnt").textContent = `${selTools.length} tool${selTools.length !== 1 ? "s" : ""}`;
  el("sub").textContent =
    selTools.length === 0
      ? "Click tools to add, or load the recommended stack."
      : `${covered} of ${TOTAL_LAYERS} layers covered`;
  const body = el("body");
  if (!selTools.length) {
    body.innerHTML =
      '<div class="stack-empty"><i class="ti ti-stack-2"></i>Nothing selected yet.<br>Click any tool to add it.</div>';
    return;
  }
  body.innerHTML = selTools
    .map((t) => {
      const dotCls = cIds.has(t.id) ? "cd" : t.warn ? "warn" : "";
      const reqLine = t.warn ? `<div class="si-req">${t.req}</div>` : "";
      return `<div class="si">
        <div class="si-dot${dotCls ? ` ${dotCls}` : ""}"></div>
        <div class="si-info"><div class="si-name">${t.name}</div><div class="si-layer">${t.layerName}</div>${reqLine}</div>
        <i class="ti ti-x si-rm" data-id="${t.id}" title="Remove"></i>
      </div>`;
    })
    .join("");
  for (const rm of body.querySelectorAll<HTMLElement>(".si-rm")) {
    rm.addEventListener("click", () => {
      const id = rm.dataset.id;
      if (id) toggle(id);
    });
  }
}

function renderPanels(conf: typeof CONFLICTS, warns: StackTool[], covered: number): void {
  const confBox = el("confBox");
  if (conf.length) {
    confBox.style.display = "block";
    el("confList").innerHTML = conf.map((c) => `<div class="conf-line">${c.msg}</div>`).join("");
  } else {
    confBox.style.display = "none";
  }
  const reqBox = el("reqBox");
  if (warns.length) {
    reqBox.style.display = "block";
    el("reqList").innerHTML = warns
      .map((w) => `<div class="req-warn-line"><strong>${w.name}:</strong> ${w.req}</div>`)
      .join("");
  } else {
    reqBox.style.display = "none";
  }
  el("sCov").textContent = `${covered} / ${TOTAL_LAYERS}`;
  el("bCov").style.width = `${Math.round((covered / TOTAL_LAYERS) * 100)}%`;
  el("sConf").textContent =
    conf.length === 0 ? "none ✓" : `${conf.length} conflict${conf.length > 1 ? "s" : ""}`;
  el("sConf").style.color = conf.length > 0 ? "var(--red-mid)" : "var(--teal)";
  el("bConf").style.width = `${Math.min(conf.length * 34, 100)}%`;
  el("sStars").textContent = totalStars();
}

function render(): void {
  const cIds = getConflictedIds();
  const conf = getConflicts();
  const warns = getWarnedTools();
  const covered = coveredLayers();
  renderGrid(cIds);
  renderSidebar(cIds, covered);
  renderPanels(conf, warns, covered);
}

const FILTERS = [
  { id: "all", label: "All tools" },
  { id: "rec", label: "★ Recommended" },
  { id: "sel", label: "Selected" },
  { id: "open", label: "Open source only" },
  { id: "warn", label: "⚠ Needs model/infra" },
];

for (const f of FILTERS) {
  const c = document.createElement("div");
  c.className = `chip${f.id === "all" ? " active" : ""}`;
  c.dataset.f = f.id;
  c.textContent = f.label;
  c.addEventListener("click", () => setFilter(f.id));
  el("fbar").appendChild(c);
}

el("btn-rec").addEventListener("click", loadRec);
el("btn-clear").addEventListener("click", clearAll);
el("btn-export").addEventListener("click", exportMd);
el("q").addEventListener("input", render);

wirePageModals(pages);
render();
