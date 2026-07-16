# LLM dependency classification

Load this when a tool mentions AI/LLM calls and you need to classify its dependency
tier precisely for the Requirements column.

For any tool that mentions AI/LLM calls, classify it precisely — not just as a binary warning:

| Tier | Meaning | Examples |
|---|---|---|
| **Zero-LLM** | No model calls at any stage; pure algorithmic/rule-based | RTK, omni, caveman, TrueMemory Edge |
| **Extraction-only** | Calls LLM once to extract/classify input; retrieval is algorithmic | mem0, most memory tools |
| **Full-pipeline** | LLM involved in extraction AND retrieval (e.g. HyDE query expansion) | TrueMemory Pro, cognee graph queries |
| **Session-calling** | Uses the user's own active Claude/Codex session credits | claude-mem compression, token-optimizer audit agents |
| **SaaS-hosted** | All calls go to a third-party API; no self-host option for the core | supermemory |

Record this in the Requirements column accordingly:

- `Zero-LLM; no model calls`
- `⚠ Extraction: LLM API key required (OpenAI default; Anthropic/Gemini/Ollama supported)`
- `⚠ Full-pipeline: LLM API key + model download (~N GB on first use)`
- `⚠ Uses your Claude session credits`
- `⚠ SaaS-only: memory stored on [provider] servers`

This distinction matters because zero-LLM tools work fully offline and cost nothing to run, while full-pipeline tools are most capable but highest cost and latency.
