import { normalise } from "./normalise";

/** Outcome of matching a cited quote against a fetched file's line range. */
export interface QuoteMatch {
  ok: boolean;
  reason?: string;
}

/**
 * Assert the cited quote appears within the given line range of the fetched file.
 * Comparison is whitespace- and comment-normalised substring containment, so a
 * fabricated or transcription-drifted quote fails while a genuine one survives
 * comment markers and re-wrapping.
 */
export const matchQuote = (
  quote: string,
  fileText: string,
  startLine: number,
  endLine: number,
): QuoteMatch => {
  const lines = fileText.split("\n");
  if (startLine < 1 || endLine > lines.length) {
    return {
      ok: false,
      reason: `cited lines ${startLine}-${endLine} out of bounds (file has ${lines.length})`,
    };
  }
  const needle = normalise(quote);
  if (!needle) return { ok: false, reason: "empty quote after normalisation" };
  const haystack = normalise(lines.slice(startLine - 1, endLine).join("\n"));
  return haystack.includes(needle)
    ? { ok: true }
    : { ok: false, reason: "quote not found verbatim in the cited line range" };
};
