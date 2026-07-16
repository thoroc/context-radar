# MCP tool-name conflict rules

Load this when assessing a code-navigation, memory, or MCP tool and you need to
set the `conflict` severity and projects.

When assessing a new code navigation, memory, or MCP tool, explicitly check for tool name collisions with existing tools. Hard conflicts (same or semantically identical MCP tool name exposed by two different servers) must be flagged as ⛔ HARD in the Conflict/Overlap column. The agent cannot route between tools with identical or near-identical names.

Known conflict clusters as of Jun 2026:

- **Shell tools** (RTK / sqz / lean-ctx / omni): pick ONE — hooks run in the same position
- **Code nav** (codegraph / codebase-memory-mcp / CodeGraphContext / jCodemunch / pharos-mcp / Serena): all expose overlapping `search_code`, `get_symbols`, `find_references` variants
- **Memory tools** (claude-mem / claude-smart / mem0 / cognee / TrueMemory / supermemory / gitmem / memoir): fact-memory tools overlap; pick one. ACE is stackable (strategy memory, not fact memory)
- **jdocmunch + jdatamunch**: both expose `index_local` and `list_datasets`
- **lean-ctx + magic-context**: both use `ctx_*` namespace
- **claude-mem + claude-smart**: direct competitors; claude-smart README benchmarks explicitly against claude-mem
