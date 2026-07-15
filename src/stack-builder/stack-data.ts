/**
 * Curated dataset for the MCP Stack Builder.
 *
 * This is a distinct, richer dataset from the comparison table
 * (data/context-reduction-tools.json): it carries per-tool flags (rec/free/warn),
 * short ids, layer notes, and a conflict ruleset that the flat catalogue does not
 * model. It is maintained here by hand. Lifted verbatim from the original
 * stack-builder.html; keep the two reconciled when tools change.
 */

/** License bucket that drives the licence badge colour. */
export type LicenseKind = "open" | "warn" | "paid";

export interface StackTool {
  id: string;
  name: string;
  stars: string;
  desc: string;
  lic: LicenseKind;
  /** License label shown on the badge, e.g. "MIT", "Apache-2". */
  ll: string;
  url: string;
  /** Requirements; starts with the warning marker when infra/model is needed. */
  req: string;
  /** Recommended starting point. */
  rec?: boolean;
  /** Already built into Claude Code. */
  free?: boolean;
  /** Needs a model API or external infrastructure. */
  warn?: boolean;
}

export interface StackLayer {
  id: string;
  name: string;
  badge: string;
  /** Badge colour class. */
  bc: string;
  note?: string;
  tools: StackTool[];
}

export interface Conflict {
  ids: string[];
  /** Minimum number of `ids` present to trigger (defaults to 2 when no `check`). */
  min?: number;
  /** Custom predicate over the selected-tool set. */
  check?: (s: Set<string>) => boolean;
  msg: string;
}

export const LAYERS: StackLayer[] = [
  {id:"shell",name:"Shell & tool output compression",badge:"pick ONE shell tool",bc:"b-pick",
   note:"Pick exactly one. Running two shell hooks simultaneously causes duplicate compression.",
   tools:[
    {id:"rtk",name:"RTK",stars:"70.4k",desc:"Rust hook compressing git/test/lint output. 100+ patterns, v0.42. Most battle-tested option.",lic:"open",ll:"Apache-2",url:"https://github.com/rtk-ai/rtk",req:"Rust binary; no model calls",rec:true},
    {id:"sqz",name:"sqz",stars:"173",desc:"SHA-256 dedup cache. Repeat reads = 13 tokens. MCP server. v1.0.9.",lic:"warn",ll:"ELv2",url:"https://github.com/ojuschugh1/sqz",req:"Rust binary; no model calls"},
    {id:"lean-ctx",name:"lean-ctx",stars:"2.8k",desc:"Shell hook + 76 MCP tools. Property Graph, CCP memory, file guard. 30+ agents. Local-first.",lic:"open",ll:"Apache-2",url:"https://github.com/yvgude/lean-ctx",req:"Rust binary; no model calls; Bun optional"},
    {id:"omni",name:"omni",stars:"259",desc:"Rust Context OS. Rule-based TOML distillers. Engrams, context pressure traffic light, multi-agent. v0.6.0.",lic:"open",ll:"MIT",url:"https://github.com/fajarhide/omni",req:"Rust binary; no model calls; brew install fajarhide/tap/omni"},
    {id:"ace-ctx",name:"agent-context-economy",stars:"2",desc:"6 PowerShell scripts the agent calls instead of raw commands. run-compact.ps1 (-93% terminal lines), read-symbol.ps1 (named function only), read-window.ps1 (line range), investigate.ps1 (batched search). Stackable with RTK/omni — not either/or. ⚠ Windows-first.",lic:"open",ll:"MIT",url:"https://github.com/grafikerdem/agent-context-economy",req:"PowerShell 7.0+; Windows-first (PowerShell Core on macOS/Linux); no model calls. git clone then setup-ai-scripts.ps1"},
    {id:"ctxlite",name:"ctxlite",stars:"3",desc:"Token optimizer for OpenCode+Cursor+Claude Code+Claude Desktop in one project. Pre-call rewrite, output compression, BM25 file selection, unified stats.db. Discloses exactly what's automatic vs on-demand per platform. MIT + Commons Clause (resale-restricted only).",lic:"open",ll:"MIT+Commons Clause",url:"https://github.com/ctxlite/ctxlite",req:"Zero-LLM; BM25 + tree-sitter only. Node.js for npx. npx @ctxlite/cli install --tool <platform>."},
  ]},
  {id:"output",name:"All tool output",badge:"install alongside shell tool",bc:"b-add",
   note:"Covers what shell hooks miss: web fetches, API responses, Playwright output.",
   tools:[
    {id:"ctx-mode",name:"context-mode",stars:"6.4k",desc:"Sandboxes all tool output + session continuity across compaction. 15 platforms. v0.9.23.",lic:"warn",ll:"ELv2",url:"https://github.com/mksglu/context-mode",req:"Node.js 18+; no model calls",rec:true},
    {id:"tok-opt-mcp",name:"token-optimizer-mcp",stars:"406",desc:"61 MCP tools replacing file ops with SQLite-cached versions. smart_read serves diffs. Brotli compression. ⚠ Dormant Nov 2025; HIGH npm vuln unfixed.",lic:"open",ll:"MIT",url:"https://github.com/ooples/token-optimizer-mcp",req:"⚠ Node.js 18+. HIGH severity npm vuln (picomatch). Must run with Tool Search deferral — 61 tools = massive schema load.",warn:true},
  ]},
  {id:"push",name:"Static context injection",badge:"stackable",bc:"b-add",
   note:"Pre-write context before sessions start. Run order: codesight → sigmap → caveman-compress.",
   tools:[
    {id:"sigmap",name:"sigmap",stars:"426",desc:"Writes fn/class signatures to CLAUDE.md. 31 languages, 9 MCP tools. v6.10.",lic:"open",ll:"MIT",url:"https://github.com/manojmallick/sigmap",req:"Node.js 18+; no model calls",rec:true},
    {id:"codesight",name:"codesight",stars:"1.1k",desc:"Writes routes, schema, env, dep-graph to CLAUDE.md. --wiki 91x reduction. v1.6.2.",lic:"open",ll:"MIT",url:"https://github.com/Houseofmvps/codesight",req:"Node.js 18+; no model calls"},
    {id:"codemap",name:"codemap",stars:"462",desc:"Go daemon: budget-aware context, cross-agent handoff, routing config. brew install. v4.0.7.",lic:"open",ll:"MIT",url:"https://github.com/JordanCoin/codemap",req:"Go binary; no model calls"},
    {id:"openwolf",name:"openwolf",stars:"1.7k",desc:"6 hooks: Do-Not-Repeat list, bug memory, file-map, token ledger. v1.0.4.",lic:"warn",ll:"AGPL-3.0",url:"https://github.com/cytostack/openwolf",req:"Node.js 20+; no model calls"},
    {id:"latmd",name:"lat.md",stars:"1.6k",desc:"Markdown knowledge graph for codebase (lat.md/ directory). Agents navigate via lat search/section/refs/expand instead of grep. lat check enforces wiki link + code ref integrity. lat mcp for MCP. By Yury Selivanov (asyncio, uvloop, EdgeDB). ⚠ Dormant since Mar 2026.",lic:"open",ll:"MIT",url:"https://github.com/1st1/lat.md",req:"Node.js 22+, pnpm. lat search needs OpenAI or Vercel AI Gateway key; other commands work offline."},
  ]},
  {id:"conv",name:"Conversation history management",badge:"optional",bc:"b-watch",
   note:"magic-context is OpenCode-only — not compatible with Claude Code.",
   tools:[
    {id:"v-ctx",name:"virtual-context",stars:"~3",desc:"OS virtual-memory model for message history. Very early, dormant.",lic:"open",ll:"Apache-2",url:"https://github.com/virtual-context/virtual-context",req:"⚠ Requires Ollama running locally; Python 3.10+",warn:true},
    {id:"magic-ctx",name:"magic-context",stars:"706",desc:"Background historian, cache-aware compression, cross-session memory. v0.15.7. ⚠ OpenCode only.",lic:"open",ll:"MIT",url:"https://github.com/cortexkit/magic-context",req:"⚠ OpenCode only (not Claude Code); Bun runtime",warn:true},
  ]},
  {id:"know",name:"Personal knowledge retrieval",badge:"stackable",bc:"b-add",
   note:"Add CLAUDE.md routing rules when using multiple knowledge tools to avoid agent confusion.",
   tools:[
    {id:"qmd",name:"qmd",stars:"16.5k",desc:"BM25 + vector + LLM reranking over your notes/docs. Bun-native. MIT.",lic:"open",ll:"MIT",url:"https://github.com/tobi/qmd",req:"Node.js 18+ or Bun; no model calls",rec:true},
    {id:"iwe",name:"iwe",stars:"~1k",desc:"LSP + knowledge graph for markdown notes. Graph traversal, backlinks, parent context.",lic:"open",ll:"Apache-2",url:"https://github.com/iwe-org/iwe",req:"Rust binary; no model calls"},
    {id:"graphthulhu",name:"graphthulhu",stars:"145",desc:"Full read-write MCP access to Logseq and Obsidian. 39 tools. v0.5.0.",lic:"open",ll:"MIT",url:"https://github.com/skridlevsky/graphthulhu",req:"Go binary; no model calls; Logseq HTTP API must be enabled"},
    {id:"obs-sb",name:"obsidian-second-brain",stars:"~1k",desc:"Claude Code skill. /obsidian-architect scans codebase → writes architecture notes to vault. 43 commands. ⚠ No licence.",lic:"paid",ll:"No licence",url:"https://github.com/eugeniughelbur/obsidian-second-brain",req:"Obsidian vault required. Research features need Grok/Perplexity API keys."},
    {id:"mfs",name:"mfs",stars:"4",desc:"Unifies code, memory, docs, Slack, Jira, Postgres, S3, Drive under one URI scheme (file://, s3://, slack://, postgres://...). mfs search --all fans one query across everything. Local-first: ONNX + Milvus Lite + SQLite, no API key needed. By Zilliz (Milvus). No MCP server yet.",lic:"open",ll:"Apache-2.0",url:"https://github.com/zilliztech/mfs",req:"~600MB ONNX model auto-downloaded on first run. No API key/GPU/cloud for local mode. npx skills add zilliztech/mfs --all -g."},
  ]},
  {id:"lib",name:"Library documentation retrieval",badge:"stackable",bc:"b-add",
   note:"Solves Claude using stale API knowledge for your dependencies.",
   tools:[
    {id:"ctx-neu",name:"context (neuledge)",stars:"108",desc:"100+ pre-packaged versioned library docs (Next.js, Prisma, Drizzle, tRPC…). SQLite FTS5.",lic:"open",ll:"Apache-2",url:"https://github.com/neuledge/context",req:"Node.js 18+; no model calls",rec:true},
    {id:"jdocmunch",name:"jdocmunch-mcp",stars:"163",desc:"Indexes any doc repo or local folder on demand. 10 tools, section-level retrieval. v0.1.1.",lic:"warn",ll:"Dual-use",url:"https://github.com/jgravelle/jdocmunch-mcp",req:"Python 3.10+; no model calls; uvx jdocmunch-mcp"},
    {id:"githits",name:"githits-cli",stars:"65",desc:"Version-aware index of the ENTIRE public OSS ecosystem (hosted). Search/read/grep any npm/PyPI/Crates/Go package's exact source at your installed version. get_example: cross-repo prior-art search. pkg_vulns/deps/changelog/upgrade-review. License filtering (strict/custom/yolo).",lic:"open",ll:"Apache-2.0",url:"https://github.com/githits-com/githits-cli",req:"⚠ SaaS-hosted — requires GitHits account + OAuth; indexing runs on their infra. Node.js 20.12+. npx githits@latest init. Forever-free tier.",warn:true},
  ]},
  {id:"tabular",name:"Tabular data retrieval",badge:"install if you use CSVs",bc:"b-watch",
   tools:[
    {id:"jdatamunch",name:"jdatamunch-mcp",stars:"4",desc:"Indexes CSV/Excel into SQLite. 25,333x reduction on 1M-row file. 9 tools. v0.1.1.",lic:"warn",ll:"Dual-use",url:"https://github.com/jgravelle/jdatamunch-mcp",req:"Python 3.10+; no model calls; uvx jdatamunch-mcp"},
  ]},
  {id:"onboard",name:"Codebase understanding & onboarding",badge:"run periodically",bc:"b-watch",
   note:"Costs API tokens per run — not every session. Best for onboarding and architecture reviews.",
   tools:[
    {id:"understand",name:"Understand Anything",stars:"14.7k",desc:"6-agent LLM pipeline → guided tours, domain view, committable graph. 14 platforms. v2.5.0.",lic:"open",ll:"MIT",url:"https://github.com/Lum1104/Understand-Anything",req:"⚠ Calls Anthropic API per /understand run; Node.js 18+/pnpm",warn:true},
  ]},
  {id:"codenav",name:"Code navigation",badge:"pick ONE primary",bc:"b-pick",
   note:"Install ONE code nav tool. Multiple code nav MCPs expose overlapping tool names — the agent cannot route between them reliably.",
   tools:[
    {id:"codegraph",name:"codegraph",stars:"58.5k",desc:"Pre-indexed SQLite graph. 58% fewer tool calls, 22% faster (Opus 4.8 benchmark 2026-06-02). 8 agents. MIT.",lic:"open",ll:"MIT",url:"https://github.com/colbymchenry/codegraph",req:"Node.js 22+ or 24; no model calls; npm install",rec:true},
    {id:"tokensave",name:"tokensave",stars:"253",desc:"Rust rewrite of codegraph, self-disclosed. 80+ tools vs 9, 50+ languages vs 19+, 16 agent integrations vs 1, multi-branch indexing (unique), 26x faster indexing. Dead code, circular deps, type hierarchy, atomic edit primitives. Fully open MIT.",lic:"open",ll:"MIT",url:"https://github.com/aovestdipaperino/tokensave",req:"Zero-LLM. brew/scoop/cargo install tokensave. tokensave init then tokensave install --agent claude."},
    {id:"gitnexus",name:"GitNexus",stars:"43.8k",desc:"Zero-server code intelligence engine. LadybugDB, 16 MCP tools, --skills generates CLAUDE.md skill files. Enterprise tier. Cosign attestations.",lic:"warn",ll:"PolyForm NC",url:"https://github.com/abhigyanpatwari/GitNexus",req:"Node.js 18+; no model calls; npm install"},
    {id:"cbm-mcp",name:"codebase-memory-mcp",stars:"12.7k",desc:"Go graph, Cypher, 155 languages, SLSA Level 3. Semantic search + structural graph. MIT.",lic:"open",ll:"MIT",url:"https://github.com/DeusData/codebase-memory-mcp",req:"Go static binary; no model calls; npm/PyPI/Homebrew"},
    {id:"serena",name:"Serena",stars:"25.2k",desc:"LSP symbol retrieval + symbol-level editing (insert_after_symbol). MIT. ⚠ Known 30GB memory leak.",lic:"open",ll:"MIT",url:"https://github.com/oraios/serena",req:"Python 3.10+; no model calls; uv install"},
    {id:"sourcebot",name:"sourcebot",stars:"3.4k",desc:"Self-hosted platform (Docker Compose). Zoekt code search, code nav, Ask Sourcebot NL Q&A. 469K Docker pulls.",lic:"warn",ll:"Fair Source",url:"https://github.com/sourcebot-dev/sourcebot",req:"⚠ Requires Docker Compose + PostgreSQL + Redis; Ask Sourcebot NL calls LLM",warn:true},
    {id:"graphify",name:"graphify",stars:"82.3k",desc:"Multimodal graph: code + PDFs + diagrams + video + SQL schemas. 50+ languages. v8.",lic:"open",ll:"MIT",url:"https://github.com/safishamsi/graphify",req:"Python 3.10+; no model calls"},
    {id:"graperoot",name:"GrapeRoot",stars:"780",desc:"Dual-graph (info graph + session memory). Run dgc instead of claude. Compounding context. 41% cheaper benchmark. ⚠ Core graph engine is proprietary PyPI package.",lic:"paid",ll:"Apache-2 launcher + Proprietary core",url:"https://github.com/kunal12203/codex-cli-compact",req:"⚠ Core graperoot engine is proprietary (no source). Python 3.10+, Node.js 18+. curl install."},
    {id:"ctxplus",name:"contextplus",stars:"1.7k",desc:"Tree-sitter + Spectral Clustering + wikilink hubs. Shadow restore points. Memory graph. ⚠ No licence.",lic:"paid",ll:"No licence",url:"https://github.com/ForLoopCodes/contextplus",req:"⚠ Requires Ollama or OpenAI API key for embeddings; Node.js 18+/Bun",warn:true},
    {id:"cgc",name:"CodeGraphContext",stars:"2.1k",desc:"Python MCP, KùzuDB, pre-indexed bundles. 78 contributors. v0.3.1.",lic:"open",ll:"MIT",url:"https://github.com/CodeGraphContext/CodeGraphContext",req:"Python 3.10+; no model calls"},
    {id:"sdl-mcp",name:"sdl-mcp",stars:"301",desc:"Iris Gate Ladder: 4-rung escalation (100-token card → raw source). SCIP, live indexing. ⚠ FD leak.",lic:"warn",ll:"Source-avail",url:"https://github.com/GlitterKill/sdl-mcp",req:"⚠ Node.js 24+ required (not 18/20/22)"},
    {id:"jcodemunch",name:"jCodemunch",stars:"1.9k",desc:"AST + BM25 + semantic. find_importers, get_blast_radius, get_ranked_context. 419K MCP installs. Free non-commercial.",lic:"warn",ll:"Dual-use",url:"https://github.com/jgravelle/jcodemunch-mcp",req:"Python 3.10+; optional OpenAI key for semantic mode; uvx jcodemunch-mcp"},
    {id:"pharos",name:"pharos-mcp",stars:"1",desc:"LSP-MCP bridge: 53 tools via rust-analyzer/gopls/tsserver/pyright + 18 more. +7-29pp accuracy. v0.1.0.",lic:"warn",ll:"AGPL-3.0+commercial",url:"https://github.com/LoganBresnahan/pharos-mcp",req:"⚠ Language servers must be installed separately; npm install -g pharos-mcp for pre-built binary"},
    {id:"reposcry",name:"reposcry",stars:"6",desc:"Rust-native code graph. Fast edit loop, CRG-compatible, 19 AI platform templates. v0.1.3.",lic:"open",ll:"MIT",url:"https://github.com/zibouddd/reposcry",req:"Rust binary; optional Ollama/fastembed for semantic search"},
    {id:"socraticode",name:"SocratiCode",stars:"641",desc:"Semantic search + OpenAPI/Prisma/Terraform structured artifacts. Docker Qdrant.",lic:"warn",ll:"AGPL-3.0",url:"https://github.com/giancarloerra/SocratiCode",req:"⚠ Requires Docker (Qdrant container); Node.js 18+",warn:true},
    {id:"n2-arachne",name:"n2-arachne",stars:"~4",desc:"Push model: pre-assembles 4-layer token-budgeted context before agent acts. Dormant.",lic:"open",ll:"Apache-2",url:"https://github.com/choihyunsus/n2-arachne",req:"Node.js 18+; no model calls"},
    {id:"depmesh",name:"depmesh",stars:"2",desc:"File relationships as explicit config, not inferred. depmesh.toml declares relations (tested_by, governed_by, imports). depmesh dependencies --relation tested_by ./file.py returns exact matches — zero AST, zero embeddings, zero LLM. Deterministic by design.",lic:"open",ll:"BSD-3-Clause",url:"https://github.com/Tiendil/depmesh",req:"Zero-LLM; no model calls. Python via uv or pip. uv tool install depmesh."},
    {id:"codemark",name:"codemark",stars:"0",desc:"Self-healing structural bookmarks via tree-sitter — survive renames/refactors/reformatting (tiered Exact→Relaxed→Hash resolution). codemark search --semantic finds bookmarks by meaning, local embeddings, no API key. Claude Code plugin, Neovim + Television integrations. 8 languages.",lic:"open",ll:"MIT",url:"https://github.com/DanielCardonaRojas/codemark",req:"Zero-LLM; local sqlite-vec embeddings, no API key. Rust 1.75+. brew tap DanielCardonaRojas/codemark && brew install codemark."},
  ]},
  {id:"viol",name:"Architecture violation detection",badge:"optional",bc:"b-watch",
   tools:[
    {id:"truecourse",name:"TrueCourse",stars:"21",desc:"Circular deps, layer violations, Prisma/Drizzle ER diagrams, LLM semantic review. v0.2.4.",lic:"open",ll:"MIT",url:"https://github.com/truecourse-ai/truecourse",req:"⚠ Calls LLM for semantic code review (L3); Node.js 18+",warn:true},
    {id:"repograph",name:"repo-graph",stars:"3",desc:"Trust model, reliability surface, CI gate, trend analysis. CLI only, no MCP.",lic:"open",ll:"MIT",url:"https://github.com/andreirx/repo-graph",req:"Node.js 18+; no model calls"},
  ]},
  {id:"defs",name:"MCP definition tokens",badge:"install both",bc:"b-add",
   note:"Tool Search is built into Claude Code — just enable it. Zero setup.",
   tools:[
    {id:"toolsearch",name:"Tool Search",stars:"—",desc:"Built into Claude Code. Defers tool schema loading, auto-triggers at 10% context. Zero config.",lic:"open",ll:"Free / built-in",url:"https://docs.anthropic.com/en/docs/claude-code",req:"Built into Claude Code; no additional install",rec:true,free:true},
    {id:"mcpick",name:"mcpick",stars:"—",desc:"Manual CLI toggle of MCP servers per session.",lic:"open",ll:"MIT",url:"https://github.com/spences10/mcpick",req:"Node.js 18+; no model calls"},
  ]},
  {id:"gov",name:"Cross-session governance",badge:"optional",bc:"b-watch",
   tools:[
    {id:"graphiti",name:"graphiti",stars:"25.4k",desc:"Temporal context graph. Every fact has a validity window — query what was true on any date. mcp_server/ included.",lic:"open",ll:"Apache-2.0",url:"https://github.com/getzep/graphiti",req:"⚠ Requires graph DB (FalkorDB: docker run falkordb/falkordb:latest) + LLM API key; pip install graphiti-core",warn:true},
    {id:"bitloops",name:"Bitloops",stars:"175",desc:"Team-shared reasoning linked to git commits. DevQL, Jira/Confluence ingestion. v0.0.30.",lic:"open",ll:"Apache-2",url:"https://github.com/bitloops/bitloops",req:"Rust binary; optional OpenAI key for embeddings"},
    {id:"aura",name:"Aura",stars:"~20",desc:"AST Merkle-Graph, fn-level rewind, compressed handover across sessions.",lic:"open",ll:"Apache-2",url:"https://github.com/Naridon-Inc/aura",req:"Rust binary; no model calls"},
    {id:"aictx",name:"aictx",stars:"8",desc:"Repo-local continuity runtime. aictx resume produces a capsule (active task, next action, known failures, strategy hints). aictx finalize records what happened. Failure Memory tracks structured failure patterns — agents avoid repeating them. 28 releases, v5.3.0. No model calls.",lic:"open",ll:"MIT",url:"https://github.com/oldskultxo/aictx",req:"Python 3.10+; no model calls; no external API; pip install aictx then aictx install then aictx init"},
    {id:"greplica",name:"greplica",stars:"227",desc:"Graph memory of engineering knowledge (components, flows, decisions). greplica-bootstrap once, greplica-update-working-memory each session, greplica graph context \"<question>\" retrieves prior context. Benchmarked on SWE-chat: 40-50% token reduction, up to 75% best case. ⚠ No licence file.",lic:"paid",ll:"No licence file",url:"https://github.com/Autoloops/greplica",req:"Node.js + npm (better-sqlite3 needs build tools). Local embedding mode = no API key. OpenAI mode needs OPENAI_API_KEY."},
  ]},
  {id:"resp",name:"Response & memory compression",badge:"install",bc:"b-add",
   note:"Run caveman-compress on CLAUDE.md after sigmap/codesight write to it.",
   tools:[
    {id:"caveman",name:"caveman",stars:"88.8k",desc:"Cuts 65% of output tokens by talking like caveman. Compresses CLAUDE.md ~45%. v1.8.2.",lic:"open",ll:"MIT",url:"https://github.com/JuliusBrussee/caveman",req:"Skill file; no runtime; no model calls; npx skills add JuliusBrussee/caveman",rec:true},
  ]},
  {id:"minimal",name:"Code generation minimalism (YAGNI)",badge:"install",bc:"b-add",
   note:"Different from caveman: prevents over-engineered code from being written, not compressing afterwards. Stackable with caveman.",
   tools:[
    {id:"ponytail",name:"ponytail",stars:"81.8k",desc:"YAGNI decision ladder before writing code. -54% LOC, -22% tokens, -20% cost vs baseline. 14 platforms. Updated 2026-06-18.",lic:"open",ll:"MIT",url:"https://github.com/DietrichGebert/ponytail",req:"No model calls. Claude Code/Codex hooks need node on PATH. /plugin marketplace add DietrichGebert/ponytail.",rec:true},
  ]},
  {id:"audit",name:"Config stack audit",badge:"run once after setup",bc:"b-add",
   note:"Run after assembling your stack. token-optimizer uses your Claude session; ctxharness is pure CLI.",
   tools:[
    {id:"tokenopt",name:"token-optimizer",stars:"1.4k",desc:"6 audit agents across CLAUDE.md, skills, MCP servers. Skill usage analytics. Dashboard. v5.6.5+.",lic:"warn",ll:"PolyForm NC",url:"https://github.com/alexgreensh/token-optimizer",req:"⚠ Python 3.10+ + Claude Code skill; dispatches 6 Claude Code sub-agents (uses your Claude session)",rec:true,warn:true},
    {id:"ctxharness",name:"ctxharness",stars:"4",desc:"Validates CLAUDE.md for drift: L1 version facts, L2 instruction quality, L3 hook/skill/rule assembly. Auto-fix. Score + CI diff. By RTK author.",lic:"open",ll:"MIT",url:"https://github.com/FlorianBruniaux/ctxharness",req:"Node.js 18+; no model calls; npx ctxharness"},
    {id:"tokentelemetry",name:"tokentelemetry",stars:"148",desc:"Local read-only dashboard: token usage, cost, tool-call traces, reasoning chains across 10 coding agents + Hermes autonomous agent. Budget limits, cost anomaly detection. Different from token-optimizer/ctxharness — observes only, never modifies config.",lic:"open",ll:"MIT",url:"https://github.com/VasiHemanth/tokentelemetry",req:"Node.js 18+, Python 3.9+. Zero-LLM, reads local logs only. ⚠ Anonymous opt-out telemetry on by default (DO_NOT_TRACK=1 to disable)."},
  ]},
  {id:"agentmem",name:"Agent memory persistence",badge:"pick one",bc:"b-add",
   note:"These persist what Claude learns across sessions. Pick one — they overlap significantly. ACE (strategy memory) is stackable with any of the others.",
   tools:[
    {id:"claudemem",name:"claude-mem",stars:"86.9k",desc:"Claude Code-native. 5 hooks capture observations, compress via Claude SDK, store SQLite+Chroma. 3-layer search→timeline→get_observations (~10x savings). Web viewer. v13.2.x.",lic:"open",ll:"Apache-2.0",url:"https://github.com/thedotmack/claude-mem",req:"⚠ Compression uses Claude agent SDK (calls Claude API). Auto-installs Bun + uv. npx claude-mem install (not npm install -g).",rec:true,warn:true},
    {id:"claudesmart",name:"claude-smart",stars:"724",desc:"Self-improvement: learning not memory. Corrections → actionable rules Claude follows. Self-tuning skill library (merge, archive, supersede). Project-specific + shared skills. ONNX in-process embeddings — no LLM API needed. Dashboard. ~2.7x quality vs claude-mem (EXPERIMENT.md). Powered by Reflexio.",lic:"open",ll:"Apache-2.0",url:"https://github.com/ReflexioAI/claude-smart",req:"Python 3.12+, Node.js 20+, uv. ONNX model ~86MB downloaded once. npx claude-smart install."},
    {id:"mem0",name:"mem0",stars:"56.5k",desc:"Extracts facts from conversations → persists across sessions. 90% fewer tokens vs full-context. Native Claude Code plugin. OpenMemory: free self-hosted Docker path. 277 releases.",lic:"open",ll:"Apache-2.0",url:"https://github.com/mem0ai/mem0",req:"⚠ Requires LLM API key (OpenAI default; Claude/Gemini/Groq/Ollama supported). pip install mem0ai. OpenMemory: Docker.",warn:true},
    {id:"truememory",name:"TrueMemory",stars:"311",desc:"One SQLite file. Edge/Base tiers: zero cloud, zero API key, 88.2% LoCoMo. Pro: HyDE query expansion, 93.0% LoCoMo. Directives auto-load every session. BEAM-1M/10M tested. ⚠ Licence changed to AGPL-3.0.",lic:"warn",ll:"AGPL-3.0+commercial",url:"https://github.com/buildingjoshbetter/TrueMemory",req:"Edge/Base: zero external calls, 512MB RAM. ⚠ Pro tier needs LLM API key + 4GB RAM + 1.5-2.5GB model download."},
    {id:"cognee",name:"cognee",stars:"17.5k",desc:"Knowledge graph memory engine. Claude Code plugin captures tool calls → graph. Developer rules bootstrap indexes CLAUDE.md equivalents as queryable graph.",lic:"open",ll:"Apache-2.0",url:"https://github.com/topoteretes/cognee",req:"⚠ Requires LLM API key (OpenAI default). pip install cognee. Docker for self-hosting.",warn:true},
    {id:"supermemory",name:"supermemory",stars:"2.6k",desc:"SaaS-hosted memory. Claude Code plugin injects user profile at session start + auto-captures turns. Zero infra. Personal use free.",lic:"open",ll:"Apache-2.0",url:"https://github.com/supermemoryai/supermemory",req:"⚠ SaaS-hosted — memory on Supermemory servers. API key required. Personal free; Team Memory needs Pro.",warn:true},
    {id:"gitmem",name:"gitmem",stars:"0",desc:"Git-native shared memory. Multi-tool shared brain (Claude Code + Codex + Copilot + Gemini share one memory). PR governance. ⚠ Claude Code capture not yet shipped.",lic:"open",ll:"MIT",url:"https://github.com/dev-boz/gitmem",req:"⚠ LLM API key for dream pipeline. pip install from git. Claude Code capture in Next roadmap."},
    {id:"memoir",name:"memoir",stars:"2",desc:"Git-like versioning for AI memory. Branch-aware (git checkout → branch-appropriate memories). Cache-preserving injection. memoir blame/checkout. Native Claude Code plugin. v0.1.9.",lic:"open",ll:"Apache-2.0",url:"https://github.com/zhangfengcdt/memoir",req:"⚠ Defaults to claude-haiku-4-5 (requires ANTHROPIC_API_KEY) or set MEMOIR_LLM_MODEL for OpenAI. /plugin marketplace add zhangfengcdt/memoir.",warn:true},
    {id:"ace",name:"ACE",stars:"2.2k",desc:"Strategy/skill memory (not fact memory). Skillbook of learned approaches extracted from traces via Recursive Reflector. 49% token reduction on browser automation. Stackable with fact-memory tools.",lic:"open",ll:"MIT",url:"https://github.com/kayba-ai/agentic-context-engine",req:"⚠ Requires LLM API key for every learning step (100+ providers via LiteLLM). uv add ace-framework.",warn:true},
    {id:"mem",name:"mem",stars:"0",desc:"Daily journal, \"latent memory\" thesis: model already knows general knowledge, only store YOUR decisions + why. One markdown file/day, no DB, no LLM extraction. Shared across ALL projects (not per-repo). Zero-LLM, zero infra.",lic:"open",ll:"MIT",url:"https://github.com/karmugilen/mem",req:"Zero-LLM; Python 3.8+ and git only. curl setup.sh (macOS/Linux) or setup.ps1 (Windows)."},
    {id:"curion",name:"curion",stars:"5",desc:"Deliberately minimal: 2 frozen tools (remember/recall), no kinds/states/filters. Raw input never persisted — normalize + safety-filter before write. stdio only, no network sockets. Opt-in cross-project semantic search with per-project private opt-out.",lic:"open",ll:"Apache-2.0",url:"https://github.com/geanatz/curion",req:"⚠ Extraction-only: needs LLM API key (OpenAI-compatible or Anthropic) for normalization. Node.js >=22. npm install -g @geanatz/curion.",warn:true},
  ]},
  {id:"universal",name:"Universal context compression middleware",badge:"alternative to shell + caveman + context-mode",bc:"b-add",
   note:"If you use headroom wrap claude, remove RTK + caveman + context-mode from your stack — headroom handles all three.",
   tools:[
    {id:"headroom",name:"headroom",stars:"55.8k",desc:"⚠ Repo moved to headroomlabs-ai/headroom (org transfer, same project). Compresses ALL context: tool outputs, logs, RAG, files, history. CacheAligner (KV cache). Ships RTK. Now offers managed team tier. Apache-2.0.",lic:"open",ll:"Apache-2.0",url:"https://github.com/headroomlabs-ai/headroom",req:"⚠ Python 3.10+; Kompress-base downloaded on first [ml] use (HuggingFace, ~100MB). Ships RTK binary internally.",warn:true},
    {id:"contextforge",name:"ContextForge",stars:"0",desc:"Local proxy: cf wrap claude lets Claude Code drive Ollama/OpenAI/Groq/Gemini, not just Anthropic. AST repo graph (find_symbol) + context optimizer (schema minimization, keep-newest dedup, AST skeletons). Released yesterday. ⚠ 3 unrelated same-named projects exist.",lic:"open",ll:"MIT",url:"https://github.com/anujkushwaha612/ContextForge",req:"Node.js 20+, prebuilt binaries 5 platforms. ~23MB ONNX model auto-downloaded. No API key needed for local-only Ollama use."},
  ]},
  {id:"safety",name:"Agent safety enforcement",badge:"separate concern",bc:"b-watch",
   note:"These address runtime safety — a different problem from context reduction. Useful complementary layer.",
   tools:[
    {id:"sponsio",name:"Sponsio",stars:"~400",desc:"Runtime contract enforcement. Plain-English rules → DFA checked in <0.01ms. OWASP Agentic Top 10. v0.1.0 alpha.",lic:"open",ll:"Apache-2",url:"https://github.com/SponsioLabs/Sponsio",req:"Python 3.9+ or Node.js 18+; no model calls"},
    {id:"faramesh",name:"faramesh-core",stars:"47",desc:"Pre-execution governance. 11-step deterministic pipeline. faramesh mcp wrap governs every MCP tools/call. Credential broker. Kernel enforcement (Linux). SPIFFE. v1.2.6.",lic:"open",ll:"MPL-2.0",url:"https://github.com/faramesh/faramesh-core",req:"Go binary; no model calls; brew install faramesh/tap/faramesh"},
  ]},
  {id:"runtime",name:"Agent runtime orchestration",badge:"experimental",bc:"b-watch",
   note:"ARK is not yet a Claude Code plugin — MCP connector ships in v0.8.",
   tools:[
    {id:"ark",name:"ark",stars:"7",desc:"Go agent runtime kernel. Dynamic tool loading via 6-signal scoring (cost, success, relevance). Online learning. v0.7.",lic:"open",ll:"Apache-2",url:"https://github.com/atripati/ark",req:"Go 1.22+; no model calls in core; uses your configured LLM provider via agent.yaml"},
  ]},
];

export const RECOMMENDED: string[] = ["rtk","ctx-mode","sigmap","caveman","ponytail","qmd","ctx-neu","codegraph","toolsearch","tokenopt","ctxharness"];

export const TOTAL_LAYERS = LAYERS.length;

export const CONFLICTS: Conflict[] = [
  {ids:["rtk","sqz","lean-ctx","omni","ctxlite"],min:2,msg:"⛔ HARD: Shell tools are either/or — install exactly one of RTK, sqz, lean-ctx, omni, or ctxlite."},
  {ids:["lean-ctx","magic-ctx"],check:s=>s.has("lean-ctx")&&s.has("magic-ctx"),msg:"⛔ HARD: lean-ctx and magic-context both use ctx_* MCP tool names. Also magic-context is OpenCode-only."},
  {ids:["codegraph","cbm-mcp"],check:s=>s.has("codegraph")&&s.has("cbm-mcp"),msg:"⛔ HARD: codegraph and codebase-memory-mcp expose overlapping tool names. Install one, not both."},
  {ids:["codegraph","cgc"],check:s=>s.has("codegraph")&&s.has("cgc"),msg:"⛔ HARD: codegraph and CodeGraphContext near-identical MCP surfaces. Install one, not both."},
  {ids:["codegraph","jcodemunch"],check:s=>s.has("codegraph")&&s.has("jcodemunch"),msg:"⛔ HARD: codegraph and jCodemunch overlapping tool names. Install one, not both."},
  {ids:["cbm-mcp","cgc"],check:s=>s.has("cbm-mcp")&&s.has("cgc"),msg:"⛔ HARD: codebase-memory-mcp and CodeGraphContext overlapping tool names. Install one."},
  {ids:["cbm-mcp","jcodemunch"],check:s=>s.has("cbm-mcp")&&s.has("jcodemunch"),msg:"⛔ HARD: codebase-memory-mcp and jCodemunch overlapping tool names. Install one."},
  {ids:["pharos","serena"],check:s=>s.has("pharos")&&s.has("serena"),msg:"⛔ HARD: pharos-mcp and Serena both expose find_symbol, find_references, goto_definition. Install one."},
  {ids:["pharos","cbm-mcp"],check:s=>s.has("pharos")&&s.has("cbm-mcp"),msg:"⛔ HARD: pharos-mcp and codebase-memory-mcp overlapping tool names. Install one."},
  {ids:["pharos","codegraph"],check:s=>s.has("pharos")&&s.has("codegraph"),msg:"⛔ HARD: pharos-mcp and codegraph overlapping tool names. Install one."},
  {ids:["gitnexus","codegraph"],check:s=>s.has("gitnexus")&&s.has("codegraph"),msg:"⚠ SOFT: GitNexus and codegraph overlap. Install codegraph as MIT fallback only if PolyForm NC is a concern."},
  {ids:["codegraph","tokensave"],check:s=>s.has("codegraph")&&s.has("tokensave"),msg:"⚠ SOFT: tokensave is a Rust rewrite of codegraph (self-disclosed) with much broader scope. Pick one — running both duplicates indexing and schema overhead."},
  {ids:["gitnexus","cbm-mcp"],check:s=>s.has("gitnexus")&&s.has("cbm-mcp"),msg:"⚠ SOFT: GitNexus supersedes codebase-memory-mcp. Keep cbm-mcp only if PolyForm NC is a concern."},
  {ids:["jdocmunch","jdatamunch"],check:s=>s.has("jdocmunch")&&s.has("jdatamunch"),msg:"⛔ HARD: jdocmunch-mcp and jdatamunch-mcp both expose index_local and list_datasets."},
  {ids:["ctxplus","crg"],check:s=>s.has("ctxplus")&&s.has("crg"),msg:"⛔ HARD: contextplus and code-review-graph both expose blast radius under different names."},
  {ids:["caveman","lean-ctx"],check:s=>s.has("caveman")&&s.has("lean-ctx"),msg:"⚠ SOFT: lean-ctx TDD and caveman both compress agent output. Use only one."},
  {ids:["headroom","rtk"],check:s=>s.has("headroom")&&s.has("rtk"),msg:"⚠ SOFT: headroom ships RTK internally via headroom wrap. Remove RTK when using headroom wrap claude."},
  {ids:["headroom","caveman"],check:s=>s.has("headroom")&&s.has("caveman"),msg:"⚠ SOFT: headroom handles response compression. Running caveman alongside is redundant."},
  {ids:["headroom","ctx-mode"],check:s=>s.has("headroom")&&s.has("ctx-mode"),msg:"⚠ SOFT: headroom covers everything context-mode does. Remove context-mode if using headroom."},
  {ids:["claudemem","claudesmart"],check:s=>s.has("claudemem")&&s.has("claudesmart"),msg:"⛔ HARD: claude-mem and claude-smart are direct competitors — README benchmarks explicitly against claude-mem. Pick one."},
  {ids:["claudemem","mem0","truememory","cognee","supermemory","gitmem","memoir","claudesmart","mem","curion"],min:2,msg:"⚠ SOFT: Memory persistence tools overlap significantly — pick one fact-memory tool. ACE (strategy memory) is stackable with any of them."},
];
