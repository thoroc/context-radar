/**
 * Normalise source text and a cited quote to the same shape before comparison:
 * strip a leading line-comment marker from each line, then collapse all
 * whitespace (including newlines) to single spaces and trim. This lets a verbatim
 * quote match despite comment prefixes (`//`, `//!`, `#`, `*`) and line wrapping,
 * while still catching a fabricated or altered quote.
 */
export const normalise = (text: string): string =>
  text
    .split("\n")
    .map((line) => line.replace(/^\s*(?:\/\/!|\/\/\/|\/\/|#+|\*\/|\/\*|\*)\s?/, ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
