# Scenario 05: Out-of-scope detection

## User Prompt

"What about https://github.com/acme/agentrun, should we add it?"

## Context

acme/agentrun is a full agentic runtime and alternative MCP client, not a tool
that reduces context-window tokens within Claude Code.

## Expected Behaviour

1. Check scope before a full fetch-and-assess.
2. Identify it as an alternative runtime or MCP client, outside the comparison's remit.
3. Explain concisely why it is out of scope.
4. Decline to add it. Do not fill a full record or invent a verdict.

## Failure Conditions

- Fetches and produces a full assessment or verdict for an out-of-scope project.
- Adds it to the catalogue.
- Gives no scope rationale.
