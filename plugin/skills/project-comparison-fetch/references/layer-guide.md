# Layer assignment guide

Load this when choosing the `layer` value for a tool.

| Layer | Use when the tool... |
|---|---|
| Shell & tool output compression | Intercepts Bash commands or tool outputs before they reach context |
| All tool output | Sandboxes all tool output (web fetches, API calls, Playwright) not covered by shell hooks |
| Static context injection | Pre-writes structured data (signatures, graph summaries) to CLAUDE.md or a navigable knowledge graph |
| Conversation history management | Manages the message history itself via paging or compression |
| Personal knowledge retrieval | Searches the user's own notes, docs, meeting transcripts |
| Library documentation retrieval | Serves versioned upstream library docs from a community registry |
| Tabular data retrieval | Indexes CSV/Excel files for structured query instead of full-file loading |
| Codebase understanding & onboarding | LLM-powered architectural understanding; run periodically not every session |
| Code navigation | Answers structural questions about a codebase (call chains, symbols, graph) |
| Architecture violation detection | Detects architectural problems (circular deps, violations, race conditions) |
| MCP definition tokens | Reduces the token cost of MCP tool schema definitions loaded at session start |
| Cross-session governance | Tracks intent, enables rewind, or manages handoff across sessions |
| Agent memory persistence | Persists what Claude learns from sessions (facts, rules, strategies) across restarts |
| Response verbosity & memory compression | Compresses Claude's own output or CLAUDE.md memory files |
| Code generation minimalism (YAGNI) | Prevents over-engineered code from being generated in the first place |
| Config stack audit | Audits CLAUDE.md, skills, MCP servers for drift, bloat, and unused rules |
| Universal context compression middleware | Compresses all context types in one layer (replaces shell hook + caveman + context-mode) |
| Agent safety enforcement | Enforces runtime policies and contracts on what the agent can do |
| Agent runtime orchestration | Manages which tools are loaded and how they're scored dynamically |

If the tool spans multiple layers, assign it to its **primary** layer and note secondary overlaps in the conflict column.
