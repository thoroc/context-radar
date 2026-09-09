import { readFileSync } from "node:fs";
import { type Dataset, DECISION_LABEL, type LayerMeta, starsText, type Tool } from "../../src/lib";

// Static prose: the parts of llms.txt that are editorial rather than derived.
// Everything else in the file comes from the store, because the hand-maintained
// version drifted on every count it stated and cited a file that did not exist.
const INTRO = `> A comparison catalogue of tools that reduce context-window token
> consumption in Claude Code and comparable coding agents (Codex, OpenCode,
> Cursor, Gemini CLI). Each entry answers: does this tool reduce what gets
> loaded into or generated within an agent's context window, and how does it
> interact with the rest of the stack?`;

const CONFLICTS = `- HARD conflict: two MCP servers expose the same or near-identical tool name; an agent cannot route between them. Pick one.
- SOFT conflict: redundant role or overlap; running both wastes resources but does not break routing.
- EITHER-OR: a mutually exclusive set; pick exactly one member.
- STACKABLE: no conflict; the tools are complementary.`;

const CARDINALITY_NOTE: Record<LayerMeta["cardinality"], string> = {
  "pick-one": "pick exactly one",
  stackable: "stackable",
  "install-both": "install both",
  reference: "not installable",
};

const OUTRO = `These ratings are decision support. A human should make and document any
adoption decision that materially affects a team or product.`;

// starsText rather than a local format: one tool (tool-search, built into
// Claude Code) has no repository and so no star count, and the shared helper
// already renders that as "-" everywhere else on the site.
const toolLine = (tool: Tool): string =>
  `- [${tool.tool}](${tool.githubUrl}) (${DECISION_LABEL[tool.verdict.decision]}; ${starsText(tool.stars)} stars): ${tool.whatItDoes}`;

const layerBlock = (layer: LayerMeta, tools: Tool[]): string => {
  const heading = `### ${layer.name} (${CARDINALITY_NOTE[layer.cardinality]})`;
  const pick = layer.curatedPick ? `\nCurated pick: ${layer.curatedPick}.` : "";
  const note = layer.note ? `\n${layer.note}` : "";
  const rows = tools.map(toolLine).join("\n");
  return `${heading}\n\n${layer.summary}${note}${pick}\n\n${rows}`;
};

/**
 * Builds llms.txt from the canonical store.
 *
 * Generated rather than hand-written because every factual claim in it is
 * derived: the previous file was checked in by hand and had drifted to 81 tools
 * against a store of 84 and 19 layers against 20, described the JSON as
 * `{meta, tools}` with no mention of `layers`, and pointed readers at a
 * `data/context-reduction-tools.csv` that does not exist. For a file whose only
 * audience is a machine reading it as fact, that is the worst place in the
 * repository for stale data, and a weekly freshness PR would have re-staled any
 * hand-written replacement.
 */
export const buildLlmsTxt = (dataPath: string): string => {
  const store = JSON.parse(readFileSync(dataPath, "utf8")) as Dataset;
  const byLayer = new Map<string, Tool[]>();
  for (const tool of store.tools) {
    const bucket = byLayer.get(tool.layer);
    if (bucket) bucket.push(tool);
    else byLayer.set(tool.layer, [tool]);
  }

  const verdicts = Object.values(DECISION_LABEL).join(", ");
  const layers = [...store.layers].sort((a, b) => a.order - b.order);
  const blocks = layers.map((layer) =>
    layerBlock(
      layer,
      (byLayer.get(layer.name) ?? []).sort((a, b) =>
        a.tool.toLowerCase().localeCompare(b.tool.toLowerCase()),
      ),
    ),
  );

  return `# context-radar

${INTRO}
> ${store.tools.length} tools across ${store.layers.length} layers, last updated ${store.meta.last_updated}.

## Data

- Source of truth: data/context-reduction-tools.json ({meta, layers, tools})
- CSV export (generated): context-reduction-tools.csv
- Cross-tool recommendations: data/tool-recommendations.json
- Star history (append-only): data/star-history.csv

This file is generated from the store by plugins/generate-llms-txt. Do not edit
it by hand; edit the store.

## Conflict markers

${CONFLICTS}

## Verdict vocabulary

${verdicts}.

## Catalogue by layer (${store.layers.length} layers)

Layers are listed in the store's own \`order\`. A layer's \`cardinality\` says how
many of its tools belong in one stack.

${blocks.join("\n\n")}

---

${OUTRO}
`;
};
