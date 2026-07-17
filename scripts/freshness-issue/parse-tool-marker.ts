import type { Marker } from "./types";

/** Per-tool marker embedded in an issue body; ties the issue to a tool id. */
export const TOOL_MARKER = "<!-- freshness-tool:";

export const parseToolMarker = (body: string): Marker | null => {
  const line = (body ?? "").split("\n").find((l) => l.trim().startsWith(TOOL_MARKER));
  if (!line) return null;
  const json = line
    .trim()
    .slice(TOOL_MARKER.length)
    .replace(/-->\s*$/, "")
    .trim();
  try {
    return JSON.parse(json) as Marker;
  } catch {
    return null;
  }
};
