/** A single source-code citation lifted from the store, with its owning tool id. */
export interface SourceCodeCitation {
  toolId: string;
  url: string;
  quote: string;
  checkedOn: string;
}

/** Minimal shape this walk needs; the real records carry much more. */
interface ToolLike {
  id: string;
}

const sourcesIn = (node: unknown, out: SourceCodeCitation[], toolId: string): void => {
  if (Array.isArray(node)) {
    for (const item of node) sourcesIn(item, out, toolId);
    return;
  }
  if (node && typeof node === "object") {
    const o = node as Record<string, unknown>;
    if (o.evidenceType === "source-code" && typeof o.url === "string") {
      out.push({
        toolId,
        url: o.url,
        quote: typeof o.quote === "string" ? o.quote : "",
        checkedOn: typeof o.checkedOn === "string" ? o.checkedOn : "",
      });
    }
    for (const value of Object.values(o)) sourcesIn(value, out, toolId);
  }
};

/**
 * Walk every tool record and collect all `source-code` evidence citations, from
 * any evidence block on the record (verdict, runtime, licence, conflict, extra
 * claims). These are the citations the verbatim-match gate re-checks against
 * upstream source.
 */
export const collectSourceCode = (tools: ToolLike[]): SourceCodeCitation[] => {
  const out: SourceCodeCitation[] = [];
  for (const tool of tools) sourcesIn(tool, out, tool.id);
  return out;
};
