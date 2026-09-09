/**
 * Reports duplicate keys within a single JSON object.
 *
 * `JSON.parse` keeps the last occurrence and reports nothing, so a record can
 * contradict itself and still validate. That happened here: a freshness update
 * set codeboarding's `releasedOn` to 2026-09-06 while a stale `releasedOn` of
 * 2026-07-13 sat later in the same object, so the site published the older date
 * beside notes describing the newer release. Neither the Zod schema nor the type
 * system can see it, because by the time either runs the key is already gone.
 *
 * Scans the raw text rather than a parsed value, and deliberately not via
 * `JSON.parse`'s reviver: the reviver is called once per surviving key, not once
 * per key as written, so it cannot observe a duplicate either.
 */
export const checkDuplicateKeys = (source: string, label: string): string[] => {
  const errors: string[] = [];
  // One entry per open container. A Set means an object and collects its keys;
  // null means an array, whose string elements are values, never keys.
  const stack: (Set<string> | null)[] = [];

  let i = 0;
  while (i < source.length) {
    const ch = source[i];

    if (ch === "{") {
      stack.push(new Set());
      i += 1;
    } else if (ch === "[") {
      stack.push(null);
      i += 1;
    } else if (ch === "}" || ch === "]") {
      stack.pop();
      i += 1;
    } else if (ch === '"') {
      // Read the whole string, honouring backslash escapes, so a brace or quote
      // inside a value cannot be mistaken for structure.
      let end = i + 1;
      let text = "";
      while (end < source.length && source[end] !== '"') {
        if (source[end] === "\\") {
          text += source[end + 1] ?? "";
          end += 2;
        } else {
          text += source[end];
          end += 1;
        }
      }
      // A string is a key only when the next non-whitespace character is a
      // colon and the innermost container is an object.
      let after = end + 1;
      while (after < source.length && /\s/.test(source[after])) after += 1;
      const keys = stack[stack.length - 1];
      if (source[after] === ":" && keys) {
        if (keys.has(text)) errors.push(`${label}: duplicate key "${text}" in one object`);
        keys.add(text);
      }
      i = end + 1;
    } else {
      i += 1;
    }
  }
  return errors;
};
