# Scenario 07: MCP name conflict, layer, and ingest

## User Prompt

"Add https://github.com/acme/codenav-mcp, a Python code-navigation MCP server.
It exposes search_code, get_symbols, and find_references."

## Context

Existing code-nav tools (codegraph, codebase-memory-mcp, CodeGraphContext) already
expose overlapping search_code and get_symbols surfaces.

## Expected Behaviour

1. Assign the primary layer "Code navigation".
2. Detect the tool-name collision on search_code / get_symbols and mark the conflict
   HARD, listing the overlapping projects.
3. Assign a defensible verdict from the verdict guide (e.g. either-or or watch),
   framed for a new user (no "keep, already in stack").
4. Fill templates/tool.yaml with the stable identifier keys and ingest via
   `mise run data:add -- <file>.yaml`, then `mise run validate`.
5. The record validates against the schema; tool_count and last_updated update.

## Failure Conditions

- Misses the hard tool-name collision, or marks it soft/none.
- Uses "keep, already in stack" framing.
- Hand-edits the JSON in a way that fails `mise run validate`.
